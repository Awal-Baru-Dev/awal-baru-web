import crypto from "crypto";
import { env } from "@/lib/config/env";

/**
 * DOKU Checkout Integration Library
 *
 * Provides utilities for integrating with DOKU payment gateway.
 * Supports both sandbox and production environments.
 */

/**
 * Get DOKU configuration from environment
 */
export function getDokuConfig() {
	const environment = env.VITE_DOKU_ENVIRONMENT || "sandbox";
	return {
		clientId: env.DOKU_CLIENT_ID || "",
		secretKey: env.DOKU_SECRET_KEY || "",
		environment,
		apiUrl:
			environment === "production"
				? "https://api.doku.com/checkout/v1/payment"
				: "https://api-sandbox.doku.com/checkout/v1/payment",
		statusBaseUrl:
			environment === "production"
				? "https://api.doku.com"
				: "https://api-sandbox.doku.com",
	};
}

/**
 * Get DOKU JS URL for client-side (modal checkout)
 */
export function getDokuJsUrl(): string {
	const environment = env.VITE_DOKU_ENVIRONMENT || "sandbox";
	return environment === "production"
		? "https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"
		: "https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js";
}

/**
 * Generate DOKU signature for POST API requests
 *
 * Signature components:
 * - Client-Id
 * - Request-Id
 * - Request-Timestamp
 * - Request-Target (endpoint path)
 * - Digest (SHA256 hash of request body)
 *
 * Format: HMACSHA256=base64(hmac-sha256(secret, component-signature))
 */
export function generateSignature(
	clientId: string,
	requestId: string,
	requestTimestamp: string,
	requestTarget: string,
	requestBody: string,
	secretKey: string,
): string {
	// Generate digest (SHA256 of request body, base64 encoded)
	const digest = crypto
		.createHash("sha256")
		.update(requestBody)
		.digest("base64");

	// Create component signature string
	const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

	// Generate HMAC-SHA256 signature
	const signature = crypto
		.createHmac("sha256", secretKey)
		.update(componentSignature)
		.digest("base64");

	return `HMACSHA256=${signature}`;
}

/**
 * Generate signature for GET requests (no body)
 */
