import { useState, useCallback, useEffect } from "react";
import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { LandingHeader, LandingFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/lib/config/constants";
import { PasswordInput, PasswordStrength, FormField } from "@/components/auth";
import { signupFn, loginWithGoogleFn, resendConfirmationFn } from "@/features/auth/server";
import { registerSchema, registerFieldSchemas, type RegisterFormData } from "@/lib/validations/auth";
import { useUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/daftar")({
	component: DaftarPage,
});

type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

function DaftarPage() {
	const { user, isLoading: isAuthLoading } = useUser();
	const navigate = useNavigate();
	const router = useRouter();

	const [formData, setFormData] = useState<RegisterFormData>({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [showVerification, setShowVerification] = useState(false);
	const [registeredEmail, setRegisteredEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
    if (!isAuthLoading && user) {
      navigate({ to: "/" });
    }
  }, [user, isAuthLoading, navigate]);

  // Prevent Render
  if (!isAuthLoading && user) return null;

	// Validate a single field using safeParse
	const validateField = useCallback((field: keyof RegisterFormData, value: string) => {
		// Special handling for confirmPassword - check match directly
		if (field === "confirmPassword") {
			if (value.length === 0) {
				setErrors((prev) => ({ ...prev, confirmPassword: "Konfirmasi password wajib diisi" }));
			} else if (value !== formData.password) {
				setErrors((prev) => ({ ...prev, confirmPassword: "Password tidak cocok" }));
			} else {
				setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
			}
			return;
		}

		// Skip error message for password - it has PasswordStrength component
		if (field === "password") {
			// Still update confirmPassword error if password changes and confirmPassword has content
			if (formData.confirmPassword.length > 0) {
				if (formData.confirmPassword !== value) {
					setErrors((prev) => ({ ...prev, confirmPassword: "Password tidak cocok" }));
				} else {
					setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
				}
			}
			return;
		}

		// Use safeParse for fullName and email fields
		const result = registerFieldSchemas[field].safeParse(value);

		if (result.success) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		} else {
			// Access the first issue from the ZodError
			const firstError = result.error.issues?.[0]?.message || "Input tidak valid";
			setErrors((prev) => ({ ...prev, [field]: firstError }));
		}
	}, [formData.password, formData.confirmPassword]);

	// Check if form is valid for submit button
	const isFormValid = useCallback(() => {
		// Check all required fields are filled
		if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
			return false;
		}
		// Check minimum requirements
		if (formData.fullName.length < 2) return false;
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return false;
		if (formData.password.length < 8) return false;
		if (!/[a-z]/.test(formData.password)) return false;
		if (!/[A-Z]/.test(formData.password)) return false;
		if (!/[0-9]/.test(formData.password)) return false;
		if (formData.password !== formData.confirmPassword) return false;
		return true;
	}, [formData]);

	// Handle field change - just update the value, don't validate
	const handleChange = (field: keyof RegisterFormData) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = e.target.value;
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear error when user starts typing again (better UX)
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	// Handle field blur - validate only on blur when field has content
	const handleBlur = (field: keyof RegisterFormData) => () => {
		const value = formData[field];
		// Only validate on blur if there's content
		if (value.length > 0) {
			setTouched((prev) => ({ ...prev, [field]: true }));
			validateField(field, value);
		}
	};

	// Handle Google login
	const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogleFn();
      if (result.error) {
        toast.error("Gagal Login Google", { description: result.message });
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

	// Handle form submit
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate all fields
		try {
			registerSchema.parse(formData);
			setErrors({});
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as { errors: Array<{ path: (string | number)[]; message: string }> };
				const newErrors: FormErrors = {};
				for (const err of zodError.errors) {
					const field = err.path[0] as keyof RegisterFormData;
					if (!newErrors[field]) {
						newErrors[field] = err.message;
					}
				}
				setErrors(newErrors);
				// Mark all fields as touched
				setTouched({
					fullName: true,
					email: true,
					password: true,
					confirmPassword: true,
				});
			}
			return;
		}

		setIsLoading(true);

		try {
			const result = await signupFn({
				data: {
					email: formData.email,
					password: formData.password,
					fullName: formData.fullName,
				},
			});

			if (result?.error) {
				// Handle specific error cases
				const message = result.message?.toLowerCase() || "";

				if (message.includes("already") || message.includes("exists")) {
					toast.error("Email Sudah Terdaftar", {
						description: "Email ini sudah digunakan. Silakan login atau gunakan email lain.",
					});
				} else {
					toast.error("Pendaftaran Gagal", {
						description: result.message || "Terjadi kesalahan. Silakan coba lagi.",
					});
				}
				return;
			}

			// Success
			if (result?.needsConfirmation) {
				toast.success("Pendaftaran Berhasil!", {
					description: "Cek email kamu untuk verifikasi akun.",
				});
				setRegisteredEmail(formData.email);
				setShowVerification(true);
			} else {
				// No email confirmation needed - invalidate router and redirect
				toast.success("Pendaftaran Berhasil!", {
					description: "Akun kamu sudah aktif.",
				});
				await router.invalidate();
				router.navigate({ to: "/dashboard" });
			}
		} catch (error) {
			console.error("Signup error:", error);
			toast.error("Pendaftaran Gagal", {
				description: "Terjadi kesalahan. Silakan coba lagi.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle resend verification
	const handleResend = async () => {
		setIsLoading(true);
		try {
			const result = await resendConfirmationFn({ data: { email: registeredEmail } });
			if (result?.error) {
				toast.error("Gagal Mengirim Email", {
					description: result.message,
				});
			} else {
				toast.success("Email Terkirim", {
					description: "Cek inbox email kamu untuk link verifikasi.",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Show verification pending screen
	if (showVerification) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-brand-primary/5 to-background">
				<LandingHeader />

				<main className="pt-32 pb-20 px-6">
					<div className="max-w-md mx-auto">
						<div className="bg-card border border-border rounded-2xl p-8 shadow-lg border-t-4 border-t-brand-primary text-center">
							<div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
								<Mail className="w-8 h-8 text-brand-primary" />
							</div>

							<h1 className="text-2xl font-bold text-foreground mb-2">
								Cek Email Kamu
							</h1>

							<p className="text-muted-foreground mb-6">
								Kami telah mengirim link verifikasi ke{" "}
								<span className="font-medium text-foreground">
									{registeredEmail}
								</span>
								. Klik link tersebut untuk mengaktifkan akun.
							</p>

							<div className="space-y-3">
								<Button
									variant="outline"
									className="w-full"
									onClick={handleResend}
									disabled={isLoading}
								>
									{isLoading ? (
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									) : (
										<RefreshCw className="w-4 h-4 mr-2" />
									)}
									Kirim Ulang Email
								</Button>

								<Button
									variant="ghost"
									className="w-full"
									onClick={() => setShowVerification(false)}
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									Kembali ke Pendaftaran
								</Button>
							</div>

							<p className="mt-6 text-xs text-muted-foreground">
								Tidak menerima email? Cek folder spam atau{" "}
								<button
									type="button"
									onClick={handleResend}
									className="text-brand-primary hover:underline"
								>
									kirim ulang
								</button>
								.
							</p>
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
							<h1 className="text-2xl font-bold text-foreground mb-2">
								Daftar di {APP_NAME}
							</h1>
							<p className="text-muted-foreground">
								Sudah punya akun?{" "}
								<Link
									to="/masuk"
									className="text-brand-primary hover:text-brand-cta transition-colors font-medium"
								>
									Masuk di sini
								</Link>
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							<FormField
								id="fullName"
								label="Nama Lengkap"
								error={touched.fullName ? errors.fullName : undefined}
							>
								<Input
									id="fullName"
									type="text"
									placeholder="John Doe"
									className={cn(
										"h-12",
										touched.fullName && errors.fullName && "border-destructive"
									)}
									value={formData.fullName}
									onChange={handleChange("fullName")}
									onBlur={handleBlur("fullName")}
									disabled={isLoading}
									autoComplete="name"
								/>
							</FormField>

							<FormField
								id="email"
								label="Email"
								error={touched.email ? errors.email : undefined}
							>
								<Input
									id="email"
									type="text"
									inputMode="email"
									placeholder="nama@email.com"
									className={cn(
										"h-12",
										touched.email && errors.email && "border-destructive"
									)}
									value={formData.email}
									onChange={handleChange("email")}
									onBlur={handleBlur("email")}
									disabled={isLoading}
									autoComplete="email"
								/>
							</FormField>

							<FormField
								id="password"
								label="Password"
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
								/>
								<PasswordStrength password={formData.password} />
							</FormField>

							<FormField
								id="confirmPassword"
								label="Konfirmasi Password"
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
								disabled={isLoading || !isFormValid()}
							>
								{isLoading ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Mendaftar...
									</>
								) : (
									"Daftar Sekarang"
								)}
							</Button>
						</form>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="bg-card px-2 text-muted-foreground">
									atau daftar dengan
								</span>
							</div>
						</div>

						{/* Social Login */}
						<Button variant="outline" className="w-full h-12" onClick={handleGoogleLogin} disabled={isLoading}>
							<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
								<path
									fill="currentColor"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="currentColor"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="currentColor"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="currentColor"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Google
						</Button>

						{/* Note */}
						<p className="mt-6 text-center text-xs text-muted-foreground">
							Dengan mendaftar, kamu menyetujui Syarat & Ketentuan serta Kebijakan Privasi kami.
						</p>
					</div>
				</div>
			</main>

			<LandingFooter />
		</div>
	);
}
