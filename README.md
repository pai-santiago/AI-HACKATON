# AI HACKATON

Base compartida para construir el sitio web del hackathon. El reto todavía no está definido; por eso el proyecto arranca con una aplicación React limpia, documentación para el equipo y una ruta de despliegue preparada.

## Equipo

- Santiago García
- Diego Villa
- Fabio Herrera
- Jorge Polanco

## Stack

- React 19 con TypeScript
- Vite 8 para desarrollo y compilación
- Oxlint para revisar el código
- Supabase JS para conectar una base de datos cuando creemos el proyecto
- Vercel para previews y producción desde GitHub

El código del navegador solo debe usar la URL del proyecto y su clave publishable de Supabase. Nunca agregues una clave **service_role** al frontend.

## Primeros pasos

Requiere Node.js 22.12 o posterior y npm.

~~~sh
npm ci
npm run dev
~~~

Abre la URL que muestra Vite (por defecto http://localhost:5173). Antes de iniciar el trabajo con Supabase:

1. Crea un proyecto nuevo y dedicado en Supabase para este hackathon.
2. Copia .env.example como .env.local.
3. Completa VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY con los datos de ese proyecto.
4. Carga las mismas variables en Vercel para Development, Preview y Production.

En PowerShell puedes copiar el archivo de entorno con **Copy-Item .env.example .env.local**; en macOS o Linux, usa **cp .env.example .env.local**.

## React en dos minutos

- **Componentes:** funciones que reciben datos y devuelven JSX. Mantén cada componente enfocado en una sola responsabilidad.
- **Props:** entradas de un componente. Decláralas con tipos de TypeScript para documentar qué necesita.
- **Estado:** usa useState para datos que cambian por interacción y deben actualizar la pantalla.
- **Eventos:** conecta acciones con props como onClick y onSubmit; en formularios, evita recargar la página.
- **Listas:** usa map y una clave estable por elemento.
- **Efectos:** reserva useEffect para sincronizar con sistemas externos, como una suscripción. No lo uses para calcular valores que se pueden derivar durante el render.
- **Composición:** arma pantallas con componentes pequeños en vez de hacer un componente gigante.

Empieza por la [guía oficial de React](https://react.dev/learn), la [guía de Vite](https://vite.dev/guide/) y el [tutorial React de Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-react).

## Comandos

~~~sh
npm run dev       # servidor local
npm run lint      # revisión estática
npm run build     # genera la app de producción en dist/
npm run preview   # vista local del build
~~~

## Estructura

~~~text
src/
  lib/supabase.ts   cliente opcional de Supabase
  App.tsx           pantalla inicial
  App.css           estilos de la pantalla
  index.css         estilos globales
supabase/
  migrations/       cambios de esquema versionados en SQL
docs/
  TEAM.md           coordinación del equipo
.github/
  workflows/ci.yml  lint y build para main y pull requests
~~~

## Flujo de trabajo del equipo

main es la rama estable y la rama de producción de Vercel. Para el trabajo normal, cada persona crea una rama (feat/nombre-corto o fix/nombre-corto), ejecuta lint y build, y abre un pull request a main. Vercel genera una vista previa para revisar antes de integrar. La configuración inicial puede publicarse directamente en main; después, trabajen con ramas para conservar una vista previa por cambio.

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para los comandos del flujo y [docs/TEAM.md](docs/TEAM.md) para los acuerdos de colaboración.

## Vercel

El repositorio ya incluye vercel.json con el comando de instalación y build, y el directorio de salida. Para activar despliegues:

1. En Vercel, crea un proyecto nuevo e importa este repositorio de GitHub.
2. Deja main como **Production Branch** y el directorio raíz como **./**.
3. Añade las variables de entorno de Supabase si el proyecto ya está creado.
4. Despliega.

Después de conectar GitHub, cada push a main genera un despliegue de producción y cada pull request puede generar una vista previa. La conexión y el primer despliegue se completan desde la cuenta de Vercel.

## Supabase

El cliente está listo en src/lib/supabase.ts y la plantilla de variables en .env.example. El proyecto remoto todavía debe crearse en la cuenta de Supabase del equipo. Define sus tablas y políticas de Row Level Security cuando se conozca el reto; cada cambio de esquema debe quedar en supabase/migrations/.

Consulta [supabase/README.md](supabase/README.md) antes de configurar credenciales o añadir tablas.