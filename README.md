# AI Team Workspace

Repository target: `https://github.com/addrway/Triangle`

AI Team Workspace is a full-stack SaaS app where ChatGPT and Claude collaborate on user tasks. It is intentionally **not** a basic chatbot: each AI has a role, a step in the workflow, and a visible output card.

## Product flow

1. A user signs up or logs in with Supabase Auth.
2. The user creates a project.
3. The user opens AI Team Workspace, enters a task, and selects a mode:
   - Build Product
   - Write Copy
   - Create Code
   - Research
   - Improve Prompt
   - Create Dashboard
   - Audit Website
4. The server sends the task to ChatGPT as **Strategist/Builder**.
5. The server sends the original task plus ChatGPT output to Claude as **Critic/Refiner**.
6. The server sends the original task, ChatGPT draft, and Claude review back to ChatGPT for **Final Synthesis**.
7. The UI displays three cards:
   - ChatGPT Draft
   - Claude Review
   - Final Combined Output
8. The final output can be saved to the project record, and the prompt can be saved to Prompt Lab.

## Full file structure

```txt
app/
  api/
    ai/
      claude/route.ts
      openai/route.ts
      team-task/route.ts
    projects/create/route.ts
    prompts/save/route.ts
    tasks/history/route.ts
  (dashboard)/
    admin/page.tsx
    dashboard/page.tsx
    prompt-lab/page.tsx
    projects/page.tsx
    saved-prompts/page.tsx
    settings/page.tsx
    task-history/page.tsx
    workspace/page.tsx
  login/page.tsx
  signup/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  ai/PromptLab.tsx
  ai/TeamWorkspace.tsx
  auth/AuthForm.tsx
  dashboard/AppSidebar.tsx
  dashboard/TopNav.tsx
  ui/*
lib/
  ai-team.ts
  server-supabase.ts
  supabase.ts
  utils.ts
supabase/
  schema.sql
```

## Database

Run `supabase/schema.sql` in the Supabase SQL editor. It creates:

- `profiles`
- `projects`
- `ai_tasks`
- `ai_task_steps`
- `saved_prompts`
- `prompt_tests`
- `usage_logs`

The schema enables Row Level Security and creates policies so users can only see their own projects, prompts, tasks, task steps, prompt tests, and usage logs. Admin access is supported through `profiles.role = 'admin'`.

## Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_MODEL=gpt-4.1-mini
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

Security notes:

- `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are never referenced by client components.
- All AI calls happen in server route handlers.
- Client calls send the Supabase access token to API routes.
- API routes verify the user before reading or writing Supabase rows.
- The app does not use `localStorage` for business-critical data.

## API routes

- `POST /api/ai/team-task` — runs the full ChatGPT → Claude → ChatGPT teamwork workflow and stores task + step rows.
- `POST /api/ai/openai` — tests a prompt with the OpenAI Responses API.
- `POST /api/ai/claude` — tests a prompt with the Anthropic Claude Messages API.
- `POST /api/prompts/save` — saves Prompt Lab prompts and best versions.
- `POST /api/projects/create` — creates a user-scoped project.
- `GET /api/tasks/history` — returns the signed-in user's recent task history.

## Local setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## GitHub target repository

This codebase is prepared for the `addrway/Triangle` repository. If the checkout does not already have that remote, add it with:

```bash
git remote add origin https://github.com/addrway/Triangle.git
git push -u origin HEAD
```

## Vercel deployment

1. Push this repository to `https://github.com/addrway/Triangle`.
2. Import `addrway/Triangle` into Vercel.
3. Add all environment variables listed above in **Project Settings → Environment Variables**.
4. Run `supabase/schema.sql` in Supabase before the first production test.
5. Deploy.

## Build checks

```bash
npm run typecheck
npm run build
```
