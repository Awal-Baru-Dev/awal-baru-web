/**
 * DOKU Payment Notification Webhook Handler
 *
 * This is a Nitro API route that receives HTTP POST requests from DOKU.
 * Endpoint: POST /api/doku/notification
 *
 * Supports both:
 * - Single course purchases (INV-{timestamp}-{courseId})
 * - Bundle purchases (INV-BUNDLE-{timestamp})
 */

import { 
	defineEventHandler, 
	readRawBody, 
	createError, 
	setResponseStatus, 
	getRequestHeader 
} from "h3";
import { createClient } from "@supabase/supabase-js";
import { verifyNotificationSignature, mapChannelToPaymentMethod } from "../../../src/lib/doku";

// Types from the DOKU library
interface DokuNotificationOrder {
	invoice_number: string;
	amount: number;
}

interface DokuNotificationTransaction {
	status: string;
	date: string;
	original_request_id: string;
}

interface DokuNotificationChannel {
	id: string;
}

interface DokuNotification {
	order: DokuNotificationOrder;
	transaction: DokuNotificationTransaction;
	channel: DokuNotificationChannel;
}

// Using centralized mapping from @/lib/doku

/**
 * Format currency in IDR
 */
function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

export default defineEventHandler(async (event) => {
	// 1. Extract Headers for Signature Verification
	const clientId = getRequestHeader(event, "client-id");
	const requestId = getRequestHeader(event, "request-id");
	const requestTimestamp = getRequestHeader(event, "request-timestamp");
	const signature = getRequestHeader(event, "signature");

	// 2. Read Raw Body for Signature Verification
	const rawBody = (await readRawBody(event, "utf8")) || "";

	if (!rawBody) {
		console.error("DOKU Notification: Empty request body");
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request",
			message: "Payload body is empty",
		});
	}

	// 3. Environment Configuration Check
	const supabaseUrl = process.env.VITE_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	const dokuSecretKey = process.env.DOKU_SECRET_KEY;
	const dokuClientId = process.env.DOKU_CLIENT_ID;

	if (!supabaseUrl || !serviceRoleKey || !dokuSecretKey || !dokuClientId) {
		console.error("DOKU Notification: Missing server configuration (Supabase or DOKU keys)");
		throw createError({
			statusCode: 500,
			statusMessage: "Internal Server Error",
			message: "Server configuration missing",
		});
	}

	// 4. Verify Signature
	const isSignatureValid = verifyNotificationSignature(
		dokuClientId,
		requestId || "",
		requestTimestamp || "",
		"/api/doku/notification", // Request target
		rawBody,
		signature || "",
		dokuSecretKey,
	);

	if (!isSignatureValid) {
		console.error("DOKU Notification: Invalid signature from", clientId);
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
			message: "Invalid signature",
		});
	}

	// 5. Parse Payload
	let payload: DokuNotification;
	try {
		payload = JSON.parse(rawBody);
	} catch (e) {
		console.error("DOKU Notification: Failed to parse JSON", e);
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request",
			message: "Invalid JSON payload",
		});
	}

	const { order, transaction, channel } = payload || {};

	if (!order?.invoice_number || !transaction?.status || !channel?.id) {
		console.error("DOKU Notification: Missing required fields in payload");
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request",
			message: "Missing required fields (order, transaction, or channel)",
		});
	}

	try {
		// 6. Initialize Supabase Admin Client
		const supabase = createClient(supabaseUrl, serviceRoleKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});

		const invoiceNumber = order.invoice_number;
		const isBundle = invoiceNumber.startsWith("INV-BUNDLE-");

		// 7. Find enrollments
		const { data: enrollments, error: findError } = await supabase
			.from("enrollments")
			.select("*")
			.eq("payment_reference", invoiceNumber);

		if (findError) {
			console.error("DOKU Notification: Database error finding enrollments", findError);
			throw createError({
				statusCode: 500,
				statusMessage: "Internal Server Error",
				message: "Database lookup failed",
			});
		}

		if (!enrollments || enrollments.length === 0) {
			console.warn("DOKU Notification: Enrollment not found for invoice:", invoiceNumber);
			// We return 200 here because the invoice doesn't exist in our DB, 
			// retry won't help if it's a completely unknown invoice.
			return { status: "not_found", message: "Invoice not matched to any enrollment" };
		}

		// 8. Map Status
		let paymentStatus: "pending" | "paid" | "failed" | "expired";
		let paymentMethod: string | null = null;

		switch (transaction.status.toUpperCase()) {
			case "SUCCESS":
				paymentStatus = "paid";
				paymentMethod = mapChannelToPaymentMethod(channel.id);
				break;
			case "FAILED":
				paymentStatus = "failed";
				break;
			case "EXPIRED":
				paymentStatus = "expired";
				break;
			default:
				paymentStatus = "pending";
		}

		// 9. Process Update
		const updateData: Record<string, unknown> = {
			payment_status: paymentStatus,
			updated_at: new Date().toISOString(),
		};

		if (paymentStatus === "paid") {
			updateData.purchased_at = new Date().toISOString();
			updateData.expires_at = null;
			updateData.amount_paid = isBundle
				? Math.round(order.amount / enrollments.length)
				: order.amount;
		}

		if (paymentMethod) {
			updateData.payment_method = paymentMethod;
			updateData.payment_channel = channel.id;
		}

		// Use UPSERT based on (user_id, course_id) to avoid duplicate key errors (23505)
		// This handles cases where a pending single enrollment is updated by a successful bundle payment
		const upsertEntries = enrollments.map((enr) => ({
			user_id: enr.user_id,
			course_id: enr.course_id,
			payment_reference: invoiceNumber, // Ensure latest reference
			...updateData,
		}));

		const { error: updateError } = await supabase
			.from("enrollments")
			.upsert(upsertEntries, {
				onConflict: "user_id,course_id",
				ignoreDuplicates: false,
			});

		if (updateError) {
			console.error("DOKU Notification: Failed to update enrollments", updateError);
			throw createError({
				statusCode: 500,
				statusMessage: "Internal Server Error",
				message: "Update operation failed",
			});
		}

		console.log(
			`DOKU Notification Success: ${invoiceNumber} marked as ${paymentStatus} (${upsertEntries.length} rows processed)`,
		);

		// 10. Send Response Early to Prevent Timeout
		// Kita mengirimkan respons 200 OK ke DOKU tepat setelah `enrollments` berhasil di-upsert.
		// Hal ini mencegah Timeout > 5 detik yang bisa terjadi jika kita menunggu notifikasi & third-party fetching.
		setResponseStatus(event, 200);

		// 11. Background Task for Notifications
		const sendNotificationBackground = async () => {
			try {
				const userId = enrollments[0].user_id;
				const coursesCount = enrollments.length;

				let courseLink = "/courses";
				let courseName = "kursus";
				if (!isBundle && enrollments.length === 1) {
					const { data: course, error: courseError } = await supabase
						.from("courses")
						.select("slug, title")
						.eq("id", enrollments[0].course_id)
						.single();

					if (courseError) {
						console.error("DOKU Notification Background: Failed to fetch course details", courseError);
					}

					if (course?.slug) {
						courseLink = `/courses/${course.slug}`;
						courseName = course.title || "kursus";
					}
				}

				const notificationData = {
					user_id: userId,
					type: "payment",
					title:
						paymentStatus === "paid"
							? "Pembayaran Berhasil!"
							: paymentStatus === "failed"
								? "Pembayaran Gagal"
								: "Pembayaran Kedaluwarsa",
					message:
						paymentStatus === "paid"
							? isBundle
								? `Selamat! Pembayaran ${formatCurrency(order.amount)} untuk Paket Semua Kursus (${coursesCount} kursus) telah berhasil.`
								: `Selamat! Pembayaran ${formatCurrency(order.amount)} untuk "${courseName}" telah berhasil.`
							: paymentStatus === "failed"
								? isBundle
									? "Pembayaran untuk Paket Semua Kursus gagal. Silakan coba lagi."
									: `Pembayaran untuk "${courseName}" gagal. Silakan coba lagi.`
								: isBundle
									? "Waktu pembayaran untuk Paket Semua Kursus telah habis."
									: `Waktu pembayaran untuk "${courseName}" telah habis.`,
					link: courseLink,
					metadata: {
						invoiceNumber,
						isBundle,
						coursesCount,
						amount: order.amount,
						paymentMethod,
						status: paymentStatus,
					},
				};

				const { error: notifError } = await supabase.from("notifications").insert(notificationData);
				if (notifError) {
					console.error("DOKU Notification Background: Failed to create in-app notification", notifError);
				}
			} catch (err) {
				console.error("DOKU Notification Background: Unexpected error", err);
			}
		};

		// Execute notification safely in background using Nitro's waitUntil
		const notifPromise = sendNotificationBackground();
		try {
			if (typeof event.waitUntil === "function") {
				// Standar untuk runtime serverless edge
				event.waitUntil(notifPromise);
			} else if (event.context && typeof event.context.waitUntil === "function") {
				// Standar fallbacks Nitro context
				event.context.waitUntil(notifPromise);
			} else {
				// Fallback Node.js
				notifPromise.catch(console.error);
			}
		} catch (e) {
			notifPromise.catch(console.error);
		}

		return {
			status: "success",
			message: `Enrollment status updated to ${paymentStatus}`,
		};
	} catch (error: any) {
		// If it's already an H3 error, rethrow it
		if (error.statusCode) throw error;

		console.error("DOKU Notification: Unexpected Error", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Internal Server Error",
			message: error.message || "An unexpected error occurred",
		});
	}
});
