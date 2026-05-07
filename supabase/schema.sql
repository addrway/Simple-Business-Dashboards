create extension if not exists "pgcrypto";

do $$ begin create type user_role as enum ('user', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type ai_task_status as enum ('queued', 'running', 'completed', 'failed'); exception when duplicate_object then null; end $$;
do $$ begin create type task_mode as enum ('Build Product', 'Write Copy', 'Create Code', 'Research', 'Improve Prompt', 'Create Dashboard', 'Audit Website'); exception when duplicate_object then null; end $$;
do $$ begin create type prompt_category as enum ('SBD', 'Addrway', 'Marketing', 'Coding', 'Product Design', 'Research', 'Sales Copy'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  original_prompt text not null,
  task_mode task_mode not null,
  chatgpt_draft text,
  claude_review text,
  final_output text,
  status ai_task_status not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_task_steps (
  id uuid primary key default gen_random_uuid(),
  ai_task_id uuid not null references public.ai_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('openai', 'anthropic')),
  role_name text not null,
  step_order integer not null,
  input text not null,
  output text,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category prompt_category not null default 'SBD',
  prompt text not null,
  best_version text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_prompt_id uuid references public.saved_prompts(id) on delete cascade,
  provider text not null check (provider in ('openai', 'anthropic', 'both')),
  input text not null,
  output text,
  score numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  ai_task_id uuid references public.ai_tasks(id) on delete set null,
  provider text not null check (provider in ('openai', 'anthropic', 'system')),
  action text not null,
  tokens_input integer default 0,
  tokens_output integer default 0,
  estimated_cost numeric(12,6) default 0,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists ai_tasks_user_id_idx on public.ai_tasks(user_id);
create index if not exists ai_tasks_project_id_idx on public.ai_tasks(project_id);
create index if not exists ai_task_steps_task_id_idx on public.ai_task_steps(ai_task_id);
create index if not exists saved_prompts_user_id_idx on public.saved_prompts(user_id);
create index if not exists prompt_tests_user_id_idx on public.prompt_tests(user_id);
create index if not exists usage_logs_user_id_idx on public.usage_logs(user_id);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.ai_tasks enable row level security;
alter table public.ai_task_steps enable row level security;
alter table public.saved_prompts enable row level security;
alter table public.prompt_tests enable row level security;
alter table public.usage_logs enable row level security;

create policy "Users can read their own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage their own projects" on public.projects for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage their own ai tasks" on public.ai_tasks for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage their own task steps" on public.ai_task_steps for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage their own saved prompts" on public.saved_prompts for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage their own prompt tests" on public.prompt_tests for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users read their own usage logs" on public.usage_logs for select using (auth.uid() = user_id or public.is_admin());
create policy "Users insert their own usage logs" on public.usage_logs for insert with check (auth.uid() = user_id or public.is_admin());
