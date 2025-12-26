import { BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard, CourseCardSkeleton } from "./course-card";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/db/types";

interface CourseGridProps {
	courses: Course[];
	ownedCourseIds?: Set<string>;
	progressMap?: Map<string, number>; // courseId -> progress percentage
	className?: string;
}

interface CourseGridLoadingProps {
	count?: number;
	className?: string;
}

interface CourseGridEmptyProps {
	title?: string;
	description?: string;
	className?: string;
}

interface CourseGridErrorProps {
	message?: string;
	onRetry?: () => void;
	className?: string;
}

/**
 * Course Grid Component
 *
 * Responsive grid layout for displaying courses:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3-4 columns
 */
export function CourseGrid({
	courses,
	ownedCourseIds = new Set(),
	progressMap = new Map(),
	className,
}: CourseGridProps) {
	if (courses.length === 0) {
		return <CourseGridEmpty />;
	}

	return (
		<div
			className={cn(
				"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
				className,
			)}
		>
			{courses.map((course) => (
				<CourseCard
					key={course.id}
					course={course}
					isOwned={ownedCourseIds.has(course.id)}
					progress={progressMap.get(course.id)}
				/>
			))}
		</div>
	);
}

/**
 * Loading state with skeleton cards
 */
export function CourseGridLoading({
	count = 4,
	className,
}: CourseGridLoadingProps) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
				className,
			)}
		>
			{Array.from({ length: count }).map((_, index) => (
				<CourseCardSkeleton key={`skeleton-${index}`} />
			))}
		</div>
	);
}

/**
 * Empty state when no courses are available
 */
export function CourseGridEmpty({
	title = "Belum Ada Kursus",
	description = "Kursus baru akan segera tersedia. Pantau terus untuk update terbaru!",
	className,
}: CourseGridEmptyProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-16 text-center",
				className,
			)}
		>
			<div className="w-20 h-20 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
				<BookOpen className="w-10 h-10 text-brand-primary" />
			</div>
			<h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
			<p className="text-muted-foreground max-w-md">{description}</p>
		</div>
	);
}

/**
 * Error state with retry option
 */
export function CourseGridError({
	message = "Gagal memuat kursus. Silakan coba lagi.",
	onRetry,
	className,
}: CourseGridErrorProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-16 text-center",
				className,
			)}
		>
			<div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6">
				<BookOpen className="w-10 h-10 text-destructive" />
			</div>
			<h3 className="text-xl font-semibold text-foreground mb-2">
				Terjadi Kesalahan
			</h3>
			<p className="text-muted-foreground max-w-md mb-6">{message}</p>
			{onRetry && (
				<Button variant="outline" onClick={onRetry}>
					<RefreshCw className="w-4 h-4 mr-2" />
					Coba Lagi
				</Button>
			)}
		</div>
	);
}
