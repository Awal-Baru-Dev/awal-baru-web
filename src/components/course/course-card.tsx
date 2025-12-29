import { Link } from "@tanstack/react-router";
import { Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/db/types";

interface CourseCardProps {
	course: Course;
	isOwned?: boolean;
	progress?: number; // 0-100
	className?: string;
}

/**
 * Format price to Indonesian Rupiah
 */
function formatPrice(price: number): string {
	if (price === 0) return "Gratis";
	if (price >= 1000000) {
		return `Rp ${(price / 1000000).toFixed(1)}jt`;
	}
	if (price >= 1000) {
		return `Rp ${Math.floor(price / 1000)}rb`;
	}
	return `Rp ${price.toLocaleString("id-ID")}`;
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
	return `${hours}j ${remainingMinutes}m`;
}

/**
 * Calculate discount percentage
 */
function getDiscountPercent(original: number, current: number): number {
	if (!original || original <= current) return 0;
	return Math.round(((original - current) / original) * 100);
}

export function CourseCard({
	course,
	isOwned = false,
	progress = 0,
	className,
}: CourseCardProps) {
	const discount = getDiscountPercent(
		course.original_price || 0,
		course.price,
	);
	// const rating = course.metadata?.stats?.rating || 0;

	return (
		<Link
			to="/courses/$slug"
			params={{ slug: course.slug }}
			className={cn(
				"group block rounded-xl border bg-card overflow-hidden transition-all duration-200",
				"hover:shadow-lg hover:scale-[1.02]",
				isOwned
					? "border-2 border-brand-primary/40 hover:border-brand-primary/60 shadow-brand-primary/10 shadow-md"
					: "border-border hover:border-brand-primary/30",
				className,
			)}
		>
			{/* Thumbnail */}
			<div className="relative aspect-[828/914] bg-muted overflow-hidden">
				{course.thumbnail_url ? (
					<img
						src={course.thumbnail_url}
						alt={course.title}
						className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center">
						<span className="text-4xl text-brand-primary/40">
							{course.title.charAt(0)}
						</span>
					</div>
				)}

				{/* Badges */}
				<div className="absolute top-3 left-3 flex gap-2">
					{course.category && (
						<Badge
							variant="secondary"
							className="bg-background/90 backdrop-blur-sm text-xs"
						>
							{course.category}
						</Badge>
					)}
					{discount > 0 && !isOwned && (
						<Badge className="bg-destructive text-destructive-foreground text-xs">
							-{discount}%
						</Badge>
					)}
				</div>

				{/* Owned badge */}
				{isOwned && (
					<Badge className="absolute top-3 right-3 bg-brand-primary text-white border-0 shadow-lg">
						<CheckCircle2 className="w-3 h-3 mr-1" />
						DIMILIKI
					</Badge>
				)}

				{/* Progress bar for owned courses */}
				{isOwned && progress > 0 && (
					<div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
						<div
							className="h-full bg-brand-primary transition-all"
							style={{ width: `${progress}%` }}
						/>
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-4 space-y-3">
				{/* Title */}
				<h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.75rem] group-hover:text-brand-primary transition-colors">
					{course.title}
				</h3>

				{/* Short description */}
				{course.short_description && (
					<p className="text-sm text-muted-foreground line-clamp-2">
						{course.short_description}
					</p>
				)}

				{/* Instructor */}
				{course.instructor_name && (
					<p className="text-sm text-muted-foreground">
						Oleh{" "}
						<span className="text-foreground font-medium">
							{course.instructor_name}
						</span>
					</p>
				)}

				{/* Stats row - only duration shown for MVP */}
				<div className="flex items-center gap-3 text-sm text-muted-foreground">
					<div className="flex items-center gap-1">
						<Clock className="w-4 h-4" />
						<span>{formatDuration(course.duration_minutes)}</span>
					</div>
					{/* Rating and lesson count hidden for MVP */}
					{/* {rating > 0 && (
						<div className="flex items-center gap-1">
							<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
							<span>{rating.toFixed(1)}</span>
						</div>
					)}
					{course.lessons_count > 0 && (
						<span>{course.lessons_count} pelajaran</span>
					)} */}
				</div>

				{/* Price / CTA */}
				<div className="pt-2 border-t border-border">
					{isOwned ? (
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								{progress > 0 ? `${progress}% selesai` : "Belum dimulai"}
							</span>
							<span className="text-sm font-medium text-brand-primary group-hover:underline">
								Lanjutkan Belajar
							</span>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<span className="font-bold text-lg text-foreground">
								{formatPrice(course.price)}
							</span>
							{discount > 0 && course.original_price && (
								<span className="text-sm text-muted-foreground line-through">
									{formatPrice(course.original_price)}
								</span>
							)}
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}

/**
 * Skeleton loading state for CourseCard
 */
export function CourseCardSkeleton() {
	return (
		<div className="rounded-xl border border-border bg-card overflow-hidden">
			{/* Thumbnail skeleton */}
			<Skeleton className="aspect-[828/914] w-full" />

			{/* Content skeleton */}
			<div className="p-4 space-y-3">
				{/* Title */}
				<div className="space-y-2">
					<Skeleton className="h-5 w-full" />
					<Skeleton className="h-5 w-3/4" />
				</div>

				{/* Description */}
				<div className="space-y-1.5">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
				</div>

				{/* Instructor */}
				<Skeleton className="h-4 w-1/2" />

				{/* Stats */}
				<div className="flex gap-3">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-12" />
				</div>

				{/* Price */}
				<div className="pt-2 border-t border-border">
					<Skeleton className="h-6 w-24" />
				</div>
			</div>
		</div>
	);
}
