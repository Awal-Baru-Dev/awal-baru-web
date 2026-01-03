/**
 * Progress Server Functions
 *
 * Server-side functions for course progress tracking.
 * MVP approach: position-based progress (current lesson / total lessons)
 */

import { createBrowserClient } from "@/lib/db/supabase/client";
import type { Course, CourseProgress, ActivityLog, QueryResult } from "@/lib/db/types";

/**
 * Calculate the lesson position (1-indexed) within the entire course
 */
export function calculateLessonPosition(
	course: Course,
	sectionId: string,
	lessonIndex: number,
): number {
	const sections = course.content?.sections || [];
	let position = 0;

	for (const section of sections) {
		for (let i = 0; i < section.lessons.length; i++) {
			position++;
			if (section.id === sectionId && i === lessonIndex) {
				return position;
			}
		}
	}

	return position;
}

/**
 * Calculate progress percentage from position
 */
export function calculateProgressPercent(
	course: Course,
	sectionId: string,
	lessonIndex: number,
): number {
	const totalLessons = course.lessons_count || 0;
	if (totalLessons === 0) return 0;

	const position = calculateLessonPosition(course, sectionId, lessonIndex);
	return Math.round((position / totalLessons) * 100);
}

/**
 * Get user's progress for a course
 */
export async function getCourseProgress(
	userId: string,
	courseId: string,
): Promise<QueryResult<CourseProgress>> {
	try {
		const supabase = createBrowserClient();

		const { data, error } = await supabase
			.from("course_progress")
			.select("*")
			.eq("user_id", userId)
			.eq("course_id", courseId)
			.maybeSingle();

		if (error) {
			console.error("Error fetching course progress:", error);
			return { data: null, error: error.message };
		}

		return { data: data as CourseProgress | null, error: null };
	} catch (error) {
		console.error("Error fetching course progress:", error);
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get user's progress for multiple courses at once
 * Used by dashboard to calculate overall stats
 */
export async function getAllCourseProgress(
	userId: string,
	courseIds: string[],
): Promise<QueryResult<CourseProgress[]>> {
	try {
		if (courseIds.length === 0) {
			return { data: [], error: null };
		}

		const supabase = createBrowserClient();

		const { data, error } = await supabase
			.from("course_progress")
			.select("*")
			.eq("user_id", userId)
			.in("course_id", courseIds);

		if (error) {
			console.error("Error fetching all course progress:", error);
			return { data: null, error: error.message };
		}

		return { data: (data as CourseProgress[]) || [], error: null };
	} catch (error) {
		console.error("Error fetching all course progress:", error);
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Update user's progress for a course (upsert)
 */
export async function updateCourseProgress(
    userId: string,
    courseId: string,
    sectionId: string,
    lessonIndex: number,
    progressPercent: number,
    lastWatchedSeconds: number = 0,
): Promise<QueryResult<CourseProgress>> {
    try {
        const supabase = createBrowserClient();

        const payload = {
            user_id: userId,
            course_id: courseId,
            current_section_id: sectionId,
            current_lesson_index: lessonIndex,
            progress_percent: progressPercent,
            last_watched_seconds: lastWatchedSeconds,
            last_accessed_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("course_progress")
            .upsert(
                payload,
                {
                    onConflict: "user_id,course_id", 
                },
            )
            .select()
            .single();

        if (error) {
            return { data: null, error: error.message };
        }
        return { data: data as CourseProgress, error: null };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// ============================================================================
// Activity Logging Functions
// ============================================================================

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
function getTodayDate(): string {
	const now = new Date();
	return now.toISOString().split("T")[0];
}

/**
 * Log activity for a user on a course (upsert for today)
 * Increments lessons completed and/or adds time spent
 */
export async function logActivity(
	userId: string,
	courseId: string,
	lessonsCompleted: number = 0,
	timeSpentMinutes: number = 0,
): Promise<QueryResult<ActivityLog>> {
	try {
		const supabase = createBrowserClient();
		const today = getTodayDate();

		// First, try to get existing record for today
		const { data: existing } = await supabase
			.from("activity_log")
			.select("*")
			.eq("user_id", userId)
			.eq("course_id", courseId)
			.eq("activity_date", today)
			.maybeSingle();

		// Calculate new values (add to existing or start fresh)
		const newLessonsCompleted = (existing?.lessons_completed ?? 0) + lessonsCompleted;
		const newTimeSpentMinutes = (existing?.time_spent_minutes ?? 0) + timeSpentMinutes;

		const { data, error } = await supabase
			.from("activity_log")
			.upsert(
				{
					user_id: userId,
					course_id: courseId,
					activity_date: today,
					lessons_completed: newLessonsCompleted,
					time_spent_minutes: newTimeSpentMinutes,
				},
				{
					onConflict: "user_id,course_id,activity_date",
				},
			)
			.select()
			.single();

		if (error) {
			console.error("Error logging activity:", error);
			return { data: null, error: error.message };
		}

		return { data: data as ActivityLog, error: null };
	} catch (error) {
		console.error("Error logging activity:", error);
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get user's total cumulative learning time
 */
export async function getTotalLearningTime(userId: string): Promise<QueryResult<number>> {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("activity_log")
        .select("time_spent_minutes")
        .eq("user_id", userId);

      if (error) return { data: null, error: error.message };

      // Sum all minutes from every log entry
      const totalMinutes = data.reduce(
        (sum: number, log: { time_spent_minutes: number | null }) => {
          return sum + (log.time_spent_minutes || 0);
        },
        0
      );
      return { data: totalMinutes, error: null };
    } catch (error) {
        return { data: null, error: "Failed to fetch total time" };
    }
}

/**
 * Get user's weekly activity (last 7 days)
 * Returns aggregated data per day across all courses
 */
export async function getWeeklyActivity(
	userId: string,
): Promise<QueryResult<ActivityLog[]>> {
	try {
		const supabase = createBrowserClient();

		// Calculate date 7 days ago
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
		const startDate = sevenDaysAgo.toISOString().split("T")[0];

		const { data, error } = await supabase
			.from("activity_log")
			.select("*")
			.eq("user_id", userId)
			.gte("activity_date", startDate)
			.order("activity_date", { ascending: true });

		if (error) {
			console.error("Error fetching weekly activity:", error);
			return { data: null, error: error.message };
		}

		return { data: (data as ActivityLog[]) || [], error: null };
	} catch (error) {
		console.error("Error fetching weekly activity:", error);
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Calculate current streak (consecutive days with activity)
 */
export async function getActivityStreak(
	userId: string,
): Promise<QueryResult<number>> {
	try {
		const supabase = createBrowserClient();

		// Get all activity dates for the user, ordered by date descending
		const { data, error } = await supabase
			.from("activity_log")
			.select("activity_date")
			.eq("user_id", userId)
			.order("activity_date", { ascending: false })
			.limit(30); // Look back up to 30 days

		if (error) {
			console.error("Error fetching activity streak:", error);
			return { data: null, error: error.message };
		}

		if (!data || data.length === 0) {
			return { data: 0, error: null };
		}

		// Get unique dates (in case of multiple courses per day)
		const uniqueDates = [...new Set(data.map((d: { activity_date: string }) => d.activity_date))].sort().reverse();

		// Calculate streak
		let streak = 0;
		const today = getTodayDate();
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = yesterday.toISOString().split("T")[0];

		// Streak only counts if user was active today or yesterday
		if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayStr) {
			return { data: 0, error: null };
		}

		// Count consecutive days
		let expectedDate = new Date(uniqueDates[0] as string);
		for (const dateStr of uniqueDates) {
			const expectedDateStr = expectedDate.toISOString().split("T")[0];

			if (dateStr === expectedDateStr) {
				streak++;
				expectedDate.setDate(expectedDate.getDate() - 1);
			} else {
				break;
			}
		}

		return { data: streak, error: null };
	} catch (error) {
		console.error("Error calculating activity streak:", error);
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
