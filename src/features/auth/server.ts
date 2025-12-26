/**
 * Auth Server Functions
 *
 * Server-side authentication operations using TanStack Start's createServerFn.
 * These functions run on the server and handle all auth operations securely.
 */

import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { getSupabaseServerClient } from "@/lib/db/supabase/server";
import type { Profile } from "@/lib/db/types";

/**
 * User data returned from auth operations
 */
export interface AuthUser {
	id: string;
	email: string | undefined;
	profile: Profile | null;
}

/**
 * Fetch the current authenticated user
 *
 * Used in route beforeLoad to get user state on every navigation.
 * Returns null if not authenticated.
 */
export const fetchUser = createServerFn({ method: "GET" }).handler(
	async (): Promise<AuthUser | null> => {
		const supabase = await getSupabaseServerClient();
		const { data, error } = await supabase.auth.getUser();

		if (error || !data.user) {
			return null;
		}

		// Fetch profile data
		const { data: profile } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", data.user.id)
			.single();

		return {
			id: data.user.id,
			email: data.user.email,
			profile: profile as Profile | null,
		};
	},
);

/**
 * Sign in with email and password
 */
export const loginFn = createServerFn({ method: "POST" })
	.inputValidator((d: { email: string; password: string }) => d)
	.handler(async ({ data }) => {
		const supabase = await getSupabaseServerClient();
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});

		if (error) {
			return {
				error: true,
				message: error.message,
				code: error.code,
			};
		}

		return { error: false };
	});

/**
 * Sign up with email and password
 */
export const signupFn = createServerFn({ method: "POST" })
	.inputValidator((d: { email: string; password: string; fullName?: string }) => d)
	.handler(async ({ data }) => {
		const supabase = await getSupabaseServerClient();

		// Get the app URL for email redirect
		const appUrl = import.meta.env.VITE_APP_URL || "";

		const { data: authData, error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: {
				data: {
					full_name: data.fullName,
				},
				emailRedirectTo: `${appUrl}/auth/callback`,
			},
		});

		if (error) {
			return {
				error: true,
				message: error.message,
				code: error.code,
			};
		}

		// Check if email confirmation is required
		const needsConfirmation = authData.user && !authData.session;

		return {
			error: false,
			needsConfirmation,
		};
	});

/**
 * Sign out and redirect to home
 */
export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
	const supabase = await getSupabaseServerClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		return {
			error: true,
			message: error.message,
		};
	}

	// Redirect to home page after logout
	throw redirect({ href: "/" });
});

/**
 * Request password reset email
 */
export const requestPasswordResetFn = createServerFn({ method: "POST" })
	.inputValidator((d: { email: string }) => d)
	.handler(async ({ data }) => {
		const supabase = await getSupabaseServerClient();

		// Get the app URL for email redirect
		const appUrl = import.meta.env.VITE_APP_URL || "";

		const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
			redirectTo: `${appUrl}/reset-password`,
		});

		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}

		return { error: false };
	});

/**
 * Update password (for reset password flow)
 */
export const resetPasswordFn = createServerFn({ method: "POST" })
	.inputValidator((d: { password: string }) => d)
	.handler(async ({ data }) => {
		const supabase = await getSupabaseServerClient();

		const { error } = await supabase.auth.updateUser({
			password: data.password,
		});

		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}

		return { error: false };
	});

/**
 * Resend confirmation email
 */
export const resendConfirmationFn = createServerFn({ method: "POST" })
	.inputValidator((d: { email: string }) => d)
	.handler(async ({ data }) => {
		const supabase = await getSupabaseServerClient();

		// Get the app URL for email redirect
		const appUrl = import.meta.env.VITE_APP_URL || "";

		const { error } = await supabase.auth.resend({
			type: "signup",
			email: data.email,
			options: {
				emailRedirectTo: `${appUrl}/auth/callback`,
			},
		});

		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}

		return { error: false };
	});

/**
 * Exchange auth code for session (PKCE flow)
 * Used in /auth/callback route
 */
export const exchangeCodeForSessionFn = createServerFn({ method: "POST" })
	.inputValidator((d: { code: string }) => d)
	.handler(async ({ data }) => {
		const supabase = await getSupabaseServerClient();

		const { error } = await supabase.auth.exchangeCodeForSession(data.code);

		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}

		return { error: false };
	});
