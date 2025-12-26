import { createFileRoute } from "@tanstack/react-router";
import { LandingHeader, LandingFooter } from "@/components/layout";
import {
	LandingHero,
	LandingStats,
	LandingFeatures,
	LandingCTA,
} from "@/components/landing";

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
