import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const Route = createFileRoute("/_authed/dashboard")({
	component: DashboardPage,
});

/**
 * Get user display name from auth user
 */
function getDisplayName(user: { email?: string; profile: { full_name: string | null } | null } | null): string {
	if (!user) return "";
	if (user.profile?.full_name) return user.profile.full_name;
	if (user.email) return user.email.split("@")[0];
	return "User";
}

function DashboardPage() {
	// Get user from route context (set by _authed layout's parent __root)
	const { user } = Route.useRouteContext();

	const displayName = getDisplayName(user);
	const firstName = displayName.split(" ")[0];

	return (
		<DashboardLayout>
			<div className="p-4 lg:p-8 space-y-8">
				{/* Welcome header */}
				<div>
					<h1 className="text-2xl lg:text-3xl font-bold text-foreground">
						Selamat datang, {firstName}!
					</h1>
					<p className="text-muted-foreground mt-1">
						Lanjutkan perjalanan belajarmu menuju American Dream.
					</p>
				</div>

				{/* Stats grid */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						icon={BookOpen}
						label="Kursus Aktif"
						value="0"
						color="text-brand-primary"
						bgColor="bg-brand-primary/10"
					/>
					<StatCard
						icon={Clock}
						label="Jam Belajar"
						value="0"
						color="text-blue-500"
						bgColor="bg-blue-500/10"
					/>
					<StatCard
						icon={CheckCircle2}
						label="Kursus Selesai"
						value="0"
						color="text-amber-500"
						bgColor="bg-amber-500/10"
					/>
					<StatCard
						icon={TrendingUp}
						label="Progress"
						value="0%"
						color="text-green-500"
						bgColor="bg-green-500/10"
					/>
				</div>

				{/* Continue learning section */}
				<section>
					<h2 className="text-lg font-semibold text-foreground mb-4">
						Lanjutkan Belajar
					</h2>
					<div className="bg-card border border-border rounded-xl p-8 text-center">
						<div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
							<BookOpen className="w-8 h-8 text-brand-primary" />
						</div>
						<h3 className="font-medium text-foreground mb-2">
							Belum ada kursus
						</h3>
						<p className="text-muted-foreground text-sm mb-4">
							Mulai belajar dengan mendaftar ke kursus pertamamu.
						</p>
						<a
							href="/courses"
							className="inline-flex items-center justify-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors"
						>
							Jelajahi Kursus
						</a>
					</div>
				</section>

				{/* Quick links */}
				<section>
					<h2 className="text-lg font-semibold text-foreground mb-4">
						Akses Cepat
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<QuickLinkCard
							href="/courses"
							title="Katalog Kursus"
							description="Lihat semua kursus yang tersedia"
						/>
						<QuickLinkCard
							href="/dashboard/profil"
							title="Lengkapi Profil"
							description="Update informasi profil kamu"
						/>
						<QuickLinkCard
							href="/tentang"
							title="Tentang Tedchay"
							description="Kenalan dengan mentor kamu"
						/>
					</div>
				</section>
			</div>
		</DashboardLayout>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
	color,
	bgColor,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
	color: string;
	bgColor: string;
}) {
	return (
		<div className="bg-card border border-border rounded-xl p-4">
			<div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mb-3`}>
				<Icon className={`w-5 h-5 ${color}`} />
			</div>
			<p className="text-2xl font-bold text-foreground">{value}</p>
			<p className="text-sm text-muted-foreground">{label}</p>
		</div>
	);
}

function QuickLinkCard({
	href,
	title,
	description,
}: {
	href: string;
	title: string;
	description: string;
}) {
	return (
		<a
			href={href}
			className="block bg-card border border-border rounded-xl p-4 hover:border-brand-primary transition-colors group"
		>
			<h3 className="font-medium text-foreground group-hover:text-brand-primary transition-colors">
				{title}
			</h3>
			<p className="text-sm text-muted-foreground mt-1">{description}</p>
		</a>
	);
}
