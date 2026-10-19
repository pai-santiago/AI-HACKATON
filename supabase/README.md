# Supabase

Esta carpeta contiene el esquema reproducible del proyecto AI-HACKATON. Lee primero [el flujo de base de datos del equipo](../docs/DATABASE_WORKFLOW.md).

## Archivos

- `config.toml`: configuración local generada por Supabase CLI.
- `migrations/`: cambios SQL ordenados por timestamp y versionados en Git.
- `seed.sql`: datos ficticios que solo se cargan al reconstruir la base local.

## Seguridad y conexión

El frontend usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` desde `.env.local` y Vercel. No agregues `secret`, `service_role`, contraseñas de Postgres ni tokens al frontend, a variables `VITE_*` o al repo. Las tablas de prueba exigen una sesión de Auth y una fila autorizada en `hackathon_team_members`; las políticas RLS niegan acceso a `anon`.

No asumas que el proyecto vinculado por la CLI o por una integración es el correcto. Compara siempre el project ref con el proyecto AI-HACKATON y confirma que sea distinto de Prospectum MIAI antes de hacer cualquier cambio remoto.

## Trabajo local

Instala Docker Desktop y usa `npm run db:start`, `npm run db:reset` y `npm run db:lint`. `db:reset` es local y destructivo solo para la instancia local. El seed no se publica con `db push`.

Las migraciones se proponen por pull request. Tras la revisión, Santiago es el único responsable de aplicar migraciones al proyecto remoto, primero con `supabase db push --dry-run` y luego con `supabase db push`.
