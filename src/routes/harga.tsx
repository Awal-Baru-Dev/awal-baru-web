import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LandingHeader, LandingFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { APP_NAME } from "@/lib/config/constants";
import { formatPrice } from "@/lib/utils";
import { useCreatePayment } from "@/features/payments";
import { useUser } from "@/contexts/user-context";
import { toast } from "sonner";

export const Route = createFileRoute("/harga")({
	component: HargaPage,
});

function HargaPage() {
	const navigate = useNavigate();
	const { user } = useUser();
	const createPayment = useCreatePayment();

	// Handle bundle purchase (for Paket Lengkap)
	const handleBundlePurchase = () => {
		if (!user) {
			// Redirect to login with return URL
			navigate({
				to: "/masuk",
				search: { redirect: "/harga" },
			});
			return;
		}

		// Create bundle payment
		createPayment.mutate(
			{ isBundle: true },
			{
				onSuccess: (result) => {
					if (!result.success) {
						toast.error("Gagal Memproses Pembayaran", {
							description: result.error || "Silakan coba lagi.",
						});
					}
					// Success case is handled by the hook (opens DOKU modal)
				},
				onError: () => {
					toast.error("Gagal Memproses Pembayaran", {
						description: "Terjadi kesalahan. Silakan coba lagi.",
					});
				},
			},
		);
	};

	return (
		<div className="min-h-screen bg-background">
			<LandingHeader />

			<main className="pt-20">
				{/* Hero Section */}
				<section className="py-20 bg-hero-gradient text-white">
					<div className="container mx-auto px-6 lg:px-16 text-center">
						<h1 className="text-4xl md:text-5xl font-bold mb-6">
							Investasi untuk Masa Depanmu
						</h1>
						<p className="text-xl text-white/90 max-w-2xl mx-auto">
							Pilih paket yang sesuai dengan kebutuhanmu. Semua kursus sudah
							termasuk akses 12 bulan dan update materi gratis.
						</p>
					</div>
				</section>

				{/* Pricing Cards */}
				<section className="py-20 bg-background">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
							{PRICING_TIERS.filter((tier) => tier.name !== "Konsultasi").map(
								(tier, index) => (
									<PricingCard
										key={index}
										tier={tier}
										onBundlePurchase={
											tier.name === "Paket Lengkap"
												? handleBundlePurchase
												: undefined
										}
									/>
								),
							)}
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="py-20 bg-background">
					<div className="container mx-auto px-6 lg:px-16">
						<h2 className="text-3xl font-bold text-foreground text-center mb-12">
							Pertanyaan Umum
						</h2>

						<div className="max-w-3xl mx-auto space-y-6">
							{FAQ_ITEMS.map((item, index) => (
								<FAQItem
									key={index}
									question={item.question}
									answer={item.answer}
								/>
							))}
						</div>
					</div>
				</section>
			</main>

			<LandingFooter />
		</div>
	);
}

interface PricingTier {
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	features: string[];
	isPopular?: boolean;
	buttonText: string;
}

const PRICING_TIERS: PricingTier[] = [
	{
		name: "Kursus Satuan",
		description: "Pilih satu kursus yang kamu butuhkan",
		price: 99000,
		originalPrice: 199000,
		features: [
			"Akses 1 kursus pilihan",
			"Video HD profesional",
			"Akses 12 bulan",
			"Update materi gratis",
		],
		buttonText: "Pilih Kursus",
	},
	{
		name: "Paket Lengkap",
		description: "Akses semua kursus dengan harga spesial",
		price: 249000,
		originalPrice: 1040000,
		features: [
			"Akses SEMUA kursus",
			"40+ jam konten video",
			"Akses 12 bulan",
			"Update materi gratis",
			"Akses komunitas eksklusif",
			"Prioritas dukungan",
		],
		isPopular: true,
		buttonText: "Pilih Paket Ini",
	},
	{
		name: "Konsultasi",
		description: "Bimbingan personal dengan Tedchay",
		price: 999000,
		features: [
			"Sesi 1-on-1 (60 menit)",
			"Review dokumen personal",
			"Strategi khusus untuk kasusmu",
			"Follow-up via WhatsApp",
			"Termasuk Paket Lengkap",
		],
		buttonText: "Hubungi Kami",
	},
];

