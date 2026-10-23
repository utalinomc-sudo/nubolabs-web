# Revisión adversarial — diagnostico-mapa-oportunidades (HDU-09)

- Fecha: 2026-10-22
- Revisor: agente independiente (skill `adversarial-review`), sobre el working tree de `feature/diagnostico-mapa-oportunidades` antes del commit
- Veredicto: **FAIL** (1 Major, 9 Minor y 5 preguntas). Tras los arreglos de la sección R de `tasks.md`, todos resueltos o aceptados.

## Verificación propia del revisor
49 archivos y 360 tests, `tsc`, `lint` y `openspec validate --strict` limpios. Sondas de casos límite fuera del repo (jiti). Coincidencia letra a letra de los textos de la spec; ninguna superficie al cliente con índice, montos u horas ahorradas; compatibilidad con leads antiguos; `/admin/estimador` sin `fetch`; log sin datos personales.

## Hallazgos y resolución

| Severidad | Hallazgo | Resolución |
|---|---|---|
| **Major** | Un `meta.areas` mínimo (`{ id, friccion }`) se aceptaba y rompía el detalle (`a.respuestas.map`) y la ficha (`text(a.area)`). El lead quedaba sin poder borrarse, porque el botón de borrar vive en el detalle | `normalizeDiagnosticMeta` rearma el `meta` en el servidor con las 6 áreas completas (nombre y respuestas). `storedAreas` lee las áreas de forma defensiva en el detalle y la ficha. Tests: función pura, `POST /api/leads`, ficha y **detalle con Firestore simulado** (`app/admin/(panel)/leads/[id]/page.test.tsx`) |
| Minor | El mapa confiaba en el `friccion` del cliente (`friccion: 100` con respuestas "Nunca" → alta) | El puntaje sale de las respuestas; el `friccion` recibido solo se usa si el área no trae respuestas válidas. El índice también se recalcula (test) |
| Minor | La ficha decía "El cliente no agregó el paso opcional de estimación de ahorro" en todo lead nuevo | Texto quitado (test) |
| Minor | La búsqueda por `area`/`corto` tomaba el primer elemento de `AREAS` que coincidiera con cualquiera de los dos | `findAreaId`: `id`, después nombre, después nombre corto (test) |
| Minor | Preguntas abiertas inventadas dibujadas en el PDF; `/api/diagnostico/report` sin límite de tamaño, y un cuerpo `null` daba 500 | Solo preguntas conocidas (las actuales y la primera anterior), con respuestas de hasta 1.000 caracteres; 400 si el cuerpo no es un objeto o si `meta` pasa de 64 KB (tests) |
| Minor | Documentación: `api-spec` y ESTADO nombraban `indiceFriccion` como disparador; la decisión 7 decía que la lista lee `meta.oportunidades`; faltaban funciones en la decisión 1 | Corregido en `docs/api-spec.yml`, `docs/ESTADO-PROYECTO.md` (#17) y `design.md` (decisiones 1, 3, 4, 7 y 8). El estado "en preview" queda cierto al subir la rama |
| Minor | Contraste de los chips de nivel (≈ 4,1 y 4,3:1 a 12 px) | Rojo sobre blanco con borde (4,6:1) y azul oscuro sobre celeste (5,8:1) en el bloque de la portada y en el detalle del lead |
| Minor | Hex nuevos `#FF8A7F` y `#DCE6F7` en el panel de `/diagnostico` | Tokens `text-accent`, `text-brand-light`, `text-inverse-muted` y `text-inverse-strong` |
| Minor | Tests faltantes: redirección sin sesión, páginas del panel, `sendClientReport`, tarjeta de éxito | `app/admin/(panel)/layout.test.tsx` (sin sesión → `/admin/login`; con sesión, menú con el estimador), test del detalle, `sendClientReport` con `fetch` simulado (asunto y adjunto) y barrido de la tarjeta de éxito |
| Minor | El `message` interno lo armaba el cliente | Lo arma el servidor con `diagnosticSummary` (test) |
| Pregunta | "ni horas" contra "en menos de 24 horas" | La spec precisa "horas ahorradas" |
| Pregunta | El PDF solo muestra el nombre de pila | La spec precisa "el nombre en el saludo y la empresa si existe" |
| Pregunta | Orden del ejemplo de la portada | El ejemplo sigue el orden de la tabla (ventas, control, orden, equipo) |
| Pregunta | Bajo 960 px el panel queda bajo el cuestionario | Aceptado (como antes del cambio); anotado en design.md |
| Pregunta | Clientes con la página vieja envían áreas sin `id` | Resuelto por la normalización en el servidor |

## Re-verificación (sección R de `tasks.md`)
`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (`--maxWorkers=2`, **51 archivos, 374 tests**) · `npm run build` ✔ · `openspec validate diagnostico-mapa-oportunidades --strict` ✔. Los tests de comportamiento nuevos fallaron antes del arreglo; los del detalle con lead antiguo y la redirección sin sesión son de cobertura.
