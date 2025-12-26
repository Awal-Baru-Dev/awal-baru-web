import { env } from "./env";

/**
 * Feature flags for AwalBaru.com
 *
 * These control which features are enabled/disabled at runtime.
 * Configure via environment variables.
 */
export const featureFlags = {
	/**
	 * Whether users must verify their email before logging in.
	 *
	 * - true (default): Users must verify email. Registration shows verification modal.
	 * - false: Users auto-login after registration. No verification required.
	 *
	 * IMPORTANT: When changing this, also update Supabase settings:
	 * Authentication → Settings → "Confirm email" must match.
	 */
	requireEmailVerification: env.VITE_REQUIRE_EMAIL_VERIFICATION,

	/**
	 * Whether to show devtools in development
	 */
	showDevtools: import.meta.env.DEV,

	/**
	 * Whether Sentry error tracking is enabled
	 */
	sentryEnabled: !!env.VITE_SENTRY_DSN,
} as const;

export type FeatureFlags = typeof featureFlags;
