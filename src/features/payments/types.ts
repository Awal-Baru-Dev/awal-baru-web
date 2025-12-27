/**
 * Payment Feature Types
 */

import type { PaymentStatus } from "@/lib/db/types";

/**
 * Input for creating a single course payment
 */
export interface CreatePaymentInput {
	isBundle: false;
	courseId: string;
	courseSlug: string;
	courseName: string;
	coursePrice: number;
}

/**
 * Input for creating a bundle payment (all courses)
 */
export interface CreateBundlePaymentInput {
	isBundle: true;
}

/**
 * Combined input type for payment creation
 */
export type PaymentInput = CreatePaymentInput | CreateBundlePaymentInput;

/**
 * Result from createPaymentFn
 */
export interface CreatePaymentResult {
	success: boolean;
	paymentUrl?: string;
	invoiceNumber?: string;
	error?: string;
}

/**
 * Input for verifying a payment
 */
export interface VerifyPaymentInput {
	invoiceNumber: string;
}

/**
 * Result from verifyPaymentFn
 */
export interface VerifyPaymentResult {
	success: boolean;
	status?: PaymentStatus;
	message?: string;
	error?: string;
}

/**
 * Payment query keys for React Query
 */
export const paymentKeys = {
	all: ["payments"] as const,
	pending: () => [...paymentKeys.all, "pending"] as const,
};
