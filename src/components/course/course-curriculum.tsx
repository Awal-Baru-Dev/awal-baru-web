import { Play, Lock, CheckCircle2, Clock } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Course, CourseSection } from "@/lib/db/types";

interface CourseCurriculumProps {
	course: Course;
	isEnrolled?: boolean;
	completedLessons?: Set<string>; // Set of "sectionId-lessonIndex"
	currentLesson?: { sectionId: string; lessonIndex: number };
	onLessonClick?: (sectionId: string, lessonIndex: number) => void;
	className?: string;
}

/**
 * Format lesson duration to display
 */
function formatLessonDuration(duration?: string): string {
	if (!duration) return "";
	return duration;
}

/**
 * Calculate section progress
 */
function getSectionProgress(
	section: CourseSection,
	completedLessons: Set<string>,
): { completed: number; total: number } {
	const total = section.lessons.length;
	const completed = section.lessons.filter((_, index) =>
		completedLessons.has(`${section.id}-${index}`),
	).length;
	return { completed, total };
}

/**
 * Calculate total section duration
 */
function getSectionDuration(section: CourseSection): string {
	// Sum up all lesson durations (assuming format like "8m" or "12m")
	let totalMinutes = 0;
	for (const lesson of section.lessons) {
		if (lesson.duration) {
			const match = lesson.duration.match(/(\d+)/);
			if (match) {
				totalMinutes += parseInt(match[1], 10);
			}
		}
	}
	if (totalMinutes === 0) return "";
	if (totalMinutes < 60) return `${totalMinutes}m`;
	const hours = Math.floor(totalMinutes / 60);
	const mins = totalMinutes % 60;
	return mins > 0 ? `${hours}j ${mins}m` : `${hours}j`;
}

/**
 * Course Curriculum Component
 *
 * Displays course sections and lessons in an accordion layout.
 * Shows different states for enrolled vs non-enrolled users.
 */
export function CourseCurriculum({
	course,
	isEnrolled = false,
	completedLessons = new Set(),
	currentLesson,
	onLessonClick,
	className,
}: CourseCurriculumProps) {
	const sections = course.content?.sections || [];

	if (sections.length === 0) {
		return (
			<div className={cn("text-center py-8 text-muted-foreground", className)}>
				Kurikulum belum tersedia.
			</div>
		);
	}

	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-foreground">Kurikulum</h2>
				<span className="text-sm text-muted-foreground">
					{sections.length} bagian • {course.lessons_count} pelajaran
				</span>
			</div>

			<Accordion
				type="multiple"
				defaultValue={sections.map((s) => s.id)}
				className="space-y-3"
			>
				{sections.map((section, sectionIndex) => {
					const progress = getSectionProgress(section, completedLessons);
					const duration = getSectionDuration(section);
					const isCompleted = progress.completed === progress.total;

					return (
						<AccordionItem
							key={section.id}
							value={section.id}
							className="border border-border rounded-lg overflow-hidden bg-card"
						>
							<AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
								<div className="flex items-center gap-3 flex-1 text-left">
									{/* Progress indicator */}
									<div
										className={cn(
											"w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
											isCompleted
												? "bg-green-500 text-white"
												: progress.completed > 0
													? "bg-brand-primary/20 text-brand-primary"
													: "bg-muted text-muted-foreground",
										)}
									>
										{isCompleted ? (
											<CheckCircle2 className="w-4 h-4" />
										) : (
											String(sectionIndex + 1).padStart(2, "0")
										)}
									</div>

									{/* Section title */}
									<div className="flex-1 min-w-0">
										<h3 className="font-medium text-foreground truncate">
											{section.title}
										</h3>
									</div>

									{/* Section stats */}
									<div className="flex items-center gap-3 text-sm text-muted-foreground">
										{isEnrolled && (
											<span>
												{progress.completed}/{progress.total}
											</span>
										)}
										{duration && (
											<span className="flex items-center gap-1">
												<Clock className="w-3.5 h-3.5" />
												{duration}
											</span>
										)}
									</div>
								</div>
							</AccordionTrigger>

							<AccordionContent className="pb-0">
								<div className="border-t border-border">
									{section.lessons.map((lesson, lessonIndex) => {
										const lessonKey = `${section.id}-${lessonIndex}`;
										const isComplete = completedLessons.has(lessonKey);
										const isCurrent =
											currentLesson?.sectionId === section.id &&
											currentLesson?.lessonIndex === lessonIndex;
										const canAccess = isEnrolled || lesson.isFree;

										return (
											<button
												key={lessonKey}
												type="button"
												onClick={() =>
													canAccess &&
													onLessonClick?.(section.id, lessonIndex)
												}
												disabled={!canAccess && !lesson.isFree}
												className={cn(
													"w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
													"hover:bg-muted/50",
													isCurrent &&
														"bg-brand-primary/10 border-l-2 border-l-brand-primary",
													!canAccess && "opacity-60 cursor-not-allowed",
												)}
											>
												{/* Lesson status icon */}
												<div
													className={cn(
														"w-5 h-5 flex items-center justify-center",
														isComplete && "text-green-500",
														isCurrent && "text-brand-primary",
														!canAccess && "text-muted-foreground",
													)}
												>
													{isComplete ? (
														<CheckCircle2 className="w-5 h-5" />
													) : isCurrent ? (
														<Play className="w-5 h-5 fill-current" />
													) : canAccess ? (
														<Play className="w-4 h-4" />
													) : (
														<Lock className="w-4 h-4" />
													)}
												</div>

												{/* Lesson title */}
												<span
													className={cn(
														"flex-1 text-sm",
														isCurrent
															? "font-medium text-brand-primary"
															: "text-foreground",
													)}
												>
													{lesson.title}
												</span>

												{/* Free badge */}
												{lesson.isFree && !isEnrolled && (
													<Badge
														variant="secondary"
														className="bg-brand-primary/10 text-brand-primary text-xs"
													>
														FREE
													</Badge>
												)}

												{/* Duration */}
												{lesson.duration && (
													<span className="text-xs text-muted-foreground">
														{formatLessonDuration(lesson.duration)}
													</span>
												)}
											</button>
										);
									})}
								</div>
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>
		</div>
	);
}

/**
 * Skeleton loading state for CourseCurriculum
 */
export function CourseCurriculumSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-6 w-24" />
				<Skeleton className="h-4 w-32" />
			</div>

			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="border border-border rounded-lg p-4">
						<div className="flex items-center gap-3">
							<Skeleton className="w-6 h-6 rounded-full" />
							<Skeleton className="h-5 flex-1" />
							<Skeleton className="h-4 w-16" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