interface PricingCardProps {
	tier: PricingTier;
	onBundlePurchase?: () => void;
}

function PricingCard({ tier, onBundlePurchase }: PricingCardProps) {
	const isPaketLengkap = tier.name === "Paket Lengkap";

	return (
		<div
			className={`relative bg-card border rounded-2xl p-6 h-full flex flex-col ${
				tier.isPopular
					? "border-brand-primary border-2 shadow-lg"
					: "border-border"
			}`}
		>
			{tier.isPopular && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2">
					<div className="flex items-center gap-1 bg-brand-primary text-white text-sm font-semibold px-3 py-1 rounded-full">
						<Star className="w-4 h-4" />
						Paling Populer
					</div>
				</div>
			)}

			<div className="text-center mb-6">
				<h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
				<p className="text-sm text-muted-foreground">{tier.description}</p>
			</div>

			<div className="mb-6 flex flex-col items-center justify-center">
				{tier.originalPrice && (
					<div className="text-muted-foreground line-through text-sm mb-1">
						{formatPrice(tier.originalPrice)}
					</div>
				)}

				{tier.name === "Kursus Satuan" ? (
					<div className="flex items-baseline justify-center gap-1.5 flex-wrap">
						<span className="text-sm font-medium text-muted-foreground">
							Mulai dari
						</span>
						<span className="text-3xl font-bold text-foreground">
							{formatPrice(tier.price)}
						</span>
					</div>
				) : (
					<div className="text-3xl font-bold text-foreground">
						{formatPrice(tier.price)}
					</div>
				)}
			</div>

			<ul className="space-y-3 mb-8 flex-1">
				{tier.features.map((feature, index) => (
					<li key={index} className="flex items-start gap-2 text-sm">
						<Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
						<span className="text-muted-foreground">{feature}</span>
					</li>
				))}
			</ul>

			<div className="mt-auto">
				{isPaketLengkap && onBundlePurchase ? (
					<Button
						className={`w-full ${tier.isPopular ? "btn-cta" : ""}`}
						variant={tier.isPopular ? "default" : "outline"}
						onClick={onBundlePurchase}
					>
						{tier.buttonText}
					</Button>
				) : (
					<Link to="/daftar">
						<Button
							className={`w-full ${tier.isPopular ? "btn-cta" : ""}`}
							variant={tier.isPopular ? "default" : "outline"}
						>
							{tier.buttonText}
						</Button>
					</Link>
				)}
			</div>
		</div>
	);
}

interface FAQItemProps {
	question: string;
	answer: string;
}

const FAQ_ITEMS: FAQItemProps[] = [
	{
		question: "Berapa lama akses kursus saya?",
		answer: `Semua pembelian kursus di ${APP_NAME} memberikan akses selama 12 bulan. Selama periode tersebut, kamu juga akan mendapat semua update materi secara gratis.`,
	},
	{
		question: "Bagaimana metode pembayarannya?",
		answer:
			"Kami menerima berbagai metode pembayaran: Transfer Bank, Virtual Account, E-Wallet (OVO, GoPay, DANA), QRIS, dan Kartu Kredit.",
	},
	{
		question: "Apakah ada garansi uang kembali?",
		answer:
			"Ya, kami memberikan garansi 7 hari uang kembali jika kamu merasa kursus tidak sesuai ekspektasi. Tidak ada pertanyaan yang rumit.",
	},
];

function FAQItem({ question, answer }: FAQItemProps) {
	return (
		<div className="bg-card border border-border rounded-xl p-6">
			<h3 className="text-lg font-semibold text-foreground mb-2">{question}</h3>
			<p className="text-muted-foreground">{answer}</p>
		</div>
	);
}