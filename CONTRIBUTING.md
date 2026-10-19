# Contribuir

## Preparar el entorno

~~~sh
git clone https://github.com/pai-santiago/AI-HACKATON.git AI-HACKATON
cd AI-HACKATON
npm ci
npm run dev
~~~

Crea .env.local a partir de .env.example si ya tienes acceso al proyecto Supabase. No compartas ese archivo. Docker no es necesario para trabajar en React o desplegar la app.

Docker Desktop (o un runtime compatible) solo hace falta si vas a ejecutar la base Supabase local con los comandos `npm run db:*`. Si solo vas a trabajar en la interfaz web o usar la app conectada a Supabase remoto, puedes trabajar sin Docker. Para trabajar localmente con la base, sigue [docs/DATABASE_WORKFLOW.md](docs/DATABASE_WORKFLOW.md). Las migraciones se crean en ramas y se proponen por pull request; no alteres el esquema remoto desde el panel.

Consulta [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para ver cuándo se crean despliegues Preview y Production y cómo publicar con la CLI.

## Cada cambio

1. Actualiza main y crea una rama: **git switch -c feat/nombre-corto**.
2. Haz cambios pequeños y con un objetivo claro.
3. Si el cambio modifica el esquema de Supabase —tablas, columnas, relaciones, índices, funciones, triggers, permisos o RLS— crea una migración nueva en `supabase/migrations/` y súbela en el mismo pull request que el código que la necesita. No edites migraciones que ya llegaron a `main`; crea otra para corregirlas.
4. En la sección obligatoria de base de datos del pull request, marca exactamente si incluye migración o si no cambia el esquema. GitHub Actions rechazará la verificación si falta la declaración o si un cambio declarado no trae su archivo SQL nuevo.
5. Antes de abrir el pull request, ejecuta **npm run lint** y **npm run build**.
6. Abre un pull request a `main` y comparte el enlace de Vercel Preview.
7. Integra el cambio después de que el equipo lo revise y el CI esté verde.

Si el cambio incluye una migración SQL, también ejecuta `npm run db:reset` y `npm run db:lint` después de iniciar el Supabase local. GitHub Actions repite esos chequeos con una base temporal. Incluye solo datos sintéticos en `supabase/seed.sql`. El deploy de Vercel no aplica migraciones a la base remota; sigue el procedimiento de [docs/DATABASE_WORKFLOW.md](docs/DATABASE_WORKFLOW.md).

Para corregir un error usa el prefijo **fix/**; para documentación, **docs/**. Evita que dos personas editen la misma área sin coordinarse.

## Estilo

- Usa TypeScript y componentes funcionales de React.
- Mantén los componentes pequeños y las props tipadas.
- Prefiere HTML semántico y controles accesibles por teclado.
- Centraliza llamadas a servicios en src/lib/.
- No agregues dependencias sin una razón clara.
