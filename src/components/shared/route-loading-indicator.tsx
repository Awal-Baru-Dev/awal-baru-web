import { Loader2 } from "lucide-react";

/**
 * RouteLoadingIndicator
 *
 * A branded full-screen loading overlay shown during route transitions.
 * Used as the defaultPendingComponent in TanStack Router.
 */
export function RouteLoadingIndicator() {
	return (
		<div
			className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
			aria-busy="true"
			aria-label="Memuat halaman..."
		>
			{/* Logo */}
			<div className="mb-6">
				<img
					src="/awalbaru-logo.jpeg"
					alt="AwalBaru"
					className="w-20 h-20 rounded-xl shadow-lg"
				/>
			</div>

			{/* Loading Spinner */}
			<div className="flex flex-col items-center gap-3">
				<Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
				<p className="text-sm text-muted-foreground">Memuat...</p>
			</div>
		</div>
	);
}
