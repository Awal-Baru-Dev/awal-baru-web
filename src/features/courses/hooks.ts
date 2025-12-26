/**
 * Course React Query Hooks
 *
 * TanStack Query hooks for fetching and caching course data.
 */

import { useQuery } from "@tanstack/react-query";
import {
	getCourses,
	getCourseBySlug,
	getFeaturedCourses,
	getCourseById,
	searchCourses,
} from "./actions";

/**
 * Query keys for course-related queries
 */
export const courseKeys = {
	all: ["courses"] as const,
	lists: () => [...courseKeys.all, "list"] as const,
	list: () => [...courseKeys.lists()] as const,
	featured: () => [...courseKeys.all, "featured"] as const,
	details: () => [...courseKeys.all, "detail"] as const,
	detail: (slug: string) => [...courseKeys.details(), slug] as const,
	byId: (id: string) => [...courseKeys.all, "id", id] as const,
	search: (query: string) => [...courseKeys.all, "search", query] as const,
};

/**
 * Hook to fetch all published courses
 */
export function useCourses() {
	return useQuery({
		queryKey: courseKeys.list(),
		queryFn: async () => {
			const result = await getCourses();
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch a single course by slug
 */
export function useCourse(slug: string) {
	return useQuery({
		queryKey: courseKeys.detail(slug),
		queryFn: async () => {
			const result = await getCourseBySlug(slug);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		enabled: !!slug,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch featured courses
 */
export function useFeaturedCourses() {
	return useQuery({
		queryKey: courseKeys.featured(),
		queryFn: async () => {
			const result = await getFeaturedCourses();
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch a course by ID
 */
export function useCourseById(courseId: string) {
	return useQuery({
		queryKey: courseKeys.byId(courseId),
		queryFn: async () => {
			const result = await getCourseById(courseId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		enabled: !!courseId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to search courses by query string
 */
export function useSearchCourses(query: string) {
	return useQuery({
		queryKey: courseKeys.search(query),
		queryFn: async () => {
			const result = await searchCourses(query);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		// Only fetch when query has content
		enabled: query.trim().length > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
