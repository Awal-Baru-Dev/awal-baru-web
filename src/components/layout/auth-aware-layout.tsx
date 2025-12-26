import { useUser } from "@/contexts/user-context";
import { DashboardLayout } from "./dashboard-layout";
import { LandingHeader } from "./landing-header";
import { LandingFooter } from "./landing-footer";

interface AuthAwareLayoutProps {
	children: React.ReactNode;
	/**
	 * Content to show before the main content (e.g., hero sections)
	 * This renders full-width in both layouts
	 */
	heroSection?: React.ReactNode;
	/**
	 * Whether to show footer when not authenticated
	 * @default true
	 */
	showFooter?: boolean;
}

/**
 * Layout component that adapts based on authentication state:
 * - Authenticated: Renders DashboardLayout with sidebar
 * - Not authenticated: Renders LandingHeader + content + LandingFooter
 */
export function AuthAwareLayout({
	children,
	heroSection,
	showFooter = true,
}: AuthAwareLayoutProps) {
	const { isAuthenticated } = useUser();

	if (isAuthenticated) {
		return (
			<DashboardLayout>
				{heroSection}
				<div className="p-4 lg:p-8">{children}</div>
			</DashboardLayout>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<LandingHeader />
			<main className="pt-24">
				{heroSection}
				{children}
			</main>
			{showFooter && <LandingFooter />}
		</div>
	);
}
