import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingCTAProps {
	title?: string;
	subtitle?: string;
	buttonText?: string;
	buttonLink?: string;
}

export function LandingCTA({
	title = "Siap Memulai Perjalananmu?",
	subtitle = "Bergabung sekarang dan mulai pelajari cara mewujudkan impian Amerikamu. Ribuan orang Indonesia sudah memulai langkah pertama mereka.",
	buttonText = "Daftar Sekarang",
	buttonLink = "/daftar",
}: LandingCTAProps) {
	return (
		<section className="py-20 bg-hero-gradient text-white">
			<div className="container mx-auto px-6 lg:px-16">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
					<p className="text-xl text-white/90 mb-8 leading-relaxed">
						{subtitle}
					</p>
					<Link to={buttonLink}>
						<Button
							size="lg"
							className="btn-cta text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all"
						>
							{buttonText}
							<ArrowRight className="w-5 h-5 ml-2" />
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
