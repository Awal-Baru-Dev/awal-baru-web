interface PaymentLoadingOverlayProps {
	isLoading: boolean;
}

/**
 * Full-screen loading overlay for payment processing
 *
 * Shows a semi-transparent overlay with spinner while payment is being initiated.
 * Blocks user interaction but keeps the background page visible.
 */
export function PaymentLoadingOverlay({ isLoading }: PaymentLoadingOverlayProps) {
	if (!isLoading) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
			<div className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-2xl">
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-brand-primary" />
				<p className="text-lg font-medium text-foreground">
					Memproses pembayaran...
				</p>
				<p className="text-sm text-muted-foreground">Mohon tunggu sebentar</p>
			</div>
		</div>
	);
}
