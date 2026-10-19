## Qué cambia

- Resume el cambio y su motivo.

## Base de datos — obligatorio

Marca exactamente una opción. CI falla y GitHub bloquea la integración a `main` si falta la declaración o si no coincide con los archivos de migración.

- [ ] `NO_DATABASE_CHANGE` — Este PR no modifica tablas, columnas, relaciones, índices, funciones, triggers, permisos o políticas RLS.
- [ ] `DATABASE_MIGRATION_INCLUDED` — Este PR modifica la base de datos e incluye una migración SQL nueva en `supabase/migrations/`.

Objetos afectados o motivo por el que no se requiere migración:

- Escribe los objetos afectados o explica por qué no cambia el esquema.

Migraciones nuevas incluidas (si aplica):

- Escribe la ruta del archivo SQL nuevo o indica que no aplica.

## Cómo revisarlo

- 

## Lista rápida

- [ ] Ejecuté npm run lint
- [ ] Ejecuté npm run build
- [ ] Si agregué una migración, ejecuté npm run db:reset y npm run db:lint localmente, o revisé que esos chequeos pasen en CI
- [ ] No modifiqué ni borré migraciones que ya estaban integradas en main
- [ ] El seed solo contiene datos sintéticos de desarrollo
- [ ] Revisé el cambio en escritorio y móvil
- [ ] No incluí secretos ni datos reales en el repositorio
