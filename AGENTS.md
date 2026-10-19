# Instrucciones para agentes de código

Antes de cambiar este proyecto, revisa `CONTRIBUTING.md`, `docs/DATABASE_WORKFLOW.md` y `docs/DEPLOYMENT.md`.

## Cambios de base de datos

- Si un cambio requiere crear, modificar o retirar tablas, columnas, relaciones, índices, funciones, triggers, grants o políticas RLS, crea una migración SQL nueva en `supabase/migrations/` y agrégala al mismo pull request que el código que la necesita.
- No edites ni borres migraciones que ya llegaron a `main`. Crea una nueva migración con `npx supabase migration new nombre_corto`.
- Completa exactamente una opción de base de datos en la descripción del pull request. Si no hay cambio de esquema, marca `NO_DATABASE_CHANGE` y explica el motivo; si sí lo hay, marca `DATABASE_MIGRATION_INCLUDED` y enumera el archivo.
- Comprueba que la migración aplica desde cero usando `npm run db:reset` y `npm run db:lint` cuando el entorno local esté disponible. Revisa que los chequeos equivalentes de GitHub Actions pasen.
- No ejecutes migraciones contra Supabase remoto ni cambies datos reales sin una instrucción explícita del usuario. El deploy de Vercel no aplica migraciones remotas.
- Nunca pongas claves `secret`/`service_role`, contraseñas, tokens ni `.env.local` en el código o el pull request.

## Cambios de aplicación y despliegue

- Mantén el código de aplicación y su migración en el mismo pull request cuando dependa de un objeto de base nuevo o modificado.
- Respeta el flujo de ramas, PR, CI y Preview definido en `docs/DEPLOYMENT.md`. No publiques a producción desde una rama de trabajo.
- No cambies el esquema remoto desde Table Editor o SQL Editor como sustituto de una migración versionada.
