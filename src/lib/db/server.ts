/**
 * Server Database Client
 *
 * This module exports server-only database clients.
 * ONLY import this in server functions (createServerFn handlers) or webhooks.
 *
 * Usage:
 * - Server functions: import { getSupabaseServerClient } from '@/lib/db/server'
 * - Webhooks: import { createAdminClient } from '@/lib/db/server'
 *
 * WARNING: Do NOT import this file in client-side code.
 * It will cause Vite bundling errors due to server-only dependencies.
 */

export {
	getSupabaseServerClient,
	type SupabaseServerClient,
} from "./supabase/server";

export {
	createAdminClient,
	type SupabaseAdminClient,
} from "./supabase/admin";
