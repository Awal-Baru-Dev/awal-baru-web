import { useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { LandingHeader, LandingFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/auth";
import { requestPasswordResetFn } from "@/features/auth";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lupa-password")({
	component: LupaPasswordPage,
});

function LupaPasswordPage() {
	const [formData, setFormData] = useState<ForgotPasswordFormData>({
		email: "",
	});
	const [errors, setErrors] = useState<{ email?: string }>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [emailSent, setEmailSent] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Validate email field
	const validateField = useCallback((value: string) => {
		try {
			forgotPasswordSchema.parse({ email: value });
			setErrors({});
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as { errors: Array<{ message: string }> };
				setErrors({ email: zodError.errors[0]?.message });
			}
		}
	}, []);

	// Handle field change
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setFormData({ email: value });

		if (touched.email) {
			validateField(value);
		}
	};

	// Handle field blur
	const handleBlur = () => {
		setTouched({ email: true });
		validateField(formData.email);
	};

	// Handle form submit
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			forgotPasswordSchema.parse(formData);
			setErrors({});
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as { errors: Array<{ message: string }> };
				setErrors({ email: zodError.errors[0]?.message });
				setTouched({ email: true });
			}
			return;
		}

		setIsLoading(true);

		try {
			const result = await requestPasswordResetFn({ data: { email: formData.email } });

			if (result?.error) {
				toast.error("Gagal Mengirim Email", {
					description: result.message || "Terjadi kesalahan. Silakan coba lagi.",
				});
				return;
			}

			toast.success("Email Terkirim", {
				description: "Cek inbox email kamu untuk link reset password.",
			});
			setEmailSent(true);
		} catch (error) {
			console.error("Password reset error:", error);
			toast.error("Gagal Mengirim Email", {
				description: "Terjadi kesalahan. Silakan coba lagi.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Show success screen after email sent
	if (emailSent) {
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
								Cek Email Kamu
							</h1>

							<p className="text-muted-foreground mb-6">
								Kami telah mengirim link reset password ke{" "}
								<span className="font-medium text-foreground">
									{formData.email}
								</span>
								. Klik link tersebut untuk membuat password baru.
							</p>

							<div className="space-y-3">
								<Button
									variant="outline"
									className="w-full"
									onClick={() => {
										setEmailSent(false);
										setFormData({ email: "" });
									}}
								>
									<Mail className="w-4 h-4 mr-2" />
									Kirim ke Email Lain
								</Button>

								<Link to="/masuk" className="block">
									<Button variant="ghost" className="w-full">
										<ArrowLeft className="w-4 h-4 mr-2" />
										Kembali ke Login
									</Button>
								</Link>
							</div>

							<p className="mt-6 text-xs text-muted-foreground">
								Tidak menerima email? Cek folder spam atau tunggu beberapa menit.
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
							<div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
								<Mail className="w-8 h-8 text-brand-primary" />
							</div>
							<h1 className="text-2xl font-bold text-foreground mb-2">
								Lupa Password?
							</h1>
							<p className="text-muted-foreground">
								Masukkan email yang terdaftar dan kami akan mengirimkan link
								untuk reset password.
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
									onChange={handleChange}
									onBlur={handleBlur}
									disabled={isLoading}
									autoComplete="email"
									autoFocus
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
										Mengirim...
									</>
								) : (
									"Kirim Link Reset"
								)}
							</Button>
						</form>

						{/* Back to login */}
						<div className="mt-6 text-center">
							<Link
								to="/masuk"
								className="inline-flex items-center text-sm text-brand-primary hover:text-brand-cta transition-colors"
							>
								<ArrowLeft className="w-4 h-4 mr-1" />
								Kembali ke Login
							</Link>
						</div>
					</div>
				</div>
			</main>

			<LandingFooter />
		</div>
	);
}
