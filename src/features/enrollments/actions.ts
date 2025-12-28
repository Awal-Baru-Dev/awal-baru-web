/**
 * Enrollment Server Functions
 *
 * Server-side functions for enrollment operations.
 */

import { createBrowserClient } from "@/lib/db/supabase/client";
import type {
	Enrollment,
	EnrollmentWithCourse,
	ListResult,
	QueryResult,
} from "@/lib/db/types";

/**
 * Get all enrollments for a user
 */
export async function getUserEnrollments(
	userId: string,
): Promise<ListResult<EnrollmentWithCourse>> {
	try {
		const supabase = createBrowserClient();

		const { data, error } = await supabase
			.from("enrollments")
			.select(`
				*,
				course:courses(*)
			`)
			.eq("user_id", userId)
			.eq("payment_status", "paid")
			.order("purchased_at", { ascending: false });

		if (error) {
			console.error("Error fetching enrollments:", error);
			return { data: [], error: error.message };
		}

		return { data: data as EnrollmentWithCourse[], error: null };
	} catch (error) {
		console.error("Error fetching enrollments:", error);
		return {
			data: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Check if a user is enrolled in a specific course
 */
export async function checkEnrollment(
	userId: string,
	courseId: string,
): Promise<QueryResult<Enrollment>> {
	try {
		const supabase = createBrowserClient();

		const { data, error } = await supabase
			.from("enrollments")
			.select("*")
			.eq("user_id", userId)
			.eq("course_id", courseId)
			.eq("payment_status", "paid")
			.maybeSingle();

		if (error) {
			console.error("Error checking enrollment:", error);
			return { data: null, error: error.message };
		}

		return { data: data as Enrollment | null, error: null };
	} catch (error) {
		console.error("Error checking enrollment:", error);
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get enrollment with course details
 */
export async function getEnrollmentWithCourse(
	userId: string,
	courseId: string,
): Promise<QueryResult<EnrollmentWithCourse>> {
	try {
		const supabase = createBrowserClient();

		const { data, error } = await supabase
			.from("enrollments")
			.select(`
				*,
				course:courses(*)
			`)
			.eq("user_id", userId)
			.eq("course_id", courseId)
			.eq("payment_status", "paid")
			.maybeSingle();

		if (error) {
			console.error("Error fetching enrollment with course:", error);
			return { data: null, error: error.message };
		}

		return { data: data as EnrollmentWithCourse | null, error: null };
	} catch (error) {
		console.error("Error fetching enrollment with course:", error);
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get all enrolled course IDs for a user (useful for marking owned courses)
 */
export async function getEnrolledCourseIds(
	userId: string,
): Promise<ListResult<string>> {
	try {
		const supabase = createBrowserClient();

		const { data, error } = await supabase
			.from("enrollments")
			.select("course_id")
			.eq("user_id", userId)
			.eq("payment_status", "paid");

		if (error) {
			console.error("Error fetching enrolled course IDs:", error);
			return { data: [], error: error.message };
		}

		const courseIds = data.map((enrollment: { course_id: string }) => enrollment.course_id);
		return { data: courseIds, error: null };
	} catch (error) {
		console.error("Error fetching enrolled course IDs:", error);
		return {
			data: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
