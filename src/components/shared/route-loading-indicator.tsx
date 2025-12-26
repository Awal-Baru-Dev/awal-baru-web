/**
 * RouteLoadingIndicator
 *
 * A branded full-screen loading overlay shown during route transitions.
 * Used as the defaultPendingComponent in TanStack Router.
 *
 * Animation: Option 2 - Pulsing Ring
 * Rings that pulse outward from the logo (like a radar ping).
 */
export function RouteLoadingIndicator() {
	return (
		<div
			className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
			aria-busy="true"
			aria-label="Memuat halaman..."
		>
			{/* Logo with Pulsing Rings */}
			<div className="relative mb-6">
				{/* Pulsing rings - staggered timing */}
				<div className="absolute inset-0 rounded-xl border-2 border-brand-primary animate-[ping-ring_2s_ease-out_infinite]" />
				<div className="absolute inset-0 rounded-xl border-2 border-brand-primary animate-[ping-ring_2s_ease-out_infinite_0.66s]" />
				<div className="absolute inset-0 rounded-xl border-2 border-brand-primary animate-[ping-ring_2s_ease-out_infinite_1.33s]" />

				{/* Logo */}
				<img
					src="/awalbaru-logo.jpeg"
					alt="AwalBaru"
					className="w-20 h-20 rounded-xl shadow-lg relative z-10"
				/>
			</div>

			{/* Loading Text */}
			<p className="text-sm text-muted-foreground">Memuat...</p>

			{/* CSS Keyframes for ping ring animation */}
			<style>
				{`
					@keyframes ping-ring {
						0% {
							transform: scale(1);
							opacity: 0.8;
						}
						100% {
							transform: scale(1.5);
							opacity: 0;
						}
					}
				`}
			</style>
		</div>
	);
}
