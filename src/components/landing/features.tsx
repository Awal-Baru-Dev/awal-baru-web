import {
	BookOpen,
	Trophy,
	Video,
	type LucideIcon,
} from "lucide-react";
import { APP_NAME, BRAND } from "@/lib/config/constants";

interface Feature {
	icon: LucideIcon;
	title: string;
	description: string;
}

const FEATURES: Feature[] = [
	{
		icon: BookOpen,
		title: "Kursus Berkualitas",
		description:
			"Materi lengkap dari pengalaman nyata, bukan teori. Langkah demi langkah yang mudah diikuti.",
	},
	{
		icon: Video,
		title: "Video HD Profesional",
		description:
			"Konten video berkualitas tinggi yang bisa ditonton kapan saja, di mana saja.",
	},
	{
		icon: Trophy,
		title: "Dibimbing Ahli",
		description: `Belajar langsung dari ${BRAND.founder}, pemenang DV Lottery yang sudah sukses di Amerika.`,
	},
];

export function LandingFeatures() {
	return (
		<section className="py-20 bg-background">
			<div className="container mx-auto px-6 lg:px-16">
				<SectionHeader
					title={`Mengapa Memilih ${APP_NAME}?`}
					subtitle="Platform pembelajaran terlengkap untuk wujudkan impian Amerikamu"
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{FEATURES.map((feature, index) => (
						<FeatureCard key={index} feature={feature} />
					))}
				</div>
			</div>
		</section>
	);
}

interface SectionHeaderProps {
	title: string;
	subtitle?: string;
}

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
	return (
		<div className="text-center mb-12">
			<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
				{title}
			</h2>
			{subtitle && (
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					{subtitle}
				</p>
			)}
		</div>
	);
}

interface FeatureCardProps {
	feature: Feature;
}

function FeatureCard({ feature }: FeatureCardProps) {
	const Icon = feature.icon;

	return (
		<div className="bg-card border border-border rounded-2xl p-6 card-hover">
			<div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
				<Icon className="h-6 w-6 text-brand-primary" />
			</div>
			<h3 className="text-xl font-semibold text-foreground mb-2">
				{feature.title}
			</h3>
			<p className="text-muted-foreground">{feature.description}</p>
		</div>
	);
}
