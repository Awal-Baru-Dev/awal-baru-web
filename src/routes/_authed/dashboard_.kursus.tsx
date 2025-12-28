import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, Play, Calendar, BookMarked } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUserEnrollments } from "@/features/enrollments";
import { useAllCourseProgress } from "@/features/progress";
import type { EnrollmentWithCourse } from "@/lib/db/types";

// Status filter types
type CourseStatus = "all" | "in_progress" | "completed";

const searchSchema = z.object({
	status: z.enum(["all", "in_progress", "completed"]).optional().default("all"),
});

export const Route = createFileRoute("/_authed/dashboard_/kursus")({
	component: KursusSayaPage,
	validateSearch: searchSchema,
});

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

/**
 * Format relative date (e.g., "2 hari yang lalu")
 */
function formatRelativeDate(dateString: string | null): string {
	if (!dateString) return "";

	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Hari ini";
	if (diffDays === 1) return "Kemarin";
	if (diffDays < 7) return `${diffDays} hari yang lalu`;
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7);
		return `${weeks} minggu yang lalu`;
	}
	if (diffDays < 365) {
		const months = Math.floor(diffDays / 30);
		return `${months} bulan yang lalu`;
	}
	const years = Math.floor(diffDays / 365);
	return `${years} tahun yang lalu`;
}

/**
 * Get course status based on progress
 * For now, without progress tracking:
 * - All courses are "in_progress" (0% but started by purchasing)
 * - None are "completed" yet
 */
function getCourseStatus(progress: number): "new" | "in_progress" | "completed" {
	if (progress === 0) return "new";
	if (progress >= 100) return "completed";
	return "in_progress";
}

/**
 * Filter enrollments by status
 */
function filterEnrollmentsByStatus(
	enrollments: EnrollmentWithCourse[],
	status: CourseStatus,
	getProgress: (courseId: string) => number
): EnrollmentWithCourse[] {
	if (status === "all") return enrollments;

	return enrollments.filter((enrollment) => {
		const progress = getProgress(enrollment.course_id);
		const courseStatus = getCourseStatus(progress);

		if (status === "in_progress") {
			return courseStatus === "new" || courseStatus === "in_progress";
		}
		if (status === "completed") {
			return courseStatus === "completed";
		}
		return true;
	})
}

function KursusSayaPage() {
	const { status } = Route.useSearch();

	// Fetch user enrollments
	const { data: enrollments, isLoading: enrollmentsLoading } = useUserEnrollments();

	// Extract course IDs for progress fetching
	const courseIds = useMemo(
		() => enrollments?.map((e) => e.course_id) ?? [],
		[enrollments]
	);

	// Fetch progress for all enrolled courses
	const { data: progressData, isLoading: progressLoading } = useAllCourseProgress(courseIds);

	// Combined loading state
	const isLoading = enrollmentsLoading || progressLoading;

	// Get progress for a course from the fetched data
	const getProgress = (courseId: string): number => {
		const progress = progressData?.find((p) => p.course_id === courseId);
		return progress?.progress_percent ?? 0;
	};

	// Filter enrollments based on status
	const filteredEnrollments = enrollments
		? filterEnrollmentsByStatus(enrollments, status, getProgress)
		: [];

	// Count courses by status for tab badges
	const allCount = enrollments?.length ?? 0;
	const inProgressCount = enrollments?.filter((e) => {
		const progress = getProgress(e.course_id);
		return progress < 100;
	}).length ?? 0;
	const completedCount = enrollments?.filter((e) => {
		const progress = getProgress(e.course_id);
		return progress >= 100;
	}).length ?? 0;

	return (
		<DashboardLayout>
			<div className="p-4 lg:p-8 space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-2xl lg:text-3xl font-bold text-foreground">
						Kursus Saya
					</h1>
					<p className="text-muted-foreground mt-1">
						Kelola dan lanjutkan kursus yang sudah kamu beli.
					</p>
				</div>

				{/* Status Filter Tabs */}
				<div className="flex gap-2 border-b border-border pb-0">
					<StatusTab
						label="Semua"
						count={allCount}
						isActive={status === "all"}
						href="/dashboard/kursus"
						search={{ status: "all" }}
					/>
					<StatusTab
						label="Sedang Dipelajari"
						count={inProgressCount}
						isActive={status === "in_progress"}
						href="/dashboard/kursus"
						search={{ status: "in_progress" }}
					/>
					<StatusTab
						label="Selesai"
						count={completedCount}
						isActive={status === "completed"}
						href="/dashboard/kursus"
						search={{ status: "completed" }}
					/>
				</div>

				{/* Course Grid */}
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<CourseCardSkeleton key={i} />
						))}
					</div>
				) : filteredEnrollments.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredEnrollments.map((enrollment) => (
							<EnrolledCourseCardExpanded
								key={enrollment.id}
								enrollment={enrollment}
								progress={getProgress(enrollment.course_id)}
							/>
						))}
					</div>
				) : (
					<EmptyState status={status} hasAnyCourses={allCount > 0} />
				)}
			</div>
		</DashboardLayout>
	)
}

/**
 * Status filter tab
 */
