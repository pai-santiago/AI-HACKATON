# Contribuir

## Preparar el entorno

~~~sh
git clone https://github.com/pai-santiago/AI-HACKATON.git AI-HACKATON
cd AI-HACKATON
npm ci
npm run dev
~~~

Crea .env.local a partir de .env.example si ya tienes acceso al proyecto Supabase. No compartas ese archivo.

Para trabajar localmente con la base de datos, instala Docker Desktop y sigue [docs/DATABASE_WORKFLOW.md](docs/DATABASE_WORKFLOW.md). Las migraciones se crean en ramas y se proponen por pull request; no alteres el esquema remoto desde el panel.

## Cada cambio

1. Actualiza main y crea una rama: **git switch -c feat/nombre-corto**.
2. Haz cambios pequeños y con un objetivo claro.
3. Antes de abrir el pull request, ejecuta **npm run lint** y **npm run build**.
4. Abre un pull request a main y comparte el enlace de Vercel Preview.
5. Integra el cambio después de que el equipo lo revise y el CI esté verde.

Si el cambio incluye SQL, también ejecuta `npm run db:reset` y `npm run db:lint` después de iniciar el Supabase local. Incluye solo datos sintéticos en `supabase/seed.sql`.

Para corregir un error usa el prefijo **fix/**; para documentación, **docs/**. Evita que dos personas editen la misma área sin coordinarse.

## Estilo

- Usa TypeScript y componentes funcionales de React.
- Mantén los componentes pequeños y las props tipadas.
- Prefiere HTML semántico y controles accesibles por teclado.
- Centraliza llamadas a servicios en src/lib/.
- No agregues dependencias sin una razón clara.
