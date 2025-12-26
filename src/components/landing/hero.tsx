import { Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config/constants";

export function LandingHero() {
	return (
		<section className="relative min-h-screen bg-hero-gradient text-white pt-20 sm:pt-32 pb-8 sm:pb-16 overflow-hidden">
			{/* Subtle American flag stripes decoration */}
			<div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
				<div className="h-full flex flex-col">
					<div className="flex-1 bg-red-600" />
					<div className="flex-1 bg-white" />
					<div className="flex-1 bg-red-600" />
					<div className="flex-1 bg-white" />
					<div className="flex-1 bg-red-600" />
				</div>
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-16 relative z-10">
				<div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-12 lg:items-center">
					{/* Title - Shows first on mobile, left column on desktop */}
					<div className="space-y-2 sm:space-y-4 text-center lg:text-left order-1 lg:order-none">
						<HeroTitle />
					</div>

					{/* Hero Image - Shows second on mobile, right column on desktop */}
					<div className="relative flex items-center justify-center lg:justify-end order-2 lg:order-none lg:row-span-2">
						<HeroImage />
					</div>

					{/* Description and Buttons - Shows third on mobile, left column on desktop */}
					<div className="space-y-4 sm:space-y-8 text-center lg:text-left order-3 lg:order-none">
						<p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
							Bergabunglah dengan {APP_NAME} — platform pembelajaran yang
							membantu orang Indonesia mewujudkan impian tinggal dan berkembang
							di Amerika Serikat. Dipandu langsung oleh Tedchay yang telah
							merasakan perjalanan ini.
						</p>

						<HeroActions />
					</div>
				</div>
			</div>
		</section>
	);
}

/**
 * Hero title with glow effect
 */
function HeroTitle() {
	return (
		<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
			<GlowText>WUJUDKAN</GlowText>
			<br />
			<GlowText>IMPIAN HIDUP</GlowText>
			<br />
			<GlowText>DI AMERIKA</GlowText>
		</h1>
	);
}

/**
 * Text with subtle glow effect
 */
function GlowText({ children }: { children: React.ReactNode }) {
	return (
		<span className="relative inline-block">
			<span className="relative z-10 text-white">{children}</span>
			<div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
		</span>
	);
}

/**
 * Hero image with floating badge
 */
function HeroImage() {
	return (
		<div className="relative w-full max-w-[350px] sm:max-w-[450px] lg:max-w-[625px] mx-auto lg:mx-0">
			{/* Decorative blur */}
			<div className="absolute inset-0 bg-white/5 rounded-3xl blur-3xl" />

			{/* Image container */}
			<div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
				<div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/10">
					<img
						src="/landing-page-hero.jpeg"
						alt="Teddy Cahyadi - Jr. Executive Sous Chef in New York, USA"
						className="w-full h-auto"
					/>
				</div>

				{/* Floating badge */}
				<div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-4 lg:-bottom-10 lg:-right-10 bg-brand-cta text-white px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-lg sm:rounded-xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
					<div className="text-xs sm:text-sm lg:text-base font-bold">
						✓ DV Lottery Winner
					</div>
					<div className="text-xs sm:text-sm opacity-90">
						Living the American Dream
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Hero call-to-action buttons
 */
function HeroActions() {
	return (
		<div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
			<Link to="/daftar" className="w-full sm:w-auto">
				<Button
					size="lg"
					className="w-full sm:w-auto btn-cta text-base px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all"
				>
					Mulai Belajar
					<ArrowRight className="w-5 h-5 ml-2" />
				</Button>
			</Link>
			<Button
				size="lg"
				variant="ghost"
				className="w-full sm:w-auto text-white hover:text-white hover:bg-white/10 border-2 border-white/30 font-semibold text-base px-6 sm:px-8"
			>
				<Play className="w-5 h-5 mr-2 fill-current" />
				Tonton Cerita Tedchay
			</Button>
		</div>
	);
}
