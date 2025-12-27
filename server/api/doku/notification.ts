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

import { defineEventHandler, readBody } from "h3";
import { createClient } from "@supabase/supabase-js";

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

/**
 * Map DOKU channel ID to payment method
 */
function mapChannelToPaymentMethod(channelId: string): string {
	if (channelId.startsWith("VIRTUAL_ACCOUNT_")) return "virtual_account";
	if (channelId === "CREDIT_CARD") return "credit_card";
	if (channelId.startsWith("EMONEY_") || channelId === "QRIS") return "e_wallet";
	if (channelId.startsWith("ONLINE_TO_OFFLINE_")) return "retail";
	if (channelId.startsWith("DIRECT_DEBIT_")) return "direct_debit";
	if (channelId.startsWith("PEER_TO_PEER_")) return "paylater";
	return "other";
}

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
	try {
		// Read the raw body
		const payload = await readBody<DokuNotification>(event);

		console.log("DOKU Notification received:", JSON.stringify(payload, null, 2));

		const { order, transaction, channel } = payload || {};

		if (!order?.invoice_number || !transaction?.status) {
			console.error("Missing required fields in DOKU notification");
			return { status: "error", error: "Missing required fields" };
		}

		// Create admin Supabase client
		const supabaseUrl = process.env.VITE_SUPABASE_URL;
		const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl || !serviceRoleKey) {
			console.error("Missing Supabase configuration");
			return { status: "error", error: "Server configuration error" };
		}

		const supabase = createClient(supabaseUrl, serviceRoleKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});

		const invoiceNumber = order.invoice_number;
		const isBundle = invoiceNumber.startsWith("INV-BUNDLE-");

		// Find enrollments by payment reference (invoice number)
		const { data: enrollments, error: findError } = await supabase
			.from("enrollments")
			.select("*")
			.eq("payment_reference", invoiceNumber);

		if (findError || !enrollments || enrollments.length === 0) {
			console.error("Enrollment(s) not found for invoice:", invoiceNumber);
			return { status: "enrollment_not_found" };
		}

		// Map DOKU transaction status to our payment status
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

		// Build update data
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

		// Update ALL enrollments with this invoice number
		const { error: updateError, count } = await supabase
			.from("enrollments")
			.update(updateData)
			.eq("payment_reference", invoiceNumber);

		if (updateError) {
			console.error("Failed to update enrollment(s):", updateError);
			return { status: "error", error: "Failed to update enrollment" };
		}

		// Create notification for user
		const userId = enrollments[0].user_id;
		const coursesCount = enrollments.length;

		let courseLink = "/courses";
		let courseName = "kursus";
		if (!isBundle && enrollments.length === 1) {
			const { data: course } = await supabase
				.from("courses")
				.select("slug, title")
				.eq("id", enrollments[0].course_id)
				.single();

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

		try {
			await supabase.from("notifications").insert(notificationData);
		} catch (notifError) {
			console.error("Failed to create payment notification:", notifError);
		}

		console.log(
			isBundle
				? `Bundle: ${count || enrollments.length} enrollments updated to ${paymentStatus} for invoice ${invoiceNumber}`
				: `Enrollment ${enrollments[0].id} updated to ${paymentStatus} for invoice ${invoiceNumber}`,
		);

		return {
			status: "ok",
			message: isBundle
				? `Bundle: ${count || enrollments.length} enrollments updated to ${paymentStatus}`
				: `Enrollment updated to ${paymentStatus}`,
			isBundle,
			coursesUpdated: count || enrollments.length,
		};
	} catch (error) {
		console.error("DOKU notification error:", error);
		return { status: "error", message: "Internal server error" };
	}
});
