import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
	ArrowLeft,
	Menu,
	X,
	AlertCircle,
	ChevronRight,
	Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	WistiaPlayer,
	CourseLearnSidebar,
	VideoLessonNav,
	type LessonNavInfo,
	type WistiaPlayerHandle,
	type WistiaProgressData,
} from "@/components/course";
import { useCourse } from "@/features/courses";
import { useEnrollmentStatus } from "@/features/enrollments";
import {
	useCourseProgress,
	useUpdateProgress,
	getProgressDisplayData,
	calculateLessonPosition,
} from "@/features/progress";
import { APP_NAME } from "@/lib/config/constants";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/db/types";

// Search params schema for lesson navigation
const learnSearchSchema = z.object({
	section: z.string().optional(),
	lesson: z.coerce.number().optional(),
});

export const Route = createFileRoute("/_authed/courses/$slug/learn")({
	component: CourseLearnPage,
	validateSearch: learnSearchSchema,
});

interface CurrentLesson {
	sectionId: string;
	lessonIndex: number;
	title: string;
	videoId: string;
	startTime: number;
}

/**
 * Get lesson info from course content
 */
function getLessonFromCourse(
	course: Course,
	sectionId: string,
	lessonIndex: number,
): CurrentLesson | null {
	const sections = course.content?.sections || [];
	const section = sections.find((s) => s.id === sectionId);

	if (!section || !section.lessons[lessonIndex]) {
		return null;
	}

	const lesson = section.lessons[lessonIndex];
	return {
		sectionId,
		lessonIndex,
		title: lesson.title,
		videoId: lesson.videoId || "",
		startTime: lesson.startTime || 0,
	};
}

/**
 * Get first available lesson from course
 */
function getFirstLesson(course: Course): CurrentLesson | null {
	const sections = course.content?.sections || [];

	for (const section of sections) {
		if (section.lessons.length > 0) {
			const lesson = section.lessons[0];
			return {
				sectionId: section.id,
				lessonIndex: 0,
				title: lesson.title,
				videoId: lesson.videoId || "",
				startTime: lesson.startTime || 0,
			};
		}
	}

	return null;
}

/**
 * Get lesson at a specific time (for manual seek detection)
 */
function getLessonAtTime(course: Course, timeInSeconds: number): CurrentLesson | null {
	const sections = course.content?.sections || [];

	for (const section of sections) {
		for (let i = 0; i < section.lessons.length; i++) {
			const lesson = section.lessons[i];
			const startTime = lesson.startTime || 0;

			// Find the next lesson's startTime to determine endTime
			let endTime = Number.POSITIVE_INFINITY;

			// Check next lesson in same section
			if (i + 1 < section.lessons.length) {
				endTime = section.lessons[i + 1].startTime || endTime;
			} else {
				// Check first lesson of next section
				const sectionIdx = sections.indexOf(section);
				if (sectionIdx + 1 < sections.length) {
					const nextSection = sections[sectionIdx + 1];
					if (nextSection.lessons.length > 0) {
						endTime = nextSection.lessons[0].startTime || endTime;
					}
				}
			}

			if (timeInSeconds >= startTime && timeInSeconds < endTime) {
				return {
					sectionId: section.id,
					lessonIndex: i,
					title: lesson.title,
					videoId: lesson.videoId || "",
					startTime: lesson.startTime || 0,
				};
			}
		}
	}

	return null;
}

/**
 * Get end time for a lesson (next lesson's startTime or Infinity)
 */
function getLessonEndTime(course: Course, sectionId: string, lessonIndex: number): number {
	const sections = course.content?.sections || [];
	const sectionIdx = sections.findIndex((s) => s.id === sectionId);

	if (sectionIdx < 0) return Number.POSITIVE_INFINITY;

	const section = sections[sectionIdx];

	// Check next lesson in same section
	if (lessonIndex + 1 < section.lessons.length) {
		return section.lessons[lessonIndex + 1].startTime || Number.POSITIVE_INFINITY;
	}

	// Check first lesson of next section
	if (sectionIdx + 1 < sections.length) {
		const nextSection = sections[sectionIdx + 1];
		if (nextSection.lessons.length > 0) {
			return nextSection.lessons[0].startTime || Number.POSITIVE_INFINITY;
		}
	}

	return Number.POSITIVE_INFINITY;
}

/**
 * Get previous lesson info
 */
