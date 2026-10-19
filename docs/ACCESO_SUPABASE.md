# Acceso rápido a Supabase

Hay tres permisos diferentes. Una invitación de GitHub no da acceso al panel de Supabase, y una clave de API no convierte a alguien en administrador de la base.

## 1. Invitar al panel de Supabase

Cada integrante necesita su propia cuenta de Supabase y el email asociado a ella.

1. Santiago abre la organización de Supabase que contiene **solo AI-HACKATON**.
2. Entra a **Organization Settings → Team members** y elige **Invite member**.
3. Escribe el email de la cuenta Supabase del integrante.
4. Si el plan permite permisos por proyecto, limita la invitación al proyecto **AI-HACKATON** y asigna el rol mínimo que necesite. No des rol Owner.
5. El integrante acepta la invitación desde su propio correo y entra con su propia cuenta.

Los roles por proyecto están disponibles en planes Team y Enterprise. Si el plan actual no ofrece ese alcance, mantén este hackathon en una organización separada; no invites al equipo a una organización que contenga Prospectum MIAI u otros proyectos.

## 2. Conectar la app React al proyecto

Desde el proyecto correcto **AI-HACKATON**, abre **Connect** y copia el **Project URL** y la **Publishable key**. No copies `secret` ni `service_role`.

En la raíz del repo, cada integrante crea su archivo local:

~~~powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
~~~

En macOS o Linux, el primer comando es `cp .env.example .env.local`.

Completa `.env.local` con los dos valores de Connect:

~~~dotenv
VITE_SUPABASE_URL=https://TU-PROJECT-REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
~~~

La publishable key está diseñada para usarse en el navegador. RLS y las políticas de cada tabla deciden qué datos puede leer o modificar una persona. La clave no da acceso al dashboard ni privilegios de administrador. `.env.local` está ignorado por Git; no lo subas.

## 3. Permitir que una persona use las tablas desde la app

La clave publishable por sí sola no permite leer ni escribir tablas. Para las tablas de prueba M1:

1. La persona debe iniciar sesión con una cuenta de **Supabase Auth del proyecto AI-HACKATON**.
2. Santiago registra el UUID de esa cuenta en `public.hackathon_team_members`.
3. Las políticas RLS permiten solo las operaciones definidas para integrantes autorizados.

La app todavía necesita una pantalla de inicio de sesión antes de usar esas tablas desde el navegador.

## 4. Cambiar el esquema de forma coordinada

- Cada integrante crea y prueba migraciones en su rama local; revisa [el flujo completo de base de datos](DATABASE_WORKFLOW.md).
- No uses el SQL Editor o Table Editor remoto para cambios de esquema del día a día.
- Santiago revisa el `project ref`, ejecuta `supabase db push --dry-run` y aplica migraciones aprobadas con `supabase db push`.
- Nadie comparte contraseñas, tokens personales de Supabase, claves `secret`/`service_role` ni la contraseña de Postgres.

Para entrar al repo, cada persona también necesita una invitación de colaborador en GitHub si va a subir ramas. El repo público se puede leer sin invitación, pero eso no permite hacer push.

## Datos que Santiago debe pedir a cada integrante

- Usuario de GitHub (`@usuario`) para invitarlo al repo.
- Email de la cuenta Supabase para invitarlo al proyecto u organización.

No publiques esos datos ni los agregues a archivos versionados.

## Referencias oficiales

- [Invitaciones y roles de Supabase](https://supabase.com/docs/guides/platform/access-control)
- [Claves API y seguridad](https://supabase.com/docs/guides/getting-started/api-keys)
- [React y Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Migraciones con Supabase CLI](https://supabase.com/docs/guides/deployment/database-migrations)
