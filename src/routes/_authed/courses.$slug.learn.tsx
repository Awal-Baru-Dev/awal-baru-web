import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config/constants";

export const Route = createFileRoute("/_authed/courses/$slug/learn")({
	component: CourseLearnPage,
});

/**
 * Course Learn Page (Video Player)
 *
 * This page will be implemented in the next phase.
 * For now, it shows a placeholder.
 *
 * This route is protected by the _authed layout.
 */
function CourseLearnPage() {
	const { slug } = Route.useParams();

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
				<div className="container mx-auto max-w-6xl px-6">
					<div className="flex items-center justify-between h-16">
						<Button variant="ghost" size="sm" asChild>
							<Link to="/courses/$slug" params={{ slug }}>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Kembali ke Kursus
							</Link>
						</Button>

						<Link to="/" className="flex items-center gap-2">
							<div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">A</span>
							</div>
							<span className="font-semibold text-foreground hidden sm:inline">
								{APP_NAME}
							</span>
						</Link>

						<div className="w-20" />
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="pt-24 pb-20 px-6">
				<div className="container mx-auto max-w-4xl">
					<div className="text-center py-20">
						<div className="w-20 h-20 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
							<Construction className="w-10 h-10 text-brand-primary" />
						</div>
						<h1 className="text-2xl font-bold text-foreground mb-4">
							Video Player Segera Hadir
						</h1>
						<p className="text-muted-foreground max-w-md mx-auto mb-6">
							Fitur video player sedang dalam pengembangan. Kamu akan bisa
							menonton video pelajaran di sini.
						</p>
						<Button asChild>
							<Link to="/courses/$slug" params={{ slug }}>
								Kembali ke Detail Kursus
							</Link>
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}
