## 0. Rama de trabajo

- [x] 0.1 Crear y cambiar a `feature/casos-por-rubro` desde `main` actualizado (con HDU-01, 03, 02, 10, 04 y 06 mezcladas); verificar con `git branch --show-current`, que `lib/leadOptions.ts` exporta `INDUSTRIES` e `IndustryKey` y que `UseCases.tsx` ya no tiene el bloque de métricas.

## 1. Modelo y normalización (design.md, decisiones 1 y 2) — TDD

- [x] 1.1 Agregar a `lib/siteConfig.casos.test.ts` (deben fallar; archivo aparte como en las HDU anteriores): `normalizeCaseRubro` (válido → igual; ausente, desconocido y `"otro"` → `"todos"`), `CASE_RUBROS` (los 5 rubros de `INDUSTRIES` sin `"otro"`, en su orden), `mergeConfig` (sin `content.casos.items` → 14 defaults; no arreglo, arreglo vacío o solo casos sin texto → defaults; recorta; descarta sin `title`; casos viejos sin rubro → `"todos"`; máximo 18) y los defaults (14 casos: 3 todos, 3 gastronomía, 2 automotriz, 2 construcción, 2 servicios, 2 comercio, con `body: ""`; encabezado "Ejemplos por rubro" / "Esto es lo que dejamos funcionando en negocios como el tuyo" sin bajada; sin "n8n", "Make", "API", "CRM", "ERP", "IA" ni "horas"); actualizar en `lib/siteConfig.sections.test.ts` la aserción de la bajada de Casos (delta MODIFIED de `landing/contenido-pyme`); verificar que `npm test` falla.
- [x] 1.2 Implementar en `lib/siteConfig.ts` `CaseRubro`, `CASE_RUBROS` (desde `lib/leadOptions.ts`), `CaseItem.rubro`, `normalizeCaseRubro`, `mergeCase` y la mezcla con `mergeList` (1 a 18); reemplazar los casos por defecto de `defaultSiteConfig()` por los 14 casos de la HDU-08 §4 y fijar el encabezado por defecto; verificar que `npm test` pasa y `npx tsc --noEmit` queda limpio.

## 2. Filtro puro (decisión 3) — TDD

- [x] 2.1 Escribir `components/landing/casesFilter.test.ts` (debe fallar): `availableRubros` (orden de `CASE_RUBROS`, excluye rubros sin casos y `"todos"`; solo casos "todos" → `[]`), `filterCases` (`"all"` → todos; `"automotriz"` con defaults → 5 casos en orden original), `resultsLabel` ("Mostrando 6 ejemplos de Gastronomía", "Mostrando 14 ejemplos", "Mostrando 1 ejemplo de Comercio").
- [x] 2.2 Implementar `components/landing/casesFilter.ts`; verificar que el test de 2.1 pasa.

## 3. Sección en la portada (decisión 4)

- [x] 3.1 Agregar a `components/icons.tsx` `IconUtensils`, `IconCar`, `IconBuilding`, `IconBriefcase` e `IconBag` con el estilo existente; verificar con `npx tsc --noEmit`.
- [x] 3.2 Escribir `components/landing/UseCasesFilter.test.tsx` (`// @vitest-environment jsdom`, debe fallar): render inicial con 14 tarjetas y "Todos" presionado; clic en "Gastronomía" → 6 tarjetas, `aria-pressed="true"` solo en ese chip y región viva con "Mostrando 6 ejemplos de Gastronomía"; "Todos" → 14; sin casos de construcción no hay chip "Construcción"; solo casos "todos" → sin chips y con la etiqueta "Para todos"; un caso con `body` lo muestra. Sumar al barrido de `components/landing/Home.vocabulario.test.tsx` la etiqueta "Para todos".
- [x] 3.3 Implementar `components/landing/UseCasesFilter.tsx` (`"use client"`) y reescribir `components/landing/UseCases.tsx` con el diseño de la referencia (`#ejemplos` de `docs/design/propuesta-web-hdu-08.html`), manteniendo `id="casos"` y `return null` sin casos, con los textos fijos en `casesLabels` de `lib/content.ts`; verificar que el test de 3.2 pasa y `npm run build` compila.
- [x] 3.4 Banda de cifras (design.md decisión 6): en `components/landing/Metrics.tsx`, con cifras, banda navy propia con `py-16 lg:py-20` y sin la línea superior; quitar la prop `spaced` y su uso en `app/page.tsx`; verificar `components/landing/Metrics.test.tsx` y `npx tsc --noEmit`.

## 4. Editor del admin (decisión 5)

