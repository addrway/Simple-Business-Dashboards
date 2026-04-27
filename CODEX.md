# CODEX.md

## SBD Product Vision

SBD — Simple Business Dashboard — is a production SaaS app for everyday business users who need beautiful dashboards without technical complexity.

The product is built for mom-and-pop shops, small businesses, online sellers, logistics teams, retail operators, and non-technical users who want to enter simple numbers and immediately understand what is happening in their business.

SBD must feel clear, calm, premium, and useful. Users should never feel like they need to understand databases, analytics tools, formulas, or dashboard software to get value.

## Tech Stack

Build SBD with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style reusable components
- Recharts
- TanStack Table
- Supabase for authentication and database
- Vercel-ready deployment configuration

## Data Rules

- Do not use `localStorage` for business-critical data.
- Supabase is the source of truth for customer, business, dashboard, metric, and chart data.
- Use environment variables for service URLs and keys.
- Do not hardcode secrets, tokens, service keys, or customer-specific credentials.
- Always protect customer data with appropriate auth checks, ownership checks, and Supabase row-level security assumptions.

## UX Rules

- UI must be simple enough for non-technical users.
- Dashboards must look premium, modern, polished, and clean.
- Prefer clear labels, obvious actions, and friendly workflows over technical language.
- Keep screens focused. Do not overload users with configuration.
- Data entry should feel fast and lightweight.
- Charts should explain business meaning, not just display numbers.

## Engineering Rules

- Build all features in small phases.
- Keep the codebase Vercel-ready at all times.
- Always use reusable components for shared UI and dashboard patterns.
- Prefer simple, maintainable architecture over premature abstraction.
- Keep business logic, Supabase access, and presentation components organized clearly.
- Do not introduce payments, Stripe, DigitalOcean, or extra infrastructure until explicitly requested.

## Product Boundaries

Phase work should stay focused on the current SBD goal:

- Auth
- Business profiles
- Dashboard type selection
- Simple metric entry
- Supabase-backed dashboards
- Premium chart views
- Settings and admin basics

Do not expand into billing, marketplace features, complex integrations, or unrelated infrastructure unless requested.
