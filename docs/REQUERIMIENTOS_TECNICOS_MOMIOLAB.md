# Requerimientos técnicos de MomioLab

**Estado:** borrador para la siguiente fase
**Alcance actual:** primer boceto de terminal con Naive Bayes gaussiano. Este documento registra necesidades conocidas y decisiones que el equipo aún debe confirmar.

## 1. Alcance del primer boceto

| ID | Requerimiento | Estado |
| --- | --- | --- |
| RF-01 | Cargar un historial CSV con fecha, equipo local, equipo visitante y goles de ambos equipos. | Implementado |
| RF-02 | Ordenar los partidos cronológicamente y construir variables solo con encuentros anteriores al partido evaluado. | Implementado |
| RF-03 | Entrenar un único algoritmo: Naive Bayes gaussiano para Local, Empate y Visitante. | Implementado |
| RF-04 | Permitir seleccionar local y visitante desde el menú de terminal y rechazar equipos inexistentes o repetidos. | Implementado |
| RF-05 | Mostrar probabilidades 1X2, momios decimales justos (`1 / p`) y gráfica de barras en terminal. | Implementado |
| RF-06 | Separar cronológicamente los ejemplos para una evaluación 80/20 y mostrar accuracy, log loss y Brier. | Implementado |
| RF-07 | Identificar claramente el CSV actual como sintético y no presentar sus métricas como desempeño en partidos reales. | Implementado |
| RF-08 | Mantener el marcador en vivo separado del historial que alimenta el algoritmo. | Implementado |

## 2. Requerimientos técnicos pendientes para la siguiente fase

### Datos y fuentes

- **RT-01 — Fuente histórica:** seleccionar una fuente de resultados finalizados que cubra las ligas y temporadas que el equipo necesite.
- **RT-02 — Uso de datos:** revisar licencia, atribución, límites, frecuencia de actualización y condiciones de uso antes de integrar la fuente.
- **RT-03 — Esquema común:** definir identificadores estables para equipos, liga, temporada, fecha, goles y estado del partido.
- **RT-04 — Calidad:** especificar cómo tratar partidos suspendidos, resultados corregidos, duplicados, equipos renombrados y datos faltantes.
- **RT-05 — Trazabilidad:** conservar fuente, fecha de descarga y versión del conjunto de datos para reproducir cada análisis.
- **RT-06 — Separación de fuentes:** no usar el feed de marcador en vivo como sustituto de resultados históricos ni como fuente de cuotas. Elegir una fuente distinta si se requiere comparar contra cuotas de casas.

### Modelo y evaluación

- **RT-07 — Variables:** confirmar que se mantengan los últimos cinco partidos y documentar si se añadirán localía, fuerza de rivales u otras variables disponibles.
- **RT-08 — Prevención de fuga:** construir cada variable solo con información disponible antes del partido que se está prediciendo.
- **RT-09 — Evaluación temporal:** fijar temporadas o fechas de entrenamiento, validación y prueba antes de medir resultados; conservar una prueba final no usada para ajustar el modelo.
- **RT-10 — Referencia base:** comparar Naive Bayes con una predicción simple basada en frecuencias históricas antes de afirmar que el modelo aporta mejora.
- **RT-11 — Calibración:** revisar si las probabilidades estimadas corresponden a frecuencias observadas; acordar con el equipo los criterios mínimos de aceptación.
- **RT-12 — Reproducibilidad:** registrar versión del código, periodo de datos, variables y métricas asociadas a cada ejecución.
- **RT-13 — Alcance del momio:** mantener claro que `1 / p` es un momio justo sin margen. Para compararlo con cuotas publicadas se necesitará una fuente autorizada y un método explícito para quitar el margen.

### Integración y operación

- **RT-14 — Configuración:** guardar URLs y claves de proveedor en variables de entorno locales; nunca incluir secretos en React, Git o archivos públicos.
- **RT-15 — Resiliencia:** definir caché, manejo de límites, reintentos y mensaje de error cuando la fuente externa no responda.
- **RT-16 — Entorno:** documentar Node.js 22.12 o posterior, npm y los comandos de terminal necesarios para instalar, ejecutar y compilar el proyecto.
- **RT-17 — Interfaz:** conservar el flujo de CLI para elegir equipos y leer el resultado; si la predicción pasa al dashboard, reutilizar el mismo algoritmo y mostrar origen y fecha de los datos.

## 3. Decisiones que debe cerrar el equipo

Antes de conectar datos reales, confirmar:

1. Ligas y temporadas que cubrirá la demo.
2. Proveedor y permiso de uso de datos históricos.
3. Si el proyecto comparará momios justos con cuotas de casas y qué fuente se permitirá.
4. Periodo de prueba y métricas mínimas para considerar útil el modelo.
5. Si la siguiente entrega seguirá en terminal o integrará la predicción al dashboard.

## 4. Estado y límites que hay que comunicar

- El primer boceto ejecuta solo Naive Bayes gaussiano.
- Los datos actuales son sintéticos; las métricas actuales describen únicamente ese archivo.
- El marcador de SportScore se presenta en el dashboard, pero no alimenta el cálculo de la CLI.
- Los resultados son estimaciones académicas y no recomendaciones de apuesta.

## Referencias internas

- `scripts/momio-naive-bayes-cli.ts`
- `src/lib/momioModels.ts`
- `docs/MOMIOLAB_TERMINAL.md`
- `docs/LIVE_SCORES_API.md`
