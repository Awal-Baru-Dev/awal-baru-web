import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateProfileFn } from "@/features/profile/server";
import { profileSchema } from "@/lib/validations/profile";
import { useUser } from "@/contexts/user-context";

interface WhatsappCollectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: () => void;
}

export function WhatsappCollectionModal({
	isOpen,
	onClose,
	onSubmit,
}: WhatsappCollectionModalProps) {
	const { profile } = useUser();
	const [whatsappNumber, setWhatsappNumber] = useState("+62");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate number using existing schema
		try {
			profileSchema.shape.whatsappNumber.parse(whatsappNumber);
			setError(null);
		} catch (err: any) {
			setError(err.errors?.[0]?.message || "Format tidak valid");
			return;
		}

		if (!whatsappNumber || whatsappNumber === "+62" || whatsappNumber === "+") {
			setError("Nomor WhatsApp wajib diisi");
			return;
		}

		setIsLoading(true);
		try {
			// Update profile specifically with the new whatsapp number
			const result = await updateProfileFn({
				data: {
					fullName: profile?.full_name || "",
					whatsappNumber: whatsappNumber,
				},
			});

			if (result.error) {
				setError(result.message || "Gagal menyimpan nomor");
			} else {
				// We don't bother triggering router.invalidate() here immediately
				// because they are transitioning to DOKU gateway anyway.
				onSubmit();
			}
		} catch (err) {
			setError("Terjadi kesalahan sistem.");
		} finally {
			setIsLoading(false);
		}
	};
	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let val = e.target.value.replace(/[^\d+]/g, "");
		// Prevent multiple pluses
		val = val.replace(/(?!^\+)\+/g, "");
		
		if (val.length > 0 && !val.startsWith("+") && val.startsWith("0")) {
			val = "+62" + val.substring(1);
		} else if (val.length > 0 && !val.startsWith("+")) {
			val = "+" + val;
		}

		setWhatsappNumber(val);

		// Clear error while typing
		if (error) setError(null);
	};

	const handlePhoneBlur = () => {
		if (!whatsappNumber || whatsappNumber === "+") return;
		try {
			profileSchema.shape.whatsappNumber.parse(whatsappNumber);
			setError(null);
		} catch (err: any) {
			setError(err.errors?.[0]?.message || "Format tidak valid");
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<AlertDialogContent className="sm:max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle>Hampir Selesai!</AlertDialogTitle>
					<AlertDialogDescription>
						Sebelum melanjutkan ke pembayaran, mohon lengkapi nomor WhatsApp
						kamu untuk keperluan pengiriman informasi kursus dan bantuan.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="whatsappNumber">Nomor WhatsApp</Label>
						<Input
							id="whatsappNumber"
							type="tel"
							placeholder="+62812... or 0812..."
							value={whatsappNumber}
							onChange={handlePhoneChange}
							onBlur={handlePhoneBlur}
							disabled={isLoading}
							autoFocus
						/>
						{error && <p className="text-sm text-destructive mt-1">{error}</p>}
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isLoading}
						>
							Batal
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
							Lanjutkan Pembayaran
						</Button>
					</div>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
