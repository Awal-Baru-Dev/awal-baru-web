/**
 * Supabase client exports
 *
 * This barrel ONLY exports browser-safe clients to prevent
 * server code from being bundled into client builds.
 *
 * Import browser client: from "@/lib/db/supabase/client" or "@/lib/db/supabase"
 * Import server client: from "@/lib/db/supabase/server"
 * Import admin client: from "@/lib/db/supabase/admin"
 */

// Only re-export browser-safe client from barrel
export { createBrowserClient, type SupabaseBrowserClient } from "./client";

// Types are safe to export (type-only imports are tree-shaken)
export type { SupabaseServerClient } from "./server";
export type { SupabaseAdminClient } from "./admin";
