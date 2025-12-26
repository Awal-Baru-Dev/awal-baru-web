import { PAYMENT } from "@/lib/config/constants";

/**
 * Format a number to Indonesian Rupiah currency
 * @example formatPrice(149000) → "Rp149.000"
 */
export function formatPrice(price: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: PAYMENT.currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price);
}

/**
 * Format a number with thousand separators
 * @example formatNumber(1250) → "1.250"
 */
export function formatNumber(num: number): string {
	return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Format minutes to human-readable duration string
 * @example formatDuration(90) → "1 jam 30 menit"
 * @example formatDuration(45) → "45 menit"
 */
export function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} menit`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (remainingMinutes === 0) {
		return `${hours} jam`;
	}

	return `${hours} jam ${remainingMinutes} menit`;
}

/**
 * Format seconds to mm:ss format
 * @example formatTime(125) → "2:05"
 */
export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format a date to Indonesian locale
 * @example formatDate(new Date()) → "24 Desember 2024"
 */
export function formatDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(d);
}

/**
 * Format a date to relative time (e.g., "5 menit lalu")
 */
export function formatRelativeTime(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSeconds < 60) {
		return "Baru saja";
	}
	if (diffMinutes < 60) {
		return `${diffMinutes} menit lalu`;
	}
	if (diffHours < 24) {
		return `${diffHours} jam lalu`;
	}
	if (diffDays < 7) {
		return `${diffDays} hari lalu`;
	}

	return formatDate(d);
}

/**
 * Truncate a string to a maximum length
 * @example truncate("Hello World", 5) → "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
	if (str.length <= maxLength) return str;
	return `${str.slice(0, maxLength)}...`;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
