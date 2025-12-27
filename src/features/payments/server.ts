/**
 * Payment Server Functions
 *
 * Server-side payment operations using TanStack Start's createServerFn.
 * Handles DOKU payment creation and verification.
 */

import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase/server";
import {
	createDokuPayment,
	checkDokuPaymentStatus,
	ALL_PAYMENT_METHODS,
	mapChannelToPaymentMethod,
} from "@/lib/doku";
import { PAYMENT } from "@/lib/config/constants";
import type { PaymentInput, CreatePaymentResult, VerifyPaymentInput, VerifyPaymentResult } from "./types";

/**
 * Sanitize text for DOKU API
 * DOKU only allows: a-z A-Z 0-9 . - / + , = _ : ' @ %
 */
function sanitizeForDoku(text: string): string {
	return text
		.replace(/&/g, "dan") // & -> dan (Indonesian "and")
		.replace(/[^\w\s.,\-/+=_:'@%]/g, "") // Remove invalid chars like ()[]{}!?#$^*
		.trim();
}

/**
 * Generate invoice number
 */
function generateInvoiceNumber(isBundle: boolean, courseId?: string): string {
	const timestamp = Date.now();
	if (isBundle) {
		return `INV-BUNDLE-${timestamp}`;
	}
	return `INV-${timestamp}-${courseId?.slice(0, 8) || "UNKNOWN"}`;
}

/**
 * Get callback URLs for payment
 */
function getCallbackUrls(isBundle: boolean, courseSlug?: string) {
	const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";

	if (isBundle) {
		return {
			success: `${appUrl}/courses?payment=success&type=bundle`,
			cancel: `${appUrl}/courses?payment=cancelled`,
		};
	}

	return {
		success: `${appUrl}/courses/${courseSlug}?payment=success`,
		cancel: `${appUrl}/courses/${courseSlug}?payment=cancelled`,
	};
}

/**
 * Create a payment for a single course or bundle
 *
 * 1. Validates user is authenticated
 * 2. Checks not already enrolled
 * 3. Creates pending enrollment(s)
 * 4. Calls DOKU API
 * 5. Returns payment URL
 */
export const createPaymentFn = createServerFn({ method: "POST" })
	.inputValidator((data: PaymentInput) => data)
	.handler(async ({ data }): Promise<CreatePaymentResult> => {
		const supabase = await getSupabaseServerClient();

		// 1. Check authentication
		const { data: authData, error: authError } = await supabase.auth.getUser();
		if (authError || !authData.user) {
			return { success: false, error: "Silakan login terlebih dahulu" };
		}

		const userId = authData.user.id;
		const userEmail = authData.user.email || "";

		// Get user profile for customer info
		const { data: profile } = await supabase
			.from("profiles")
			.select("full_name, phone")
			.eq("id", userId)
			.single();

		// 2. Prepare payment based on type
		let invoiceNumber: string;
		let amount: number;
		let itemName: string;
		let enrollmentData: Array<{
			user_id: string;
			course_id: string;
			payment_status: "pending";
			payment_reference: string;
			amount_paid: number;
			expires_at: string;
		}>;
		let callbackUrls: { success: string; cancel: string };

		if (data.isBundle) {
			// Bundle purchase: Get the Bundle course from database for price
			const { data: bundleCourse, error: bundleError } = await supabase
				.from("courses")
				.select("id, title, price")
				.eq("category", "Bundle")
				.eq("is_published", true)
				.single();

			if (bundleError || !bundleCourse) {
				return { success: false, error: "Paket bundle tidak ditemukan" };
			}

			// Get all published courses (excluding Bundle category)
			const { data: courses, error: coursesError } = await supabase
				.from("courses")
				.select("id, title")
				.eq("is_published", true)
				.neq("category", "Bundle");

			if (coursesError || !courses?.length) {
				return { success: false, error: "Gagal memuat daftar kursus" };
			}

			// Get user's existing paid enrollments
			const { data: existingEnrollments } = await supabase
				.from("enrollments")
				.select("course_id")
				.eq("user_id", userId)
				.eq("payment_status", "paid");

			const paidCourseIds = new Set(
				existingEnrollments?.map((e: { course_id: string }) => e.course_id) || []
			);

			// Filter to only unpurchased courses
			const unpurchasedCourses = courses.filter(
				(c: { id: string }) => !paidCourseIds.has(c.id)
			);

			if (unpurchasedCourses.length === 0) {
				return { success: false, error: "Kamu sudah memiliki semua kursus!" };
			}

			invoiceNumber = generateInvoiceNumber(true);
			// Use price from database instead of hardcoded constant
			amount = bundleCourse.price;
			itemName = bundleCourse.title;
			callbackUrls = getCallbackUrls(true);

			// Create enrollment data for all unpurchased courses
			const expiresAt = new Date(Date.now() + PAYMENT.expiryMinutes * 60 * 1000).toISOString();
			enrollmentData = unpurchasedCourses.map((course: { id: string }) => ({
				user_id: userId,
				course_id: course.id,
				payment_status: "pending" as const,
				payment_reference: invoiceNumber,
				amount_paid: 0, // Will be updated on successful payment
				expires_at: expiresAt,
			}));
		} else {
			// Single course purchase
			const { courseId, courseSlug, courseName, coursePrice } = data;

			// Check if already enrolled
			const { data: existingEnrollment } = await supabase
				.from("enrollments")
				.select("id, payment_status")
				.eq("user_id", userId)
				.eq("course_id", courseId)
				.eq("payment_status", "paid")
				.maybeSingle();

			if (existingEnrollment) {
				return { success: false, error: "Kamu sudah terdaftar di kursus ini" };
			}

			invoiceNumber = generateInvoiceNumber(false, courseId);
			amount = coursePrice;
			itemName = courseName;
			callbackUrls = getCallbackUrls(false, courseSlug);

			const expiresAt = new Date(Date.now() + PAYMENT.expiryMinutes * 60 * 1000).toISOString();
			enrollmentData = [
				{
					user_id: userId,
					course_id: courseId,
					payment_status: "pending" as const,
					payment_reference: invoiceNumber,
					amount_paid: 0,
					expires_at: expiresAt,
				},
			];
		}

		// 3. Create pending enrollments (upsert to handle retries)
		const { error: enrollError } = await supabase
			.from("enrollments")
			.upsert(enrollmentData, {
				onConflict: "user_id,course_id",
				ignoreDuplicates: false,
			});

		if (enrollError) {
			console.error("Error creating pending enrollment:", enrollError);
			return { success: false, error: "Gagal membuat data pendaftaran" };
		}

		// 4. Call DOKU API
		const dokuResult = await createDokuPayment({
			order: {
				amount,
				invoice_number: invoiceNumber,
				currency: PAYMENT.currency,
				callback_url: callbackUrls.success,
				callback_url_cancel: callbackUrls.cancel,
				callback_url_result: callbackUrls.success,
				language: "ID",
				auto_redirect: true,
				disable_retry_payment: false,
				line_items: [
					{
						id: invoiceNumber,
						name: sanitizeForDoku(itemName).slice(0, 255), // Max 255 chars
						quantity: 1,
						price: amount,
					},
				],
			},
			payment: {
				payment_due_date: PAYMENT.expiryMinutes,
				payment_method_types: [...ALL_PAYMENT_METHODS],
			},
			customer: {
				id: userId,
				name: sanitizeForDoku(profile?.full_name || userEmail.split("@")[0]).slice(0, 255),
				email: userEmail,
				phone: profile?.phone || undefined,
			},
		});

		if (!dokuResult.success || !dokuResult.data) {
			console.error("DOKU payment creation failed:", dokuResult.error);
			return {
				success: false,
				error: dokuResult.error || "Gagal memproses pembayaran",
			};
		}

		// 5. Return payment URL
		return {
			success: true,
			paymentUrl: dokuResult.data.response.payment.url,
			invoiceNumber,
		};
	});

/**
 * Verify payment status after redirect
 *
 * Called when user returns from DOKU with ?payment=success
 * Checks the actual payment status and updates enrollment if needed.
 */
export const verifyPaymentFn = createServerFn({ method: "POST" })
	.inputValidator((data: VerifyPaymentInput) => data)
	.handler(async ({ data }): Promise<VerifyPaymentResult> => {
		const { invoiceNumber } = data;
		const supabase = await getSupabaseServerClient();

		// Check authentication
		const { data: authData, error: authError } = await supabase.auth.getUser();
		if (authError || !authData.user) {
			return { success: false, error: "Silakan login terlebih dahulu" };
		}

		// Check payment status with DOKU
		const statusResult = await checkDokuPaymentStatus(invoiceNumber);

		if (!statusResult.success || !statusResult.data) {
			// Don't return error - the webhook might update it later
			return {
				success: true,
				status: "pending",
				message: "Menunggu konfirmasi pembayaran",
			};
		}

		const dokuStatus = statusResult.data.transaction.status;
		const channel = statusResult.data.channel?.id || "";

		// Map status
		let paymentStatus: "pending" | "paid" | "failed" | "expired";
		let message: string;

		switch (dokuStatus) {
			case "SUCCESS":
				paymentStatus = "paid";
				message = "Pembayaran berhasil! Kursus telah dibuka.";
				break;
			case "FAILED":
				paymentStatus = "failed";
				message = "Pembayaran gagal. Silakan coba lagi.";
				break;
			case "EXPIRED":
				paymentStatus = "expired";
				message = "Pembayaran kedaluwarsa. Silakan buat transaksi baru.";
				break;
			default:
				paymentStatus = "pending";
				message = "Menunggu konfirmasi pembayaran";
		}

		// Update enrollments if status changed
		if (paymentStatus !== "pending") {
			const updateData: Record<string, unknown> = {
				payment_status: paymentStatus,
			};

			if (paymentStatus === "paid") {
				updateData.purchased_at = new Date().toISOString();
				updateData.expires_at = null;
				updateData.payment_method = mapChannelToPaymentMethod(channel);
				updateData.payment_channel = channel;
			}

			await supabase
				.from("enrollments")
				.update(updateData)
				.eq("payment_reference", invoiceNumber)
				.eq("user_id", authData.user.id);
		}

		return {
			success: true,
			status: paymentStatus,
			message,
		};
	});

/**
 * Get pending enrollment by invoice number
 * Used to resume a payment flow
 */
export const getPendingPaymentFn = createServerFn({ method: "GET" })
	.inputValidator((data: { invoiceNumber: string }) => data)
	.handler(async ({ data }) => {
		const supabase = await getSupabaseServerClient();

		const { data: authData, error: authError } = await supabase.auth.getUser();
		if (authError || !authData.user) {
			return { success: false, error: "Not authenticated" };
		}

		const { data: enrollment, error } = await supabase
			.from("enrollments")
			.select("*")
			.eq("payment_reference", data.invoiceNumber)
			.eq("user_id", authData.user.id)
			.eq("payment_status", "pending")
			.maybeSingle();

		if (error || !enrollment) {
			return { success: false, error: "Pending payment not found" };
		}

		return { success: true, enrollment };
	});