function getPreviousLesson(
	course: Course,
	currentSectionId: string,
	currentLessonIndex: number,
): LessonNavInfo | null {
	const sections = course.content?.sections || [];
	const currentSectionIdx = sections.findIndex((s) => s.id === currentSectionId);

	if (currentSectionIdx < 0) return null;

	// Try previous lesson in same section
	if (currentLessonIndex > 0) {
		const section = sections[currentSectionIdx];
		return {
			sectionId: currentSectionId,
			lessonIndex: currentLessonIndex - 1,
			title: section.lessons[currentLessonIndex - 1].title,
		};
	}

	// Try last lesson of previous section
	if (currentSectionIdx > 0) {
		const prevSection = sections[currentSectionIdx - 1];
		const lastLessonIndex = prevSection.lessons.length - 1;
		if (lastLessonIndex >= 0) {
			return {
				sectionId: prevSection.id,
				lessonIndex: lastLessonIndex,
				title: prevSection.lessons[lastLessonIndex].title,
			};
		}
	}

	return null;
}

/**
 * Get next lesson info
 */
function getNextLesson(
	course: Course,
	currentSectionId: string,
	currentLessonIndex: number,
): LessonNavInfo | null {
	const sections = course.content?.sections || [];
	const currentSectionIdx = sections.findIndex((s) => s.id === currentSectionId);

	if (currentSectionIdx < 0) return null;

	const currentSection = sections[currentSectionIdx];

	// Try next lesson in same section
	if (currentLessonIndex < currentSection.lessons.length - 1) {
		return {
			sectionId: currentSectionId,
			lessonIndex: currentLessonIndex + 1,
			title: currentSection.lessons[currentLessonIndex + 1].title,
		};
	}

	// Try first lesson of next section
	if (currentSectionIdx < sections.length - 1) {
		const nextSection = sections[currentSectionIdx + 1];
		if (nextSection.lessons.length > 0) {
			return {
				sectionId: nextSection.id,
				lessonIndex: 0,
				title: nextSection.lessons[0].title,
			};
		}
	}

	return null;
}

/**
 * Course Learn Page (Video Player)
 *
 * Full-screen video learning experience with:
 * - Video player (Wistia)
 * - Sidebar with progress and curriculum navigation
 * - Previous/Next navigation
 *
 * This route is protected by the _authed layout.
 */