export function generateGetSignature(
	clientId: string,
	requestId: string,
	requestTimestamp: string,
	requestTarget: string,
	secretKey: string,
): string {
	const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}`;

	const signature = crypto
		.createHmac("sha256", secretKey)
		.update(componentSignature)
		.digest("base64");

	return `HMACSHA256=${signature}`;
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
	return crypto.randomUUID();
}

/**
 * Generate ISO8601 UTC timestamp for DOKU requests
 */
export function generateTimestamp(): string {
	return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * All supported payment methods for DOKU Checkout
 */
export const ALL_PAYMENT_METHODS = [
	// Virtual Account
	"VIRTUAL_ACCOUNT_BCA",
	"VIRTUAL_ACCOUNT_BANK_MANDIRI",
	"VIRTUAL_ACCOUNT_BANK_SYARIAH_MANDIRI",
	"VIRTUAL_ACCOUNT_BRI",
	"VIRTUAL_ACCOUNT_BNI",
	"VIRTUAL_ACCOUNT_DOKU",
	"VIRTUAL_ACCOUNT_BANK_PERMATA",
	"VIRTUAL_ACCOUNT_BANK_CIMB",
	"VIRTUAL_ACCOUNT_BANK_DANAMON",
	"VIRTUAL_ACCOUNT_BTN",
	"VIRTUAL_ACCOUNT_BNC",
	// Credit Card
	"CREDIT_CARD",
	// E-Wallet
	"EMONEY_OVO",
	"EMONEY_SHOPEE_PAY",
	"EMONEY_DANA",
	"EMONEY_LINKAJA",
	"EMONEY_DOKU",
	// QRIS
	"QRIS",
	// Convenience Store
	"ONLINE_TO_OFFLINE_ALFA",
	"ONLINE_TO_OFFLINE_INDOMARET",
	// Direct Debit
	"DIRECT_DEBIT_BRI",
	// Paylater
	"PEER_TO_PEER_AKULAKU",
	"PEER_TO_PEER_KREDIVO",
	"PEER_TO_PEER_INDODANA",
] as const;

export type PaymentMethod = (typeof ALL_PAYMENT_METHODS)[number];

// ============================================================================
// Types
// ============================================================================

export interface DokuLineItem {
	id: string;
	name: string;
	quantity: number;
	price: number;
	sku?: string;
	category?: string;
	url?: string;
	image_url?: string;
	type?: string;
}

export interface DokuOrder {
	amount: number;
	invoice_number: string;
	currency?: string;
	callback_url?: string;
	callback_url_cancel?: string;
	callback_url_result?: string;
	language?: string;
	auto_redirect?: boolean;
	disable_retry_payment?: boolean;
	line_items?: DokuLineItem[];
}

export interface DokuPayment {
	payment_due_date?: number;
	payment_method_types?: string[];
	type?: "SALE" | "INSTALLMENT" | "AUTHORIZE";
}

export interface DokuCustomer {
	id?: string;
	name?: string;
	last_name?: string;
	email?: string;
	phone?: string;
	address?: string;
	postcode?: string;
	state?: string;
	city?: string;
	country?: string;
}

export interface DokuPaymentRequest {
	order: DokuOrder;
	payment?: DokuPayment;
	customer?: DokuCustomer;
	additional_info?: Record<string, unknown>;
}

export interface DokuPaymentResponse {
	message: string[];
	response: {
		order: {
			amount: string;
			invoice_number: string;
			currency: string;
			session_id: string;
		};
		payment: {
			payment_method_types: string[];
			payment_due_date: number;
			token_id: string;
			url: string;
			expired_date: string;
		};
		uuid: string;
		headers: {
			request_id: string;
			signature: string;
			date: string;
			client_id: string;
		};
	};
}

export interface DokuNotification {
	order: {
		invoice_number: string;
		amount: number;
	};
	transaction: {
		status: string;
		date: string;
		original_request_id: string;
	};
	channel: {
		id: string;
	};
	acquirer?: {
		id: string;
	};
	virtual_account_info?: {
		virtual_account_number: string;
	};
	service: {
		id: string;
	};
}

export interface DokuOrderStatusResponse {
	order: {
		invoice_number: string;
		amount: number;
	};
	transaction: {
		status: "SUCCESS" | "PENDING" | "FAILED" | "EXPIRED";
		date?: string;
	};
	acquirer?: {
		id: string;
	};
	channel?: {
		id: string;
	};
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a payment request to DOKU
 */
export async function createDokuPayment(
	request: DokuPaymentRequest,
): Promise<{ success: boolean; data?: DokuPaymentResponse; error?: string }> {
	const config = getDokuConfig();

	if (!config.clientId || !config.secretKey) {
		return { success: false, error: "DOKU credentials not configured" };
	}

	const requestId = generateRequestId();
	const requestTimestamp = generateTimestamp();
	const requestTarget = "/checkout/v1/payment";
	const requestBody = JSON.stringify(request);

	const signature = generateSignature(
		config.clientId,
		requestId,
		requestTimestamp,
		requestTarget,
		requestBody,
		config.secretKey,
	);

	try {
		const response = await fetch(config.apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Client-Id": config.clientId,
				"Request-Id": requestId,
				"Request-Timestamp": requestTimestamp,
				Signature: signature,
			},
			body: requestBody,
		});

		const data = await response.json();

		if (!response.ok) {
			console.error("DOKU API error:", data);
			return {
				success: false,
				error: data.error_messages?.join(", ") || "Payment initiation failed",
			};
		}

		return { success: true, data };
	} catch (error) {
		console.error("DOKU request error:", error);
		return { success: false, error: "Failed to connect to payment gateway" };
	}
}

/**
 * Check payment status from DOKU
 */
export async function checkDokuPaymentStatus(
	invoiceNumber: string,
): Promise<{ success: boolean; data?: DokuOrderStatusResponse; error?: string }> {
	const config = getDokuConfig();

	if (!config.clientId || !config.secretKey) {
		return { success: false, error: "DOKU credentials not configured" };
	}

	const requestTarget = `/orders/v1/status/${invoiceNumber}`;
	const requestId = generateRequestId();
	const requestTimestamp = generateTimestamp();

	const signature = generateGetSignature(
		config.clientId,
		requestId,
		requestTimestamp,
		requestTarget,
		config.secretKey,
	);

	try {
		const response = await fetch(`${config.statusBaseUrl}${requestTarget}`, {
			method: "GET",
			headers: {
				"Client-Id": config.clientId,
				"Request-Id": requestId,
				"Request-Timestamp": requestTimestamp,
				Signature: signature,
			},
		});

		const data = await response.json();

		if (!response.ok) {
			console.error("DOKU status check error:", data);
			return {
				success: false,
				error: data.error_messages?.join(", ") || "Status check failed",
			};
		}

		return { success: true, data };
	} catch (error) {
		console.error("DOKU status check error:", error);
		return { success: false, error: "Failed to connect to payment gateway" };
	}
}

/**
 * Verify DOKU notification signature
 */
export function verifyNotificationSignature(
	clientId: string,
	requestId: string,
	requestTimestamp: string,
	requestTarget: string,
	requestBody: string,
	receivedSignature: string,
	secretKey: string,
): boolean {
	const expectedSignature = generateSignature(
		clientId,
		requestId,
		requestTimestamp,
		requestTarget,
		requestBody,
		secretKey,
	);
	return expectedSignature === receivedSignature;
}

/**
 * Map DOKU channel to payment method string for database
 */
export function mapChannelToPaymentMethod(
	channel: string,
): "virtual_account" | "credit_card" | "e_wallet" | "retail" | "direct_debit" | "paylater" {
	if (channel.startsWith("VIRTUAL_ACCOUNT_")) return "virtual_account";
	if (channel === "CREDIT_CARD") return "credit_card";
	if (channel.startsWith("EMONEY_") || channel === "QRIS") return "e_wallet";
	if (channel.startsWith("ONLINE_TO_OFFLINE_")) return "retail";
	if (channel.startsWith("DIRECT_DEBIT_")) return "direct_debit";
	if (channel.startsWith("PEER_TO_PEER_")) return "paylater";
	return "e_wallet"; // default fallback
}
