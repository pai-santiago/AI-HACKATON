# Primer boceto de MomioLab en terminal

El primer entregable interactivo usa **un solo algoritmo: Naive Bayes gaussiano**. La app web y el resto del dashboard permanecen intactos.

## Abrir y ejecutar en Visual Studio Code

1. Abre la carpeta raíz `AI-HACKATON` en VS Code.
2. Abre la terminal integrada con **Ctrl+`**.
3. Ejecuta `npm run momio:cli`.
4. Elige una acción: predecir un partido, listar equipos, explicar el algoritmo o salir. Para predecir, responde con el número o el nombre de cada equipo.

También puedes ejecutar `npm run momio:demo` para ver una predicción de ejemplo sin interacción.

## Qué muestra

- Probabilidades estimadas de Local, Empate y Visitante.
- Gráfica de barras 1X2 en terminal, escalada de 0 a 100%.
- Momios decimales justos, calculados como `1 / probabilidad` y sin margen de casa.
- Diez variables de forma reciente, calculadas con hasta los últimos cinco partidos.
- Métricas de una separación cronológica 80/20: accuracy, log loss y Brier.

El CSV incluido es **sintético**. Por eso la salida y las métricas solo sirven para enseñar el flujo; no representan datos reales ni recomiendan apostar. El supuesto central de Naive Bayes es la independencia condicional entre variables.

## Usar otro CSV

`npm run momio:cli -- "ruta/al/historial.csv"`

El CSV requiere columnas de fecha, equipo local, equipo visitante, goles del local y goles del visitante. El parser actual acepta encabezados como `date,home_team,away_team,home_goals,away_goals` y exige al menos 60 partidos válidos.




## Siguiente fase

Los requerimientos técnicos pendientes están anotados en [REQUERIMIENTOS_TECNICOS_MOMIOLAB.md](REQUERIMIENTOS_TECNICOS_MOMIOLAB.md).
