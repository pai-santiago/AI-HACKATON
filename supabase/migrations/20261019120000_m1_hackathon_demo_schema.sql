-- M1: isolated synthetic tables to prove relational reads and writes.
-- Real challenge data belongs in later migrations, never in these demo tables.

create table public.hackathon_team_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 100),
  github_username text unique,
  added_at timestamptz not null default now()
);

create table public.hackathon_demo_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null default '',
  created_at timestamptz not null default now()
);

create table public.hackathon_demo_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.hackathon_demo_projects (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hackathon_demo_tasks_project_id_idx
  on public.hackathon_demo_tasks (project_id);

alter table public.hackathon_team_members enable row level security;
alter table public.hackathon_demo_projects enable row level security;
alter table public.hackathon_demo_tasks enable row level security;

revoke all on table public.hackathon_team_members from public, anon, authenticated;
grant select on table public.hackathon_team_members to authenticated;

create policy "team members can read their own membership"
  on public.hackathon_team_members
  for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.hackathon_demo_projects from public, anon, authenticated;
grant select, insert, update, delete on table public.hackathon_demo_projects to authenticated;

create policy "listed team members can manage demo projects"
  on public.hackathon_demo_projects
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.hackathon_team_members as team_member
      where team_member.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.hackathon_team_members as team_member
      where team_member.user_id = (select auth.uid())
    )
  );

revoke all on table public.hackathon_demo_tasks from public, anon, authenticated;
grant select, insert, update, delete on table public.hackathon_demo_tasks to authenticated;

create policy "listed team members can manage demo tasks"
  on public.hackathon_demo_tasks
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.hackathon_team_members as team_member
      where team_member.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.hackathon_team_members as team_member
      where team_member.user_id = (select auth.uid())
    )
  );
