/**
 * Enrollment React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/user-context";
import {
	getUserEnrollments,
	checkEnrollment,
	getEnrollmentWithCourse,
	getEnrolledCourseIds,
} from "./actions";

/**
 * Query keys for enrollment-related queries
 */
export const enrollmentKeys = {
	all: ["enrollments"] as const,
	lists: () => [...enrollmentKeys.all, "list"] as const,
	list: (userId: string) => [...enrollmentKeys.lists(), userId] as const,
	details: () => [...enrollmentKeys.all, "detail"] as const,
	detail: (userId: string, courseId: string) =>
		[...enrollmentKeys.details(), userId, courseId] as const,
	courseIds: (userId: string) =>
		[...enrollmentKeys.all, "courseIds", userId] as const,
};

/**
 * Hook to fetch all enrollments for the current user
 */
export function useUserEnrollments() {
	const { user } = useUser();

	return useQuery({
		queryKey: enrollmentKeys.list(user?.id ?? ""),
		queryFn: async () => {
			if (!user?.id) return [];
			const result = await getUserEnrollments(user.id);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		enabled: !!user?.id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to check if the current user is enrolled in a specific course
 */
export function useEnrollmentStatus(courseId: string) {
	const { user } = useUser();

	return useQuery({
		queryKey: enrollmentKeys.detail(user?.id ?? "", courseId),
		queryFn: async () => {
			if (!user?.id) return null;
			const result = await checkEnrollment(user.id, courseId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		enabled: !!user?.id && !!courseId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to get enrollment with full course details
 */
export function useEnrollmentWithCourse(courseId: string) {
	const { user } = useUser();

	return useQuery({
		queryKey: [...enrollmentKeys.detail(user?.id ?? "", courseId), "course"],
		queryFn: async () => {
			if (!user?.id) return null;
			const result = await getEnrollmentWithCourse(user.id, courseId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		enabled: !!user?.id && !!courseId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to get all enrolled course IDs for the current user
 * Useful for efficiently marking owned courses in listings
 */
export function useEnrolledCourseIds() {
	const { user } = useUser();

	return useQuery({
		queryKey: enrollmentKeys.courseIds(user?.id ?? ""),
		queryFn: async () => {
			if (!user?.id) return new Set<string>();
			const result = await getEnrolledCourseIds(user.id);
			if (result.error) {
				throw new Error(result.error);
			}
			return new Set(result.data);
		},
		enabled: !!user?.id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
