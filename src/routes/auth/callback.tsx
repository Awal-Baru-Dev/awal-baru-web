import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@/lib/db/supabase/client";

export const Route = createFileRoute("/auth/callback")({
	component: AuthCallbackPage,
});

function AuthCallbackPage() {
	const navigate = useNavigate();
	const router = useRouter();
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [message, setMessage] = useState("Memproses autentikasi...");

	useEffect(() => {
		const handleCallback = async () => {
			const supabase = createBrowserClient();

			// Get the hash fragment from URL
			const hashParams = new URLSearchParams(window.location.hash.substring(1));
			const accessToken = hashParams.get("access_token");
			const refreshToken = hashParams.get("refresh_token");
			const type = hashParams.get("type");

			// Also check query params (some flows use query instead of hash)
			const queryParams = new URLSearchParams(window.location.search);
			const code = queryParams.get("code");
			const errorParam = queryParams.get("error");
			const errorDescription = queryParams.get("error_description");

			// Handle error from Supabase
			if (errorParam) {
				setStatus("error");
				setMessage(errorDescription || "Terjadi kesalahan saat autentikasi.");
				return;
			}

			try {
				// Handle code exchange (PKCE flow)
				if (code) {
					const { error } = await supabase.auth.exchangeCodeForSession(code);
					if (error) throw error;

					setStatus("success");
					setMessage("Email berhasil diverifikasi!");

					// Invalidate router to refresh user state and redirect
					setTimeout(async () => {
						await router.invalidate();
						navigate({ to: "/dashboard" });
					}, 1500);
					return;
				}

				// Handle token-based auth (implicit flow)
				if (accessToken && refreshToken) {
					const { error } = await supabase.auth.setSession({
						access_token: accessToken,
						refresh_token: refreshToken,
					});

					if (error) throw error;

					// Check the type of auth event
					if (type === "recovery") {
						setStatus("success");
						setMessage("Silakan buat password baru.");
						setTimeout(async () => {
							await router.invalidate();
							navigate({ to: "/reset-password" });
						}, 1000);
					} else if (type === "signup" || type === "email_change") {
						setStatus("success");
						setMessage("Email berhasil diverifikasi!");
						setTimeout(async () => {
							await router.invalidate();
							navigate({ to: "/dashboard" });
						}, 1500);
					} else {
						setStatus("success");
						setMessage("Autentikasi berhasil!");
						setTimeout(async () => {
							await router.invalidate();
							navigate({ to: "/dashboard" });
						}, 1500);
					}
					return;
				}

				// If no tokens or code, check existing session
				const { data: { session } } = await supabase.auth.getSession();
				if (session) {
					setStatus("success");
					setMessage("Sudah login!");
					setTimeout(async () => {
						await router.invalidate();
						navigate({ to: "/dashboard" });
					}, 1000);
				} else {
					setStatus("error");
					setMessage("Link tidak valid atau sudah kadaluarsa.");
				}
			} catch (error) {
				console.error("Auth callback error:", error);
				setStatus("error");
				setMessage(
					error instanceof Error
						? error.message
						: "Terjadi kesalahan saat autentikasi."
				);
			}
		};

		handleCallback();
	}, [navigate, router]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-primary/5 to-background flex items-center justify-center px-6">
			<div className="max-w-md w-full">
				<div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
					{status === "loading" && (
						<>
							<Loader2 className="w-12 h-12 animate-spin text-brand-primary mx-auto mb-4" />
							<p className="text-muted-foreground">{message}</p>
						</>
					)}

					{status === "success" && (
						<>
							<div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
								<CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
							</div>
							<h2 className="text-xl font-bold text-foreground mb-2">Berhasil!</h2>
							<p className="text-muted-foreground">{message}</p>
							<p className="text-sm text-muted-foreground mt-2">
								Mengalihkan...
							</p>
						</>
					)}

					{status === "error" && (
						<>
							<div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
								<AlertCircle className="w-8 h-8 text-destructive" />
							</div>
							<h2 className="text-xl font-bold text-foreground mb-2">
								Terjadi Kesalahan
							</h2>
							<p className="text-muted-foreground mb-4">{message}</p>
							<a
								href="/masuk"
								className="text-brand-primary hover:text-brand-cta transition-colors"
							>
								Kembali ke halaman login
							</a>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
