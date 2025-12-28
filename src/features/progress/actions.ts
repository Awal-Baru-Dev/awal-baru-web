/**
 * Progress Server Functions
 *
 * Server-side functions for course progress tracking.
 * MVP approach: position-based progress (current lesson / total lessons)
 */

import { createBrowserClient } from "@/lib/db/supabase/client";
import type { Course, CourseProgress, QueryResult } from "@/lib/db/types";

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
 * Update user's progress for a course (upsert)
 */
export async function updateCourseProgress(
	userId: string,
	courseId: string,
	sectionId: string,
	lessonIndex: number,
	progressPercent: number,
): Promise<QueryResult<CourseProgress>> {
	try {
		const supabase = createBrowserClient();

		const { data, error } = await supabase
			.from("course_progress")
			.upsert(
				{
					user_id: userId,
					course_id: courseId,
					current_section_id: sectionId,
					current_lesson_index: lessonIndex,
					progress_percent: progressPercent,
					last_accessed_at: new Date().toISOString(),
				},
				{
					onConflict: "user_id,course_id",
				},
			)
			.select()
			.single();

		if (error) {
			console.error("Error updating course progress:", error);
			return { data: null, error: error.message };
		}

		return { data: data as CourseProgress, error: null };
	} catch (error) {
		console.error("Error updating course progress:", error);
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
