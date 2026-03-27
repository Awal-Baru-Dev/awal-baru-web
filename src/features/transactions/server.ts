import { createBrowserClient } from "@/lib/db/supabase/client";
import type { AdminTransaction, ListResult } from "@/lib/db/types";

export async function getAdminTransactions(): Promise<
	ListResult<AdminTransaction>
> {
	try {
		const supabase = createBrowserClient();

		const { data, error } = await supabase
			.from("admin_transactions_view")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching transactions:", error);
			return { data: [], error: error.message };
		}

		// Dynamically expire transactions that have past their expires_at date
		const processedData = (data as AdminTransaction[]).map(trx => {
			if (
				trx.payment_status === "pending" && 
				trx.expires_at && 
				new Date(trx.expires_at).getTime() < Date.now()
			) {
				return { ...trx, payment_status: "expired" } as AdminTransaction;
			}
			return trx;
		});

		return { data: processedData, error: null };
	} catch (error) {
		return {
			data: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
