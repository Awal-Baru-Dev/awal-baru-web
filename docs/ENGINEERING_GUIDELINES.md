# Engineering Guidelines - AwalBaru.com

This document outlines the best practices, patterns, and conventions for developing AwalBaru.com. Reference this guide when implementing new features or debugging issues.

---

## Table of Contents

1. [Supabase & Authentication](#supabase--authentication)
2. [Navigation & Routing](#navigation--routing)
3. [State Management](#state-management)
4. [Performance Patterns](#performance-patterns)
5. [Component Patterns](#component-patterns)
6. [Error Handling](#error-handling)
7. [Security Considerations](#security-considerations)

---

## Supabase & Authentication

### Server-First Auth Pattern (Recommended)

We use TanStack Start's server-first approach for authentication. Auth happens server-side via cookies, not client-side listeners.

**Architecture:**
```
┌─────────────────────────────────────────────────────┐
│  __root.tsx                                         │
│     └── beforeLoad → fetchUser (createServerFn)    │
│            └── getSupabaseServerClient()           │
│            └── supabase.auth.getUser()             │
│                    ↓                                │
│               Server-side auth via cookies          │
│               User available in route context       │
└─────────────────────────────────────────────────────┘
```

**Key Files:**
- `src/features/auth/server.ts` - Server functions for auth operations
- `src/lib/db/supabase/server.ts` - Server-side Supabase client
- `src/routes/_authed.tsx` - Layout route for protected pages

**Benefits:**
- No intermittent hanging from client-side listeners
- Faster initial load (user fetched during route load)
- Better security (auth tokens in HTTP-only cookies)
- SSR-friendly (user available before render)

---

### CRITICAL: Dynamic Imports for Server Utilities

**DO:** Use dynamic imports for `@tanstack/react-start/server` inside handlers

```typescript
// src/lib/db/supabase/server.ts
export async function getSupabaseServerClient() {
  // Dynamic import prevents server code from bundling into client
  const { getCookies, setCookie } = await import("@tanstack/react-start/server");

  return createSupabaseServerClient(url, key, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookies) {
        for (const cookie of cookies) {
          setCookie(cookie.name, cookie.value);
        }
      },
    },
  });
}
```

**DON'T:** Use static imports at the top level

```typescript
// BAD - Causes Vite bundling error:
// "Failed to resolve import tanstack-start-injected-head-scripts:v"
import { getCookies, setCookie } from "@tanstack/react-start/server";

export function getSupabaseServerClient() {
  // ...
}
```

**Why:** Static imports of `@tanstack/react-start/server` at the module level cause Vite to try bundling server-only code into the client bundle, resulting in virtual module resolution errors.

**Reference:** https://github.com/TanStack/router/issues/3355

---

### Server Functions - Always Await getSupabaseServerClient

Since `getSupabaseServerClient()` is async (due to dynamic imports), always await it:

```typescript
export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient(); // Must await!
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    // ...
  });
```

---

### Protected Routes - Use Layout Routes

**DO:** Use the `_authed` layout route for protected pages

```typescript
// src/routes/_authed.tsx
export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw new Error("Not authenticated");
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === "Not authenticated") {
      return <LoginRedirect />;
    }
    throw error;
  },
  component: () => <Outlet />,
});

// Protected routes go under src/routes/_authed/
// e.g., src/routes/_authed/dashboard.tsx
```

**DON'T:** Use client-side ProtectedRoute wrapper components

```typescript
// DEPRECATED - Use _authed layout instead
<ProtectedRoute>
  <DashboardContent />
</ProtectedRoute>
```

---

### After Auth Actions - Invalidate Router

After login/signup, invalidate the router to refetch user in `beforeLoad`:

```typescript
const handleLogin = async (email: string, password: string) => {
  const result = await loginFn({ data: { email, password } });

  if (!result?.error) {
    await router.invalidate();  // Refetch user in beforeLoad
    router.navigate({ to: redirectUrl || "/dashboard" });
  }
};
```

---

### Client Initialization - Use Singleton Pattern (Browser Client)

For client-side operations (real-time, etc.), use the singleton client:

**DO:** Use the singleton client from `@/lib/db/client`

```typescript
import { createBrowserClient } from "@/lib/db/client";

const supabase = createBrowserClient(); // Returns cached instance
```

**DON'T:** Create new clients manually

```typescript
// BAD - Creates new instance every time
import { createBrowserClient } from "@supabase/ssr";
const supabase = createBrowserClient(url, key);
```

**Why:** Creating multiple client instances causes:
- Repeated initialization overhead
- Auth state not shared between instances
- Slower performance (10+ seconds vs instant)

---

### Initial Auth Check - Use `getSession()` Not `getUser()`

**DO:** Use `getSession()` for initial auth state

```typescript
// Fast - reads from localStorage (~50ms)
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user ?? null;
```

**DON'T:** Use `getUser()` for initial checks

```typescript
// Slow - always hits network (2-10+ seconds)
const { data: { user } } = await supabase.auth.getUser();
```

**When to use `getUser()`:**
- Before sensitive operations (payments, password changes)
- When you need guaranteed fresh data from the server
- Security-critical verification

```typescript
// Verify session before sensitive operation
const verifySession = async (): Promise<boolean> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return !error && !!user;
};

// Usage
const handlePayment = async () => {
  if (!await verifySession()) {
    toast.error("Session expired. Please login again.");
    navigate({ to: "/masuk" });
    return;
  }
  // Proceed with payment...
};
```

---

### Auth State Changes - Handle Events Properly

The `onAuthStateChange` listener fires multiple events. Handle them appropriately:

| Event | When it fires | What to do |
|-------|---------------|------------|
| `INITIAL_SESSION` | On first load | Usually skip (already handled by `getSession()`) |
| `SIGNED_IN` | User logs in | Update user state, fetch profile |
| `SIGNED_OUT` | User logs out | Clear all user state |
| `TOKEN_REFRESHED` | Token auto-refreshed | Usually no action needed |
| `USER_UPDATED` | User data changed (password, email) | Refresh user data |
| `PASSWORD_RECOVERY` | Password reset link clicked | Redirect to reset form |

**Example Implementation:**

```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  const user = session?.user ?? null;

  // Handle sign out
  if (event === "SIGNED_OUT" || !user) {
    setUser(null);
    setProfile(null);
    return;
  }

  // Handle sign in and user updates
  if (event === "SIGNED_IN" || event === "USER_UPDATED") {
    setUser(user);
    await fetchProfile(user.id);
  }

  // Handle password recovery
  if (event === "PASSWORD_RECOVERY") {
    navigate({ to: "/reset-password" });
  }
});
```

---

### Sign Out - Use Optimistic UI

**DO:** Update UI immediately, then call API

```typescript
const signOut = async () => {
  // 1. Optimistic update - instant UI feedback
  setUser(null);
  setProfile(null);

  // 2. Then call API in background
  try {
    await supabase.auth.signOut();
  } catch (error) {
    // Even if API fails, keep UI logged out
    // The session will be invalid anyway
    console.error("Sign out error:", error);
  }
};
```

**DON'T:** Wait for API before updating UI

```typescript
// BAD - User waits for network
const signOut = async () => {
  await supabase.auth.signOut(); // User waits here...
  setUser(null);
  setProfile(null);
};
```

---

### Cross-Device Session Invalidation

When a user changes their password on Device A, Device B may still have cached session.

**How it's handled automatically:**
1. Access tokens expire (~1 hour)
2. Supabase tries to refresh with refresh token
3. Refresh fails (password change invalidated old tokens)
4. `onAuthStateChange` fires `SIGNED_OUT`
5. User is logged out

**For high-security operations, verify explicitly:**

```typescript
const performSensitiveOperation = async () => {
  // Verify session is still valid
  const { error } = await supabase.auth.getUser();
  if (error) {
    toast.error("Session expired");
    await signOut();
    return;
  }

  // Proceed with operation...
};
```

---

## Navigation & Routing

### Use TanStack Router - Never `window.location.href`

**DO:** Use TanStack Router for navigation

```typescript
import { useNavigate, Link } from "@tanstack/react-router";

// In components
const navigate = useNavigate();
navigate({ to: "/dashboard" });

// For links
<Link to="/dashboard">Dashboard</Link>
```

**DON'T:** Use `window.location.href`

```typescript
// BAD - Causes full page reload
window.location.href = "/dashboard";
```

**Why `window.location.href` is bad:**
1. Full page reload (3-5 seconds)
2. All React state is lost
3. App re-initializes from scratch
4. Auth state must be re-fetched from network
5. Poor user experience

**Why TanStack Router is good:**
1. Instant SPA navigation (~50ms)
2. React state is preserved
3. No re-initialization
4. Smooth transitions
5. Better UX

---

### Redirect After Auth Actions

```typescript
// In useAuth hook
const signIn = async (data: LoginFormData) => {
  const { error } = await supabase.auth.signInWithPassword(data);

  if (!error) {
    // Use router navigation
    navigate({ to: options.redirectTo || "/dashboard" });
  }
};
```

---

### Protected Routes

Use the `ProtectedRoute` component for auth-required pages:

```typescript
// In route file
import { ProtectedRoute } from "@/components/auth";

function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

---

## State Management

### Prevent Duplicate API Calls with Refs

**DO:** Use refs to deduplicate concurrent calls

```typescript
const fetchRef = useRef<string | null>(null);

const fetchData = async (id: string) => {
  // Skip if already fetching this ID
  if (fetchRef.current === id) {
    return;
  }

  fetchRef.current = id;

  try {
    const data = await api.fetch(id);
    setData(data);
  } finally {
    // Reset after delay to allow legitimate re-fetches
    setTimeout(() => {
      if (fetchRef.current === id) {
        fetchRef.current = null;
      }
    }, 1000);
  }
};
```

**Why:** Auth state changes can fire multiple events rapidly, causing duplicate fetches.

---

### Handle Component Unmounting

**DO:** Track mounted state to prevent state updates on unmounted components

```typescript
useEffect(() => {
  const isMounted = { current: true };

  const fetchData = async () => {
    const data = await api.fetch();

    // Only update if still mounted
    if (isMounted.current) {
      setData(data);
    }
  };

  fetchData();

  return () => {
    isMounted.current = false;
  };
}, []);
```

---

### Context vs Local State

| Use Context For | Use Local State For |
|-----------------|---------------------|
| Auth state (user, profile) | Form inputs |
| Theme preferences | UI toggles (modals, dropdowns) |
| Global app settings | Component-specific data |
| Data shared across routes | Temporary/transient state |

---

## Performance Patterns

### Optimistic UI Updates

Update UI immediately, then sync with server:

```typescript
// Good - Instant feedback
const handleLike = async (postId: string) => {
  // 1. Update UI immediately
  setLiked(true);
  setLikeCount(prev => prev + 1);

  // 2. Sync with server
  try {
    await api.likePost(postId);
  } catch (error) {
    // 3. Rollback on failure
    setLiked(false);
    setLikeCount(prev => prev - 1);
    toast.error("Failed to like post");
  }
};
```

---

### Lazy Loading Routes

TanStack Router automatically code-splits routes. Each route is loaded only when needed.

```typescript
// Routes are automatically lazy-loaded
export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});
```

---

### Avoid Unnecessary Re-renders

**DO:** Use `useCallback` for functions passed to children

```typescript
const handleClick = useCallback(() => {
  // handle click
}, [dependencies]);

return <Button onClick={handleClick} />;
```

**DO:** Use `useMemo` for expensive computations

```typescript
const filteredItems = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);
```

---

## Component Patterns

### Form Validation with Zod

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

// Validate
try {
  schema.parse(formData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
  }
}
```

---

### Toast Notifications

Use Sonner for consistent toast notifications:

```typescript
import { toast } from "sonner";

// Success
toast.success("Berhasil!", {
  description: "Data telah disimpan.",
});

// Error
toast.error("Gagal", {
  description: "Terjadi kesalahan.",
});

// With action
toast.warning("Email belum diverifikasi", {
  action: {
    label: "Kirim Ulang",
    onClick: () => resendVerification(),
  },
});
```

---

### Loading States

Always show loading feedback:

```typescript
function MyComponent() {
  const { isLoading } = useQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <Content />;
}
```

For buttons:

```typescript
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Memproses...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

---

## Error Handling

### Auth Errors

Use the centralized error handler:

```typescript
import { getAuthErrorMessage, isAuthError } from "@/lib/auth/errors";

try {
  await supabase.auth.signIn(credentials);
} catch (error) {
  const { title, message } = getAuthErrorMessage(error);

  // Special handling for specific errors
  if (isAuthError(error, "email_not_confirmed")) {
    // Show resend verification option
  }

  toast.error(title, { description: message });
}
```

---

### API Errors

```typescript
try {
  const { data, error } = await supabase
    .from("table")
    .select("*");

  if (error) throw error;

  return data;
} catch (error) {
  console.error("API Error:", error);
  toast.error("Gagal memuat data");
  return null;
}
```

---

## Security Considerations

### Never Trust Client-Side Data

Always validate on the server. Client-side validation is for UX only.

### Protect Sensitive Operations

Before sensitive operations, verify the session:

```typescript
const handleDeleteAccount = async () => {
  // 1. Verify session is valid
  const { error } = await supabase.auth.getUser();
  if (error) {
    toast.error("Please login again");
    return;
  }

  // 2. Require password confirmation
  const confirmed = await confirmPassword();
  if (!confirmed) return;

  // 3. Proceed with deletion
  await deleteAccount();
};
```

### Environment Variables

- Never commit `.env` files
- Use `VITE_` prefix for client-side variables
- Keep sensitive keys server-side only

```
# .env
VITE_SUPABASE_URL=...        # OK - public
VITE_SUPABASE_ANON_KEY=...   # OK - public (anon key)
SUPABASE_SERVICE_KEY=...      # Server only - never expose
```

---

## Quick Reference

### Auth Performance Checklist

- [ ] Using server-first auth pattern (not client-side listeners)
- [ ] Using dynamic imports for `@tanstack/react-start/server` utilities
- [ ] Awaiting `getSupabaseServerClient()` in all server functions
- [ ] Using `_authed` layout route for protected pages
- [ ] Calling `router.invalidate()` after auth actions
- [ ] Using singleton browser client for client-side operations

### Navigation Checklist

- [ ] Using `useNavigate()` from TanStack Router
- [ ] Using `<Link>` component for links
- [ ] Never using `window.location.href`
- [ ] Protected routes under `_authed` layout (not ProtectedRoute wrapper)

### State Management Checklist

- [ ] Using refs to prevent duplicate fetches
- [ ] Checking mounted state before state updates
- [ ] Using Context for global state
- [ ] Using local state for component-specific data

---

## File Structure Reference

```
src/
├── components/
│   ├── auth/          # Auth UI components (forms, etc.)
│   ├── layout/        # Layout components
│   ├── shared/        # Shared/reusable components
│   └── ui/            # UI primitives (shadcn)
├── contexts/
│   ├── theme-context.tsx
│   └── user-context.tsx  # Simplified - uses route context
├── features/
│   └── auth/
│       └── server.ts  # Auth server functions (loginFn, signupFn, etc.)
├── lib/
│   ├── auth/          # Auth utilities (error handling)
│   ├── config/        # App configuration
│   ├── db/
│   │   ├── supabase/
│   │   │   ├── client.ts   # Browser client (singleton)
│   │   │   └── server.ts   # Server client (async, uses dynamic imports)
│   │   └── types.ts        # Database types
│   └── validations/   # Zod schemas
└── routes/
    ├── __root.tsx     # Root route with beforeLoad → fetchUser
    ├── _authed.tsx    # Layout route for protected pages
    ├── _authed/       # Protected routes (dashboard, etc.)
    ├── masuk.tsx      # Login page
    ├── daftar.tsx     # Registration page
    └── auth/
        └── callback.tsx  # OAuth/email verification callback
```

---

*Last updated: December 2024*
