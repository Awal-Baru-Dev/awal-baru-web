import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		// Supabase (server-side only)
		SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

		// DOKU Payment Gateway
		DOKU_CLIENT_ID: z.string().min(1).optional(),
		DOKU_SECRET_KEY: z.string().min(1).optional(),
		DOKU_ENVIRONMENT: z
			.enum(["sandbox", "production"])
			.default("sandbox")
			.optional(),

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

		// DOKU (client-side environment for JS loading)
		VITE_DOKU_ENVIRONMENT: z
			.enum(["sandbox", "production"])
			.default("sandbox")
			.optional(),

		// Feature Flags
		VITE_REQUIRE_EMAIL_VERIFICATION: z
			.string()
			.transform((val) => val !== "false")
			.default("true"),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: import.meta.env,

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
