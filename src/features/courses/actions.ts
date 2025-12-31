/**
 * Course Server Functions
 *
 * Server-side functions for fetching course data from Supabase.
 * These functions are called from React Query hooks.
 */

import { createBrowserClient } from "@/lib/db/supabase/client";
import type { Course, ListResult, QueryResult } from "@/lib/db/types";

// Debug helper - set to true only for local debugging
const DEBUG = false;
const log = (fn: string, message: string, data?: unknown) => {
	if (!DEBUG) return;
	const timestamp = new Date().toISOString().split("T")[1].slice(0, 12);
	console.log(`[${timestamp}] [COURSE:${fn}]`, message, data ?? "");
};

/**
 * Get all published courses
 */
export async function getCourses(): Promise<ListResult<Course>> {
	log("getCourses", "Starting...");
	try {
		const supabase = createBrowserClient();
		log("getCourses", "Got client, querying...");

		const { data, error } = await supabase
			.from("courses")
			.select("*")
			.eq("is_published", true)
			.order("display_order", { ascending: true })
			.order("created_at", { ascending: false });

		log("getCourses", "Query returned", { count: data?.length, error: error?.message });

		if (error) {
			console.error("Error fetching courses:", error);
			return { data: [], error: error.message };
		}

		return { data: data as Course[], error: null };
	} catch (error) {
		console.error("Error fetching courses:", error);
		log("getCourses", "EXCEPTION", error);
		return {
			data: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get all courses for admin (including unpublished)
 */
export async function getAdminCourses(): Promise<ListResult<Course>> {
  try {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin courses:", error);
      return { data: [], error: error.message };
    }

    return { data: data as Course[], error: null };
  } catch (error) {
    console.error("Error fetching admin courses:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a single course by slug
 */
export async function getCourseBySlug(
	slug: string,
): Promise<QueryResult<Course>> {
	try {
		const supabase = createBrowserClient();

		const { data, error } = await supabase
			.from("courses")
			.select("*")
			.eq("slug", slug)
			.eq("is_published", true)
			.single();

		if (error) {
			console.error("Error fetching course:", error);
			return { data: null, error: error.message };
		}

		return { data: data as Course, error: null };
	} catch (error) {
		console.error("Error fetching course:", error);
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get featured courses for homepage
 */
export async function getFeaturedCourses(): Promise<ListResult<Course>> {
	log("getFeaturedCourses", "Starting...");
	try {
		const supabase = createBrowserClient();
		log("getFeaturedCourses", "Got client, querying...");

		const { data, error } = await supabase
			.from("courses")
			.select("*")
			.eq("is_published", true)
			.eq("is_featured", true)
			.order("display_order", { ascending: true })
			.limit(4);

		log("getFeaturedCourses", "Query returned", { count: data?.length, error: error?.message });

		if (error) {
			console.error("Error fetching featured courses:", error);
			return { data: [], error: error.message };
		}

		return { data: data as Course[], error: null };
	} catch (error) {
		console.error("Error fetching featured courses:", error);
		log("getFeaturedCourses", "EXCEPTION", error);
		return {
			data: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get course by ID (for internal use with enrollment checks)
 */
export async function getCourseById(
	courseId: string,
): Promise<QueryResult<Course>> {
	try {
		const supabase = createBrowserClient();

		const { data, error } = await supabase
			.from("courses")
			.select("*")
			.eq("id", courseId)
			.single();

		if (error) {
			console.error("Error fetching course by ID:", error);
			return { data: null, error: error.message };
		}

		return { data: data as Course, error: null };
	} catch (error) {
		console.error("Error fetching course by ID:", error);
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// Maximum allowed search query length
const MAX_SEARCH_QUERY_LENGTH = 100;

/**
 * Search courses by query string
 * Matches against title, short_description, category, and instructor_name
 */
export async function searchCourses(query: string): Promise<ListResult<Course>> {
	log("searchCourses", "Starting...", { query });

	// Validate input length
	if (query && query.length > MAX_SEARCH_QUERY_LENGTH) {
		return { data: [], error: null };
	}

	try {
		const supabase = createBrowserClient();
		log("searchCourses", "Got client, querying...");

		let queryBuilder = supabase
			.from("courses")
			.select("*")
			.eq("is_published", true);

		// Apply search filter if query is not empty
		if (query && query.trim()) {
			const searchTerm = query.trim();
			queryBuilder = queryBuilder.or(
				`title.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,instructor_name.ilike.%${searchTerm}%`
			);
		}

		const { data, error } = await queryBuilder
			.order("display_order", { ascending: true })
			.order("created_at", { ascending: false })
			.limit(50);

		log("searchCourses", "Query returned", { count: data?.length, error: error?.message });

		if (error) {
			console.error("Error searching courses:", error);
			return { data: [], error: error.message };
		}

		return { data: data as Course[], error: null };
	} catch (error) {
		console.error("Error searching courses:", error);
		log("searchCourses", "EXCEPTION", error);
		return {
			data: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Upload to Supabase Storage
 */
export async function uploadCourseAsset(
	file: File,
	bucket: "course-assets" | "avatars",
	path: string
): Promise<string | null> {
	try {
		const supabase = createBrowserClient();
		
		const { data, error } = await supabase.storage
			.from(bucket)
			.upload(path, file, {
				cacheControl: "3600",
				upsert: true,
			});

		if (error) {
			throw error;
		}

		const { data: publicUrlData } = supabase.storage
			.from(bucket)
			.getPublicUrl(data.path);

		return publicUrlData.publicUrl;
	} catch (error) {
		console.error(`Error uploading to ${bucket}:`, error);
		return null;
	}
}

/**
 * Create new course
 */
export async function createCourse(
  courseData: Partial<Course>
) {
  try {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from("courses")
      .insert(courseData)
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Create Course Exception:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}