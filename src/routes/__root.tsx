import {
	HeadContent,
	Outlet,
	Scripts,
	Link,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { Home, ArrowLeft } from "lucide-react";

import { ThemeProvider, themeScript } from "@/contexts/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { DevTools } from "@/components/shared/dev-tools";
import { fetchUser, type AuthUser } from "@/features/auth";

import appCss from "@/styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

/**
 * Router context type
 *
 * - queryClient: TanStack Query client for data fetching
 * - user: Current authenticated user (null if not logged in)
 */
interface MyRouterContext {
	queryClient: QueryClient;
	user: AuthUser | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	/**
	 * beforeLoad runs on every navigation (server-side on initial load, client-side on navigation)
	 * Fetches the current user from Supabase via server function
	 */
	beforeLoad: async () => {
		const user = await fetchUser();
		return { user };
	},

	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "AwalBaru.com - Wujudkan Impian Amerikamu",
			},
			{
				name: "description",
				content:
					"Platform pembelajaran online untuk membantu orang Indonesia meraih American Dream. Pelajari DV Lottery, visa, dan cara sukses di Amerika.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/jpeg",
				href: "/awalbaru-logo.jpeg",
			},
			{
				rel: "apple-touch-icon",
				href: "/awalbaru-logo.jpeg",
			},
		],
		scripts: [
			{
				// Prevent flash of wrong theme
				children: themeScript,
			},
		],
	}),

	component: RootComponent,
	notFoundComponent: NotFoundComponent,
});

function RootComponent() {
	return (
		<html lang="id" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider>
					<Outlet />
					<Toaster richColors closeButton position="top-right" />
					<DevTools />
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}

function NotFoundComponent() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-primary/5 to-background flex items-center justify-center px-6">
			<div className="text-center max-w-md">
				<h1 className="text-9xl font-bold text-brand-primary/20">404</h1>
				<h2 className="text-2xl font-bold text-foreground mt-4 mb-2">
					Halaman Tidak Ditemukan
				</h2>
				<p className="text-muted-foreground mb-8">
					Maaf, halaman yang kamu cari tidak ada atau telah dipindahkan.
				</p>
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button asChild>
						<Link to="/">
							<Home className="w-4 h-4 mr-2" />
							Ke Beranda
						</Link>
					</Button>
					<Button variant="outline" onClick={() => window.history.back()}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Kembali
					</Button>
				</div>
			</div>
		</div>
	);
}
