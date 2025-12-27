import { createFileRoute, Link } from "@tanstack/react-router";
import { LandingHeader, LandingFooter } from "@/components/layout";
import { MessageCircle, Mail, Clock, HelpCircle, ArrowRight } from "lucide-react";
import { APP_NAME } from "@/lib/config/constants";

export const Route = createFileRoute("/kontak")({
	component: KontakPage,
});

// Contact Information - Update with real data
const contactInfo = {
	whatsapp: {
		number: "+6281234567890", // Replace with real WhatsApp number
		displayNumber: "+62 812-3456-7890",
		message: `Halo, saya butuh bantuan dengan kursus di ${APP_NAME}`,
	},
	email: "support@awalbaru.com", // Replace with real email
	hours: {
		weekday: "Senin - Jumat: 09:00 - 17:00 WIB",
		weekend: "Sabtu: 09:00 - 12:00 WIB",
	},
};

function KontakPage() {
	// Generate WhatsApp link
	const whatsappLink = `https://wa.me/${contactInfo.whatsapp.number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(contactInfo.whatsapp.message)}`;

	return (
		<div className="min-h-screen bg-background">
			<LandingHeader />

			<main className="pt-20">
				{/* Hero Section */}
				<section className="py-16 bg-hero-gradient text-white">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="max-w-3xl mx-auto text-center">
							<div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<MessageCircle className="w-8 h-8" />
							</div>
							<h1 className="text-4xl md:text-5xl font-bold mb-4">
								Hubungi Kami
							</h1>
							<p className="text-xl text-white/90">
								Kami siap membantu menjawab pertanyaan kamu
							</p>
						</div>
					</div>
				</section>

				{/* Contact Cards Section */}
				<section className="py-16 bg-background">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="max-w-4xl mx-auto">
							<div className="grid md:grid-cols-2 gap-6">
								{/* WhatsApp Card */}
								<div className="bg-card border border-border rounded-xl p-6 text-center">
									<div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
										<MessageCircle className="w-7 h-7 text-green-600" />
									</div>
									<h3 className="text-xl font-semibold text-foreground mb-2">
										WhatsApp
									</h3>
									<p className="text-muted-foreground mb-4">
										Respon cepat untuk pertanyaan umum
									</p>
									<p className="text-sm text-muted-foreground mb-4">
										{contactInfo.whatsapp.displayNumber}
									</p>
									<a
										href={whatsappLink}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
									>
										<MessageCircle className="w-5 h-5" />
										Chat via WhatsApp
									</a>
								</div>

								{/* Email Card */}
								<div className="bg-card border border-border rounded-xl p-6 text-center">
									<div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
										<Mail className="w-7 h-7 text-blue-600" />
									</div>
									<h3 className="text-xl font-semibold text-foreground mb-2">
										Email
									</h3>
									<p className="text-muted-foreground mb-4">
										Untuk pertanyaan detail atau dokumentasi
									</p>
									<p className="text-sm text-muted-foreground mb-4">
										{contactInfo.email}
									</p>
									<a
										href={`mailto:${contactInfo.email}`}
										className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
									>
										<Mail className="w-5 h-5" />
										Kirim Email
									</a>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Operating Hours Section */}
				<section className="py-12 bg-muted">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="max-w-2xl mx-auto text-center">
							<div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
								<Clock className="w-6 h-6 text-amber-600" />
							</div>
							<h2 className="text-xl font-semibold text-foreground mb-4">
								Jam Operasional
							</h2>
							<div className="space-y-1 text-muted-foreground">
								<p>{contactInfo.hours.weekday}</p>
								<p>{contactInfo.hours.weekend}</p>
							</div>
							<p className="text-sm text-muted-foreground mt-4">
								Pesan di luar jam operasional akan dibalas pada hari kerja
								berikutnya.
							</p>
						</div>
					</div>
				</section>

				{/* Help Center CTA */}
				<section className="py-16 bg-background">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="max-w-2xl mx-auto">
							<div className="bg-card border border-border rounded-xl p-8 text-center">
								<div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<HelpCircle className="w-6 h-6 text-brand-primary" />
								</div>
								<h3 className="text-xl font-semibold text-foreground mb-2">
									Cek Pusat Bantuan
								</h3>
								<p className="text-muted-foreground mb-6">
									Temukan jawaban cepat untuk pertanyaan umum di Pusat Bantuan
									kami.
								</p>
								<Link
									to="/bantuan"
									className="inline-flex items-center gap-2 text-brand-primary hover:underline font-medium"
								>
									Kunjungi Pusat Bantuan
									<ArrowRight className="w-4 h-4" />
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>

			<LandingFooter />
		</div>
	);
}
