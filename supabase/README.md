# Supabase

Este directorio está reservado para configuración y migraciones de la base de datos de este hackathon. No hay un proyecto remoto ni un esquema de aplicación creado todavía.

## Conectar el cliente

Crea un proyecto dedicado en Supabase. Guarda su Project URL y publishable key en .env.local con los nombres de .env.example, y en Vercel en los entornos Development, Preview y Production.

El frontend puede usar la publishable key porque es pública por diseño. No uses service_role en React, Vite, variables VITE_* ni commits. Antes de crear tablas, habilita Row Level Security y define políticas que limiten qué usuarios pueden leer o modificar datos.

## Migraciones

Cuando se acuerde el modelo de datos, guarda cada cambio de esquema como SQL versionado en migrations/, con nombres consecutivos y descriptivos. Evita crear tablas antes de conocer los datos que requiere el reto.