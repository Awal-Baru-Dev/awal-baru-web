import { createFileRoute, redirect } from "@tanstack/react-router";
import { exchangeCodeForSessionFn } from "@/features/auth/server";

type CallbackSearchParams = {
  code?: string;
  next?: string;
  error_description?: string;
};

export const Route = createFileRoute("/auth/callback")({
  component: () => null,

  validateSearch: (search: Record<string, unknown>): CallbackSearchParams => {
    return {
      code: typeof search.code === "string" ? search.code : undefined,
      next: typeof search.next === "string" ? search.next : "/dashboard",
      error_description:
        typeof search.error_description === "string"
          ? search.error_description
          : undefined,
    };
  },

  loaderDeps: ({ search: { code, next, error_description } }) => ({
    code,
    next,
    error_description,
  }),

  loader: async ({ deps }) => {
    const { code, next, error_description } = deps;

    if (error_description) {
      console.error("Auth Callback Error:", error_description);
      throw redirect({
        to: "/masuk",
        search: { error: error_description },
      });
    }

    if (code) {
      const result = await exchangeCodeForSessionFn({ data: { code } });

      if (result.error) {
        console.error("Exchange Code Error:", result.message);
        throw redirect({
          to: "/masuk",
          search: {
            error: "Gagal memproses sesi login. Silakan coba lagi.",
          },
        });
      }
    }

    throw redirect({ to: next });
  },
});
