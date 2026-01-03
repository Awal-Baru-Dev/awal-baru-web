import { createBrowserClient } from "@/lib/db/supabase/client";
import { getAdminTransactions } from "@/features/transactions/server";
import { getAdminCourses } from "@/features/courses/actions";

export async function getDashboardStats() {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

  if (error) throw new Error(error.message);
  return data;
}

export async function getDashboardData() {
  const [stats, recentTrx, popularCourses] = await Promise.all([
    getDashboardStats(),
    getAdminTransactions().then((res) => res.data?.slice(0, 5) || []),
    getAdminCourses().then((res) => res.data?.slice(0, 5) || []),
  ]);

  return { stats, recentTrx, popularCourses };
}
