# SBD — Simple Business Dashboard MVP

SBD is a static, no-backend MVP for small business owners to input simple numbers or upload CSV files and instantly view business dashboards.

## Run locally
1. Open `/workspace/Simple-Business-Dashboards/sbd/index.html` directly in your browser.
2. For best compatibility, run a static server:
   - `cd /workspace/Simple-Business-Dashboards/sbd`
   - `python3 -m http.server 8080`
   - Visit `http://localhost:8080`

## Pages
- `index.html` — Landing page
- `login.html` — Demo login
- `signup.html` — Demo signup
- `dashboard.html` — KPI dashboard + CSV upload + charts + table
- `templates.html` — Template gallery
- `pricing.html` — Plan cards
- `settings.html` — Profile + reset + future integrations

## Tech
- HTML, CSS, JavaScript
- Chart.js (CDN)
- localStorage for demo persistence

## CSV format
Use a CSV with this header:
`date,category,revenue,expense`

Example row:
`2026-04-24,Online Store,5500,2100`

## MVP notes
- Data is local only (browser localStorage)
- Auth is demo-only
- Built to be future-ready for Supabase, Stripe, and Vercel
