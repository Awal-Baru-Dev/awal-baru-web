/**
 * Supabase Browser Client
 *
 * Used in Client Components (components with "use client" directive).
 * This client handles authentication and database operations in the browser.
 *
 * Uses singleton pattern to reuse the same client instance across the app.
 * This improves performance by:
 * - Avoiding repeated client initialization
 * - Sharing auth state across all usages
 * - Reducing network overhead
 */

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/config/env";

// Singleton instance
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

/**
 * Get the Supabase client for browser/client-side usage.
 * Returns a singleton instance - the same client is reused across all calls.
 */
export function createBrowserClient() {
	// Return existing instance if available
	if (browserClient) {
		return browserClient;
	}

	const supabaseUrl = env.VITE_SUPABASE_URL;
	const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			"Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
		);
	}

	// Create and cache the client
	browserClient = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);

	return browserClient;
}

// Export type for convenience
export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;
