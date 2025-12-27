import { z } from "zod";

/**
 * Password validation requirements
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = [
	{ key: "length", label: "Minimal 8 karakter", test: (p: string) => p.length >= PASSWORD_MIN_LENGTH },
	{ key: "lowercase", label: "Huruf kecil (a-z)", test: (p: string) => /[a-z]/.test(p) },
	{ key: "uppercase", label: "Huruf besar (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
	{ key: "number", label: "Angka (0-9)", test: (p: string) => /[0-9]/.test(p) },
] as const;

/**
 * Check which password requirements are met
 */
export function checkPasswordRequirements(password: string) {
	return PASSWORD_REQUIREMENTS.map((req) => ({
		...req,
		met: req.test(password),
	}));
}

/**
 * Calculate password strength (0-4)
 * 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong
 */
export function calculatePasswordStrength(password: string): {
	score: number;
	label: string;
	color: string;
} {
	if (!password) {
		return { score: 0, label: "", color: "" };
	}

	const requirements = checkPasswordRequirements(password);
	const metCount = requirements.filter((r) => r.met).length;

	// Additional checks for extra strength
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
	const isLong = password.length >= 12;

	let score = metCount;
	if (hasSpecialChar) score += 0.5;
	if (isLong) score += 0.5;

	// Normalize to 1-4 scale
	if (score <= 1) return { score: 1, label: "Lemah", color: "bg-red-500" };
	if (score <= 2) return { score: 2, label: "Cukup", color: "bg-orange-500" };
	if (score <= 3.5) return { score: 3, label: "Baik", color: "bg-yellow-500" };
	return { score: 4, label: "Kuat", color: "bg-green-500" };
}

/**
 * Login form schema
 */
export const loginSchema = z.object({
	email: z
		.string()
		.min(1, "Email wajib diisi")
		.email("Format email tidak valid"),
	password: z
		.string()
		.min(1, "Password wajib diisi"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form field schemas (for individual field validation)
 */
export const registerFieldSchemas = {
	fullName: z
		.string()
		.min(1, "Nama wajib diisi")
		.min(2, "Nama minimal 2 karakter")
		.max(100, "Nama maksimal 100 karakter"),
	email: z
		.string()
		.min(1, "Email wajib diisi")
		.email("Format email tidak valid"),
	password: z
		.string()
		.min(PASSWORD_MIN_LENGTH, `Password minimal ${PASSWORD_MIN_LENGTH} karakter`)
		.refine(
			(p) => /[a-z]/.test(p),
			"Password harus mengandung huruf kecil"
		)
		.refine(
			(p) => /[A-Z]/.test(p),
			"Password harus mengandung huruf besar"
		)
		.refine(
			(p) => /[0-9]/.test(p),
			"Password harus mengandung angka"
		),
	confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
};

/**
 * Registration form schema
 */
export const registerSchema = z
	.object(registerFieldSchemas)
	.refine((data) => data.password === data.confirmPassword, {
		message: "Password tidak cocok",
		path: ["confirmPassword"],
	});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, "Email wajib diisi")
		.email("Format email tidak valid"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(PASSWORD_MIN_LENGTH, `Password minimal ${PASSWORD_MIN_LENGTH} karakter`)
			.refine(
				(p) => /[a-z]/.test(p),
				"Password harus mengandung huruf kecil"
			)
			.refine(
				(p) => /[A-Z]/.test(p),
				"Password harus mengandung huruf besar"
			)
			.refine(
				(p) => /[0-9]/.test(p),
				"Password harus mengandung angka"
			),
		confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Password tidak cocok",
		path: ["confirmPassword"],
	});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
