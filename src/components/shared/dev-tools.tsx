import { lazy, Suspense } from "react";

/**
 * Lazy-loaded DevTools component
 *
 * This component only loads the devtools in development mode,
 * preventing them from being bundled in production and avoiding
 * SSR build warnings about unused imports.
 */

// Lazy load devtools only in development
const TanStackDevtoolsLazy = import.meta.env.DEV
	? lazy(() =>
			import("@tanstack/react-devtools").then((mod) => ({
				default: mod.TanStackDevtools,
			}))
		)
	: () => null;

const TanStackRouterDevtoolsPanelLazy = import.meta.env.DEV
	? lazy(() =>
			import("@tanstack/react-router-devtools").then((mod) => ({
				default: mod.TanStackRouterDevtoolsPanel,
			}))
		)
	: () => null;

const ReactQueryDevtoolsPanelLazy = import.meta.env.DEV
	? lazy(() =>
			import("@tanstack/react-query-devtools").then((mod) => ({
				default: mod.ReactQueryDevtoolsPanel,
			}))
		)
	: () => null;

export function DevTools() {
	// Don't render anything in production
	if (!import.meta.env.DEV) {
		return null;
	}

	return (
		<Suspense fallback={null}>
			<TanStackDevtoolsLazy
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "TanStack Router",
						render: (
							<Suspense fallback={null}>
								<TanStackRouterDevtoolsPanelLazy />
							</Suspense>
						),
					},
					{
						name: "TanStack Query",
						render: (
							<Suspense fallback={null}>
								<ReactQueryDevtoolsPanelLazy />
							</Suspense>
						),
					},
				]}
			/>
		</Suspense>
	);
}
