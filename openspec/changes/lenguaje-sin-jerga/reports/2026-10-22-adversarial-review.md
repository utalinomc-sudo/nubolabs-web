# Revisión adversarial — lenguaje-sin-jerga (HDU-02)

- Fecha: 2026-10-22
- Revisor: agente independiente (sin el contexto de la implementación), skill `/adversarial-review`
- Alcance: `git diff main` de `feature/lenguaje-sin-jerga` más los archivos nuevos del cambio; artefactos de `openspec/changes/lenguaje-sin-jerga/` y la referencia `docs/design/propuesta-web-hdu-08.html`.
- Método del revisor: lectura de spec/diseño/tareas/reportes, `npx vitest run` (159 en verde), `npx tsc --noEmit`, test temporal con 16 casos (documento de producción simulado, mezcla `merge:true` de Firestore, formas raras y admin; **borrado después**), cálculo de contraste WCAG.

## Veredicto del revisor
**PASS WITH GAPS** — 2 Major (spec y operación), sin errores de código en la portada. Preview publicable con cuidado del Firestore compartido; archivo no aconsejable hasta corregir la spec.

## Hallazgos y resolución

| # | Severidad | Hallazgo | Resolución |
|---|---|---|---|
| 1 | Major | Validar el guardado en el preview escribe en el Firestore de producción (que corre `main`): restablecer Servicios quitaría la tarjeta "Diagnóstico" de la portada vigente; ediciones de prueba aparecerían al mezclar; el guardado dejaba fijos los defaults | ✅ Protocolo en `design.md` (Risks, Migration Plan paso 0 y 1), `tasks.md` (N+2.3, P.0, R.2) y `docs/ESTADO-PROYECTO.md`: no guardar contenido desde el preview, respaldo de `config/site` antes de P.1, guardado real validado con P.1. Además el admin ahora **envía solo las secciones modificadas** (ver 10) |
| 2 | Major | La spec decía que todo texto vacío cae al default; `mergeList` deja `""` en campos de ítems válidos y descarta ítems sin título | ✅ Excepción escrita en `spec.md` (listas de largo variable) con el escenario "Lista variable con ítems vacíos" y su test en `lib/siteConfig.sections.test.ts` |
| 3 | Minor | `visible` sin normalizar: un `null` ocultaba la sección pero el menú la seguía enlazando | ✅ `mergeVisible` en `lib/siteConfig.ts` (solo booleanos ganan) + test |
| 4 | Minor | `cierreCta` con `whitespace-nowrap`: un texto largo desbordaba a 375 px | ✅ `sm:whitespace-nowrap` en `Problem.tsx` |
| 5 | Minor | La prueba de vocabulario no cubría textos fijos (panel del hero, formulario, pie, rótulos en JSX) ni "nube" | ✅ `components/landing/Home.vocabulario.test.tsx` renderiza la portada completa y aplica la regex + "nube" (con comprobación de que el texto recorrido no es vacío). Rótulos fijos movidos a `sectionLabels` en `lib/content.ts` |
| 6 | Minor | "+120 h ahorradas al mes" visible y la exclusión hasta HDU-06 solo estaba en el diseño | ✅ Escrita en el requisito de vocabulario de la spec |
| 7 | Minor | Contraste: "* cifras referenciales" 3,10:1; comentario de `inverse` inexacto; "+"/"=" decorativos 2,49:1 | ✅ `text-inverse-muted` en `UseCases.tsx`; comentario corregido (≥ 4,5:1). "+"/"=" quedan: están dentro de un `aria-hidden` decorativo (WCAG 1.4.3 exceptúa texto que es parte de una imagen) |
| 8 | Minor | `ListField`: claves por índice (el foco no seguía al ítem), botones de 32 px, aviso `role="status"` montado de forma condicional | ✅ Claves estables y deterministas (sin desajuste de hidratación), foco que sigue al ítem (o pasa a "Bajar"/"Subir" en los extremos), anuncio en región viva, botones de 44 px; aviso de `SectionCard` en región siempre montada. Test de foco en `ConfigEditor.test.tsx`; comprobado en el navegador |
| 9 | Minor | El admin deja guardar ítems vacíos que la portada descarta sin avisar | ✅ Avisos en los editores ("Un dolor vacío no se publica…", "Un campo vacío usa el texto recomendado", etc.) |
| 10 | Minor / Pregunta | Cada guardado dejaba fijos en Firestore los defaults de todas las secciones | ✅ `changedKeys` en `ConfigEditor.tsx`: se envía la visibilidad y solo las secciones modificadas desde la carga o el último guardado. Spec ("Guardar solo lo modificado"), `design.md` decisión 5, `docs/data-model.md`, `docs/api-spec.yml`, `docs/frontend-standards.md` y tests (payload con la edición; segundo guardado sin `content`; restablecer Servicios de forma antigua) |
| 11 | Minor | Tests: `MANAGED_KEYS` contra lista escrita a mano; sin tests de Services/Process; restablecer no revisaba la franja de éxito; ningún test veía la edición en el payload | ✅ `MANAGED_KEYS` + `equipo` = claves de `SiteContent`; `Services.test.tsx` (2) y `Process.test.tsx` (1); el test de restablecer revisa la franja; el de guardado revisa la edición |
| 12 | Minor | `IconSearch` sin `aria-hidden` | ✅ Agregado |
| 13 | Minor | El rollback no avisaba que, tras P.1, la portada anterior pierde la tarjeta "Diagnóstico" | ✅ Nota en el Migration Plan de `design.md` |
| 14 | Minor (preexistente) | `nosotros.objetivos` no arreglo tumba `/admin/config` | ⏭ Seguimiento: pendiente 15 de `docs/ESTADO-PROYECTO.md` (actualizado) |
| 15 | Pregunta | `/diagnostico`: el panel final sigue con "Índice de fricción" y el estimador | ⏭ Anotado en el estado de HDU-02 en `docs/backlog/prospectos-oa.md`: pasa a HDU-09 |
| 16 | Pregunta | `<title>` "Nubolabs — AI & Automation Agency" | ⏭ Decisión vigente de HDU-01 (identidad de marca); se le menciona a Mauro |
| 17 | Pregunta (preexistente) | La "Etiqueta" de Ejemplos no se muestra en la portada | ⏭ Para HDU-05 (rediseño de Casos) |

## Re-verificación
`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (**22 archivos, 170 tests**) · `npm run build` ✔. E2E corto con Playwright: mover un dolor con el teclado (foco y anuncio), botones de 44 px, guardado con POST interceptado (solo `problema` con la edición; segundo guardado solo `visible`), barrido de vocabulario a 375 px (0 coincidencias) y sin scroll horizontal; consola sin errores de hidratación.

## Veredicto final
**PASS** tras las correcciones: los 2 Major y los Minor de código, tests y spec quedaron resueltos; quedan 4 seguimientos (14–17) fuera del alcance. Publicable en preview (sin guardar contenido desde él) y archivable tras la aprobación y la mezcla.
