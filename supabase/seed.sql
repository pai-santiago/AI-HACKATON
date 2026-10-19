-- Synthetic local-only records for the M1 relationship smoke test.
-- Never use `supabase db push --include-seed` against production.

insert into public.hackathon_demo_projects (id, name, description)
values (
  'a1000000-0000-4000-8000-000000000001',
  'Proyecto de prueba AI-HACKATON',
  'Datos sintéticos para comprobar la relación proyecto-tarea.'
)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description;

insert into public.hackathon_demo_tasks (id, project_id, title, status)
values
  (
    'a2000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'Validar la relación proyecto-tarea',
    'done'
  ),
  (
    'a2000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    'Probar una lectura y una escritura con un usuario del equipo',
    'todo'
  )
on conflict (id) do update
set project_id = excluded.project_id,
    title = excluded.title,
    status = excluded.status;
