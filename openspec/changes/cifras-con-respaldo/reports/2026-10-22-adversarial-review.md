# Revisión adversarial — cifras-con-respaldo (HDU-06)

- Fecha: 2026-10-22
- Revisor: agente independiente (sin el contexto de la implementación), skill `/adversarial-review`
- Alcance: `git diff main` de `feature/cifras-con-respaldo` más los archivos nuevos; artefactos del cambio y specs vigentes de `landing/*`.
- Método del revisor: lectura de artefactos, reportes y capturas; `tsc`, `lint`, 247 tests (`--maxWorkers=2`), `openspec validate`; test temporal con 9 hipótesis (borrado); contraste WCAG.

## Veredicto del revisor
**PASS WITH GAPS** — 1 Major (spec), sin Blocker. Preview publicable (la sección parte oculta y con la configuración real no se muestra ningún número); no archivar sin el delta de `contenido-pyme`.

## Hallazgos y resolución

| # | Severidad | Hallazgo | Resolución |
|---|---|---|---|
| 1 | Major | La spec vigente `landing/contenido-pyme` exceptúa de la regla de vocabulario las cifras de Casos "hasta HDU-06"; archivar sin delta dejaba esa excepción obsoleta | ✅ `specs/landing/contenido-pyme/spec.md` con `## MODIFIED Requirements` ("Vocabulario para dueños de negocio" sin la excepción) y propuesta con la capacidad modificada; `validate --strict` ✔ |
| 2 | Minor (invariante central) | `.trim()` no quita U+200B, U+200C/D, U+2060, U+00AD ni U+180E: una fuente "invisible" (pegada desde Word o WhatsApp) publicaba la cifra; el editor no avisaba | ✅ `hasContent()` (al menos una letra o dígito) en `visibleCifras`, el aviso del editor y la frase de `Metrics`; tests con esos caracteres, "." y "-"; escenario nuevo en la spec |
| 3 | Pregunta | Una fuente "." o "-" pasaba el filtro | ✅ Resuelto por `hasContent()`; exigir más (largo, año) queda como decisión editorial de Mauro |
| 4 | Minor | La fuente usaba `ink-faint`, que los estándares reservan para lo decorativo | ✅ `inverse-muted` (7,8:1 sobre navy, el token de rótulos en mono) |
| 5 | Minor | Docs desfasados: visibilidad "ausente = visible", `metrics` listado en `lib/content.ts`, columnas en `design.md` | ✅ Corregidos (`data-model.md`, `frontend-standards.md`, `design.md`) |
| 6 | Minor (latente) | La casilla del admin usaba `?? true` aunque la sección parte oculta | ✅ `?? !s.defaultHidden` y tipo de `sections` con `defaultHidden`; test sin la clave |
| 7 | Minor | La spec no decía que una frase guardada vacía se respeta | ✅ Escenario "Frase guardada vacía" |
| 8 | Minor | Sin tests de la casilla de visibilidad ni de caracteres invisibles; sin test de más de 4 en `Metrics` | ✅ Agregados (la casilla: desmarcada por defecto y sin la clave; al marcarla se envía `visible.cifras: true`) |
| 9 | Minor | Con 3 cifras entre 640 y 1023 px quedaba 2+1; con 1 cifra, tarjeta enorme | ✅ 3 cifras → 3 columnas desde `sm`; banda a todo el ancho donde 1 cifra se lee como una fila (captura de 1, 3, 4 y solo frase) |
| 10 | Pregunta | Tarjeta navy separada 48–64 px de la banda navy de "Ejemplos"; capturas recortadas | ✅ La banda de cifras ahora continúa la de "Ejemplos" (línea superior, como el bloque anterior); `spaced` si "Ejemplos" está oculta; capturas de contexto a 1280 y 375 px |
| 11 | Detalle | `<ul>` sin viñetas pierde la semántica de lista en Safari/VoiceOver | ✅ `role="list"` |

## Re-verificación
`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (`--maxWorkers=2`, **34 archivos, 251 tests**) · `npm run build` ✔ · `openspec validate --strict` ✔. Cambios temporales de E2E revertidos.

## Veredicto final
**PASS** tras las correcciones. Publicable en preview (sin guardar contenido desde él) y archivable tras la aprobación y la mezcla.
