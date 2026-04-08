import { createBrowserClient } from "@/lib/db/supabase/client";
import type { AdminProfile } from "@/lib/db/types";

export interface PaginatedUsersResult {
	data: AdminProfile[];
	totalCount: number;
	error: string | null;
}

export async function getAdminUsers(params: {
	page: number;
	limit: number;
	searchQuery?: string;
}): Promise<PaginatedUsersResult> {
	try {
		const supabase = createBrowserClient();
		const from = (params.page - 1) * params.limit;
		const to = from + params.limit - 1;

		let query = supabase
			.from("admin_profiles_view")
			.select("*", { count: "exact" });

		if (params.searchQuery) {
			query = query.or(
				`full_name.ilike.%${params.searchQuery}%,email.ilike.%${params.searchQuery}%`,
			);
		}

		const { data, error, count } = await query
			.order("created_at", { ascending: false })
			.range(from, to);

		if (error) {
			console.error("Error fetching users:", error);
			return { data: [], totalCount: 0, error: error.message };
		}

		return {
			data: (data as AdminProfile[]) || [],
			totalCount: count || 0,
			error: null,
		};
	} catch (error) {
		console.error("Error fetching users:", error);
		return {
			data: [],
			totalCount: 0,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
