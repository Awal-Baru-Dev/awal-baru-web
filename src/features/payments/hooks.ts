/**
 * Payment React Query Hooks
 */

import { useMutation } from "@tanstack/react-query";
import { createPaymentFn, verifyPaymentFn } from "./server";
import type { PaymentInput, VerifyPaymentInput } from "./types";

/**
 * Destroy any existing DOKU checkout elements from the DOM
 *
 * DOKU's loadJokulCheckout() caches the first session and doesn't reinitialize
 * on subsequent calls. We need to remove all DOKU elements to force a fresh checkout.
 */
function destroyDokuCheckout(): void {
	if (typeof window === "undefined") return;

	// Remove DOKU iframe(s) - they typically have src containing "doku.com"
	const iframes = document.querySelectorAll('iframe[src*="doku.com"]');
	iframes.forEach((iframe) => iframe.remove());

	// Remove DOKU modal container and overlay elements
	// DOKU creates elements with specific classes/ids
	const dokuElements = document.querySelectorAll(
		'[id*="jokul"], [class*="jokul"], [id*="doku"], [class*="doku-"]'
	);
	dokuElements.forEach((el) => el.remove());

	// Also remove any modal backdrop that DOKU might create
	const modalBackdrops = document.querySelectorAll(
		'.modal-backdrop, [class*="overlay"], [class*="backdrop"]'
	);
	modalBackdrops.forEach((el) => {
		// Only remove if it looks like a DOKU-created element (not our own modals)
		if (el.querySelector('iframe[src*="doku"]') || el.id?.includes('doku') || el.id?.includes('jokul')) {
			el.remove();
		}
	});
}

/**
 * Hook to create a payment (single course or bundle)
 *
 * On success, opens DOKU checkout in a modal overlay.
 */
export function useCreatePayment() {
	return useMutation({
		mutationFn: async (input: PaymentInput) => {
			const result = await createPaymentFn({ data: input });
			return result;
		},
		onSuccess: (data) => {
			if (data.success && data.paymentUrl) {
				// Destroy any existing DOKU checkout before opening a new one
				// This fixes the issue where closing and reopening shows the old session
				destroyDokuCheckout();

				// Try to open DOKU checkout modal
				if (typeof window !== "undefined" && (window as unknown as { loadJokulCheckout?: (url: string) => void }).loadJokulCheckout) {
					(window as unknown as { loadJokulCheckout: (url: string) => void }).loadJokulCheckout(data.paymentUrl);
				} else {
					// Fallback: redirect to payment URL
					window.location.href = data.paymentUrl;
				}
			}
		},
		onError: (error) => {
			console.error("Payment creation error:", error);
		},
	});
}

/**
 * Hook to verify payment status after redirect
 */
export function useVerifyPayment() {
	return useMutation({
		mutationFn: async (input: VerifyPaymentInput) => {
			const result = await verifyPaymentFn({ data: input });
			return result;
		},
	});
}

/**
 * Get DOKU JS URL based on environment
 */
export function getDokuJsUrl(): string {
	const environment = import.meta.env.VITE_DOKU_ENVIRONMENT || "sandbox";
	return environment === "production"
		? "https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"
		: "https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js";
}
