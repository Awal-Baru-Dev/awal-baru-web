import { createBrowserClient } from "@/lib/db/supabase/client";
import type { GroupedAdminTransaction } from "@/lib/db/types";

export interface PaginatedTransactionsResult {
	data: GroupedAdminTransaction[];
	totalCount: number;
	error: string | null;
}

export async function getAdminTransactions(params: {
	page: number;
	limit: number;
	searchQuery?: string;
	statusFilter?: string;
}): Promise<PaginatedTransactionsResult> {
	try {
		const supabase = createBrowserClient();

		const { data, error } = await supabase.rpc(
			"get_paginated_admin_transactions",
			{
				p_page: params.page,
				p_limit: params.limit,
				p_search_query: params.searchQuery || "",
				p_status_filter: params.statusFilter || "all",
			},
		);

		if (error) {
			console.error("Supabase RPC Error:", error);
			return { data: [], totalCount: 0, error: error.message };
		}

		return {
			data: (data?.[0]?.data || []) as GroupedAdminTransaction[],
			totalCount: Number(data?.[0]?.total_count || 0),
			error: null,
		};
	} catch (error) {
		return {
			data: [],
			totalCount: 0,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
