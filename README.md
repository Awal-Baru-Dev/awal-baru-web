# 🎓 AwalBaru.com - Premium E-Learning & Course Platform

Welcome to the **AwalBaru** repository! This is a complete, modern e-learning platform built for high performance, secure payments, and seamless video streaming. 

This repository powers the entire frontend, backend routing, protected payment flows, and the administrative dashboard. 

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [TanStack Start](https://tanstack.com/start/latest) (React Server Components, SSR, File-based Routing)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Storage)
- **Payment Gateway**: [DOKU](https://doku.com/) (Virtual Accounts, QRIS, E-Wallets)
- **Video CDN**: [Bunny.net](https://bunny.net/) (Edge Delivery & Token Authentication)
- **Linting/Formatting**: [Biome](https://biomejs.dev/)
- **Deployment**: [Netlify](https://www.netlify.com/)

---

## 🚀 Local Development Setup

### 1. Prerequisites
Ensure you have the following installed:
- `Node.js` (v20+ recommended)
- `pnpm` (Package Manager)
- `Supabase CLI` (`npm install -g supabase`)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase & DOKU keys:
```bash
VITE_PUBLIC_SUPABASE_URL=...
VITE_PUBLIC_SUPABASE_ANON_KEY=...
DOKU_CLIENT_ID=...
DOKU_SECRET_KEY=...
```

### 4. Running the App locally
```bash
pnpm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🗄️ Database & Supabase Guide

This project relies heavily on PostgreSQL features such as Views, Triggers, and RLS (Row Level Security).

### Syncing with the Cloud
If you make changes to your tables on the Supabase Dashboard, you can pull them down locally to keep your project updated:
```bash
npx supabase db pull
```
*(Note: If you encounter a `history does not match` error, back up your local `supabase/migrations/` folder, clear it, and run the pull command again to snag a completely fresh snapshot!)*

### Generating Seed Data Safely
To populate your local environment with true courses (but without downloading actual user/payment data), we utilize a pruning script:
1. Run a full data dump: `npx supabase db dump --data-only > supabase/seed.sql`
2. Run the prune script: `node prune-seed.mjs`
This will parse the massive dump, grab *only* the `courses` mock data, and neatly save it to `supabase/seed/001_seed_courses.sql`.

---

## 💳 Payment Flow (DOKU Webhooks)

AwalBaru's transactions are asynchronous. When a user checks out, an enrollment record is created with `payment_status: 'pending'` and `amount_paid: 0`.

The system relies strictly on **DOKU Webhooks** to finalize enrollment:
1. **Endpoint**: `POST /api/doku/notification` (Must be configured inside the DOKU Dashboard).
2. **Success**: If DOKU pushes a `SUCCESS` status, the Database is updated to `'paid'`, and the content is instantly unlocked. (Users *cannot* access the course with a pending status).
3. **Expired**: If the transaction times out, the `payment_status` flips to `'expired'`.

### 🛡️ Admin Dashboard Safeguards
There are custom PostgreSQL Views built specifically to safeguard the Admin Dashboard metrics:
- **`admin_course_list_view`**: Heavily modified via SQL to ensure "Total Students" and "Total Sales" only sum up enrollments where `payment_status = 'paid'`. Pending Checkouts purposely do not inflate your sales numbers.
- **`admin_transactions_view`**: If DOKU completely fails to send an expiration webhook, the React Frontend intercepts stuck transactions automatically using the `expires_at` column, forcing them to display as `Kedaluwarsa` (Expired) once the time passes.

---

## 🎥 Secure Video Streaming (Bunny.net)

To protect your premium course content from piracy and illegal downloading, the platform utilizes a two-tier video architecture backed by Bunny.net Stream:

1. **Preview/Trailer Videos**: 
   These are public marketing videos served directly via your configured **Bunny Pull Zone** (e.g., `https://{PULL_ZONE}/{previewVideoId}/play_720p.mp4`).
2. **Premium Course Videos**: 
   When a user clicks 'Play' inside a paid course, the React frontend calls a **Supabase Edge Function** (`/functions/v1/bunny-signed-url`). This function actively generates a cryptographically signed, expiring token for the Bunny API. The video is instantly disabled if the link is shared with a non-paying user. 

*(Make sure your `VITE_BUNNY_PULL_ZONE_URL` and library IDs are properly defined in Netlify).*

---

## 🏗️ Building for Production (Netlify)

The `vite target` is optimized explicitly for serverless deployment on Netlify.

- **To compile:**
  ```bash
  pnpm run build
  ```
  *Note: The SSR entry point will bundle directly into the `.netlify/v1/functions/` folder. This means you cannot test the production build using a standard Node server.*

- **To test the production build locally:**
  You must use the Netlify CLI:
  ```bash
  npx netlify dev
  ```

### ⚠️ Strict Linting
This project enforces strict React hooks checking via **Biome**. Before pushing to production, verify your code by running:
```bash
pnpm run check
```
AwalBaru strictly enforces that Hooks (`useEffect`, `useState`, etc.) cannot be conditionally skipped or placed below early `return` statements, as it will crash the React tree.

---

*For support, open an Issue or PR in the repository.*
