# Fuente de partidos en vivo

## Integración actual

MomioLab consulta **SportScore** desde `src/LiveMatches.tsx`:

```text
GET https://sportscore.com/api/widget/matches/?sport=football&limit=50
```

No se necesita cuenta ni API key. La respuesta trae partidos activos y recientes con local, visitante, marcador, estado, hora, competición y enlaces/logos. El navegador consulta el feed al abrir la pestaña y cada 60 segundos; SportScore documenta una caché de borde del mismo intervalo.

La pestaña muestra hasta 12 partidos a la vez, permite filtrar las competiciones incluidas en el feed recibido y selecciona Liga MX cuando viene en la respuesta. El proveedor pide el enlace visible **Powered by SportScore** con `rel="dofollow"`; ya está en el pie del panel.

## Límites y alcance

- El nivel gratuito permite aproximadamente 10,000 solicitudes por cada 24 horas y cada IP.
- Los datos son “as is”, sin SLA; SportScore advierte que marcadores y horarios pueden corregirse.
- El endpoint entrega un máximo de 50 partidos recientes/en vivo. El filtro solo busca dentro de esos 50; no es un calendario completo de todas las ligas.
- El feed ofrece marcadores y estados, no cuotas de casas. El modelo de momios sigue separado y aún usa el CSV sintético de demostración.
- Uso previsto: prototipo académico. El nivel gratuito requiere atribución visible en cada pantalla que muestre estos datos.

## Opciones comparadas

| Servicio | Gratis y límites publicados | Evaluación para MomioLab |
| --- | --- | --- |
| **SportScore** | Sin clave; unas 10,000 solicitudes/día/IP; feed de hasta 50 partidos; exige atribución. | Elegido: marcador global, CORS habilitado y acceso inmediato, sin registro. |
| API-Football / API-Sports | Nivel de $0 con 100 solicitudes/día y 10/min; hay que crear cuenta y usar API key. Incluye livescore y odds. | Más control de ligas y endpoints, pero la cuota diaria no alcanza para sondeo cada minuto. |
| football-data.org | Nivel de €0: 12 competiciones, marcadores retrasados y 10 solicitudes/min; livescores en tiempo real aparecen en un plan de pago. | No satisface el requisito de marcador en vivo gratuito. |
| OpenLigaDB | Sin cuenta ni key; límite publicado de 60 solicitudes/min; datos de las competiciones presentes en su catálogo. | Buena alternativa simple, pero la cobertura disponible no es tan amplia como la necesaria para el tablero global. |
| TheSportsDB | API v1 gratuita con clave pública `123`, 30 solicitudes/min; su documentación reserva livescores para Premium. | Útil para eventos, calendarios y metadatos; no para obtener scores en vivo en el nivel gratis. |
| Sportmonks | Plan gratuito sin tarjeta ni vencimiento, limitado a Danish Superliga y Scottish Premiership; token de cuenta. | Funciona para probar livescores, pero no cubre Liga MX en su nivel gratuito documentado. |
| ScoreBat | El feed gratuito da videos de partidos antiguos; los feeds recientes/de competición son de pago. | No es una API de estado y marcador en vivo. |

## Fuentes oficiales

- [SportScore: API, endpoints, caché y límite](https://sportscore.com/developers/)
- [SportScore: términos del nivel gratuito y atribución](https://sportscore.com/developers/terms/)
- [API-Football: planes y precio](https://www.api-football.com/pricing)
- [API-Football: documentación de endpoints y autenticación](https://www.api-football.com/documentation_v3)
- [football-data.org: precios y cobertura](https://www.football-data.org/pricing)
- [football-data.org: política de solicitudes](https://docs.football-data.org/general/v4/policies.html)
- [OpenLigaDB: API y límites](https://api.openligadb.de/index.html)
- [TheSportsDB: guía de API v1 y nivel gratis](https://www.thesportsdb.com/api.php)
- [Sportmonks: preguntas frecuentes del plan gratis](https://www.sportmonks.com/faq/)
- [ScoreBat: documentación de acceso y feeds](https://www.scorebat.com/video-api/docs/)

Comparación revisada el **9 de noviembre de 2026**. Antes de publicar o ampliar el uso, vuelve a revisar límites, cobertura y términos del proveedor.
