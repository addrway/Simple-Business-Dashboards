# Codex Guide for SBD

You are working on SBD Pro, the Simple Business Dashboards SaaS app.

Core message:
"Enter your data. See your business clearly."

## Product Direction

SBD is a simple SaaS dashboard for small business owners, logistics teams, managers, and consultants. Keep every change practical, clean, and beginner-friendly.

Do not turn SBD into a complex BI platform. Prioritize:
- Dashboard snapshots
- Projects and tasks
- Finance tracking
- CSV uploads
- Inventory, customers, reports, invoices, receipts, payroll, contractors, and time tracking scaffolds
- Admin command center access for admin users only

## Technical Stack

- React with Create React App
- Plain JavaScript and JSX only
- Supabase Auth and Postgres
- Pure `fetch` Supabase client in `src/supabase.js`
- Chart.js and `react-chartjs-2`
- PapaParse for CSV upload
- Vercel hosting

## Design System

Preserve the existing SBD design:
- Background: `#f5f4f0`
- Sidebar: `#0f0f14`
- Accent blue: `#1a56db`
- Teal green: `#0d9488`
- Fonts: Figtree body, Playfair Display headings
- Clean cards, soft borders, simple KPI cards, readable tables

## Security Rules

- Never hardcode service-role keys.
- Never store passwords in code or docs.
- Never call AI providers directly from frontend code.
- Use Supabase RLS and `auth.uid()` ownership rules.
- Keep admin access gated by `profiles.role = 'admin'` or an equivalent admin profile field already present in the schema.

## Vercel Deployment

The app is configured for Vercel with `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Required Vercel environment variables:

```env
REACT_APP_SUPABASE_URL=https://cfzlglnnqyetjtbtixlx.supabase.co
REACT_APP_SUPABASE_KEY=sb_publishable_ihmJz3DWT4_wcGxKNYr9qg_RE-MC0fq
ANTHROPIC_API_KEY=your-server-side-anthropic-key
```

## Verification

Before finishing a Codex task:
- Check changed files with `git diff`.
- Run `node -c api/claude.js` when the API route changes.
- Run `npm run build` when npm is available.
- Verify the Vercel URL returns HTTP 200 after deployment.
- Mention any verification that could not run locally.

## Related AI System Files

- `CLAUDE.md`
- `.cursor/rules/sbd-engineering-rules.mdc`
- `prompts/SBD_Codex_Master_Prompt.md`
- `agents/SBD_Agent_Roles.md`
