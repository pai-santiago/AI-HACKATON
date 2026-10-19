# Despliegues del sitio

## Resumen

- Proyecto de Vercel: `ai-hackaton`.
- Producción: <https://ai-hackaton-bay.vercel.app>.
- Rama de producción: `main`.
- Framework: Vite; instalación `npm ci`, compilación `npm run build`, salida `dist/`.
- Variables de navegador requeridas: `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. No agregues claves `secret` o `service_role` al frontend ni al repositorio.

## Flujo recomendado para el equipo

1. Crea una rama `feat/...`, `fix/...` o `docs/...` desde `main` actualizado.
2. Realiza un cambio acotado y ejecuta `npm run lint` y `npm run build`.
3. Abre un pull request a `main`. GitHub Actions ejecuta lint, build y la validación local de las migraciones de Supabase.
4. Revisa la vista previa del cambio antes de integrar.
5. Integra el pull request solo después de la revisión del equipo y de que CI esté verde. La integración a `main` es el paso que publica el cambio en producción cuando el proyecto tiene conectada la integración de GitHub con Vercel.

No hagas push directo a `main` para cambios normales. Para una emergencia, acuerda explícitamente el cambio con Santiago y revisa el estado de CI y Vercel después. GitHub Actions ejecuta los chequeos, pero hoy la rama `main` no tiene protección configurada; por lo tanto, usar PR y esperar CI verde es un acuerdo del equipo, no un bloqueo automático. Si quieren impedir merges directos, Santiago puede agregar una regla en **Settings → Branches/Rulesets** que requiera pull request y los chequeos de CI.

## Qué despliega Vercel

La conexión GitHub–Vercel está activa: GitHub muestra despliegues Production del bot `vercel[bot]` para este repositorio. Con esa conexión:

- Los pushes a ramas distintas de `main` generan despliegues **Preview** con URL propia.
- Los cambios del pull request actualizan la vista previa que el equipo revisa.
- Un push o merge a `main` genera un despliegue **Production** y actualiza el sitio público si compila correctamente.

La Preview sirve para revisar el cambio antes de que afecte producción. No uses la URL de Preview para guardar información real ni asumas que tiene la misma protección de acceso que producción.

## Publicar desde la CLI

También se puede desplegar con la CLI de Vercel desde la raíz del proyecto:

~~~sh
# Crear una vista previa del contenido que tienes en tu carpeta actual
vercel

# Publicar el contenido actual en producción
vercel --prod
~~~

La sesión de Codex está autenticada en Vercel y este checkout está enlazado al proyecto `ai-hackaton`; por eso Santiago puede pedirle a Codex que prepare y publique un despliegue. Antes de un despliegue de producción, confirma que el contenido corresponde al cambio aprobado en `main`, revisa lint/build y comprueba el resultado en Vercel. La CLI despliega el contenido del checkout actual, así que no ejecutes `vercel --prod` desde una rama de trabajo por accidente.

La sesión local de la CLI y la integración GitHub son conexiones distintas. Si un push o pull request no genera su deployment automático, revisa en **Vercel → ai-hackaton → Settings → Git** que el repositorio conectado sea `pai-santiago/AI-HACKATON` y que la rama de producción sea `main`.

## Docker

**Docker no es requisito para trabajar en React ni para desplegar el sitio.** Para instalar dependencias, editar la web, ejecutar `npm run dev`, `npm run lint`, `npm run build` o desplegar con Vercel no hace falta instalar Docker.

Docker Desktop (o un runtime compatible, como Podman) sí hace falta para levantar el Supabase local con `npm run db:start`, reconstruirlo con `npm run db:reset` o revisar el esquema local con `npm run db:lint`. En Windows, Docker Desktop es la opción recomendada. No es necesario que todo el equipo lo instale si solo trabaja en la interfaz; quien cambie migraciones puede hacerlo, aunque tener el entorno local permite validarlas antes del pull request. GitHub Actions también valida las migraciones en su propio entorno CI.

## Qué acceso necesita cada integrante

- **GitHub:** colaborador del repositorio para subir ramas y abrir pull requests.
- **Vercel:** acceso al proyecto solo para administrar configuración o manejar despliegues manuales. La URL pública se puede visitar sin una cuenta Vercel.
- **Supabase:** invitación separada si necesita acceder al panel. Para cambios del esquema, sigue el flujo de migraciones en [DATABASE_WORKFLOW.md](DATABASE_WORKFLOW.md).

Una invitación a GitHub no concede automáticamente permisos en Vercel o Supabase. No compartas cuentas, tokens ni secretos para resolver permisos.
