import { createBrowserClient } from "@/lib/db/supabase/client";
import type { AdminProfile, ListResult } from "@/lib/db/types";

export async function getAdminUsers(): Promise<ListResult<AdminProfile>> {
  try {
    const supabase = createBrowserClient();


    const { data, error } = await supabase
      .from("admin_profiles_view")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return { data: [], error: error.message };
    }

    return { data: (data as AdminProfile[]) || [], error: null };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
