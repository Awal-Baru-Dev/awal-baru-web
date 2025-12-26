/**
 * Supabase Admin Client
 *
 * Used for server-side operations that need to bypass Row Level Security (RLS).
 * This includes:
 * - Payment webhooks (DOKU notifications)
 * - System notifications
 * - Admin operations
 *
 * SECURITY: This client uses the service role key which bypasses RLS.
 * Only use in trusted server-side code, never expose to client.
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/config/env";

/**
 * Create a Supabase admin client that bypasses RLS
 *
 * @throws Error if service role key is not configured
 */
export function createAdminClient() {
	const supabaseUrl = env.VITE_SUPABASE_URL;
	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl) {
		throw new Error(
			"Missing VITE_SUPABASE_URL environment variable.",
		);
	}

	if (!serviceRoleKey) {
		throw new Error(
			"Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
				"This key is required for admin operations like webhooks.",
		);
	}

	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}

// Export type for convenience
export type SupabaseAdminClient = ReturnType<typeof createAdminClient>;
