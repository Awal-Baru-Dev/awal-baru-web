/**
 * Logout Route
 *
 * Following TanStack Start pattern, logout is a route that calls the logoutFn
 * server function in its loader. The server function signs out and redirects to home.
 */

import { createFileRoute } from "@tanstack/react-router";
import { logoutFn } from "@/features/auth";

export const Route = createFileRoute("/logout")({
	// Disable preloading for logout route
	preload: false,
	// Call logoutFn which signs out and redirects to home
	loader: () => logoutFn(),
});
