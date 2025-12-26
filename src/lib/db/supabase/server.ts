/**
 * Supabase Server Client
 *
 * Used in Server Functions (createServerFn) and Route loaders/beforeLoad.
 * This client handles authentication with proper cookie management for SSR.
 *
 * Uses TanStack Start's built-in cookie utilities for seamless integration.
 *
 * NOTE: We use dynamic imports for @tanstack/react-start/server utilities
 * to prevent Vite from bundling server-only code into the client bundle.
 * See: https://github.com/TanStack/router/issues/3355
 */

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";

/**
 * Get a Supabase client for server-side usage.
 *
 * This function automatically handles cookies using TanStack Start's
 * server utilities. No need to pass a cookie store - it's handled automatically.
 *
 * @example
 * ```ts
 * const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
 *   const supabase = await getSupabaseServerClient()
 *   const { data } = await supabase.auth.getUser()
 *   return data.user
 * })
 * ```
 */
export async function getSupabaseServerClient() {
	// Dynamic import to prevent server-only code from being bundled into client
	const { getCookies, setCookie } = await import("@tanstack/react-start/server");

	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
	const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			"Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
		);
	}

	return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return Object.entries(getCookies()).map(([name, value]) => ({
					name,
					value,
				}));
			},
			setAll(cookies) {
				for (const cookie of cookies) {
					setCookie(cookie.name, cookie.value);
				}
			},
		},
	});
}

// Export type for convenience
export type SupabaseServerClient = ReturnType<typeof getSupabaseServerClient>;
