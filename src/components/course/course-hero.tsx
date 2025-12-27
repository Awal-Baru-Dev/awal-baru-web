import { Play, Clock, BookOpen, Star, Users, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WistiaPlayer } from "./wistia-player";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/db/types";

interface CourseHeroProps {
	course: Course;
	isEnrolled?: boolean;
	onPreviewClick?: () => void;
	className?: string;
}

/**
 * Get first video ID from course content
 */
function getFirstVideoId(course: Course): string | null {
	const sections = course.content?.sections || [];
	for (const section of sections) {
		for (const lesson of section.lessons || []) {
			if (lesson.videoId) {
				return lesson.videoId;
			}
		}
	}
	return null;
}

/**
 * Format duration from minutes to human readable
 */
function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} menit`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (remainingMinutes === 0) {
		return `${hours} jam`;
	}
	return `${hours} jam ${remainingMinutes} menit`;
}

/**
 * Course Hero Component
 *
 * Displays the main course information including:
 * - Video preview/thumbnail
 * - Title and description
 * - Instructor info
 * - Stats (duration, lessons, rating)
 * - Tags
 */
export function CourseHero({
	course,
	isEnrolled = false,
	onPreviewClick,
	className,
}: CourseHeroProps) {
	const rating = course.metadata?.stats?.rating || 0;
	const students = course.metadata?.stats?.students || 0;
	const tags = course.metadata?.tags || [];

	// Get first video ID from course content for enrolled users
	const firstVideoId = getFirstVideoId(course);

	return (
		<div className={cn("space-y-6", className)}>
			{/* Video Player for enrolled users / Thumbnail for non-enrolled */}
			<div className="relative aspect-video rounded-xl overflow-hidden bg-muted group">
				{isEnrolled && firstVideoId ? (
					<>
						<WistiaPlayer mediaId={firstVideoId} className="w-full h-full" />
						{/* Enrolled badge */}
						<Badge className="absolute top-4 left-4 bg-green-600 text-white">
							<CheckCircle className="w-3 h-3 mr-1" />
							Sudah Terdaftar
						</Badge>
					</>
				) : course.thumbnail_url ? (
					<img
						src={course.thumbnail_url}
						alt={course.title}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center">
						<span className="text-6xl text-brand-primary/40">
							{course.title.charAt(0)}
						</span>
					</div>
				)}

				{/* Play button overlay - only for non-enrolled with preview */}
				{!isEnrolled && (course.preview_video_url || onPreviewClick) && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
						<Button
							size="lg"
							className="rounded-full w-16 h-16"
							onClick={onPreviewClick}
						>
							<Play className="w-8 h-8 fill-current" />
						</Button>
					</div>
				)}

				{/* Preview badge - only for non-enrolled */}
				{!isEnrolled && course.preview_video_url && (
					<Badge className="absolute bottom-4 left-4 bg-brand-primary/90 text-white">
						<Play className="w-3 h-3 mr-1" />
						Preview Gratis
					</Badge>
				)}
			</div>

			{/* Title */}
			<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
				{course.title}
			</h1>

			{/* Tags */}
			{tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{tags.map((tag, index) => (
						<Badge key={`tag-${index}`} variant="secondary">
							{tag}
						</Badge>
					))}
					{course.level && (
						<Badge variant="outline" className="capitalize">
							{course.level}
						</Badge>
					)}
				</div>
			)}

			{/* Description */}
			{course.short_description && (
				<p className="text-lg text-muted-foreground leading-relaxed">
					{course.short_description}
				</p>
			)}

			{/* Stats */}
			<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-1.5">
					<Clock className="w-4 h-4" />
					<span>{formatDuration(course.duration_minutes)}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<BookOpen className="w-4 h-4" />
					<span>{course.lessons_count} pelajaran</span>
				</div>
				{rating > 0 && (
					<div className="flex items-center gap-1.5">
						<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
						<span>{rating.toFixed(1)}</span>
					</div>
				)}
				{students > 0 && (
					<div className="flex items-center gap-1.5">
						<Users className="w-4 h-4" />
						<span>{students.toLocaleString("id-ID")} siswa</span>
					</div>
				)}
			</div>

			{/* Instructor Card */}
			{course.instructor_name && (
				<div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
					<div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden">
						{course.instructor_avatar ? (
							<img
								src={course.instructor_avatar}
								alt={course.instructor_name}
								className="w-full h-full object-cover"
							/>
						) : (
							<span className="text-lg font-semibold text-brand-primary">
								{course.instructor_name.charAt(0)}
							</span>
						)}
					</div>
					<div>
						<p className="font-medium text-foreground">
							{course.instructor_name}
						</p>
						{course.instructor_title && (
							<p className="text-sm text-muted-foreground">
								{course.instructor_title}
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * Skeleton loading state for CourseHero
 */
export function CourseHeroSkeleton() {
	return (
		<div className="space-y-6">
			{/* Video skeleton */}
			<Skeleton className="aspect-video w-full rounded-xl" />

			{/* Title skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-3/4" />
			</div>

			{/* Tags skeleton */}
			<div className="flex gap-2">
				<Skeleton className="h-6 w-16 rounded-full" />
				<Skeleton className="h-6 w-20 rounded-full" />
				<Skeleton className="h-6 w-14 rounded-full" />
			</div>

			{/* Description skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-5 w-full" />
				<Skeleton className="h-5 w-full" />
				<Skeleton className="h-5 w-2/3" />
			</div>

			{/* Stats skeleton */}
			<div className="flex gap-4">
				<Skeleton className="h-5 w-24" />
				<Skeleton className="h-5 w-28" />
				<Skeleton className="h-5 w-16" />
			</div>

			{/* Instructor skeleton */}
			<div className="flex items-center gap-4 p-4 rounded-xl border border-border">
				<Skeleton className="w-12 h-12 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
		</div>
	);
}
