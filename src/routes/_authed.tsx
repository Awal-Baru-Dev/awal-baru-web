/**
 * Authenticated Layout Route
 *
 * This is a layout route that protects all child routes.
 * If the user is not authenticated, they will be redirected to the login page.
 *
 * All routes under src/routes/_authed/ will automatically require authentication.
 */

import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authed")({
	/**
	 * Check authentication before loading any child route
	 */
	beforeLoad: ({ context }) => {
		if (!context.user) {
			// Throw error to trigger errorComponent
			throw new Error("Not authenticated");
		}
	},

	/**
	 * Error component shown when authentication fails
	 */
	errorComponent: ({ error }) => {
		if (error.message === "Not authenticated") {
			return <LoginRedirect />;
		}
		// Re-throw other errors
		throw error;
	},

	/**
	 * The authenticated layout - just renders child routes
	 */
	component: AuthedLayout,
});

/**
 * Redirects to login page with return URL
 */
function LoginRedirect() {
	const navigate = useNavigate();

	useEffect(() => {
		// Get current path to redirect back after login
		const currentPath = window.location.pathname + window.location.search;

		navigate({
			to: "/masuk",
			search: { redirect: currentPath },
		});
	}, [navigate]);

	// Show loading state while redirecting
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="animate-pulse text-muted-foreground">
				Mengalihkan ke halaman login...
			</div>
		</div>
	);
}

/**
 * Authenticated layout component
 * Simply renders child routes - styling is handled by individual pages
 */
function AuthedLayout() {
	return <Outlet />;
}
