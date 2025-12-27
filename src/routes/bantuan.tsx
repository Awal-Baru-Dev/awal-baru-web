import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LandingHeader, LandingFooter } from "@/components/layout";
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/config/constants";

export const Route = createFileRoute("/bantuan")({
	component: BantuanPage,
});

// FAQ Data
const faqCategories = [
	{
		category: "Pembelian & Pembayaran",
		items: [
			{
				question: "Bagaimana cara membeli kursus?",
				answer:
					"Pilih kursus yang ingin kamu beli, klik tombol 'Beli Sekarang', lalu ikuti proses pembayaran. Setelah pembayaran berhasil, kursus akan langsung bisa diakses dari dashboard kamu.",
			},
			{
				question: "Metode pembayaran apa saja yang tersedia?",
				answer:
					"Kami menerima pembayaran via Transfer Bank (Virtual Account BCA, Mandiri, BNI, BRI, dll), E-Wallet (OVO, GoPay, Dana, ShopeePay), QRIS, dan Kartu Kredit/Debit.",
			},
			{
				question: "Apakah bisa refund jika tidak puas?",
				answer:
					"Kami menyediakan garansi 7 hari. Jika tidak puas dengan kursus dalam 7 hari pertama setelah pembelian, hubungi kami untuk proses refund.",
			},
			{
				question: "Apakah ada diskon untuk pembelian bundle?",
				answer:
					"Ya! Pembelian paket bundle (semua kursus) mendapatkan harga lebih hemat dibandingkan membeli kursus satuan. Cek halaman Katalog Kursus untuk melihat penawaran terbaru.",
			},
		],
	},
	{
		category: "Akses Kursus",
		items: [
			{
				question: "Apakah akses kursus selamanya?",
				answer:
					"Ya! Setelah membeli, kamu mendapatkan akses selamanya (lifetime access) ke semua materi kursus termasuk update konten di masa depan.",
			},
			{
				question: "Bisa diakses dari berapa device?",
				answer:
					"Kamu bisa mengakses kursus dari device manapun (laptop, tablet, HP) selama login dengan akun yang sama. Tidak ada batasan jumlah device.",
			},
			{
				question: "Apakah bisa download video untuk ditonton offline?",
				answer:
					"Saat ini video hanya bisa ditonton secara streaming. Fitur download sedang dalam pengembangan dan akan tersedia di update mendatang.",
			},
			{
				question: "Bagaimana cara melanjutkan kursus yang sudah dimulai?",
				answer:
					"Buka Dashboard, lalu klik 'Lanjutkan Belajar' atau masuk ke halaman 'Kursus Saya' untuk melihat semua kursus yang sudah kamu beli.",
			},
		],
	},
	{
		category: "Akun & Teknis",
		items: [
			{
				question: "Bagaimana cara reset password?",
				answer:
					"Klik 'Lupa Password' di halaman login, masukkan email yang terdaftar, dan ikuti instruksi yang dikirim ke email kamu untuk reset password.",
			},
			{
				question: "Video tidak bisa diputar, bagaimana solusinya?",
				answer:
					"Pastikan koneksi internet stabil, coba refresh halaman, atau gunakan browser lain (Chrome/Firefox terbaru). Jika masih bermasalah, hubungi kami.",
			},
			{
				question: "Bagaimana cara mengubah email atau data profil?",
				answer:
					"Masuk ke Dashboard, klik menu Profil, lalu edit informasi yang ingin diubah. Untuk perubahan email, akan ada verifikasi ke email baru.",
			},
		],
	},
];

function BantuanPage() {
	return (
		<div className="min-h-screen bg-background">
			<LandingHeader />

			<main className="pt-20">
				{/* Hero Section */}
				<section className="py-16 bg-hero-gradient text-white">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="max-w-3xl mx-auto text-center">
							<div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<HelpCircle className="w-8 h-8" />
							</div>
							<h1 className="text-4xl md:text-5xl font-bold mb-4">
								Pusat Bantuan
							</h1>
							<p className="text-xl text-white/90">
								Temukan jawaban untuk pertanyaan umum seputar {APP_NAME}
							</p>
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="py-16 bg-background">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="max-w-3xl mx-auto">
							<h2 className="text-2xl font-bold text-foreground mb-8">
								Pertanyaan Umum
							</h2>

							<div className="space-y-8">
								{faqCategories.map((category) => (
									<div key={category.category}>
										<h3 className="text-lg font-semibold text-foreground mb-4">
											{category.category}
										</h3>
										<div className="space-y-3">
											{category.items.map((item, index) => (
												<FAQItem
													key={index}
													question={item.question}
													answer={item.answer}
												/>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* Contact CTA Section */}
				<section className="py-16 bg-muted">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="max-w-2xl mx-auto text-center">
							<div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
								<MessageCircle className="w-7 h-7 text-brand-primary" />
							</div>
							<h2 className="text-2xl font-bold text-foreground mb-4">
								Masih butuh bantuan?
							</h2>
							<p className="text-muted-foreground mb-6">
								Tim support kami siap membantu menjawab pertanyaan kamu.
							</p>
							<Link
								to="/kontak"
								className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors font-medium"
							>
								Hubungi Kami
								<ArrowRight className="w-4 h-4" />
							</Link>
						</div>
					</div>
				</section>
			</main>

			<LandingFooter />
		</div>
	);
}

/**
 * FAQ Accordion Item
 */
function FAQItem({ question, answer }: { question: string; answer: string }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="bg-card border border-border rounded-xl overflow-hidden">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
			>
				<span className="font-medium text-foreground pr-4">{question}</span>
				<ChevronDown
					className={cn(
						"w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform",
						isOpen && "rotate-180"
					)}
				/>
			</button>
			<div
				className={cn(
					"overflow-hidden transition-all duration-200",
					isOpen ? "max-h-96" : "max-h-0"
				)}
			>
				<div className="px-4 pb-4 text-muted-foreground">{answer}</div>
			</div>
		</div>
	);
}
