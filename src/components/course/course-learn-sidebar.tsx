import { useState, useEffect } from "react";
import {
	ChevronDown,
	ChevronUp,
	Play,
	CheckCircle2,
	Circle,
	PanelLeftClose,
	PanelLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Course, CourseSection, CourseProgress as CourseProgressData } from "@/lib/db/types";
import { isLessonCompleted as checkLessonCompleted } from "@/features/progress";

interface CurrentLesson {
	sectionId: string;
	lessonIndex: number;
}

interface CourseProgressDisplay {
	completedLessons: number;
	totalLessons: number;
	overallProgress: number;
}

interface CourseLearnSidebarProps {
	course: Course;
	currentLesson: CurrentLesson | undefined;
	progress: CourseProgressDisplay;
	/** Raw progress data for completion checking */
	progressData?: CourseProgressData | null;
	onLessonSelect: (sectionId: string, lessonIndex: number) => void;
	open?: boolean;
	onToggle?: () => void;
	className?: string;
}

/**
 * Calculate total section duration from lessons
 */
function getSectionDuration(section: CourseSection): string {
	let totalMinutes = 0;
	for (const lesson of section.lessons) {
		if (lesson.duration) {
			const match = lesson.duration.match(/(\d+)/);
			if (match) {
				totalMinutes += Number.parseInt(match[1], 10);
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
 * Course Learn Sidebar Component
 *
 * Displays course progress and curriculum navigation for the learn page.
 * Shows progress summary (hardcoded for Phase A) and expandable sections with lessons.
 */
export function CourseLearnSidebar({
	course,
	currentLesson,
	progress,
	progressData,
	onLessonSelect,
	open = true,
	onToggle,
	className,
}: CourseLearnSidebarProps) {
	const sections = course.content?.sections || [];

	// Track which section is expanded (default to current lesson's section)
	const [expandedSection, setExpandedSection] = useState<string>(
		currentLesson?.sectionId || sections[0]?.id || "",
	);

	// Update expanded section when current lesson changes
	useEffect(() => {
		if (currentLesson?.sectionId) {
			setExpandedSection(currentLesson.sectionId);
		}
	}, [currentLesson?.sectionId]);

	// Check if a lesson is completed (before current position)
	const isLessonCompleted = (sectionId: string, lessonIndex: number): boolean => {
		return checkLessonCompleted(course, progressData, sectionId, lessonIndex);
	};

	// Count completed lessons in a section
	const getSectionCompletedCount = (section: CourseSection): number => {
		return section.lessons.filter((_, idx) =>
			isLessonCompleted(section.id, idx),
		).length;
	};

	if (!open) {
		return (
			<div className={cn("flex flex-col items-center pt-4", className)}>
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggle}
					className="w-10 h-10"
					aria-label="Buka sidebar"
				>
					<PanelLeft className="w-5 h-5" />
				</Button>
			</div>
		);
	}

	return (
		<div className={cn("p-4 space-y-4", className)}>
			{/* Toggle button for desktop */}
			{onToggle && (
				<div className="flex justify-end">
					<Button
						variant="ghost"
						size="icon"
						onClick={onToggle}
						className="w-8 h-8"
						aria-label="Tutup sidebar"
					>
						<PanelLeftClose className="w-4 h-4" />
					</Button>
				</div>
			)}

			{/* Progress Overview Card */}
			<Card className="border-l-4 border-l-brand-primary">
				<CardContent className="p-4">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Progress Kursus
							</span>
							<span className="text-lg font-bold text-brand-primary">
								{progress.overallProgress}%
							</span>
						</div>
						<Progress value={progress.overallProgress} className="h-2" />
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span>
								{progress.completedLessons} dari {progress.totalLessons}{" "}
								pelajaran
							</span>
							<span>selesai</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Course Content */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">Konten Kursus</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 pt-0 max-h-[60vh] overflow-y-auto">
					{sections.map((section) => {
						const isExpanded = expandedSection === section.id;
						const sectionLessons = section.lessons.length;
						const completedInSection = getSectionCompletedCount(section);
						const duration = getSectionDuration(section);
						const isSectionComplete =
							completedInSection === sectionLessons && sectionLessons > 0;

						return (
							<div
								key={section.id}
								className="border border-border rounded-lg overflow-hidden"
							>
								{/* Section Header */}
								<button
									type="button"
									onClick={() =>
										setExpandedSection(isExpanded ? "" : section.id)
									}
									className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-center gap-3 flex-1 min-w-0">
										{/* Section completion indicator */}
										<div className="flex-shrink-0">
											{isSectionComplete ? (
												<CheckCircle2 className="w-5 h-5 text-green-600" />
											) : (
												<Circle className="w-5 h-5 text-muted-foreground" />
											)}
										</div>
										<span className="font-medium text-sm truncate">
											{section.title}
										</span>
									</div>
									<div className="flex items-center gap-2 flex-shrink-0">
										<span className="text-xs text-muted-foreground">
											{completedInSection}/{sectionLessons}
										</span>
										{duration && (
											<span className="text-xs text-muted-foreground hidden sm:inline">
												{duration}
											</span>
										)}
										{isExpanded ? (
											<ChevronUp className="w-4 h-4 text-muted-foreground" />
										) : (
											<ChevronDown className="w-4 h-4 text-muted-foreground" />
										)}
									</div>
								</button>

								{/* Section Lessons */}
								{isExpanded && section.lessons.length > 0 && (
									<div className="border-t border-border bg-muted/20">
										{section.lessons.map((lesson, lessonIndex) => {
											const isCompleted = isLessonCompleted(
												section.id,
												lessonIndex,
											);
											const isCurrent =
												currentLesson?.sectionId === section.id &&
												currentLesson?.lessonIndex === lessonIndex;

											return (
												<button
													key={`${section.id}-${lessonIndex}`}
													type="button"
													onClick={() =>
														onLessonSelect(section.id, lessonIndex)
													}
													className={cn(
														"w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 text-left",
														isCurrent &&
															"bg-brand-primary/10 border-l-2 border-l-brand-primary",
													)}
												>
													<div className="flex items-center gap-3 flex-1 min-w-0">
														{/* Lesson status icon */}
														{isCompleted ? (
															<CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
														) : isCurrent ? (
															<Play className="w-4 h-4 text-brand-primary fill-brand-primary flex-shrink-0" />
														) : (
															<Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
														)}
														<span
															className={cn(
																"text-sm truncate",
																isCurrent &&
																	"font-medium text-brand-primary",
															)}
														>
															{lesson.title}
														</span>
													</div>
													{lesson.duration && (
														<span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
															{lesson.duration}
														</span>
													)}
												</button>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
				</CardContent>
			</Card>

			{/* Instructor Card */}
			{course.instructor_name && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-lg">Narasumber</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
								{course.instructor_avatar ? (
									<img
										src={course.instructor_avatar}
										alt={course.instructor_name}
										className="w-full h-full rounded-full object-cover"
									/>
								) : (
									<span className="text-sm font-semibold text-brand-primary">
										{course.instructor_name.charAt(0)}
									</span>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-semibold text-sm">
									{course.instructor_name}
								</h4>
								{course.instructor_title && (
									<p className="text-xs text-muted-foreground">
										{course.instructor_title}
									</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
