/**
 * Database Client Factory
 *
 * This module provides a database-agnostic client factory.
 * Currently uses Supabase, but can be swapped to a REST API or other backend.
 *
 * Usage:
 * - Browser: import { createBrowserClient } from '@/lib/db/client'
 * - Server: import { createServerClient } from '@/lib/db/client'
 * - Admin: import { createAdminClient } from '@/lib/db/client'
 */

// Re-export from Supabase implementation
// To switch to a different backend, update these exports
export {
	createBrowserClient,
	getSupabaseServerClient,
	createAdminClient,
	type SupabaseBrowserClient,
	type SupabaseServerClient,
	type SupabaseAdminClient,
} from "./supabase";

// Re-export types
export * from "./types";

/**
 * Get the current database implementation type
 * Useful for conditional logic based on backend
 */
export function getDbImplementation(): "supabase" | "rest" {
	return "supabase";
}
