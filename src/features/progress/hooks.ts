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
	getAllCourseProgress,
	updateCourseProgress,
	calculateProgressPercent,
	calculateLessonPosition,
	logActivity,
	getWeeklyActivity,
	getActivityStreak,
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
 * Hook to get user's progress for multiple courses at once
 * Used by dashboard to calculate overall stats
 */
export function useAllCourseProgress(courseIds: string[]) {
	const { user } = useUser();

	return useQuery({
		queryKey: ["all-course-progress", user?.id, courseIds],
		queryFn: async () => {
			if (!user?.id || courseIds.length === 0) return [];
			const result = await getAllCourseProgress(user.id, courseIds);
			return result.data ?? [];
		},
		enabled: !!user?.id && courseIds.length > 0,
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

// ============================================================================
// Activity Tracking Hooks
// ============================================================================

/**
 * Hook to log activity (lessons completed, time spent)
 */
export function useLogActivity() {
	const { user } = useUser();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			courseId,
			lessonsCompleted = 0,
			timeSpentMinutes = 0,
		}: {
			courseId: string;
			lessonsCompleted?: number;
			timeSpentMinutes?: number;
		}) => {
			if (!user?.id) throw new Error("User not authenticated");

			const result = await logActivity(
				user.id,
				courseId,
				lessonsCompleted,
				timeSpentMinutes,
			);

			if (result.error) throw new Error(result.error);
			return result.data;
		},
		onSuccess: () => {
			// Invalidate weekly activity cache
			queryClient.invalidateQueries({ queryKey: ["weekly-activity"] });
			queryClient.invalidateQueries({ queryKey: ["activity-streak"] });
		},
	});
}

/**
 * Hook to get user's weekly activity (last 7 days)
 */
export function useWeeklyActivity() {
	const { user } = useUser();

	return useQuery({
		queryKey: ["weekly-activity", user?.id],
		queryFn: async () => {
			if (!user?.id) return [];
			const result = await getWeeklyActivity(user.id);
			return result.data ?? [];
		},
		enabled: !!user?.id,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Hook to get user's activity streak
 */
export function useActivityStreak() {
	const { user } = useUser();

	return useQuery({
		queryKey: ["activity-streak", user?.id],
		queryFn: async () => {
			if (!user?.id) return 0;
			const result = await getActivityStreak(user.id);
			return result.data ?? 0;
		},
		enabled: !!user?.id,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Aggregated weekly data for dashboard charts
 */
export interface WeeklyChartData {
	day: string;
	dayFull: string;
	menit: number;
	pelajaran: number;
}

/**
 * Get formatted weekly chart data from activity logs
 */
export function formatWeeklyChartData(
	activityLogs: { activity_date: string; time_spent_minutes: number; lessons_completed: number }[],
): WeeklyChartData[] {
	const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
	const dayNamesFull = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

	// Create a map of last 7 days
	const result: WeeklyChartData[] = [];
	const today = new Date();

	for (let i = 6; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().split("T")[0];
		const dayIndex = date.getDay();

		// Find activity for this date (sum across all courses)
		const dayActivity = activityLogs.filter((a) => a.activity_date === dateStr);
		const totalMinutes = dayActivity.reduce((sum, a) => sum + a.time_spent_minutes, 0);
		const totalLessons = dayActivity.reduce((sum, a) => sum + a.lessons_completed, 0);

		result.push({
			day: dayNames[dayIndex],
			dayFull: dayNamesFull[dayIndex],
			menit: totalMinutes,
			pelajaran: totalLessons,
		});
	}

	return result;
}
