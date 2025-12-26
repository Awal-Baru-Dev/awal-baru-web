import { createFileRoute } from "@tanstack/react-router";
import { LandingHeader, LandingFooter } from "@/components/layout";
import { LandingCTA } from "@/components/landing";
import {
	Award,
	Calendar,
	MapPin,
	ChefHat,
	Plane,
	GraduationCap,
} from "lucide-react";
import { APP_NAME, BRAND } from "@/lib/config/constants";

export const Route = createFileRoute("/tentang")({
	component: TentangPage,
});

function TentangPage() {
	return (
		<div className="min-h-screen bg-background">
			<LandingHeader />

			<main className="pt-20">
				{/* Hero Section */}
				<section className="py-20 bg-hero-gradient text-white">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="grid lg:grid-cols-2 gap-12 items-center">
							<div>
								<h1 className="text-4xl md:text-5xl font-bold mb-6">
									Tentang {BRAND.founder}
								</h1>
								<p className="text-xl text-white/90 leading-relaxed mb-4">
									Dari dapur Indonesia ke dapur New York City — perjalanan
									seorang chef yang mewujudkan American Dream melalui DV
									Lottery.
								</p>
								<div className="flex items-center gap-2 text-white/80">
									<Award className="w-5 h-5" />
									<span>DV Lottery Winner 2020</span>
								</div>
							</div>
							<div className="flex justify-center lg:justify-end">
								<img
									src="/tedchay-hero.png"
									alt={BRAND.founder}
									className="w-full max-w-md rounded-2xl shadow-2xl border-4 border-white/10"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Timeline Section */}
				<section className="py-20 bg-background">
					<div className="container mx-auto px-6 lg:px-16">
						<h2 className="text-3xl font-bold text-foreground text-center mb-12">
							Perjalanan {BRAND.founder}
						</h2>

						<div className="max-w-3xl mx-auto">
							<Timeline />
						</div>
					</div>
				</section>

				{/* Mission Section */}
				<section className="py-20 bg-muted">
					<div className="container mx-auto px-6 lg:px-16">
						<div className="max-w-3xl mx-auto text-center">
							<h2 className="text-3xl font-bold text-foreground mb-6">
								Misi {APP_NAME}
							</h2>
							<p className="text-lg text-muted-foreground leading-relaxed mb-8">
								{APP_NAME} didirikan dengan satu tujuan: membantu orang
								Indonesia yang bermimpi untuk tinggal di Amerika Serikat.
								Melalui pengalaman langsung dan bimbingan praktis, kami ingin
								membuktikan bahwa American Dream bukan hanya mimpi — tapi
								sesuatu yang bisa diwujudkan.
							</p>
							<div className="grid md:grid-cols-3 gap-6 text-left">
								<MissionCard
									title="Edukasi"
									description="Memberikan pengetahuan lengkap tentang proses imigrasi Amerika"
								/>
								<MissionCard
									title="Bimbingan"
									description="Panduan langkah demi langkah dari pengalaman nyata"
								/>
								<MissionCard
									title="Komunitas"
									description="Membangun jaringan sesama pencari American Dream"
								/>
							</div>
						</div>
					</div>
				</section>

				<LandingCTA
					title="Mulai Perjalananmu Bersama Tedchay"
					subtitle="Pelajari dari pengalaman langsung seseorang yang sudah mewujudkan American Dream."
					buttonText="Lihat Kursus"
					buttonLink="/courses"
				/>
			</main>

			<LandingFooter />
		</div>
	);
}

interface TimelineItem {
	year: string;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
}

const TIMELINE_ITEMS: TimelineItem[] = [
	{
		year: "2015",
		title: "Memulai Karir Chef",
		description: "Memulai perjalanan sebagai chef profesional di Indonesia",
		icon: ChefHat,
	},
	{
		year: "2019",
		title: "Mendaftar DV Lottery",
		description: "Pertama kali mendaftar program DV Lottery Amerika Serikat",
		icon: GraduationCap,
	},
	{
		year: "2020",
		title: "Menang DV Lottery",
		description: "Terpilih sebagai pemenang DV Lottery — American Dream dimulai",
		icon: Award,
	},
	{
		year: "2021",
		title: "Pindah ke Amerika",
		description: "Resmi pindah ke Amerika Serikat dengan Green Card",
		icon: Plane,
	},
	{
		year: "2023",
		title: "Jr. Sous Chef NYC",
		description:
			"Menjadi Jr. Executive Sous Chef di restoran ternama New York City",
		icon: MapPin,
	},
	{
		year: "2024",
		title: "Mendirikan AwalBaru.com",
		description:
			"Memulai misi untuk membantu orang Indonesia lainnya meraih American Dream",
		icon: Calendar,
	},
];

function Timeline() {
	return (
		<div className="relative">
			{/* Vertical line */}
			<div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

			<div className="space-y-8">
				{TIMELINE_ITEMS.map((item, index) => (
					<TimelineCard key={index} item={item} />
				))}
			</div>
		</div>
	);
}

function TimelineCard({ item }: { item: TimelineItem }) {
	const Icon = item.icon;

	return (
		<div className="relative flex gap-6">
			{/* Icon circle */}
			<div className="relative z-10 w-16 h-16 rounded-full bg-brand-primary/10 border-4 border-background flex items-center justify-center shrink-0">
				<Icon className="w-6 h-6 text-brand-primary" />
			</div>

			{/* Content */}
			<div className="bg-card border border-border rounded-xl p-6 flex-1 card-hover">
				<div className="text-sm text-brand-primary font-semibold mb-1">
					{item.year}
				</div>
				<h3 className="text-lg font-semibold text-foreground mb-2">
					{item.title}
				</h3>
				<p className="text-muted-foreground">{item.description}</p>
			</div>
		</div>
	);
}

function MissionCard({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="bg-card border border-border rounded-xl p-6">
			<h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
			<p className="text-muted-foreground text-sm">{description}</p>
		</div>
	);
}
