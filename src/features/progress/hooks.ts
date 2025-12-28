/**
 * Progress Hooks
 *
 * React hooks for course progress tracking.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/user-context";
import type { Course, CourseProgress } from "@/lib/db/types";
import {
	getCourseProgress,
	updateCourseProgress,
	calculateProgressPercent,
	calculateLessonPosition,
} from "./actions";

/**
 * Hook to get user's progress for a course
 */
export function useCourseProgress(courseId: string) {
	const { user } = useUser();

	return useQuery({
		queryKey: ["course-progress", courseId, user?.id],
		queryFn: async () => {
			if (!user?.id || !courseId) return null;
			const result = await getCourseProgress(user.id, courseId);
			return result.data;
		},
		enabled: !!user?.id && !!courseId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Hook to update user's progress
 */
export function useUpdateProgress() {
	const { user } = useUser();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			courseId,
			course,
			sectionId,
			lessonIndex,
		}: {
			courseId: string;
			course: Course;
			sectionId: string;
			lessonIndex: number;
		}) => {
			if (!user?.id) throw new Error("User not authenticated");

			const progressPercent = calculateProgressPercent(
				course,
				sectionId,
				lessonIndex,
			);

			const result = await updateCourseProgress(
				user.id,
				courseId,
				sectionId,
				lessonIndex,
				progressPercent,
			);

			if (result.error) throw new Error(result.error);
			return result.data;
		},
		onSuccess: (data, variables) => {
			// Update the cache
			queryClient.setQueryData(
				["course-progress", variables.courseId, user?.id],
				data,
			);
		},
	});
}

/**
 * Derived progress data for UI display
 */
export interface ProgressDisplayData {
	completedLessons: number;
	totalLessons: number;
	overallProgress: number;
	currentSectionId: string | null;
	currentLessonIndex: number | null;
}

/**
 * Calculate display data from progress record
 */
export function getProgressDisplayData(
	course: Course,
	progress: CourseProgress | null | undefined,
): ProgressDisplayData {
	const totalLessons = course.lessons_count || 0;

	if (!progress) {
		return {
			completedLessons: 0,
			totalLessons,
			overallProgress: 0,
			currentSectionId: null,
			currentLessonIndex: null,
		};
	}

	// Completed lessons = current position (starting a lesson = completing it in MVP)
	const currentPosition = calculateLessonPosition(
		course,
		progress.current_section_id,
		progress.current_lesson_index,
	);

	return {
		completedLessons: currentPosition,
		totalLessons,
		overallProgress: progress.progress_percent,
		currentSectionId: progress.current_section_id,
		currentLessonIndex: progress.current_lesson_index,
	};
}

/**
 * Check if a lesson is "completed" (before current position)
 */
export function isLessonCompleted(
	course: Course,
	progress: CourseProgress | null | undefined,
	sectionId: string,
	lessonIndex: number,
): boolean {
	if (!progress) return false;

	const lessonPosition = calculateLessonPosition(course, sectionId, lessonIndex);
	const currentPosition = calculateLessonPosition(
		course,
		progress.current_section_id,
		progress.current_lesson_index,
	);

	// Lesson is completed if it's at or before current position
	// (starting a lesson = completing it in MVP model)
	return lessonPosition <= currentPosition;
}
