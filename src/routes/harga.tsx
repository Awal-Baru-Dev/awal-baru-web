import { createFileRoute, Link } from "@tanstack/react-router";
import { LandingHeader, LandingFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap } from "lucide-react";
import { APP_NAME, BUNDLE_CONFIG } from "@/lib/config/constants";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/harga")({
	component: HargaPage,
});

function HargaPage() {
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
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
							{PRICING_TIERS.map((tier, index) => (
								<PricingCard key={index} tier={tier} />
							))}
						</div>
					</div>
				</section>

				{/* Bundle Highlight */}
				<section className="py-20 bg-muted">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="max-w-4xl mx-auto bg-card border-2 border-brand-primary rounded-2xl p-8 md:p-12">
							<div className="flex items-center gap-2 mb-4">
								<Zap className="w-6 h-6 text-brand-primary" />
								<span className="text-brand-primary font-semibold">
									Penawaran Terbaik
								</span>
							</div>

							<div className="grid md:grid-cols-2 gap-8 items-center">
								<div>
									<h2 className="text-3xl font-bold text-foreground mb-4">
										{BUNDLE_CONFIG.name}
									</h2>
									<p className="text-muted-foreground mb-6">
										{BUNDLE_CONFIG.description}
									</p>
									<ul className="space-y-3">
										{BUNDLE_CONFIG.features.map((feature, index) => (
											<li
												key={index}
												className="flex items-center gap-2 text-foreground"
											>
												<Check className="w-5 h-5 text-green-500 shrink-0" />
												{feature}
											</li>
										))}
									</ul>
								</div>

								<div className="text-center md:text-right">
									<div className="text-muted-foreground line-through text-lg">
										{formatPrice(BUNDLE_CONFIG.originalPrice)}
									</div>
									<div className="text-4xl md:text-5xl font-bold text-brand-primary mb-2">
										{formatPrice(BUNDLE_CONFIG.price)}
									</div>
									<div className="text-sm text-muted-foreground mb-6">
										Hemat{" "}
										{formatPrice(
											BUNDLE_CONFIG.originalPrice - BUNDLE_CONFIG.price,
										)}
									</div>
									<Link to="/daftar">
										<Button size="lg" className="btn-cta px-8">
											Dapatkan Sekarang
										</Button>
									</Link>
								</div>
							</div>
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
								<FAQItem key={index} question={item.question} answer={item.answer} />
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
		price: 149000,
		originalPrice: 299000,
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
		price: 499000,
		originalPrice: 999000,
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

function PricingCard({ tier }: { tier: PricingTier }) {
	return (
		<div
			className={`relative bg-card border rounded-2xl p-6 ${
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

			<div className="text-center mb-6">
				{tier.originalPrice && (
					<div className="text-muted-foreground line-through text-sm">
						{formatPrice(tier.originalPrice)}
					</div>
				)}
				<div className="text-3xl font-bold text-foreground">
					{formatPrice(tier.price)}
				</div>
			</div>

			<ul className="space-y-3 mb-6">
				{tier.features.map((feature, index) => (
					<li key={index} className="flex items-start gap-2 text-sm">
						<Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
						<span className="text-muted-foreground">{feature}</span>
					</li>
				))}
			</ul>

			<Link to="/daftar">
				<Button
					className={`w-full ${tier.isPopular ? "btn-cta" : ""}`}
					variant={tier.isPopular ? "default" : "outline"}
				>
					{tier.buttonText}
				</Button>
			</Link>
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
	{
		question: "Bisakah saya konsultasi langsung dengan Tedchay?",
		answer:
			"Tentu! Pilih paket Konsultasi untuk mendapat sesi 1-on-1 dengan Tedchay. Kamu bisa diskusi tentang kasusmu secara personal.",
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
