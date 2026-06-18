# SBD Pro - Full Repository Audit & Production-Readiness Assessment

## Current State Report

The "SBD Pro" repository is in a transitional state between two frameworks. Originally, it appears to have been built as a standard Create React App (CRA) using `react-scripts`. However, there is currently a significant and parallel Next.js App Router structure (`app/`, `components/`, `lib/`) injected into the repository. Because of this, the project builds successfully using `npm run build` (CRA), but fails when attempting to build the Next.js application due to missing core dependencies (e.g., `next`).

This hybrid architecture causes duplicated logic, fragmented design systems (Tailwind vs inline styled components), and confusing authentication flows.

### 1. Architecture Review
* **Issue:** Mixed framework environments. `package.json` configures a CRA build (`react-scripts`), but the repository contains Next.js specific files like `next.config.ts`, `app/` routing directory, and `components/ui/` built with server-side capabilities in mind (`"use client"`).
* **Result:** The Next.js side of the application cannot run because the `next` dependency is completely missing from `package.json`.

### 2. Build Health Review
* **CRA Build:** Succeeds and outputs a production build to `build/`.
* **Next.js Build:** Fails. Running `npx next build` crashes immediately because the `next` module is not installed.
* **Vercel API routes:** `api/claude.js` is set up to run as a serverless function on Vercel, handling the API requests securely.

### 3. Security Review
* **Supabase:** RLS policies are enabled on all major tables (`profiles`, `businesses`, `metrics`, etc.). Policies accurately restrict users to their own data.
* **Environment Variables:** Handled correctly. `api/claude.js` strictly requires `ANTHROPIC_API_KEY` on the server and `src/supabase.js` uses generic fallback URLs if env vars are missing. However, `.env` loading might be inconsistent between the CRA client and Next.js client (`REACT_APP_` vs `NEXT_PUBLIC_`).

### 4. Supabase Review
* The schema (`schema.sql` and `supabase/schema.sql`) correctly defines standard structures. The `supabase/schema.sql` seems to represent a more advanced, relational setup tailored for the Next.js application, while the root `schema.sql` represents the older CRA layout. This dual-schema setup is confusing and likely leads to broken data mapping.

### 5. Authentication Review
* **CRA (`src/AuthContext.js`):** Fully functional. Uses `supabase.auth` and properly manages user sessions, profiles, and 24-hour trials.
* **Next.js (`lib/data.ts`):** Implements redundant fetching logic (`getSessionUser`), entirely separate from `AuthContext.js`.

### 6. Trial/Subscription Review
* Trial logic is enforced via `trial_ends` timestamp calculation in `AuthContext.js`.
* *Discrepancy:* Project memory states a "5-Day Free Trial", but the code (`AuthContext.js` and `schema.sql` triggers) explicitly calculates and defaults to a 24-hour trial.

### 7. Stripe Review
* There is no Stripe integration or mention of Stripe in the current codebase, aside from the provided external Stripe Payment Link in project memory.

### 8. Admin Access Review
* Admin bypass is functional in `src/AuthContext.js` via `profile?.is_admin === true`.
* *Discrepancy:* The requested fallback logic for `email === "lumen-bridge@outlook.com"` is missing entirely from `AuthContext.js`.

### 9. AI Integration Review
* `api/claude.js` handles both free-text extraction and chat completions securely using Anthropic's Claude 3.5 Sonnet. The system prompt is well-configured according to constraints.

### 10. UX Review
* **CRA Side:** Uses a massive inline `<Style />` component in `src/App.jsx`. Typography constraints (Playfair Display and Figtree) are met.
* **Next.js Side:** Uses Tailwind CSS. Typography fonts (Playfair Display and Figtree) are *not* imported or applied in `app/layout.tsx` or `app/globals.css`.

### 11. Mobile Review
* Mobile responsiveness is explicitly handled in both the CRA inline styles (via media queries) and the Next.js components (via Tailwind `hidden lg:block` utilities).

### 12. Performance Review
* The application is relatively lightweight, but the duplication of logic (API calls, contexts, layouts) will cause severe maintenance overhead.

---

## Critical Issues

1. **Framework Conflict:** The repository is split between Create React App and Next.js. `package.json` does not include Next.js dependencies, making the `app/` and `components/` directories completely unusable.
2. **Dual Database Schemas:** Two conflicting schemas (`schema.sql` and `supabase/schema.sql`) define different table structures. For example, the Next.js side expects `businesses` and `metrics`, while the CRA side expects `finance`, `projects`, etc.

## High Priority Issues

1. **Admin Fallback Logic:** `AuthContext.js` lacks the instructed hardcoded admin bypass for `lumen-bridge@outlook.com`.
2. **Trial Duration Discrepancy:** The database triggers and frontend logic calculate a 24-hour trial, conflicting with the "5-Day Free Trial" requirement.
3. **Missing Typography in Next.js:** If moving to Next.js, `app/layout.tsx` lacks the required Playfair Display and Figtree font imports.

## Medium Priority Issues

1. **Environment Variable Naming:** CRA expects `REACT_APP_` prefixes while the Next.js files (like `lib/supabase.ts`) expect `NEXT_PUBLIC_`.
2. **Stripe Integration:** The Stripe payment flow does not exist in the app; users cannot upgrade their subscription after the trial expires without manual intervention.

## Low Priority Issues

1. **UI Duplication:** `src/App.jsx` and `app/page.tsx` serve identical purposes but use entirely different design systems (inline CSS vs Tailwind/shadcn).

---

## Recommended Roadmap

### Phase 1: Architecture Consolidation (Immediate)
* Decide on a single framework. Given the presence of serverless architecture needs, standardizing entirely on **Next.js App Router** is recommended.
* Install `next`, `react`, `react-dom` appropriately.
* Remove `react-scripts` and the CRA configuration.
* Merge the two `schema.sql` files into a single source of truth and run migrations.

### Phase 2: Feature Alignment
* Update the trial duration logic in Supabase triggers and `AuthContext.js` / `lib/data.ts` to reflect the 5-day trial.
* Implement the `lumen-bridge@outlook.com` admin fallback.
* Fix Next.js font imports in `app/layout.tsx`.

### Phase 3: Cleanup & Refactor
* Delete the unused CRA source files (`src/App.jsx`, `src/index.js`, etc.) if moving to Next.js.
* Standardize on Tailwind CSS and shadcn/ui components across the board.
* Implement Stripe checkout routing.