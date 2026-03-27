import { createFileRoute } from "@tanstack/react-router";
import {
	LandingCTA,
	LandingFeatures,
	LandingHero,
	LandingStats,
} from "@/components/landing";
import { LandingFooter, LandingHeader } from "@/components/layout";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

function LandingPage() {
	return (
		<div className="min-h-screen bg-background">
			<LandingHeader />

			<main>
				<LandingHero />
				<LandingStats />
				<LandingFeatures />
				<LandingCTA />
			</main>

			<LandingFooter />
		</div>
	);
}
