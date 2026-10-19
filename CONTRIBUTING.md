# Contribuir

## Preparar el entorno

~~~sh
git clone https://github.com/pai-santiago/AI-HACKATON.git AI-HACKATON
cd AI-HACKATON
npm ci
npm run dev
~~~

Crea .env.local a partir de .env.example si ya tienes acceso al proyecto Supabase. No compartas ese archivo.

## Cada cambio

1. Actualiza main y crea una rama: **git switch -c feat/nombre-corto**.
2. Haz cambios pequeños y con un objetivo claro.
3. Antes de abrir el pull request, ejecuta **npm run lint** y **npm run build**.
4. Abre un pull request a main y comparte el enlace de Vercel Preview.
5. Integra el cambio después de que el equipo lo revise y el CI esté verde.

Para corregir un error usa el prefijo **fix/**; para documentación, **docs/**. Evita que dos personas editen la misma área sin coordinarse.

## Estilo

- Usa TypeScript y componentes funcionales de React.
- Mantén los componentes pequeños y las props tipadas.
- Prefiere HTML semántico y controles accesibles por teclado.
- Centraliza llamadas a servicios en src/lib/.
- No agregues dependencias sin una razón clara.