function StatusTab({
	label,
	count,
	isActive,
	href,
	search,
}: {
	label: string;
	count: number;
	isActive: boolean;
	href: string;
	search: { status: CourseStatus };
}) {
	return (
		<Link
			to={href}
			search={search}
			className={cn(
				"px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
				isActive
					? "border-brand-primary text-brand-primary"
					: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
			)}
		>
			{label}
			{count > 0 && (
				<span
					className={cn(
						"ml-2 px-2 py-0.5 rounded-full text-xs",
						isActive
							? "bg-brand-primary/10 text-brand-primary"
							: "bg-muted text-muted-foreground"
					)}
				>
					{count}
				</span>
			)}
		</Link>
	)
}

/**
 * Enhanced course card with enrollment details
 */
function EnrolledCourseCardExpanded({
	enrollment,
	progress = 0,
}: {
	enrollment: EnrollmentWithCourse;
	progress?: number;
}) {
	const { course } = enrollment;
	const status = getCourseStatus(progress);

	return (
		<Link
			to="/courses/$slug"
			params={{ slug: course.slug }}
			className="block bg-card border border-border rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-md transition-all group"
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

				{/* Status Badge */}
				<div className="absolute top-3 left-3">
					{status === "completed" ? (
						<Badge className="bg-brand-primary text-white border-0">
							Selesai
						</Badge>
					) : status === "in_progress" ? (
						<Badge className="bg-brand-primary/80 text-white border-0">
							{progress}% Selesai
						</Badge>
					) : (
						<Badge className="bg-brand-primary/60 text-white border-0">
							Baru
						</Badge>
					)}
				</div>

				{/* Play overlay on hover */}
				<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
					<div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
						<Play className="w-6 h-6 text-brand-primary ml-0.5" fill="currentColor" />
					</div>
				</div>

				{/* Progress bar */}
				<div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
					<div
						className="h-full transition-all bg-brand-primary"
						style={{ width: `${Math.max(progress, 0)}%` }}
					/>
				</div>
			</div>

			{/* Content */}
			<div className="p-4 space-y-3">
				<h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-brand-primary transition-colors">
					{course.title}
				</h3>

				{/* Course metadata */}
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<Clock className="w-4 h-4" />
						{formatCourseDuration(course.duration_minutes)}
					</span>
					<span className="flex items-center gap-1.5">
						<BookMarked className="w-4 h-4" />
						{course.lessons_count} pelajaran
					</span>
				</div>

				{/* Enrollment info */}
				<div className="flex items-center justify-between pt-2 border-t border-border">
					<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Calendar className="w-3.5 h-3.5" />
						Dibeli {formatRelativeDate(enrollment.purchased_at)}
					</span>
					{progress > 0 && progress < 100 && (
						<span className="text-xs font-medium text-brand-primary">
							{progress}% selesai
						</span>
					)}
					{progress >= 100 && (
						<span className="text-xs font-medium text-brand-primary">
							Selesai
						</span>
					)}
				</div>
			</div>
		</Link>
	)
}

/**
 * Course card loading skeleton
 */
function CourseCardSkeleton() {
	return (
		<div className="bg-card border border-border rounded-xl overflow-hidden">
			<Skeleton className="w-full aspect-video" />
			<div className="p-4 space-y-3">
				<Skeleton className="h-5 w-3/4" />
				<div className="flex gap-4">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-24" />
				</div>
				<div className="flex justify-between pt-2 border-t border-border">
					<Skeleton className="h-3 w-28" />
				</div>
			</div>
		</div>
	)
}

/**
 * Empty state component
 */
function EmptyState({
	status,
	hasAnyCourses,
}: {
	status: CourseStatus;
	hasAnyCourses: boolean;
}) {
	// If user has courses but filtered to empty
	if (hasAnyCourses) {
		return (
			<div className="bg-card border border-border rounded-xl p-8 text-center">
				<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
					<BookOpen className="w-8 h-8 text-muted-foreground" />
				</div>
				<h3 className="font-medium text-foreground mb-2">
					{status === "completed"
						? "Belum ada kursus yang selesai"
						: "Tidak ada kursus dalam kategori ini"}
				</h3>
				<p className="text-muted-foreground text-sm mb-4">
					{status === "completed"
						? "Selesaikan kursus yang sedang dipelajari untuk melihatnya di sini."
						: "Coba lihat kategori lain atau tambah kursus baru."}
				</p>
				<Link
					to="/dashboard/kursus"
					search={{ status: "all" }}
					className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-brand-primary hover:underline"
				>
					Lihat Semua Kursus
				</Link>
			</div>
		)
	}

	// No courses at all
	return (
		<div className="bg-card border border-border rounded-xl p-8 text-center">
			<div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
				<BookOpen className="w-8 h-8 text-brand-primary" />
			</div>
			<h3 className="font-medium text-foreground mb-2">
				Belum ada kursus
			</h3>
			<p className="text-muted-foreground text-sm mb-4">
				Mulai perjalanan belajarmu dengan membeli kursus pertama.
			</p>
			<Link
				to="/courses"
				className="inline-flex items-center justify-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors"
			>
				Jelajahi Kursus
			</Link>
		</div>
	)
}
