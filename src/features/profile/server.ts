/**
 * Profile Server Functions
 *
 * Server-side profile operations using TanStack Start's createServerFn.
 * Handles profile updates, avatar uploads, and password changes.
 */

import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase/server";

/**
 * Update user profile (full_name, phone)
 */
export const updateProfileFn = createServerFn({ method: "POST" })
	.inputValidator((d: { fullName: string; phone: string }) => d)
	.handler(async ({ data }): Promise<{ error: boolean; message?: string }> => {
		const supabase = await getSupabaseServerClient();

		// Get current user
		const { data: userData, error: authError } = await supabase.auth.getUser();
		if (authError || !userData.user) {
			return { error: true, message: "Tidak terautentikasi" };
		}

		// Update profile
		const { error } = await supabase
			.from("profiles")
			.update({
				full_name: data.fullName,
				phone: data.phone || null,
				updated_at: new Date().toISOString(),
			})
			.eq("id", userData.user.id);

		if (error) {
			console.error("Profile update error:", error);
			return { error: true, message: "Gagal memperbarui profil" };
		}

		return { error: false };
	});

/**
 * Upload avatar to Supabase Storage
 * Returns the public URL of the uploaded avatar
 */
export const uploadAvatarFn = createServerFn({ method: "POST" })
	.inputValidator((d: { fileBase64: string; fileName: string; mimeType: string }) => d)
	.handler(async ({ data }): Promise<{ error: boolean; message?: string; url?: string }> => {
		const supabase = await getSupabaseServerClient();

		// Get current user
		const { data: userData, error: authError } = await supabase.auth.getUser();
		if (authError || !userData.user) {
			return { error: true, message: "Tidak terautentikasi" };
		}

		const userId = userData.user.id;

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
		if (!allowedTypes.includes(data.mimeType)) {
			return { error: true, message: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." };
		}

		// Decode base64
		const base64Data = data.fileBase64.split(",")[1] || data.fileBase64;
		const buffer = Buffer.from(base64Data, "base64");

		// Validate size (max 2MB)
		if (buffer.length > 2 * 1024 * 1024) {
			return { error: true, message: "Ukuran file maksimal 2MB" };
		}

		// Get file extension
		const extMap: Record<string, string> = {
			"image/jpeg": "jpg",
			"image/png": "png",
			"image/webp": "webp",
		};
		const ext = extMap[data.mimeType] || "jpg";
		const filePath = `${userId}/avatar.${ext}`;

		// Delete existing avatar if any (different extension)
		const { data: existingFiles } = await supabase.storage
			.from("avatars")
			.list(userId);

		if (existingFiles && existingFiles.length > 0) {
			const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
			await supabase.storage.from("avatars").remove(filesToDelete);
		}

		// Upload new avatar
		const { error: uploadError } = await supabase.storage
			.from("avatars")
			.upload(filePath, buffer, {
				contentType: data.mimeType,
				upsert: true,
			});

		if (uploadError) {
			console.error("Avatar upload error:", uploadError);
			return { error: true, message: "Gagal mengunggah foto" };
		}

		// Get public URL
		const { data: urlData } = supabase.storage
			.from("avatars")
			.getPublicUrl(filePath);

		// Add cache-busting timestamp to URL
		const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

		// Update profile with new avatar URL
		const { error: updateError } = await supabase
			.from("profiles")
			.update({
				avatar_url: avatarUrl,
				updated_at: new Date().toISOString(),
			})
			.eq("id", userId);

		if (updateError) {
			console.error("Profile avatar update error:", updateError);
			return { error: true, message: "Gagal memperbarui profil" };
		}

		return { error: false, url: avatarUrl };
	});

/**
 * Change password (requires current password verification)
 */
export const changePasswordFn = createServerFn({ method: "POST" })
	.inputValidator((d: { currentPassword: string; newPassword: string }) => d)
	.handler(async ({ data }): Promise<{ error: boolean; message?: string }> => {
		const supabase = await getSupabaseServerClient();

		// Get current user
		const { data: userData, error: authError } = await supabase.auth.getUser();
		if (authError || !userData.user || !userData.user.email) {
			return { error: true, message: "Tidak terautentikasi" };
		}

		// Verify current password by attempting to sign in
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: userData.user.email,
			password: data.currentPassword,
		});

		if (signInError) {
			return { error: true, message: "Password saat ini salah" };
		}

		// Update to new password
		const { error: updateError } = await supabase.auth.updateUser({
			password: data.newPassword,
		});

		if (updateError) {
			console.error("Password update error:", updateError);
			return { error: true, message: "Gagal memperbarui password" };
		}

		return { error: false };
	});
