import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

import * as Sentry from "@sentry/tanstackstart-react";

import { env } from "@/lib/config/env";
import { featureFlags } from "@/lib/config/features";
import { RouteLoadingIndicator } from "@/components/shared";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
	const rqContext = TanstackQuery.getContext();

	const router = createRouter({
		routeTree,
		context: {
			...rqContext,
			// User is set dynamically by beforeLoad in __root.tsx
			// This is a placeholder that gets overwritten on each navigation
			user: null,
		},

		defaultPreload: "intent",

		// Route loading indicator configuration
		defaultPendingComponent: RouteLoadingIndicator,
		defaultPendingMs: 0, // Show immediately when navigation starts
		defaultPendingMinMs: 400, // Minimum 400ms display to prevent flash
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient: rqContext.queryClient,
	});

	// Initialize Sentry on client-side only
	if (!router.isServer && featureFlags.sentryEnabled) {
		Sentry.init({
			dsn: env.VITE_SENTRY_DSN,
			integrations: [],
			tracesSampleRate: 1.0,
			sendDefaultPii: true,
		});
	}

	return router;
};
