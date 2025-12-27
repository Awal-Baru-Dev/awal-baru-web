import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "./auth";

/**
 * Profile update form schema
 */
export const profileSchema = z.object({
	fullName: z
		.string()
		.min(2, "Nama minimal 2 karakter")
		.max(100, "Nama maksimal 100 karakter"),
	phone: z
		.string()
		.regex(/^(\+62|62|0)?[0-9]{9,13}$/, "Format nomor telepon tidak valid")
		.or(z.literal(""))
		.optional()
		.transform((val) => val || ""),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Password change form schema
 */
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
		newPassword: z
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
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Password tidak cocok",
		path: ["confirmPassword"],
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "Password baru harus berbeda dengan password saat ini",
		path: ["newPassword"],
	});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Avatar upload validation constants
 */
export const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2MB
export const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Validate avatar file before upload
 */
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
	if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
		return {
			valid: false,
			error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP.",
		};
	}

	if (file.size > AVATAR_MAX_SIZE) {
		return {
			valid: false,
			error: "Ukuran file maksimal 2MB",
		};
	}

	return { valid: true };
}
