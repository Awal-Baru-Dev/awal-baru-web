import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, CheckCircle2, TrendingUp, Play } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserEnrollments } from "@/features/enrollments";
import type { Course } from "@/lib/db/types";

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

/**
 * Format duration from minutes to human readable hours
 */
function formatLearningHours(minutes: number): string {
	if (minutes < 60) {
		return `${minutes}m`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (remainingMinutes === 0) {
		return `${hours}`;
	}
	return `${hours}.${Math.round(remainingMinutes / 6)}`;
}

/**
 * Format duration for course card
 */
function formatCourseDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} menit`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (remainingMinutes === 0) {
		return `${hours} jam`;
	}
	return `${hours}j ${remainingMinutes}m`;
}

function DashboardPage() {
	// Get user from route context (set by _authed layout's parent __root)
	const { user } = Route.useRouteContext();

	// Fetch user enrollments
	const { data: enrollments, isLoading: isLoadingEnrollments } = useUserEnrollments();

	const displayName = getDisplayName(user);
	const firstName = displayName.split(" ")[0];

	// Compute dashboard stats from enrollments
	const activeCourses = enrollments?.length ?? 0;
	const totalLearningMinutes = enrollments?.reduce(
		(sum, enrollment) => sum + (enrollment.course?.duration_minutes ?? 0),
		0
	) ?? 0;
	const learningHours = formatLearningHours(totalLearningMinutes);
	// For now, completed courses and progress are 0 until progress tracking is implemented
	const completedCourses = 0;
	const overallProgress = 0;

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
						value={isLoadingEnrollments ? "-" : String(activeCourses)}
						color="text-brand-primary"
						bgColor="bg-brand-primary/10"
					/>
					<StatCard
						icon={Clock}
						label="Jam Belajar"
						value={isLoadingEnrollments ? "-" : learningHours}
						color="text-blue-500"
						bgColor="bg-blue-500/10"
						tooltip="Total durasi kursus yang dimiliki"
					/>
					<StatCard
						icon={CheckCircle2}
						label="Kursus Selesai"
						value={String(completedCourses)}
						color="text-amber-500"
						bgColor="bg-amber-500/10"
						tooltip="Akan tersedia setelah mulai belajar"
					/>
					<StatCard
						icon={TrendingUp}
						label="Progress"
						value={`${overallProgress}%`}
						color="text-green-500"
						bgColor="bg-green-500/10"
						tooltip="Akan tersedia setelah mulai belajar"
					/>
				</div>

				{/* Continue learning section */}
				<section>
					<h2 className="text-lg font-semibold text-foreground mb-4">
						Lanjutkan Belajar
					</h2>
					{isLoadingEnrollments ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{[1, 2, 3].map((i) => (
								<div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
									<Skeleton className="w-full aspect-video" />
									<div className="p-4 space-y-2">
										<Skeleton className="h-5 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
									</div>
								</div>
							))}
						</div>
					) : enrollments && enrollments.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{enrollments.map((enrollment) => (
								<EnrolledCourseCard
									key={enrollment.id}
									course={enrollment.course}
									progress={0} // Will be implemented with progress tracking
								/>
							))}
						</div>
					) : (
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
							<Link
								to="/courses"
								className="inline-flex items-center justify-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors"
							>
								Jelajahi Kursus
							</Link>
						</div>
					)}
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
	tooltip,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
	color: string;
	bgColor: string;
	tooltip?: string;
}) {
	return (
		<div className="bg-card border border-border rounded-xl p-4" title={tooltip}>
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
		<Link
			to={href}
			className="block bg-card border border-border rounded-xl p-4 hover:border-brand-primary transition-colors group"
		>
			<h3 className="font-medium text-foreground group-hover:text-brand-primary transition-colors">
				{title}
			</h3>
			<p className="text-sm text-muted-foreground mt-1">{description}</p>
		</Link>
	);
}

/**
 * Enrolled course card for continue learning section
 */
function EnrolledCourseCard({
	course,
	progress = 0,
}: {
	course: Course;
	progress?: number;
}) {
	return (
		<Link
			to="/courses/$slug"
			params={{ slug: course.slug }}
			className="block bg-card border border-border rounded-xl overflow-hidden hover:border-brand-primary transition-colors group"
		>
			{/* Thumbnail */}
			<div className="relative aspect-video bg-muted">
				{course.thumbnail_url ? (
					<img
						src={course.thumbnail_url}
						alt={course.title}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary/20 to-brand-primary/5">
						<span className="text-4xl font-bold text-brand-primary/30">
							{course.title.charAt(0)}
						</span>
					</div>
				)}
				{/* Play overlay on hover */}
				<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
					<div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
						<Play className="w-5 h-5 text-brand-primary ml-0.5" fill="currentColor" />
					</div>
				</div>
				{/* Progress bar */}
				{progress > 0 && (
					<div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
						<div
							className="h-full bg-brand-primary"
							style={{ width: `${progress}%` }}
						/>
					</div>
				)}
			</div>
			{/* Content */}
			<div className="p-4">
				<h3 className="font-medium text-foreground line-clamp-2 group-hover:text-brand-primary transition-colors">
					{course.title}
				</h3>
				<div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
					<span className="flex items-center gap-1">
						<Clock className="w-4 h-4" />
						{formatCourseDuration(course.duration_minutes)}
					</span>
					{progress > 0 && (
						<span className="text-brand-primary font-medium">
							{progress}% selesai
						</span>
					)}
				</div>
			</div>
		</Link>
	);
}
