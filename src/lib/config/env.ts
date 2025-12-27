import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		// Supabase (server-side only)
		SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

		// DOKU Payment Gateway (server-side secrets)
		DOKU_CLIENT_ID: z.string().min(1).optional(),
		DOKU_SECRET_KEY: z.string().min(1).optional(),

		// Server URL (for callbacks)
		SERVER_URL: z.string().url().optional(),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: "VITE_",

	client: {
		// App
		VITE_APP_TITLE: z.string().min(1).default("AwalBaru.com"),
		VITE_APP_URL: z.string().url().optional(),

		// Supabase
		VITE_SUPABASE_URL: z.string().url().optional(),
		VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),

		// Sentry
		VITE_SENTRY_DSN: z.string().url().optional(),

		// DOKU environment (sandbox/production) - used for both client JS and server API
		VITE_DOKU_ENVIRONMENT: z
			.enum(["sandbox", "production"])
			.default("sandbox")
			.optional(),

		// Feature Flags
		VITE_REQUIRE_EMAIL_VERIFICATION: z
			.string()
			.default("true")
			.transform((val) => val !== "false"),
	},

	/**
	 * What object holds the environment variables at runtime.
	 *
	 * Server variables come from process.env (not exposed to client bundle).
	 * Client variables (VITE_*) come from import.meta.env (available everywhere).
	 */
	runtimeEnv: {
		// Server-only variables from process.env
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
		DOKU_CLIENT_ID: process.env.DOKU_CLIENT_ID,
		DOKU_SECRET_KEY: process.env.DOKU_SECRET_KEY,
		SERVER_URL: process.env.SERVER_URL,

		// Client variables from import.meta.env (also available on server)
		VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
		VITE_APP_URL: import.meta.env.VITE_APP_URL,
		VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
		VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
		VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
		VITE_DOKU_ENVIRONMENT: import.meta.env.VITE_DOKU_ENVIRONMENT,
		VITE_REQUIRE_EMAIL_VERIFICATION:
			import.meta.env.VITE_REQUIRE_EMAIL_VERIFICATION,
	},

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,

	/**
	 * Skip validation in certain environments
	 */
	skipValidation:
		!!import.meta.env.SKIP_ENV_VALIDATION ||
		import.meta.env.NODE_ENV === "test",
});
