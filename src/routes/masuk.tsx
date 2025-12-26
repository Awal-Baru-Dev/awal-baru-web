import { useState, useCallback } from "react";
import { createFileRoute, Link, useSearch, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LandingHeader, LandingFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/lib/config/constants";
import { PasswordInput, FormField } from "@/components/auth";
import { loginFn, resendConfirmationFn } from "@/features/auth";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

// Define search params for redirect
type SearchParams = {
	redirect?: string;
};

export const Route = createFileRoute("/masuk")({
	component: MasukPage,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			redirect: typeof search.redirect === "string" ? search.redirect : undefined,
		};
	},
});

type FormErrors = Partial<Record<keyof LoginFormData, string>>;

function MasukPage() {
	const router = useRouter();
	const search = useSearch({ from: "/masuk" });
	const redirectTo = search.redirect || "/dashboard";

	const [formData, setFormData] = useState<LoginFormData>({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [isLoading, setIsLoading] = useState(false);

	// Validate a single field
	const validateField = useCallback((field: keyof LoginFormData, value: string) => {
		const testData = { ...formData, [field]: value };

		try {
			loginSchema.parse(testData);
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
	const handleChange = (field: keyof LoginFormData) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = e.target.value;
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Validate on change if field has been touched
		if (touched[field]) {
			validateField(field, value);
		}
	};

	// Handle field blur
	const handleBlur = (field: keyof LoginFormData) => () => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		validateField(field, formData[field]);
	};

	// Handle resend confirmation
	const handleResendConfirmation = async (email: string) => {
		const result = await resendConfirmationFn({ data: { email } });
		if (result?.error) {
			toast.error("Gagal Mengirim Email", {
				description: result.message,
			});
		} else {
			toast.success("Email Terkirim", {
				description: "Cek inbox email kamu untuk link verifikasi.",
			});
		}
	};

	// Handle form submit
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate all fields
		try {
			loginSchema.parse(formData);
			setErrors({});
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as { errors: Array<{ path: (string | number)[]; message: string }> };
				const newErrors: FormErrors = {};
				for (const err of zodError.errors) {
					const field = err.path[0] as keyof LoginFormData;
					if (!newErrors[field]) {
						newErrors[field] = err.message;
					}
				}
				setErrors(newErrors);
				// Mark all fields as touched
				setTouched({
					email: true,
					password: true,
				});
			}
			return;
		}

		setIsLoading(true);

		try {
			// Call server function
			const result = await loginFn({
				data: {
					email: formData.email,
					password: formData.password,
				},
			});

			if (result?.error) {
				// Handle specific error cases
				const message = result.message?.toLowerCase() || "";

				if (message.includes("email not confirmed")) {
					toast.warning("Email Belum Diverifikasi", {
						description: "Silakan cek email kamu dan klik link verifikasi.",
						action: {
							label: "Kirim Ulang",
							onClick: () => handleResendConfirmation(formData.email),
						},
					});
				} else if (message.includes("invalid") || message.includes("credentials")) {
					toast.error("Login Gagal", {
						description: "Email atau password salah. Silakan coba lagi.",
					});
				} else {
					toast.error("Login Gagal", {
						description: result.message || "Terjadi kesalahan. Silakan coba lagi.",
					});
				}
				return;
			}

			// Success - show toast and invalidate router to refetch user
			toast.success("Login Berhasil", {
				description: "Selamat datang kembali!",
			});

			// Invalidate router to refetch user in beforeLoad
			await router.invalidate();

			// Navigate to redirect URL
			router.navigate({ to: redirectTo });
		} catch (error) {
			console.error("Login error:", error);
			toast.error("Login Gagal", {
				description: "Terjadi kesalahan. Silakan coba lagi.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-primary/5 to-background">
			<LandingHeader />

			<main className="pt-32 pb-20 px-6">
				<div className="max-w-md mx-auto">
					<div className="bg-card border border-border rounded-2xl p-8 shadow-lg border-t-4 border-t-brand-primary">
						{/* Header */}
						<div className="text-center mb-8">
							<h1 className="text-2xl font-bold text-foreground mb-2">
								Masuk ke {APP_NAME}
							</h1>
							<p className="text-muted-foreground">
								Belum punya akun?{" "}
								<Link
									to="/daftar"
									className="text-brand-primary hover:text-brand-cta transition-colors font-medium"
								>
									Daftar sekarang
								</Link>
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							<FormField
								id="email"
								label="Email"
								error={touched.email ? errors.email : undefined}
							>
								<Input
									id="email"
									type="email"
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
									autoFocus
								/>
							</FormField>

							<FormField
								id="password"
								label="Password"
								error={touched.password ? errors.password : undefined}
								labelAction={
									<Link
										to="/lupa-password"
										className="text-sm text-brand-primary hover:text-brand-cta transition-colors"
									>
										Lupa password?
									</Link>
								}
							>
								<PasswordInput
									id="password"
									placeholder="••••••••"
									className={cn(
										"h-12",
										touched.password && errors.password && "border-destructive"
									)}
									value={formData.password}
									onChange={handleChange("password")}
									onBlur={handleBlur("password")}
									disabled={isLoading}
									autoComplete="current-password"
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
										Masuk...
									</>
								) : (
									"Masuk"
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
									atau lanjutkan dengan
								</span>
							</div>
						</div>

						{/* Social Login */}
						<Button variant="outline" className="w-full h-12" disabled>
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
							Google (Coming Soon)
						</Button>

						{/* Note */}
						<p className="mt-6 text-center text-xs text-muted-foreground">
							Dengan masuk, kamu menyetujui{" "}
							<Link to="#" className="text-brand-primary hover:underline">
								Syarat & Ketentuan
							</Link>{" "}
							dan{" "}
							<Link to="#" className="text-brand-primary hover:underline">
								Kebijakan Privasi
							</Link>{" "}
							kami.
						</p>
					</div>
				</div>
			</main>

			<LandingFooter />
		</div>
	);
}
