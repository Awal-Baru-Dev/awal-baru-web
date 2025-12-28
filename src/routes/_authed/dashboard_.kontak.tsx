import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MessageCircle, Mail, Clock, HelpCircle, ArrowRight } from "lucide-react";
import { APP_NAME } from "@/lib/config/constants";

export const Route = createFileRoute("/_authed/dashboard_/kontak")({
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
		<DashboardLayout>
			<div className="p-4 lg:p-8 space-y-8">
				{/* Header */}
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
						<MessageCircle className="w-6 h-6 text-brand-primary" />
					</div>
					<div>
						<h1 className="text-2xl lg:text-3xl font-bold text-foreground">
							Hubungi Kami
						</h1>
						<p className="text-muted-foreground">
							Kami siap membantu menjawab pertanyaan kamu
						</p>
					</div>
				</div>

				{/* Contact Cards */}
				<div className="grid md:grid-cols-2 gap-6">
					{/* WhatsApp Card */}
					<div className="bg-card border border-border rounded-xl p-6 text-center">
						<div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
							<MessageCircle className="w-7 h-7 text-brand-primary" />
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
							className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium"
						>
							<MessageCircle className="w-5 h-5" />
							Chat via WhatsApp
						</a>
					</div>

					{/* Email Card */}
					<div className="bg-card border border-border rounded-xl p-6 text-center">
						<div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
							<Mail className="w-7 h-7 text-brand-primary" />
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
							className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium"
						>
							<Mail className="w-5 h-5" />
							Kirim Email
						</a>
					</div>
				</div>

				{/* Operating Hours */}
				<div className="bg-card border border-border rounded-xl p-6 text-center">
					<div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<Clock className="w-6 h-6 text-brand-primary" />
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

				{/* Help Center CTA */}
				<div className="bg-card border border-border rounded-xl p-6 text-center">
					<div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<HelpCircle className="w-6 h-6 text-brand-primary" />
					</div>
					<h3 className="text-xl font-semibold text-foreground mb-2">
						Cek Pusat Bantuan
					</h3>
					<p className="text-muted-foreground mb-4">
						Temukan jawaban cepat untuk pertanyaan umum di Pusat Bantuan
						kami.
					</p>
					<Link
						to="/dashboard/bantuan"
						className="inline-flex items-center gap-2 text-brand-primary hover:underline font-medium"
					>
						Kunjungi Pusat Bantuan
						<ArrowRight className="w-4 h-4" />
					</Link>
				</div>
			</div>
		</DashboardLayout>
	)
}
