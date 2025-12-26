/**
 * User Context (Server-First)
 *
 * This module provides user state from TanStack Router's route context.
 * The user is fetched server-side in __root.tsx beforeLoad.
 *
 * No more React Context provider needed - we use route context instead.
 */

import { useRouteContext } from "@tanstack/react-router";
import type { AuthUser } from "@/features/auth";
import type { Profile } from "@/lib/db/types";

/**
 * Hook to get the current user from route context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated } = useUser();
 *
 *   if (!isAuthenticated) {
 *     return <div>Please log in</div>;
 *   }
 *
 *   return <div>Hello, {user?.email}</div>;
 * }
 * ```
 */
export function useUser() {
	// Get user from the root route context
	const context = useRouteContext({ from: "__root__" });
	const user = context.user as AuthUser | null;

	return {
		user,
		profile: user?.profile ?? null,
		isAuthenticated: !!user,
		// No loading state needed - user is fetched before render
		isLoading: false,
	};
}

/**
 * Helper function to get user display name
 */
export function getUserDisplayName(
	user: AuthUser | null,
	profile?: Profile | null,
): string {
	if (!user) return "";

	// Prefer profile full name
	const userProfile = profile ?? user.profile;
	if (userProfile?.full_name) return userProfile.full_name;

	// Fall back to email username
	if (user.email) return user.email.split("@")[0];

	return "User";
}

/**
 * @deprecated Use useUser() hook instead. UserProvider is no longer needed
 * as user state comes from route context.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
	// No-op wrapper for backwards compatibility during migration
	return children;
}