function CourseLearnPage() {
	const { slug } = Route.useParams();
	const { section: sectionParam, lesson: lessonParam } = Route.useSearch();
	const navigate = useNavigate();

	// Refs
	const playerRef = useRef<WistiaPlayerHandle>(null);

	// State
	const [currentLesson, setCurrentLesson] = useState<CurrentLesson | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

	// Overlay state: 'manual' for sidebar clicks, 'auto-next' for video end
	const [overlayType, setOverlayType] = useState<'manual' | 'auto-next' | null>(null);
	const [pendingLesson, setPendingLesson] = useState<CurrentLesson | null>(null);

	// Fetch course data
	const {
		data: course,
		isLoading: isCourseLoading,
		error: courseError,
	} = useCourse(slug);

	// Check enrollment status
	const { data: enrollment, isLoading: isEnrollmentLoading } =
		useEnrollmentStatus(course?.id ?? "");

	// Fetch and manage progress
	const { data: progressData, isLoading: isProgressLoading } =
		useCourseProgress(course?.id ?? "");
	const updateProgress = useUpdateProgress();

	const isLoading = isCourseLoading || isEnrollmentLoading || isProgressLoading;
	const isEnrolled = !!enrollment;

	// Initialize current lesson from URL params, saved progress, or first lesson
	useEffect(() => {
		if (!course) return;

		let lesson: CurrentLesson | null = null;

		// Priority 1: Try to get lesson from URL params
		if (sectionParam && lessonParam !== undefined) {
			lesson = getLessonFromCourse(course, sectionParam, lessonParam);
		}

		// Priority 2: Resume from saved progress
		if (!lesson && progressData) {
			lesson = getLessonFromCourse(
				course,
				progressData.current_section_id,
				progressData.current_lesson_index,
			);
		}

		// Priority 3: Fall back to first lesson
		if (!lesson) {
			lesson = getFirstLesson(course);
		}

		if (lesson) {
			setCurrentLesson(lesson);
		}
	}, [course, sectionParam, lessonParam, progressData]);

	// Handle lesson selection - show confirmation overlay before playing
	const handleLessonSelect = useCallback(
		(sectionId: string, lessonIndex: number) => {
			if (!course) return;

			const lesson = getLessonFromCourse(course, sectionId, lessonIndex);
			if (!lesson) return;

			setCurrentLesson(lesson);
			setMobileSidebarOpen(false); // Close mobile sidebar

			// Seek to lesson's start time and pause
			if (playerRef.current) {
				playerRef.current.seekTo(lesson.startTime);
				playerRef.current.pause();
			}

			// Show manual confirmation overlay
			setPendingLesson(lesson);
			setOverlayType('manual');

			// Update URL without navigation
			navigate({
				to: "/courses/$slug/learn",
				params: { slug },
				search: { section: sectionId, lesson: lessonIndex },
				replace: true,
			});

			// Calculate new lesson position
			const newPosition = calculateLessonPosition(course, sectionId, lessonIndex);

			// Calculate saved position (0 if no progress saved yet)
			const savedPosition = progressData
				? calculateLessonPosition(
						course,
						progressData.current_section_id,
						progressData.current_lesson_index,
					)
				: 0;

			// Only save progress if the new position is greater than saved position
			// (progress can only increase, never decrease)
			if (newPosition > savedPosition) {
				updateProgress.mutate({
					courseId: course.id,
					course,
					sectionId,
					lessonIndex,
				});

				// Show completion toast when reaching the last lesson for the first time
				const totalLessons = course.lessons_count || 0;
				if (newPosition === totalLessons && !hasShownCompletionToast.current) {
					hasShownCompletionToast.current = true;
					toast.success("Selamat! Kamu telah menyelesaikan kursus ini.", {
						duration: 5000,
					});
				}
			}
		},
		[course, slug, navigate, updateProgress, progressData],
	);

	// Handle navigation
	const handleNavigate = useCallback(
		(sectionId: string, lessonIndex: number) => {
			handleLessonSelect(sectionId, lessonIndex);
		},
		[handleLessonSelect],
	);

	// Track if we've shown the course completion toast
	const hasShownCompletionToast = useRef(false);

	// Confirm overlay action - start playing current or next lesson
	const confirmOverlay = useCallback(() => {
		if (!course) return;

		if (overlayType === 'manual' && pendingLesson) {
			// Manual selection: just play the video at current position
			setOverlayType(null);
			setPendingLesson(null);
			playerRef.current?.play();
		} else if (overlayType === 'auto-next' && pendingLesson) {
			// Auto-next: seek to next lesson, update state, and play
			setCurrentLesson(pendingLesson);
			setOverlayType(null);
			setPendingLesson(null);

			// Seek and play
			if (playerRef.current) {
				playerRef.current.seekTo(pendingLesson.startTime);
				playerRef.current.play();
			}

			// Update URL
			navigate({
				to: "/courses/$slug/learn",
				params: { slug },
				search: {
					section: pendingLesson.sectionId,
					lesson: pendingLesson.lessonIndex,
				},
				replace: true,
			});

			// Update progress if advancing
			const newPosition = calculateLessonPosition(course, pendingLesson.sectionId, pendingLesson.lessonIndex);
			const savedPosition = progressData
				? calculateLessonPosition(
						course,
						progressData.current_section_id,
						progressData.current_lesson_index,
					)
				: 0;

			if (newPosition > savedPosition) {
				updateProgress.mutate({
					courseId: course.id,
					course,
					sectionId: pendingLesson.sectionId,
					lessonIndex: pendingLesson.lessonIndex,
				});

				// Show completion toast when reaching the last lesson
				const totalLessons = course.lessons_count || 0;
				if (newPosition === totalLessons && !hasShownCompletionToast.current) {
					hasShownCompletionToast.current = true;
					toast.success("Selamat! Kamu telah menyelesaikan kursus ini.", {
						duration: 5000,
					});
				}
			}
		}
	}, [course, overlayType, pendingLesson, slug, navigate, progressData, updateProgress]);

	// Handle video progress - detect lesson boundaries and manual seeks
	const handleProgress = useCallback(
		(data: WistiaProgressData) => {
			if (!course || !currentLesson) return;

			// Get the end time for current lesson
			const endTime = getLessonEndTime(course, currentLesson.sectionId, currentLesson.lessonIndex);

			// Check if there's a next lesson
			const next = getNextLesson(course, currentLesson.sectionId, currentLesson.lessonIndex);

			// Check if we've reached the lesson's end time (with 1 second buffer)
			if (endTime !== Number.POSITIVE_INFINITY && data.currentTime >= endTime - 1 && !overlayType) {
				if (next) {
					// There's a next lesson - pause and show the auto-next prompt
					playerRef.current?.pause();
					const nextLesson = getLessonFromCourse(course, next.sectionId, next.lessonIndex);
					if (nextLesson) {
						setPendingLesson(nextLesson);
						setOverlayType('auto-next');
					}
				} else {
					// This is the last lesson - show a toast instead (only once)
					if (!hasShownCompletionToast.current) {
						hasShownCompletionToast.current = true;
						toast.success("Selamat! Kamu telah menyelesaikan kursus ini.", {
							duration: 5000,
						});
					}
					// Don't pause or show overlay - let the video continue/end naturally
				}
				return;
			}

			// Detect if user manually seeked past lesson boundary
			const lessonAtCurrentTime = getLessonAtTime(course, data.currentTime);
			if (
				lessonAtCurrentTime &&
				(lessonAtCurrentTime.sectionId !== currentLesson.sectionId ||
					lessonAtCurrentTime.lessonIndex !== currentLesson.lessonIndex)
			) {
				// Update current lesson to match where user seeked
				setCurrentLesson(lessonAtCurrentTime);
				setOverlayType(null);
				setPendingLesson(null);

				// Update URL silently
				navigate({
					to: "/courses/$slug/learn",
					params: { slug },
					search: {
						section: lessonAtCurrentTime.sectionId,
						lesson: lessonAtCurrentTime.lessonIndex,
					},
					replace: true,
				});
			}
		},
		[course, currentLesson, overlayType, slug, navigate],
	);

	// Calculate progress display data
	const progress = course
		? getProgressDisplayData(course, progressData)
		: { completedLessons: 0, totalLessons: 0, overallProgress: 0 };

	// Get previous/next lessons
	const previousLesson = currentLesson
		? getPreviousLesson(course!, currentLesson.sectionId, currentLesson.lessonIndex)
		: null;
	const nextLesson = currentLesson
		? getNextLesson(course!, currentLesson.sectionId, currentLesson.lessonIndex)
		: null;

	// Not enrolled - redirect to course detail page
	if (!isLoading && course && !isEnrolled) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center max-w-md mx-auto px-6">
					<div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<AlertCircle className="w-8 h-8 text-destructive" />
					</div>
					<h1 className="text-xl font-bold text-foreground mb-3">
						Akses Ditolak
					</h1>
					<p className="text-muted-foreground mb-6">
						Kamu belum terdaftar di kursus ini. Silakan beli kursus terlebih
						dahulu untuk mengakses materi pembelajaran.
					</p>
					<div className="flex flex-col gap-3">
						<Button asChild>
							<Link to="/courses/$slug" params={{ slug }}>
								Lihat Detail Kursus
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link to="/dashboard/kursus">Kursus Saya</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (courseError) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center max-w-md mx-auto px-6">
					<div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<AlertCircle className="w-8 h-8 text-destructive" />
					</div>
					<h1 className="text-xl font-bold text-foreground mb-3">
						Kursus Tidak Ditemukan
					</h1>
					<p className="text-muted-foreground mb-6">
						Kursus yang kamu cari tidak tersedia atau telah dihapus.
					</p>
					<Button asChild>
						<Link to="/courses">Lihat Semua Kursus</Link>
					</Button>
				</div>
			</div>
		);
	}

	// Loading state
	if (isLoading || !course || !currentLesson) {
		return (
			<div className="min-h-screen bg-background">
				{/* Header skeleton */}
				<header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
					<div className="flex items-center justify-between h-14 px-4">
						<Skeleton className="h-8 w-32" />
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-8" />
					</div>
				</header>

				<div className="pt-14 flex">
					{/* Main content skeleton */}
					<div className="flex-1 p-4 lg:p-6">
						<Skeleton className="aspect-video w-full rounded-xl mb-4" />
						<Skeleton className="h-6 w-48 mb-2" />
						<Skeleton className="h-8 w-64" />
					</div>

					{/* Sidebar skeleton */}
					<div className="hidden lg:block w-80 border-l border-border p-4">
						<Skeleton className="h-24 w-full rounded-lg mb-4" />
						<Skeleton className="h-64 w-full rounded-lg" />
					</div>
				</div>
			</div>
		);
	}

	// Get section title for current lesson
	const currentSection = course.content?.sections?.find(
		(s) => s.id === currentLesson.sectionId,
	);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
				<div className="flex items-center justify-between h-14 px-4">
					{/* Back button */}
					<Button variant="ghost" size="sm" asChild>
						<Link to="/courses/$slug" params={{ slug }}>
							<ArrowLeft className="w-4 h-4 mr-2" />
							<span className="hidden sm:inline">Kembali</span>
						</Link>
					</Button>

					{/* Course title */}
					<div className="flex-1 text-center px-4">
						<h1 className="text-sm font-medium text-foreground truncate">
							{course.title}
						</h1>
					</div>

					{/* Mobile sidebar toggle */}
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden"
						onClick={() => setMobileSidebarOpen(true)}
					>
						<Menu className="w-5 h-5" />
					</Button>

					{/* Logo - desktop */}
					<Link
						to="/"
						className="hidden lg:flex items-center gap-2"
					>
						<img
							src="/awalbaru-logo.jpeg"
							alt={APP_NAME}
							className="h-8 w-8 rounded-lg"
						/>
					</Link>
				</div>
			</header>

			{/* Mobile sidebar overlay */}
			{mobileSidebarOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black/50 z-50"
					onClick={() => setMobileSidebarOpen(false)}
				/>
			)}

			{/* Mobile sidebar */}
			<aside
				className={cn(
					"lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background z-50 transform transition-transform duration-300 overflow-y-auto",
					mobileSidebarOpen ? "translate-x-0" : "translate-x-full",
				)}
			>
				<div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
					<span className="font-semibold">Konten Kursus</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setMobileSidebarOpen(false)}
					>
						<X className="w-5 h-5" />
					</Button>
				</div>
				<div className="p-4">
					<CourseLearnSidebar
						course={course}
						currentLesson={{
							sectionId: currentLesson.sectionId,
							lessonIndex: currentLesson.lessonIndex,
						}}
						progress={progress}
						progressData={progressData}
						onLessonSelect={handleLessonSelect}
					/>
				</div>
			</aside>

			{/* Main content */}
			<div className="pt-14 flex">
				{/* Video area */}
				<div className={cn(
					"flex-1 transition-all duration-300",
					sidebarOpen ? "lg:mr-80" : "lg:mr-14",
				)}>
					<div className="p-4 lg:p-6 max-w-5xl mx-auto">
						{/* Current lesson info */}
						<div className="mb-4">
							<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
								<span>{currentSection?.title || `Bagian ${currentLesson.sectionId}`}</span>
								<span>•</span>
								<span>Pelajaran {currentLesson.lessonIndex + 1}</span>
							</div>
							<h2 className="text-xl font-semibold text-foreground">
								{currentLesson.title}
							</h2>
						</div>

						{/* Video Player */}
						<div className="relative rounded-xl overflow-hidden shadow-lg mb-6">
							{currentLesson.videoId ? (
								<>
									<WistiaPlayer
										ref={playerRef}
										mediaId={currentLesson.videoId}
										className="w-full"
										initialTime={currentLesson.startTime}
										onProgress={handleProgress}
									/>
									{/* Lesson Confirmation Overlay */}
									{overlayType && pendingLesson && (
										<div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
											<div className="text-center px-6">
												{overlayType === 'manual' ? (
													<>
														<p className="text-white text-lg font-medium mb-2">
															Siap menonton?
														</p>
														<p className="text-white/70 text-sm mb-6">
															{pendingLesson.title}
														</p>
														<Button
															onClick={confirmOverlay}
															className="bg-brand-primary hover:bg-brand-primary/90"
														>
															<Play className="w-4 h-4 mr-2" />
															Mulai Menonton
														</Button>
													</>
												) : (
													<>
														<p className="text-white text-lg font-medium mb-2">
															Pelajaran selesai!
														</p>
														<p className="text-white/70 text-sm mb-6">
															Lanjut ke: {pendingLesson.title}
														</p>
														<Button
															onClick={confirmOverlay}
															className="bg-brand-primary hover:bg-brand-primary/90"
														>
															Lanjut ke Pelajaran Berikutnya
															<ChevronRight className="w-4 h-4 ml-2" />
														</Button>
													</>
												)}
											</div>
										</div>
									)}
								</>
							) : (
								<div className="aspect-video bg-muted flex items-center justify-center">
									<div className="text-center">
										<AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
										<p className="text-muted-foreground">
											Video tidak tersedia untuk pelajaran ini.
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Navigation buttons */}
						<VideoLessonNav
							previousLesson={previousLesson}
							nextLesson={nextLesson}
							onNavigate={handleNavigate}
						/>
					</div>
				</div>

				{/* Desktop sidebar */}
				<aside
					className={cn(
						"hidden lg:block fixed top-14 right-0 h-[calc(100vh-3.5rem)] bg-background border-l border-border overflow-y-auto transition-all duration-300",
						sidebarOpen ? "w-80" : "w-14",
					)}
				>
					<CourseLearnSidebar
						course={course}
						currentLesson={{
							sectionId: currentLesson.sectionId,
							lessonIndex: currentLesson.lessonIndex,
						}}
						progress={progress}
						progressData={progressData}
						onLessonSelect={handleLessonSelect}
						open={sidebarOpen}
						onToggle={() => setSidebarOpen(!sidebarOpen)}
					/>
				</aside>
			</div>
		</div>
	);
}
