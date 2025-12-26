/**
 * Maps Supabase auth error codes to user-friendly Indonesian messages
 */

type AuthErrorCode =
	| "invalid_credentials"
	| "email_not_confirmed"
	| "user_already_exists"
	| "weak_password"
	| "email_address_invalid"
	| "over_request_rate_limit"
	| "user_not_found"
	| "same_password"
	| "signup_disabled"
	| "email_exists"
	| string;

interface AuthError {
	title: string;
	message: string;
}

const ERROR_MESSAGES: Record<AuthErrorCode, AuthError> = {
	// Login errors
	invalid_credentials: {
		title: "Login Gagal",
		message: "Email atau password salah. Silakan coba lagi.",
	},
	email_not_confirmed: {
		title: "Email Belum Diverifikasi",
		message: "Silakan cek email kamu dan klik link verifikasi untuk melanjutkan.",
	},

	// Registration errors
	user_already_exists: {
		title: "Email Sudah Terdaftar",
		message: "Email ini sudah digunakan. Silakan login atau gunakan email lain.",
	},
	email_exists: {
		title: "Email Sudah Terdaftar",
		message: "Email ini sudah digunakan. Silakan login atau gunakan email lain.",
	},
	weak_password: {
		title: "Password Terlalu Lemah",
		message: "Gunakan kombinasi huruf besar, huruf kecil, dan angka.",
	},
	email_address_invalid: {
		title: "Email Tidak Valid",
		message: "Format email tidak valid. Silakan periksa kembali.",
	},
	signup_disabled: {
		title: "Pendaftaran Ditutup",
		message: "Pendaftaran sementara tidak tersedia. Silakan coba lagi nanti.",
	},

	// Rate limiting
	over_request_rate_limit: {
		title: "Terlalu Banyak Percobaan",
		message: "Silakan tunggu beberapa menit sebelum mencoba lagi.",
	},

	// Password reset errors
	user_not_found: {
		title: "Email Tidak Ditemukan",
		message: "Tidak ada akun dengan email ini. Silakan daftar terlebih dahulu.",
	},
	same_password: {
		title: "Password Sama",
		message: "Password baru harus berbeda dari password lama.",
	},
};

const DEFAULT_ERROR: AuthError = {
	title: "Terjadi Kesalahan",
	message: "Silakan coba lagi atau hubungi support jika masalah berlanjut.",
};

/**
 * Get user-friendly error message from Supabase auth error
 */
export function getAuthErrorMessage(error: unknown): AuthError {
	if (!error) return DEFAULT_ERROR;

	// Handle Supabase AuthError
	if (typeof error === "object" && error !== null) {
		const err = error as { code?: string; message?: string; status?: number };

		// Check for specific error code
		if (err.code && ERROR_MESSAGES[err.code]) {
			return ERROR_MESSAGES[err.code];
		}

		// Check for error message patterns
		const message = err.message?.toLowerCase() || "";

		if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
			return ERROR_MESSAGES.invalid_credentials;
		}
		if (message.includes("email not confirmed")) {
			return ERROR_MESSAGES.email_not_confirmed;
		}
		if (message.includes("user already registered") || message.includes("already exists")) {
			return ERROR_MESSAGES.user_already_exists;
		}
		if (message.includes("rate limit") || message.includes("too many requests")) {
			return ERROR_MESSAGES.over_request_rate_limit;
		}
		if (message.includes("weak password")) {
			return ERROR_MESSAGES.weak_password;
		}

		// Return message from error if available
		if (err.message) {
			return {
				title: "Terjadi Kesalahan",
				message: err.message,
			};
		}
	}

	// Handle string errors
	if (typeof error === "string") {
		return {
			title: "Terjadi Kesalahan",
			message: error,
		};
	}

	return DEFAULT_ERROR;
}

/**
 * Check if error is a specific auth error type
 */
export function isAuthError(error: unknown, code: AuthErrorCode): boolean {
	if (!error || typeof error !== "object") return false;
	const err = error as { code?: string; message?: string };

	if (err.code === code) return true;

	// Check message patterns for common errors
	const message = err.message?.toLowerCase() || "";
	switch (code) {
		case "invalid_credentials":
			return message.includes("invalid login credentials") || message.includes("invalid credentials");
		case "email_not_confirmed":
			return message.includes("email not confirmed");
		case "user_already_exists":
			return message.includes("user already registered") || message.includes("already exists");
		default:
			return false;
	}
}
