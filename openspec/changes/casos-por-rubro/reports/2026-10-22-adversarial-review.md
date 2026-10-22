# Revisión adversarial — casos-por-rubro (HDU-05)

- Fecha: 2026-10-22
- Revisor: agente independiente (skill `adversarial-review`), sobre el working tree de `feature/casos-por-rubro` antes del commit
- Veredicto: **PASS WITH GAPS** (sin Blocker ni Major; 9 Minor y 3 preguntas)

## Verificación propia del revisor
`npx vitest run --maxWorkers=2` (37 archivos, 277 tests), `npx tsc --noEmit`, `npm run lint` y `openspec validate casos-por-rubro --strict` limpios. Pruebas fuera del repo con datos raros (rubro arreglo/objeto/número, `items` como mapa, 100 000 ítems → 18 en ~5 ms, bajada con espacios). Los textos por defecto no llegan a los chunks del cliente.

## Hallazgos y resolución

| Severidad | Hallazgo | Resolución |
|---|---|---|
| Minor | Con un solo rubro, el filtro no filtra nada ("Todos" y el rubro muestran lo mismo) | Chips solo con 2 o más rubros; spec con los escenarios "Chips de rubros sin casos" (dos rubros) y "Un solo rubro"; test |
| Minor | Un título con solo un espacio de ancho cero se publicaba y creaba un chip | `isValid` de casos con `hasContent` (como cifras); el detalle se muestra solo si tiene contenido; escenario "Texto principal invisible"; test con U+200B, U+2060 y "..." |
| Minor | `aria-pressed` sin poder soltar el botón | Pulsar el chip elegido vuelve a "Todos"; escenario "Soltar el chip elegido"; test |
| Minor | Ícono de la etiqueta en gris (la referencia usa azul) | `text-brand`; test |
| Minor | Tests solo del camino feliz (hidratación, banda de cifras, casos borde) | Test de hidratación (`renderToString` + `hydrateRoot`, sin `console.error`), de la banda de cifras (`py-16`, sin `border-t`) y de dos rubros |
| Minor | `docs/frontend-standards.md` sin `casesLabels`, `CASE_RUBROS` ni `normalizeCaseRubro` | Agregados |
| Minor | La HDU-05 del backlog hablaba de scroll horizontal y de "sin saltos de layout" | Nota de ajustes al implementar en `docs/backlog/prospectos-oa.md` |
| Minor | Ayuda de la casilla "Ejemplos" con el título viejo | "Ejemplos por rubro con filtro" |
| Minor | El plan de reversión no avisaba del corte en 12 casos ni de la bajada vieja | Paso 3 del plan de migración precisado (restaurar el respaldo de `config/site`) |
| Pregunta | El preview no muestra la función con datos reales (producción tiene 6 casos viejos) y guardar ahí escribe en producción | Aprobar con las capturas del E2E local; P.1 dice explícitamente "no guardar desde el preview" y respaldar antes |
| Pregunta | Largo de la sección a 375 px con "Todos" (2.633 px) | Decisión de producto pendiente con Mauro ("Ver todos" en móvil, en otro cambio) |
| Pregunta | Qué guardó producción en `content.casos` (solo `items` o la sección completa) define el encabezado hasta P.1 | Confirmar en la consola de Firebase al hacer el respaldo |

Seguimiento fuera de alcance: aplicar `hasContent` también a las demás listas variables (dolores, servicios, preguntas…).

## Re-verificación (sección R de `tasks.md`)
`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (`--maxWorkers=2`, **37 archivos, 283 tests**) · `npm run build` ✔ · `openspec validate casos-por-rubro --strict` ✔. Los 4 tests de comportamiento nuevos fallaron antes del arreglo.
