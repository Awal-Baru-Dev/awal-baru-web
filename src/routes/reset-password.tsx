import { useState, useCallback, useEffect } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Loader2, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { LandingHeader, LandingFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { PasswordInput, PasswordStrength, FormField } from "@/components/auth";
import { resetPasswordFn } from "@/features/auth";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import { createBrowserClient } from "@/lib/db/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reset-password")({
	component: ResetPasswordPage,
});

type FormErrors = Partial<Record<keyof ResetPasswordFormData, string>>;

function ResetPasswordPage() {
	const router = useRouter();

	const [formData, setFormData] = useState<ResetPasswordFormData>({
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
	const [resetSuccess, setResetSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Check if we have a valid recovery session
	// Note: This still uses browser client because the recovery link lands here
	// with tokens in the URL that need to be processed client-side
	useEffect(() => {
		const checkSession = async () => {
			const supabase = createBrowserClient();
			const { data: { session } } = await supabase.auth.getSession();

			// Check if this is a recovery session (from password reset link)
			if (session) {
				setIsValidSession(true);
			} else {
				// Listen for auth state change (user clicking recovery link)
				const { data: { subscription } } = supabase.auth.onAuthStateChange(
					(event: AuthChangeEvent, session: Session | null) => {
						if (event === "PASSWORD_RECOVERY" && session) {
							setIsValidSession(true);
						}
					}
				);

				// Give it a moment for the auth state to update
				setTimeout(() => {
					if (isValidSession === null) {
						setIsValidSession(false);
					}
				}, 2000);

				return () => subscription.unsubscribe();
			}
		};

		checkSession();
	}, [isValidSession]);

	// Validate a single field
	const validateField = useCallback((field: keyof ResetPasswordFormData, value: string) => {
		const testData = { ...formData, [field]: value };

		try {
			resetPasswordSchema.parse(testData);
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as { errors: Array<{ path: (string | number)[]; message: string }> };
				const fieldError = zodError.errors.find(
					(e) => e.path[0] === field
				);
				setErrors((prev) => ({
					...prev,
					[field]: fieldError?.message,
				}));
			}
		}
	}, [formData]);

	// Handle field change
	const handleChange = (field: keyof ResetPasswordFormData) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = e.target.value;
		setFormData((prev) => ({ ...prev, [field]: value }));

		if (touched[field]) {
			validateField(field, value);
		}
	};

	// Handle field blur
	const handleBlur = (field: keyof ResetPasswordFormData) => () => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		validateField(field, formData[field]);
	};

	// Handle form submit
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			resetPasswordSchema.parse(formData);
			setErrors({});
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as { errors: Array<{ path: (string | number)[]; message: string }> };
				const newErrors: FormErrors = {};
				for (const err of zodError.errors) {
					const field = err.path[0] as keyof ResetPasswordFormData;
					if (!newErrors[field]) {
						newErrors[field] = err.message;
					}
				}
				setErrors(newErrors);
				setTouched({
					password: true,
					confirmPassword: true,
				});
			}
			return;
		}

		setIsLoading(true);

		try {
			const result = await resetPasswordFn({ data: { password: formData.password } });

			if (result?.error) {
				toast.error("Gagal Mengubah Password", {
					description: result.message || "Terjadi kesalahan. Silakan coba lagi.",
				});
				return;
			}

			toast.success("Password Berhasil Diubah", {
				description: "Silakan login dengan password baru.",
			});
			setResetSuccess(true);

			// Invalidate router to update user state
			await router.invalidate();
		} catch (error) {
			console.error("Password reset error:", error);
			toast.error("Gagal Mengubah Password", {
				description: "Terjadi kesalahan. Silakan coba lagi.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Loading state while checking session
	if (isValidSession === null) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-brand-primary/5 to-background">
				<LandingHeader />
				<main className="pt-32 pb-20 px-6">
					<div className="max-w-md mx-auto">
						<div className="bg-card border border-border rounded-2xl p-8 shadow-lg border-t-4 border-t-brand-primary text-center">
							<Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
							<p className="text-muted-foreground">Memverifikasi link...</p>
						</div>
					</div>
				</main>
				<LandingFooter />
			</div>
		);
	}

	// Invalid or expired link
	if (isValidSession === false) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-brand-primary/5 to-background">
				<LandingHeader />
				<main className="pt-32 pb-20 px-6">
					<div className="max-w-md mx-auto">
						<div className="bg-card border border-border rounded-2xl p-8 shadow-lg border-t-4 border-t-destructive text-center">
							<div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
								<AlertCircle className="w-8 h-8 text-destructive" />
							</div>

							<h1 className="text-2xl font-bold text-foreground mb-2">
								Link Tidak Valid
							</h1>

							<p className="text-muted-foreground mb-6">
								Link reset password sudah kadaluarsa atau tidak valid.
								Silakan minta link baru.
							</p>

							<Link to="/lupa-password">
								<Button className="w-full btn-cta">
									Minta Link Baru
								</Button>
							</Link>
						</div>
					</div>
				</main>
				<LandingFooter />
			</div>
		);
	}

	// Success state
	if (resetSuccess) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-brand-primary/5 to-background">
				<LandingHeader />
				<main className="pt-32 pb-20 px-6">
					<div className="max-w-md mx-auto">
						<div className="bg-card border border-border rounded-2xl p-8 shadow-lg border-t-4 border-t-brand-primary text-center">
							<div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
								<CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
							</div>

							<h1 className="text-2xl font-bold text-foreground mb-2">
								Password Berhasil Diubah
							</h1>

							<p className="text-muted-foreground mb-6">
								Password baru kamu sudah aktif. Silakan login dengan password baru.
							</p>

							<Link to="/masuk">
								<Button className="w-full btn-cta">
									Login Sekarang
								</Button>
							</Link>
						</div>
					</div>
				</main>
				<LandingFooter />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-primary/5 to-background">
			<LandingHeader />

			<main className="pt-32 pb-20 px-6">
				<div className="max-w-md mx-auto">
					<div className="bg-card border border-border rounded-2xl p-8 shadow-lg border-t-4 border-t-brand-primary">
						{/* Header */}
						<div className="text-center mb-8">
							<div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
								<KeyRound className="w-8 h-8 text-brand-primary" />
							</div>
							<h1 className="text-2xl font-bold text-foreground mb-2">
								Buat Password Baru
							</h1>
							<p className="text-muted-foreground">
								Masukkan password baru untuk akun kamu.
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							<FormField
								id="password"
								label="Password Baru"
								error={touched.password ? errors.password : undefined}
							>
								<PasswordInput
									id="password"
									placeholder="Minimal 8 karakter"
									className={cn(
										"h-12",
										touched.password && errors.password && "border-destructive"
									)}
									value={formData.password}
									onChange={handleChange("password")}
									onBlur={handleBlur("password")}
									disabled={isLoading}
									autoComplete="new-password"
									autoFocus
								/>
								<PasswordStrength password={formData.password} />
							</FormField>

							<FormField
								id="confirmPassword"
								label="Konfirmasi Password Baru"
								error={touched.confirmPassword ? errors.confirmPassword : undefined}
							>
								<PasswordInput
									id="confirmPassword"
									placeholder="Ulangi password"
									className={cn(
										"h-12",
										touched.confirmPassword && errors.confirmPassword && "border-destructive"
									)}
									value={formData.confirmPassword}
									onChange={handleChange("confirmPassword")}
									onBlur={handleBlur("confirmPassword")}
									disabled={isLoading}
									autoComplete="new-password"
								/>
							</FormField>

							<Button
								type="submit"
								className="w-full h-12 btn-cta"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Menyimpan...
									</>
								) : (
									"Simpan Password Baru"
								)}
							</Button>
						</form>
					</div>
				</div>
			</main>

			<LandingFooter />
		</div>
	);
}
