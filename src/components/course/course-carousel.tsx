import { useState, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/db/types";

interface CourseCarouselProps {
	courses: Course[];
	title: string;
	itemsPerPage?: number;
	className?: string;
}

/**
 * Format duration from minutes to human readable
 */
function formatCourseDuration(minutes: number): string {
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

/**
 * Course Carousel Component
 *
 * Displays courses in a paginated carousel with infinite loop navigation.
 * Shows 3 courses per page on desktop, 2 on tablet, 1 on mobile.
 */
export function CourseCarousel({
	courses,
	title,
	itemsPerPage = 3,
	className,
}: CourseCarouselProps) {
	const [currentPage, setCurrentPage] = useState(0);

	// Calculate total pages
	const totalPages = Math.ceil(courses.length / itemsPerPage);

	// Get current page courses
	const currentCourses = useMemo(() => {
		const startIndex = currentPage * itemsPerPage;
		return courses.slice(startIndex, startIndex + itemsPerPage);
	}, [courses, currentPage, itemsPerPage]);

	// Navigate to previous page (infinite loop)
	const goToPrevious = useCallback(() => {
		setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
	}, [totalPages]);

	// Navigate to next page (infinite loop)
	const goToNext = useCallback(() => {
		setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
	}, [totalPages]);

	// Don't show navigation if all courses fit on one page
	const showNavigation = courses.length > itemsPerPage;

	if (courses.length === 0) {
		return null;
	}

	return (
		<section className={className}>
			{/* Header with title and navigation */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold text-foreground">{title}</h2>
				{showNavigation && (
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={goToPrevious}
							className="w-8 h-8 rounded-full"
							aria-label="Halaman sebelumnya"
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<span className="text-sm text-muted-foreground min-w-[3rem] text-center">
							{currentPage + 1}/{totalPages}
						</span>
						<Button
							variant="outline"
							size="icon"
							onClick={goToNext}
							className="w-8 h-8 rounded-full"
							aria-label="Halaman berikutnya"
						>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				)}
			</div>

			{/* Course cards grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{currentCourses.map((course) => (
					<CarouselCourseCard key={course.id} course={course} />
				))}
			</div>
		</section>
	);
}

/**
 * Course card for carousel
 */
function CarouselCourseCard({ course }: { course: Course }) {
	return (
		<Link
			to="/courses/$slug"
			params={{ slug: course.slug }}
			className="block bg-card border border-border rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-lg transition-all group"
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
						<Play
							className="w-5 h-5 text-brand-primary ml-0.5"
							fill="currentColor"
						/>
					</div>
				</div>
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
				</div>
			</div>
		</Link>
	);
}