- [x] 4.1 Agregar a `components/admin/ConfigEditor.test.tsx` (debe fallar): en "Ejemplos", el selector "Rubro" del caso 1 ofrece "Para todos" + 5 rubros y al cambiarlo y guardar se envía solo `content.casos` con ese `rubro`; un caso nuevo parte con "Para todos"; "Usar los textos recomendados" deja 14 casos y no guarda.
- [x] 4.2 En `components/admin/config/CasosEditor.tsx`: `SelectField` (nuevo, en `Field.tsx`) "Rubro" por caso, etiquetas "Texto principal" y "Detalle (opcional)", lista de 1 a 18, nuevos casos con `rubro: "todos"` y la bajada como "Bajada (opcional)"; verificar que el test de 4.1 pasa y en el E2E (N+2.3).

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [x] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/casos-por-rubro/reports/AAAA-MM-DD-paso-N-verificacion.md` (plantilla de `docs/openspec-tasks-mandatory-steps.md` §5). Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl

- No aplica: el cambio no toca `app/api/**`.

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [x] N+2.1 Con `npm run dev` (defaults), a 1280 px: la sección `#casos` muestra 14 casos y 6 chips; "Gastronomía" → 6 casos; "Automotriz" → 5; "Todos" → 14; solo el chip elegido tiene `aria-pressed="true"`.
- [x] N+2.2 A 375 px: chips en varias líneas, cada uno ≥ 44 px de alto, `scrollWidth <= innerWidth`; evaluar el largo de la sección con "Todos" y anotarlo en el reporte (riesgo de design.md).
- [x] N+2.3 En `/admin/config` (sesión dev local): cambiar el rubro de un caso, agregar uno nuevo (queda "Para todos") y pulsar "Usar los textos recomendados" → el formulario muestra los 14 casos por defecto; al guardar, interceptar `POST /api/admin/config` (sin llegar a Firestore) y revisar que el cuerpo trae solo `content.casos` con los `rubro`. El preview comparte Firestore con producción: ahí no se guarda.
- [x] N+2.4 Con casos viejos sin rubro (default temporal "TEMPORAL E2E: NO COMMITEAR", revertido al terminar): se ven con "Para todos" y sin chips. Con cifras (default temporal): la banda navy de cifras tiene separación propia después de Ejemplos.
- [x] N+2.5 Guardar capturas y pasos en `openspec/changes/casos-por-rubro/reports/AAAA-MM-DD-paso-N2-e2e.md`.

## N+3. Documentación (OBLIGATORIO)

- [x] N+3.1 Actualizar `docs/data-model.md` (`casos.items[].rubro` con valores, regla "desconocido → todos" y 1 a 18 casos), `docs/api-spec.yml` (`SiteContentPartial.casos.items[].rubro` como enum), `docs/frontend-standards.md` (ejemplo de filtro cliente con lógica pura en la tabla de patrones), `docs/ESTADO-PROYECTO.md` y el estado de HDU-05 en `docs/backlog/prospectos-oa.md`; verificar rutas y nombres.

## R. Revisión adversarial (2026-10-22, agente independiente: PASS WITH GAPS, sin Blocker ni Major)

- [x] R.1 Spec y diseño: chips solo con 2 o más rubros (escenarios "Chips de rubros sin casos" con dos rubros y "Un solo rubro"), pulsar el chip elegido vuelve a "Todos" (escenario "Soltar el chip elegido"), texto principal invisible no se publica (escenario "Texto principal invisible"), ícono de la etiqueta en `text-brand` y plan de reversión con el corte en 12 casos; `openspec validate --strict`.
- [x] R.2 Tests: título con U+200B y de solo signos en `lib/siteConfig.casos.test.ts`; un solo rubro → sin chips, soltar el chip elegido e ícono de la etiqueta en `text-brand` en `components/landing/UseCasesFilter.test.tsx` (estos 4 fallaron antes del arreglo). De cobertura (pasaron desde el inicio): dos rubros → 3 chips, hidratación sin avisos (`renderToString` + `hydrateRoot`) y banda de cifras con `py-16` y sin línea superior en `components/landing/Metrics.test.tsx`.
- [x] R.3 Código: `isValid` de casos con `hasContent` (`lib/siteConfig.ts`), detalle solo si tiene contenido, chips con `rubros.length >= 2`, soltar el chip elegido y `text-brand` en el ícono de la etiqueta (`UseCasesFilter.tsx`); ayuda de la casilla "Ejemplos" en `SECTIONS` ("Ejemplos por rubro con filtro").
- [x] R.4 Docs: `docs/frontend-standards.md` (`casesLabels`, `CASE_RUBROS`, `normalizeCaseRubro`) y la HDU-05 de `docs/backlog/prospectos-oa.md` (chips en varias líneas sin scroll horizontal; sin saltos al cargar porque el servidor entrega el estado inicial).
- [x] R.5 Verificar con `npm run lint`, `npx tsc --noEmit`, `npm test` (`--maxWorkers=2`) y `npm run build`.

## Post-merge (Mauro, en producción)

- [ ] P.1 Antes de guardar, respaldar `config/site` desde la consola de Firebase. En `/admin/config` → Ejemplos: "Usar los textos recomendados" → revisar → "Guardar cambios" (producción tiene guardados los 6 casos genéricos, que ganan sobre los defaults); confirmar el filtro en https://www.nubolabs.cl. **No guardar desde el admin del preview** (comparte Firestore con producción).
