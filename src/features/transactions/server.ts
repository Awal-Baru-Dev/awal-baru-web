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

    return { data: data as AdminTransaction[], error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
