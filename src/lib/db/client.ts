/**
 * Browser Database Client
 *
 * This module exports ONLY browser-safe database clients.
 * For server-side usage, import from '@/lib/db/server' or '@/lib/db/supabase/server'.
 *
 * Usage:
 * - Browser: import { createBrowserClient } from '@/lib/db/client'
 * - Server: import { getSupabaseServerClient } from '@/lib/db/server'
 * - Admin: import { createAdminClient } from '@/lib/db/server'
 */

// Browser-safe exports only
export {
	createBrowserClient,
	type SupabaseBrowserClient,
} from "./supabase/client";

// Re-export types (safe for all contexts)
export * from "./types";

/**
 * Get the current database implementation type
 * Useful for conditional logic based on backend
 */
export function getDbImplementation(): "supabase" | "rest" {
	return "supabase";
}
