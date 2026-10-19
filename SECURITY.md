# Seguridad

Este repositorio es público. No subas .env.local, contraseñas, tokens, claves privadas ni datos personales del equipo.

Las variables VITE_* se incorporan al código que recibe el navegador. Solo guarda ahí la URL del proyecto y la clave publishable de Supabase. La clave service_role y otros secretos de servidor nunca pertenecen a una aplicación React.

Protege las tablas con Row Level Security y políticas explícitas antes de guardar datos. Si una credencial se expone, revócala desde su servicio y reemplázala en los entornos correspondientes.