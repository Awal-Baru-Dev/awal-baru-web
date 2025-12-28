/**
 * Dashboard Page - Option A: "Featured Focus" Layout
 *
 * Features:
 * - Large "continue watching" hero card with prominent play button
 * - Stats consolidated into a compact sidebar card
 * - Remaining courses in a horizontal carousel below
 * - Quick links at the bottom
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BookOpen,
	Clock,
	CheckCircle2,
	TrendingUp,
	Library,
	HelpCircle,
	MessageCircle,
	Settings,
	Play,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { CourseCarousel } from "@/components/course";
import { useUserEnrollments } from "@/features/enrollments";
import type { Course } from "@/lib/db/types";

export const Route = createFileRoute("/_authed/dashboard")({
	component: DashboardPage,
});

/**
 * Get user display name from auth user
 */
function getDisplayName(
	user: {
		email?: string;
		profile: { full_name: string | null } | null;
	} | null,
): string {
	if (!user) return "";
	if (user.profile?.full_name) return user.profile.full_name;
	if (user.email) return user.email.split("@")[0];
	return "User";
}

/**
 * Format duration from minutes to human readable
 */
function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes}m`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (remainingMinutes === 0) {
		return `${hours}j`;
	}
	return `${hours}j ${remainingMinutes}m`;
}

function DashboardPage() {
	// Get user from route context
	const { user } = Route.useRouteContext();

	// Fetch user enrollments
	const { data: enrollments, isLoading } = useUserEnrollments();

	const displayName = getDisplayName(user);
	const firstName = displayName.split(" ")[0];

	// Compute dashboard stats
	const activeCourses = enrollments?.length ?? 0;
	const totalLearningMinutes =
		enrollments?.reduce(
			(sum, enrollment) => sum + (enrollment.course?.duration_minutes ?? 0),
			0,
		) ?? 0;
	const completedCourses = 0; // TODO: Implement with progress tracking
	const overallProgress = 0; // TODO: Implement with progress tracking

	// Get featured course (first enrolled) and remaining courses
	const featuredCourse = enrollments?.[0]?.course;
	const otherCourses = enrollments?.slice(1).map((e) => e.course) ?? [];

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

				{/* Main content: Featured Course + Stats Sidebar */}
				{isLoading ? (
					<LoadingSkeleton />
				) : enrollments && enrollments.length > 0 ? (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Featured Course Card - 2/3 width */}
						<div className="lg:col-span-2">
							<FeaturedCourseCard course={featuredCourse!} progress={0} />
						</div>

						{/* Stats Sidebar - 1/3 width */}
						<div className="lg:col-span-1">
							<StatsSidebar
								activeCourses={activeCourses}
								learningMinutes={totalLearningMinutes}
								completedCourses={completedCourses}
								overallProgress={overallProgress}
							/>
						</div>
					</div>
				) : (
					<EmptyState />
				)}

				{/* Other Courses Carousel */}
				{!isLoading && otherCourses.length > 0 && (
					<CourseCarousel courses={otherCourses} title="Kursus Lainnya" />
				)}

				{/* Quick links */}
				<section>
					<h2 className="text-lg font-semibold text-foreground mb-4">
						Akses Cepat
					</h2>
					<div className="flex flex-wrap gap-3">
						<QuickLinkButton href="/courses" icon={Library} label="Katalog" />
						<QuickLinkButton
							href="/dashboard/bantuan"
							icon={HelpCircle}
							label="Bantuan"
						/>
						<QuickLinkButton
							href="/dashboard/kontak"
							icon={MessageCircle}
							label="Kontak"
						/>
						<QuickLinkButton
							href="/dashboard/profil"
							icon={Settings}
							label="Pengaturan"
						/>
					</div>
				</section>
			</div>
		</DashboardLayout>
	);
}

/**
 * Featured Course Card - Large hero card with play button
 */
function FeaturedCourseCard({
	course,
	progress = 0,
}: {
	course: Course;
	progress?: number;
}) {
	return (
		<div className="bg-card border border-border rounded-2xl overflow-hidden">
			<div className="p-4 pb-3">
				<span className="text-xs font-medium text-brand-primary uppercase tracking-wide">
					Lanjutkan Terakhir
				</span>
			</div>

			<Link
				to="/courses/$slug/learn"
				params={{ slug: course.slug }}
				className="block group"
			>
				{/* Large Thumbnail with Play Overlay */}
				<div className="relative aspect-video mx-4 rounded-xl overflow-hidden bg-muted">
					{course.thumbnail_url ? (
						<img
							src={course.thumbnail_url}
							alt={course.title}
							className="w-full h-full object-cover transition-transform group-hover:scale-105"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary/20 to-brand-primary/5">
							<span className="text-6xl font-bold text-brand-primary/30">
								{course.title.charAt(0)}
							</span>
						</div>
					)}

					{/* Play Button Overlay */}
					<div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
						<div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
							<Play
								className="w-7 h-7 text-brand-primary ml-1"
								fill="currentColor"
							/>
						</div>
					</div>
				</div>

				{/* Course Info */}
				<div className="p-4 pt-4">
					<h3 className="text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors line-clamp-2">
						{course.title}
					</h3>

					<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<Clock className="w-4 h-4" />
							{formatDuration(course.duration_minutes)}
						</span>
						<span className="flex items-center gap-1.5">
							<BookOpen className="w-4 h-4" />
							{course.lessons_count} pelajaran
						</span>
					</div>

					{/* Progress Bar */}
					<div className="mt-4">
						<div className="flex items-center justify-between text-sm mb-2">
							<span className="text-muted-foreground">Progress</span>
							<span className="font-medium text-brand-primary">
								{progress}%
							</span>
						</div>
						<Progress value={progress} className="h-2" />
					</div>
				</div>
			</Link>
		</div>
	);
}

/**
 * Stats Sidebar - Vertical stack of stats
 */
function StatsSidebar({
	activeCourses,
	learningMinutes,
	completedCourses,
	overallProgress,
}: {
	activeCourses: number;
	learningMinutes: number;
	completedCourses: number;
	overallProgress: number;
}) {
	return (
		<div className="bg-card border border-border rounded-2xl p-5 h-full">
			<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-5">
				Statistik Kamu
			</h3>

			<div className="space-y-6">
				<StatItem
					icon={BookOpen}
					value={String(activeCourses)}
					label="Kursus Aktif"
				/>
				<StatItem
					icon={Clock}
					value={formatDuration(learningMinutes)}
					label="Total Durasi"
				/>
				<StatItem
					icon={CheckCircle2}
					value={String(completedCourses)}
					label="Kursus Selesai"
				/>
				<StatItem
					icon={TrendingUp}
					value={`${overallProgress}%`}
					label="Progress Keseluruhan"
				/>
			</div>
		</div>
	);
}

/**
 * Individual stat item for sidebar
 */
function StatItem({
	icon: Icon,
	value,
	label,
}: {
	icon: React.ComponentType<{ className?: string }>;
	value: string;
	label: string;
}) {
	return (
		<div className="flex items-center gap-4">
			<div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
				<Icon className="w-5 h-5 text-brand-primary" />
			</div>
			<div>
				<p className="text-xl font-bold text-foreground">{value}</p>
				<p className="text-sm text-muted-foreground">{label}</p>
			</div>
		</div>
	);
}

/**
 * Loading skeleton for main content
 */
function LoadingSkeleton() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2">
				<div className="bg-card border border-border rounded-2xl overflow-hidden">
					<div className="p-4 pb-3">
						<Skeleton className="h-4 w-32" />
					</div>
					<div className="mx-4 rounded-xl overflow-hidden">
						<Skeleton className="w-full aspect-video" />
					</div>
					<div className="p-4 space-y-3">
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-2 w-full mt-4" />
					</div>
				</div>
			</div>
			<div className="lg:col-span-1">
				<div className="bg-card border border-border rounded-2xl p-5 h-full">
					<Skeleton className="h-4 w-28 mb-5" />
					<div className="space-y-6">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="flex items-center gap-4">
								<Skeleton className="w-10 h-10 rounded-lg" />
								<div className="space-y-2">
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Empty state when no courses enrolled
 */
function EmptyState() {
	return (
		<div className="bg-card border border-border rounded-2xl p-12 text-center">
			<div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
				<BookOpen className="w-10 h-10 text-brand-primary" />
			</div>
			<h3 className="text-xl font-semibold text-foreground mb-2">
				Belum ada kursus
			</h3>
			<p className="text-muted-foreground mb-6 max-w-md mx-auto">
				Mulai perjalanan belajarmu dengan mendaftar ke kursus pertamamu dan
				wujudkan American Dream-mu.
			</p>
			<Link
				to="/courses"
				className="inline-flex items-center justify-center px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-dark transition-colors font-medium"
			>
				Jelajahi Kursus
			</Link>
		</div>
	);
}

/**
 * Quick link button
 */
function QuickLinkButton({
	href,
	icon: Icon,
	label,
}: {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
}) {
	return (
		<Link
			to={href}
			className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
		>
			<Icon className="w-4 h-4 text-muted-foreground group-hover:text-brand-primary transition-colors" />
			<span className="text-sm font-medium text-foreground group-hover:text-brand-primary transition-colors">
				{label}
			</span>
		</Link>
	);
}
