# Base de datos y acceso del equipo

## Regla principal

- El proyecto Supabase de AI-HACKATON debe vivir en una organización separada de Prospectum MIAI. Si el plan permite roles por proyecto, invita al equipo con acceso de proyecto **Developer** solo a AI-HACKATON. Si no permite acceso por proyecto, usa una organización separada; no les des acceso a una organización que contenga otros proyectos.
- Cada persona usa su cuenta personal de Supabase y su cuenta personal de GitHub. No se comparten contraseñas, tokens, claves `secret`/`service_role` ni la contraseña de Postgres.
- La clave publishable solo identifica a la app web. Las políticas RLS determinan quién puede leer o cambiar filas. Nunca pongas claves privilegiadas en `VITE_*`, React o Git.
- El repo es público, así que `.env.local` y cualquier archivo de credenciales no se suben. `.env.example` contiene solo nombres de variables vacías.

## Dos tipos de acceso

### A. Cambiar el esquema

Los cambios de tablas, columnas, relaciones, índices, funciones y políticas se hacen en migraciones SQL dentro de `supabase/migrations/`. Cada persona crea la migración en su rama, la prueba localmente y abre un pull request. Nadie modifica el esquema remoto desde Table Editor o SQL Editor como flujo normal.

Solo Santiago integra y aplica migraciones al proyecto remoto, después de revisión y de comprobar que el `project ref` enlazado sea el del proyecto AI-HACKATON. Ejecuta primero `supabase db push --dry-run` y luego `supabase db push`. Nunca ejecutes `supabase db reset --linked`: eso borra y reconstruye el esquema remoto.

### B. Cambiar filas desde la aplicación

La app se conecta con la URL del proyecto y la clave publishable. La persona inicia sesión con su propia cuenta de Supabase; RLS permite el acceso a los datos solo si su `user_id` está en `public.hackathon_team_members`. Santiago invita las cuentas al proyecto de Auth y agrega sus UUID a esa tabla desde el panel SQL como propietario. Los usuarios de la app no pueden agregarse a sí mismos ni autorizar a otra persona.

Los UUID son por proyecto Supabase. Una cuenta de Auth en otro proyecto no concede acceso a este proyecto.

## Prueba M1 incluida

La migración `20261019120000_m1_hackathon_demo_schema.sql` crea:

- `hackathon_demo_projects`: proyectos ficticios para la prueba.
- `hackathon_demo_tasks`: tareas con llave foránea hacia un proyecto.
- `hackathon_team_members`: lista de cuentas autorizadas del equipo.

Las tres tablas tienen RLS. Solo personas autenticadas registradas como integrantes pueden cambiar proyectos o tareas; cada integrante solo puede leer su propia fila de membresía. `supabase/seed.sql` agrega un proyecto y dos tareas completamente sintéticos para el entorno local.

Antes de aplicar M1 al proyecto remoto, invita a los integrantes por email desde Supabase Auth. Después de que existan sus cuentas, Santiago registra sus UUID en `hackathon_team_members`. No compartas esos emails en el repo público; sustitúyelos localmente en el SQL Editor. El panel de Auth puede mostrar los UUID. El front-end todavía necesita una pantalla de inicio de sesión antes de leer estas tablas.

Plantilla para registrar una cuenta ya invitada, ejecutada por Santiago en el SQL Editor del proyecto AI-HACKATON:

~~~sql
insert into public.hackathon_team_members (user_id, display_name, github_username)
select id, 'Nombre del integrante', 'usuario-github'
from auth.users
where email = 'email-de-la-invitacion'
on conflict (user_id) do update
set display_name = excluded.display_name,
    github_username = excluded.github_username;
~~~

Sustituye los tres valores localmente. El SQL Editor debe estar abierto en AI-HACKATON; el email no se guarda en el repo.

## Mapa M1–M5

Las siglas M1–M5 asignan responsabilidad y orden de trabajo; **no son el número técnico de la migración**. Supabase ordena y registra archivos por su prefijo timestamp, que se genera con `supabase migration new`.

| Clave | Responsable | Alcance |
| --- | --- | --- |
| M1 | Santiago García (SG) | Tablas sintéticas relacionadas, RLS y semilla local de prueba. Ya está preparada en el repo. |
| M2 | Diego Villa (DV) | Primeras tablas y relaciones que exija el reto, una vez que el equipo conozca el reto. |
| M3 | Fabio Herrera (FH) | Políticas RLS y permisos de las tablas del reto; comprobar acceso permitido y denegado. |
| M4 | Jorge Polanco (JP) | Realtime, índices, triggers o funciones que el flujo del reto necesite; no añadirlos por anticipado. |
| M5 | Santiago García (SG), con una persona revisora rotativa | Integrar migraciones, regenerar tipos, revisar el dry run y coordinar el único despliegue remoto. |

M2–M4 se asignan al autor del cambio real; no se inventarán tablas de negocio antes de conocer el reto. Si dos personas trabajan en SQL al mismo tiempo, coordinen el orden y creen prefijos timestamp únicos. Si una rama queda detrás, actualícela desde `main` y vuelva a ejecutar el reset local.

## Rutina local

Requisitos para trabajar en la app: Node.js 22.12 o posterior y npm. No necesitas Docker para React, lint, build ni Vercel. Para iniciar la instancia Supabase local y ejecutar `npm run db:*`, instala Docker Desktop (recomendado en Windows y Linux) u otro runtime compatible con la API de Docker. La CLI de Supabase está fijada en `package.json` para que todo el equipo use la misma versión.

~~~sh
npm ci
npm run db:start
npm run db:reset
npm run db:lint
npm run dev
~~~

`db:reset` borra y reconstruye **solo la base local** con las migraciones y `seed.sql`. Al terminar, usa `npm run db:stop` para apagar el stack.

Para iniciar una migración nueva:

~~~sh
npx supabase migration new nombre_corto
npm run db:reset
npm run db:lint
npm run lint
npm run build
~~~

Sube solo el SQL y los cambios de app en una rama; abre un pull request a `main`. No subas dumps, contraseñas, tokens, `.env.local`, usuarios reales ni datos reales en el seed.

## Preparar el proyecto remoto

1. Confirma que el Project URL en `.env.local`, el nombre visible en Supabase y el proyecto enlazado por la CLI son AI-HACKATON y no Prospectum MIAI.
2. Invita a cada integrante usando su email de Supabase y, por separado, su usuario de GitHub. Aceptar una invitación de GitHub no da acceso a Supabase.
3. Registra los UUID de Auth en `hackathon_team_members`. No habilites acceso `anon` a las tablas demo.
4. La persona integradora autentica la CLI de forma individual, enlaza el proyecto y revisa `supabase db push --dry-run`.
5. Solo después aplica `supabase db push`. Nunca uses `--include-seed` en producción.

En los planes Team y Enterprise, Supabase permite asignar roles acotados a un proyecto. En planes sin roles por proyecto, mantén AI-HACKATON en una organización aparte para que el equipo no vea proyectos ajenos.

Referencias oficiales: [flujo de migraciones para equipos](https://supabase.com/docs/guides/deployment/database-migrations), [CLI y desarrollo local](https://supabase.com/docs/guides/local-development/cli-workflows), [roles y control de acceso](https://supabase.com/docs/guides/platform/access-control).
