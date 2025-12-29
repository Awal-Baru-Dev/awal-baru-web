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
	Library,
	HelpCircle,
	MessageCircle,
	Settings,
	Play,
	TrendingUp,
	ChevronDown,
	Activity,
} from "lucide-react";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { CourseCarousel } from "@/components/course";
import { useUserEnrollments } from "@/features/enrollments";
import {
	useAllCourseProgress,
	useWeeklyActivity,
	useActivityStreak,
	formatWeeklyChartData,
} from "@/features/progress";
import type { Course } from "@/lib/db/types";
import {
	RadialBarChart,
	RadialBar,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

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
	const { data: enrollments, isLoading: enrollmentsLoading } = useUserEnrollments();

	// Extract course IDs for progress fetching
	const courseIds = useMemo(
		() => enrollments?.map((e) => e.course?.id).filter(Boolean) as string[] ?? [],
		[enrollments]
	);

	// Fetch progress for all enrolled courses
	const { data: allProgress, isLoading: progressLoading } = useAllCourseProgress(courseIds);

	// Fetch weekly activity data for charts
	const { data: weeklyActivityRaw } = useWeeklyActivity();
	const { data: activityStreak } = useActivityStreak();

	// Format weekly activity for charts
	const weeklyChartData = useMemo(
		() => formatWeeklyChartData(weeklyActivityRaw ?? []),
		[weeklyActivityRaw]
	);

	const isLoading = enrollmentsLoading || progressLoading;

	const displayName = getDisplayName(user);
	const firstName = displayName.split(" ")[0];

	// Compute dashboard stats from real progress data
	const activeCourses = enrollments?.length ?? 0;

	// Calculate completed courses (100% progress)
	const completedCourses = useMemo(
		() => allProgress?.filter((p) => p.progress_percent === 100).length ?? 0,
		[allProgress]
	);

	// Calculate overall progress (average of all courses)
	const overallProgress = useMemo(() => {
		if (!allProgress || allProgress.length === 0) return 0;
		if (activeCourses === 0) return 0;

		// Sum progress from tracked courses, treat untracked as 0%
		const totalProgress = allProgress.reduce((sum, p) => sum + p.progress_percent, 0);
		// Average across ALL enrolled courses (not just those with progress records)
		return Math.round(totalProgress / activeCourses);
	}, [allProgress, activeCourses]);

	// Get featured course (first enrolled) and remaining courses
	const featuredCourse = enrollments?.[0]?.course;
	const featuredCourseProgress = useMemo(() => {
		if (!featuredCourse || !allProgress) return 0;
		const progress = allProgress.find((p) => p.course_id === featuredCourse.id);
		return progress?.progress_percent ?? 0;
	}, [featuredCourse, allProgress]);

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
							<FeaturedCourseCard course={featuredCourse!} progress={featuredCourseProgress} />
						</div>

						{/* Stats Sidebar - 1/3 width */}
						<div className="lg:col-span-1">
							<StatsSidebar
								activeCourses={activeCourses}
								completedCourses={completedCourses}
								overallProgress={overallProgress}
								weeklyChartData={weeklyChartData}
								streak={activityStreak ?? 0}
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
						<QuickLinkButton href="/courses" icon={Library} label="Jelajahi Semua Kursus" />
						<QuickLinkButton
							href="/dashboard/bantuan"
							icon={HelpCircle}
							label="FAQ & Panduan"
						/>
						<QuickLinkButton
							href="/dashboard/kontak"
							icon={MessageCircle}
							label="Chat dengan Kami"
						/>
						<QuickLinkButton
							href="/dashboard/profil"
							icon={Settings}
							label="Edit Profil"
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
						{/* <span className="flex items-center gap-1.5">
							<BookOpen className="w-4 h-4" />
							{course.lessons_count} pelajaran
						</span> */}
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
 * Stats Sidebar - Graph/Figure based with dropdown selector
 */
type StatType = "progress" | "courses" | "time" | "activity";

const STAT_OPTIONS: { value: StatType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
	{ value: "progress", label: "Progress", icon: TrendingUp },
	{ value: "courses", label: "Kursus", icon: BookOpen },
	{ value: "time", label: "Waktu Belajar", icon: Clock },
	{ value: "activity", label: "Aktivitas", icon: Activity },
];

interface WeeklyChartDataItem {
	day: string;
	dayFull: string;
	menit: number;
	pelajaran: number;
}

function StatsSidebar({
	activeCourses,
	completedCourses,
	overallProgress,
	weeklyChartData,
	streak,
}: {
	activeCourses: number;
	completedCourses: number;
	overallProgress: number;
	weeklyChartData: WeeklyChartDataItem[];
	streak: number;
}) {
	const [selectedStat, setSelectedStat] = useState<StatType>("progress");
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const currentOption = STAT_OPTIONS.find((opt) => opt.value === selectedStat)!;

	return (
		<div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
			{/* Header with dropdown */}
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
					Statistik
				</h3>

				{/* Dropdown selector */}
				<div className="relative">
					<button
						type="button"
						onClick={() => setDropdownOpen(!dropdownOpen)}
						className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-sm font-medium text-foreground transition-colors whitespace-nowrap"
					>
						<currentOption.icon className="w-4 h-4 text-brand-primary flex-shrink-0" />
						{currentOption.label}
						<ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
					</button>

					{dropdownOpen && (
						<div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
							{STAT_OPTIONS.map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => {
										setSelectedStat(option.value);
										setDropdownOpen(false);
									}}
									className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors whitespace-nowrap ${
										selectedStat === option.value ? "text-brand-primary bg-brand-primary/5" : "text-foreground"
									}`}
								>
									<option.icon className="w-4 h-4 flex-shrink-0" />
									{option.label}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Visualization area */}
			<div className="flex-1 flex flex-col items-center justify-center">
				{selectedStat === "progress" && (
					<ProgressVisualization percentage={overallProgress} />
				)}
				{selectedStat === "courses" && (
					<CoursesVisualization total={activeCourses} completed={completedCourses} />
				)}
				{selectedStat === "time" && (
					<TimeVisualization weeklyData={weeklyChartData} />
				)}
				{selectedStat === "activity" && (
					<ActivityVisualization weeklyData={weeklyChartData} streak={streak} />
				)}
			</div>
		</div>
	);
}

/**
 * Brand color for charts (matches --color-brand-primary)
 */
const BRAND_PRIMARY = "#1c9af1";
const BRAND_PRIMARY_LIGHT = "#1c9af133";

/**
 * Progress visualization - Radial bar chart with animation
 */
function ProgressVisualization({ percentage }: { percentage: number }) {
	// Calculate the end angle based on percentage
	// Full circle is 360 degrees (90 to -270)
	// For partial fill, we calculate proportionally
	const endAngle = 90 - (percentage / 100) * 360;

	const data = [
		{ name: "Progress", value: 100, fill: BRAND_PRIMARY },
	];

	return (
		<div className="flex flex-col items-center">
			<div className="relative w-40 h-40">
				{/* Background circle */}
				<ResponsiveContainer width="100%" height="100%">
					<RadialBarChart
						cx="50%"
						cy="50%"
						innerRadius="70%"
						outerRadius="100%"
						barSize={14}
						data={[{ value: 100 }]}
						startAngle={90}
						endAngle={-270}
					>
						<RadialBar
							dataKey="value"
							fill={BRAND_PRIMARY_LIGHT}
							cornerRadius={10}
						/>
					</RadialBarChart>
				</ResponsiveContainer>
				{/* Foreground progress arc */}
				<div className="absolute inset-0">
					<ResponsiveContainer width="100%" height="100%">
						<RadialBarChart
							cx="50%"
							cy="50%"
							innerRadius="70%"
							outerRadius="100%"
							barSize={14}
							data={data}
							startAngle={90}
							endAngle={endAngle}
						>
							<RadialBar
								dataKey="value"
								cornerRadius={10}
								animationBegin={0}
								animationDuration={1000}
								animationEasing="ease-out"
							/>
						</RadialBarChart>
					</ResponsiveContainer>
				</div>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-3xl font-bold text-foreground">{percentage}%</span>
					<span className="text-xs text-muted-foreground">selesai</span>
				</div>
			</div>
			<p className="text-sm text-muted-foreground mt-3 text-center">
				Progress keseluruhan dari semua kursus
			</p>
		</div>
	);
}

/**
 * Courses visualization - Pie/Donut chart with animation
 * @param total - Total enrolled courses
 * @param completed - Courses with 100% progress
 */
function CoursesVisualization({ total, completed }: { total: number; completed: number }) {
	// In-progress = total enrolled minus completed
	const inProgress = total - completed;

	const data = [
		{ name: "Selesai", value: completed, fill: BRAND_PRIMARY },
		{ name: "Aktif", value: inProgress, fill: BRAND_PRIMARY_LIGHT },
	];

	// If no courses, show empty state
	if (total === 0) {
		data[0].value = 0;
		data[1].value = 1; // Show empty ring
	}

	return (
		<div className="flex flex-col items-center">
			<div className="relative w-40 h-40">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={50}
							outerRadius={70}
							paddingAngle={2}
							dataKey="value"
							animationBegin={0}
							animationDuration={800}
							animationEasing="ease-out"
						>
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.fill} />
							))}
						</Pie>
						<Tooltip
							formatter={(value, name) => [`${value} kursus`, name]}
							contentStyle={{
								backgroundColor: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "8px",
								fontSize: "12px",
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-3xl font-bold text-foreground">{total}</span>
					<span className="text-xs text-muted-foreground">kursus</span>
				</div>
			</div>

			{/* Legend */}
			<div className="flex items-center gap-4 mt-3">
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_PRIMARY_LIGHT }} />
					<span className="text-sm text-muted-foreground">{inProgress} aktif</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_PRIMARY }} />
					<span className="text-sm text-muted-foreground">{completed} selesai</span>
				</div>
			</div>
		</div>
	);
}

/**
 * Time visualization - Large number with animated bar chart
 * Shows actual time spent from activity logs (weekly total)
 */
function TimeVisualization({
	weeklyData,
}: {
	weeklyData: WeeklyChartDataItem[];
}) {
	// Calculate total minutes from weekly activity data
	const totalMinutes = weeklyData.reduce((sum, d) => sum + d.menit, 0);
	const hours = Math.floor(totalMinutes / 60);
	const mins = totalMinutes % 60;

	return (
		<div className="flex flex-col items-center w-full">
			{/* Large time display */}
			<div className="text-center mb-4">
				<div className="flex items-baseline justify-center gap-1">
					<span className="text-4xl font-bold text-foreground">{hours}</span>
					<span className="text-lg text-muted-foreground">jam</span>
					<span className="text-4xl font-bold text-foreground ml-2">{mins}</span>
					<span className="text-lg text-muted-foreground">menit</span>
				</div>
				<p className="text-sm text-muted-foreground mt-1">waktu belajar minggu ini</p>
			</div>

			{/* Weekly bar chart */}
			<div className="w-full h-28">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
						<XAxis
							dataKey="day"
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
						/>
						<Tooltip
							formatter={(value) => [`${value} menit`, "Waktu"]}
							contentStyle={{
								backgroundColor: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "8px",
								fontSize: "12px",
							}}
							cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
						/>
						<Bar
							dataKey="menit"
							fill={BRAND_PRIMARY}
							radius={[4, 4, 0, 0]}
							animationBegin={0}
							animationDuration={800}
							animationEasing="ease-out"
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

/**
 * Activity visualization - Weekly activity with animated bars
 */
function ActivityVisualization({
	weeklyData,
	streak,
}: {
	weeklyData: WeeklyChartDataItem[];
	streak: number;
}) {
	// Calculate total lessons from real data
	const totalLessons = weeklyData.reduce((sum, d) => sum + d.pelajaran, 0);

	return (
		<div className="flex flex-col items-center w-full">
			{/* Summary */}
			<div className="text-center mb-4">
				<span className="text-4xl font-bold text-foreground">{totalLessons}</span>
				<p className="text-sm text-muted-foreground mt-1">pelajaran minggu ini</p>
			</div>

			{/* Activity bars */}
			<div className="w-full h-28">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
						<XAxis
							dataKey="day"
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
						/>
						<Tooltip
							formatter={(value) => [`${value} pelajaran`, "Selesai"]}
							contentStyle={{
								backgroundColor: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "8px",
								fontSize: "12px",
							}}
							cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
						/>
						<Bar
							dataKey="pelajaran"
							fill={BRAND_PRIMARY}
							radius={[4, 4, 0, 0]}
							animationBegin={0}
							animationDuration={800}
							animationEasing="ease-out"
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Streak indicator */}
			{streak > 0 ? (
				<p className="text-sm text-brand-primary font-medium mt-2">
					{streak} hari berturut-turut aktif
				</p>
			) : (
				<p className="text-sm text-muted-foreground mt-2">
					Mulai belajar untuk membangun streak!
				</p>
			)}
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
				<div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
					<div className="flex items-center justify-between mb-4">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-8 w-28 rounded-lg" />
					</div>
					<div className="flex-1 flex flex-col items-center justify-center">
						<Skeleton className="w-36 h-36 rounded-full" />
						<Skeleton className="h-4 w-32 mt-4" />
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
