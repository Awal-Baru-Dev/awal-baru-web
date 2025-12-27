import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Camera, Loader2, User, Calendar, Lock, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FormField } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, getUserDisplayName } from "@/contexts/user-context";
import { updateProfileFn, uploadAvatarFn, changePasswordFn } from "@/features/profile";
import {
	profileSchema,
	changePasswordSchema,
	validateAvatarFile,
	type ProfileFormData,
	type ChangePasswordFormData,
} from "@/lib/validations/profile";

export const Route = createFileRoute("/_authed/dashboard_/profil")({
	component: ProfilPage,
});

/**
 * Format join date to Indonesian locale
 */
function formatJoinDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function ProfilPage() {
	const { user, profile } = useUser();
	const router = useRouter();
	const displayName = getUserDisplayName(user, profile);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Avatar state
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

	// Profile form state
	const [profileData, setProfileData] = useState<ProfileFormData>({
		fullName: profile?.full_name || "",
		phone: profile?.phone || "",
	});
	const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
	const [profileTouched, setProfileTouched] = useState<Record<string, boolean>>({});
	const [isProfileLoading, setIsProfileLoading] = useState(false);

	// Password form state
	const [passwordData, setPasswordData] = useState<ChangePasswordFormData>({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof ChangePasswordFormData, string>>>({});
	const [passwordTouched, setPasswordTouched] = useState<Record<string, boolean>>({});
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);

	// Profile form validation
	const validateProfileField = (field: keyof ProfileFormData, value: string) => {
		try {
			const testData = { ...profileData, [field]: value };
			profileSchema.parse(testData);
			setProfileErrors((prev) => ({ ...prev, [field]: undefined }));
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as { errors: Array<{ path: string[]; message: string }> };
				const fieldError = zodError.errors.find((e) => e.path[0] === field);
				if (fieldError) {
					setProfileErrors((prev) => ({ ...prev, [field]: fieldError.message }));
				}
			}
		}
	};

	const handleProfileChange = (field: keyof ProfileFormData) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = e.target.value;
		setProfileData((prev) => ({ ...prev, [field]: value }));
		if (profileTouched[field]) {
			validateProfileField(field, value);
		}
	};

	const handleProfileBlur = (field: keyof ProfileFormData) => () => {
		setProfileTouched((prev) => ({ ...prev, [field]: true }));
		validateProfileField(field, profileData[field] || "");
	};

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			profileSchema.parse(profileData);
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as { errors: Array<{ path: string[]; message: string }> };
				const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
				const newTouched: Record<string, boolean> = {};

				for (const err of zodError.errors) {
					const field = err.path[0] as keyof ProfileFormData;
					newErrors[field] = err.message;
					newTouched[field] = true;
				}

				setProfileErrors(newErrors);
				setProfileTouched((prev) => ({ ...prev, ...newTouched }));
				return;
			}
		}

		setIsProfileLoading(true);
		try {
			const result = await updateProfileFn({
				data: {
					fullName: profileData.fullName,
					phone: profileData.phone || "",
				},
			});

			if (result.error) {
				toast.error("Gagal Menyimpan", { description: result.message });
			} else {
				toast.success("Profil Berhasil Diperbarui");
				await router.invalidate();
			}
		} finally {
			setIsProfileLoading(false);
		}
	};

	// Password form validation
	const validatePasswordField = (field: keyof ChangePasswordFormData, value: string) => {
		try {
			const testData = { ...passwordData, [field]: value };
			changePasswordSchema.parse(testData);
			setPasswordErrors({});
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as { errors: Array<{ path: string[]; message: string }> };
				const newErrors: Partial<Record<keyof ChangePasswordFormData, string>> = {};
				for (const err of zodError.errors) {
					const errField = err.path[0] as keyof ChangePasswordFormData;
					if (errField === field || passwordTouched[errField]) {
						newErrors[errField] = err.message;
					}
				}
				setPasswordErrors(newErrors);
			}
		}
	};

	const handlePasswordChange = (field: keyof ChangePasswordFormData) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = e.target.value;
		setPasswordData((prev) => ({ ...prev, [field]: value }));
		if (passwordTouched[field]) {
			validatePasswordField(field, value);
		}
	};

	const handlePasswordBlur = (field: keyof ChangePasswordFormData) => () => {
		setPasswordTouched((prev) => ({ ...prev, [field]: true }));
		validatePasswordField(field, passwordData[field]);
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			changePasswordSchema.parse(passwordData);
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as { errors: Array<{ path: string[]; message: string }> };
				const newErrors: Partial<Record<keyof ChangePasswordFormData, string>> = {};
				const newTouched: Record<string, boolean> = {};

				for (const err of zodError.errors) {
					const field = err.path[0] as keyof ChangePasswordFormData;
					newErrors[field] = err.message;
					newTouched[field] = true;
				}

				setPasswordErrors(newErrors);
				setPasswordTouched((prev) => ({ ...prev, ...newTouched }));
				return;
			}
		}

		setIsPasswordLoading(true);
		try {
			const result = await changePasswordFn({
				data: {
					currentPassword: passwordData.currentPassword,
					newPassword: passwordData.newPassword,
				},
			});

			if (result.error) {
				toast.error("Gagal Mengubah Password", { description: result.message });
			} else {
				toast.success("Password Berhasil Diubah");
				// Clear password form
				setPasswordData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
				setPasswordTouched({});
				setPasswordErrors({});
			}
		} finally {
			setIsPasswordLoading(false);
		}
	};

	// Avatar upload handler
	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Client-side validation
		const validation = validateAvatarFile(file);
		if (!validation.valid) {
			toast.error("Upload Gagal", { description: validation.error });
			return;
		}

		// Show preview immediately
		const previewUrl = URL.createObjectURL(file);
		setAvatarPreview(previewUrl);

		// Convert to base64
		const reader = new FileReader();
		reader.onload = async () => {
			setIsUploadingAvatar(true);
			try {
				const result = await uploadAvatarFn({
					data: {
						fileBase64: reader.result as string,
						fileName: file.name,
						mimeType: file.type,
					},
				});

				if (result.error) {
					toast.error("Upload Gagal", { description: result.message });
					setAvatarPreview(null);
				} else {
					toast.success("Foto Profil Berhasil Diperbarui");
					await router.invalidate();
				}
			} finally {
				setIsUploadingAvatar(false);
			}
		};
		reader.readAsDataURL(file);

		// Clear input so same file can be selected again
		e.target.value = "";
	};

	// Get current avatar URL
	const currentAvatarUrl = avatarPreview || profile?.avatar_url;

	return (
		<DashboardLayout>
			<div className="p-4 lg:p-8 space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-2xl lg:text-3xl font-bold text-foreground">
						Profil Saya
					</h1>
					<p className="text-muted-foreground mt-1">
						Kelola informasi profil dan akun kamu.
					</p>
				</div>

				{/* Profile Info Card */}
				<div className="bg-card border border-border rounded-xl p-6">
					<div className="flex items-center gap-2 mb-6">
						<User className="w-5 h-5 text-brand-primary" />
						<h2 className="text-lg font-semibold text-foreground">
							Informasi Profil
						</h2>
					</div>

					<form onSubmit={handleProfileSubmit}>
						<div className="flex flex-col md:flex-row gap-8">
							{/* Avatar Section */}
							<div className="flex flex-col items-center space-y-4">
								{/* Avatar Preview */}
								<div className="relative">
									<div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
										{currentAvatarUrl ? (
											<img
												src={currentAvatarUrl}
												alt="Avatar"
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center bg-brand-primary/10">
												<span className="text-2xl font-bold text-brand-primary">
													{displayName.charAt(0).toUpperCase()}
												</span>
											</div>
										)}
									</div>
									{isUploadingAvatar && (
										<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
											<Loader2 className="w-6 h-6 text-white animate-spin" />
										</div>
									)}
								</div>

								{/* Upload Button */}
								<input
									type="file"
									ref={fileInputRef}
									accept="image/jpeg,image/png,image/webp"
									onChange={handleAvatarChange}
									className="hidden"
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploadingAvatar}
								>
									<Camera className="w-4 h-4 mr-2" />
									Ubah Foto
								</Button>
								<p className="text-xs text-muted-foreground text-center">
									JPG, PNG, atau WebP
									<br />
									Maksimal 2MB
								</p>
							</div>

							{/* Form Fields */}
							<div className="flex-1 space-y-4">
								<FormField
									id="fullName"
									label="Nama Lengkap"
									error={profileTouched.fullName ? profileErrors.fullName : undefined}
								>
									<Input
										id="fullName"
										value={profileData.fullName}
										onChange={handleProfileChange("fullName")}
										onBlur={handleProfileBlur("fullName")}
										placeholder="Masukkan nama lengkap"
										disabled={isProfileLoading}
										aria-invalid={!!profileErrors.fullName}
									/>
								</FormField>

								<div className="space-y-2">
									<Label htmlFor="email" className="flex items-center gap-2">
										<Mail className="w-4 h-4 text-muted-foreground" />
										Email
									</Label>
									<Input
										id="email"
										type="email"
										value={user?.email || ""}
										disabled
										className="bg-muted"
									/>
									<p className="text-xs text-muted-foreground">
										Email tidak dapat diubah
									</p>
								</div>

								<FormField
									id="phone"
									label="Nomor Telepon"
									error={profileTouched.phone ? profileErrors.phone : undefined}
								>
									<div className="relative">
										<Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											id="phone"
											value={profileData.phone}
											onChange={handleProfileChange("phone")}
											onBlur={handleProfileBlur("phone")}
											placeholder="08xx-xxxx-xxxx"
											disabled={isProfileLoading}
											className="pl-10"
											aria-invalid={!!profileErrors.phone}
										/>
									</div>
								</FormField>

								<div className="pt-2">
									<Button
										type="submit"
										disabled={isProfileLoading}
										className="w-full md:w-auto"
									>
										{isProfileLoading && (
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										)}
										Simpan Perubahan
									</Button>
								</div>
							</div>
						</div>
					</form>
				</div>

				{/* Password Change Card */}
				<div className="bg-card border border-border rounded-xl p-6">
					<div className="flex items-center gap-2 mb-6">
						<Lock className="w-5 h-5 text-brand-primary" />
						<h2 className="text-lg font-semibold text-foreground">
							Ubah Password
						</h2>
					</div>

					<form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
						<FormField
							id="currentPassword"
							label="Password Saat Ini"
							error={passwordTouched.currentPassword ? passwordErrors.currentPassword : undefined}
						>
							<PasswordInput
								id="currentPassword"
								value={passwordData.currentPassword}
								onChange={handlePasswordChange("currentPassword")}
								onBlur={handlePasswordBlur("currentPassword")}
								placeholder="Masukkan password saat ini"
								disabled={isPasswordLoading}
								error={!!passwordErrors.currentPassword}
							/>
						</FormField>

						<FormField
							id="newPassword"
							label="Password Baru"
							error={passwordTouched.newPassword ? passwordErrors.newPassword : undefined}
						>
							<PasswordInput
								id="newPassword"
								value={passwordData.newPassword}
								onChange={handlePasswordChange("newPassword")}
								onBlur={handlePasswordBlur("newPassword")}
								placeholder="Masukkan password baru"
								disabled={isPasswordLoading}
								error={!!passwordErrors.newPassword}
							/>
							<PasswordStrength password={passwordData.newPassword} />
						</FormField>

						<FormField
							id="confirmPassword"
							label="Konfirmasi Password Baru"
							error={passwordTouched.confirmPassword ? passwordErrors.confirmPassword : undefined}
						>
							<PasswordInput
								id="confirmPassword"
								value={passwordData.confirmPassword}
								onChange={handlePasswordChange("confirmPassword")}
								onBlur={handlePasswordBlur("confirmPassword")}
								placeholder="Konfirmasi password baru"
								disabled={isPasswordLoading}
								error={!!passwordErrors.confirmPassword}
							/>
						</FormField>

						<div className="pt-2">
							<Button
								type="submit"
								disabled={isPasswordLoading}
								className="w-full md:w-auto"
							>
								{isPasswordLoading && (
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								)}
								Ubah Password
							</Button>
						</div>
					</form>
				</div>

				{/* Account Info Card */}
				<div className="bg-card border border-border rounded-xl p-6">
					<div className="flex items-center gap-2 mb-4">
						<Calendar className="w-5 h-5 text-brand-primary" />
						<h2 className="text-lg font-semibold text-foreground">
							Informasi Akun
						</h2>
					</div>

					<div className="flex items-center gap-3 text-muted-foreground">
						<span>Member sejak</span>
						{profile?.created_at ? (
							<span className="font-medium text-foreground">
								{formatJoinDate(profile.created_at)}
							</span>
						) : (
							<Skeleton className="h-5 w-32" />
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
