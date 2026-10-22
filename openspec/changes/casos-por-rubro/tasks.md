## 0. Rama de trabajo

- [ ] 0.1 Crear y cambiar a `feature/casos-por-rubro` desde `main` actualizado (con HDU-01, 03, 02, 10, 04 y 06 mezcladas); verificar con `git branch --show-current`, que `lib/leadOptions.ts` exporta `INDUSTRIES` e `IndustryKey` y que `UseCases.tsx` ya no tiene el bloque de métricas.

## 1. Modelo y normalización (design.md, decisiones 1 y 2) — TDD

- [ ] 1.1 Agregar a `lib/siteConfig.test.ts` (deben fallar): `normalizeCaseRubro` (válido → igual; ausente, desconocido y `"otro"` → `"todos"`), `normalizeCases` (no arreglo → `null`; recorta; descarta sin `title`; arreglo vacío → `[]`), `mergeConfig` (sin `content.casos.items` → 14 defaults; casos viejos sin rubro → `"todos"`) y los defaults (14 casos: 3 todos, 3 gastronomía, 2 automotriz, 2 construcción, 2 servicios, 2 comercio; sin "n8n", "Make", "API", "CRM", "ERP", "IA" ni "horas"); verificar que `npm test` falla.
- [ ] 1.2 Implementar en `lib/siteConfig.ts` `CaseRubro`, `CASE_RUBROS` (desde `lib/leadOptions.ts`), `CaseItem.rubro`, las dos funciones y la mezcla; reemplazar `useCases` en `lib/content.ts` por los 14 casos de la HDU-08 §4 y fijar el encabezado por defecto; verificar que `npm test` pasa y `npx tsc --noEmit` queda limpio.

## 2. Filtro puro (decisión 3) — TDD

- [ ] 2.1 Escribir `components/landing/casesFilter.test.ts` (debe fallar): `availableRubros` (orden de `CASE_RUBROS`, excluye rubros sin casos y `"todos"`), `filterCases` (`"all"` → todos; `"automotriz"` con defaults → 5 casos en orden original), `resultsLabel` ("Mostrando 6 ejemplos de Gastronomía", "Mostrando 14 ejemplos").
- [ ] 2.2 Implementar `components/landing/casesFilter.ts`; verificar que el test de 2.1 pasa.

## 3. Sección en la portada (decisión 4)

- [ ] 3.1 Agregar a `components/icons.tsx` `IconUtensils`, `IconCar`, `IconBuilding`, `IconBriefcase` e `IconBag` con el estilo existente; verificar con `npx tsc --noEmit`.
- [ ] 3.2 Escribir `components/landing/UseCasesFilter.test.tsx` (`// @vitest-environment jsdom`, debe fallar): render inicial con 14 tarjetas y "Todos" presionado; clic en "Gastronomía" → 6 tarjetas, `aria-pressed="true"` solo en ese chip y región viva con "Mostrando 6 ejemplos de Gastronomía"; sin casos de construcción no hay chip "Construcción".
- [ ] 3.3 Implementar `components/landing/UseCasesFilter.tsx` (`"use client"`) y reescribir `components/landing/UseCases.tsx` con el diseño de la referencia (`#ejemplos` de `docs/design/propuesta-web-hdu-08.html`), manteniendo `id="casos"` y `return null` sin casos; verificar que el test de 3.2 pasa y `npm run build` compila.

## 4. Editor del admin (decisión 5)

- [ ] 4.1 En el editor de la sección Casos: selector "Rubro" por caso ("Para todos" + 5 rubros), etiquetas "Texto principal" y "Detalle (opcional)", nuevos casos con `rubro: "todos"`, y "Usar los textos recomendados" que reemplaza encabezado y casos del formulario por los defaults sin guardar; pasar `rubro` desde `app/admin/(panel)/config/page.tsx` si hace falta; verificar en el E2E (N+2.3).

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [ ] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/casos-por-rubro/reports/AAAA-MM-DD-paso-N-verificacion.md` (plantilla de `docs/openspec-tasks-mandatory-steps.md` §5). Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl

- No aplica: el cambio no toca `app/api/**`.

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [ ] N+2.1 Con `npm run dev` (defaults), a 1280 px: la sección `#casos` muestra 14 casos y 6 chips; "Gastronomía" → 6 casos; "Automotriz" → 5; "Todos" → 14; solo el chip elegido tiene `aria-pressed="true"`.
- [ ] N+2.2 A 375 px: chips en varias líneas, cada uno ≥ 44 px de alto, `scrollWidth <= innerWidth`; evaluar el largo de la sección con "Todos" y anotarlo en el reporte (riesgo de design.md).
- [ ] N+2.3 En `/admin/config` (sesión dev local): cambiar el rubro de un caso, agregar uno nuevo (queda "Para todos") y pulsar "Usar los textos recomendados" → el formulario muestra los 14 casos por defecto. Sin datos que restaurar (no hay Firestore local); el guardado se verifica en el preview de Vercel.
- [ ] N+2.4 Guardar capturas y pasos en `openspec/changes/casos-por-rubro/reports/AAAA-MM-DD-paso-N2-e2e.md`.

## N+3. Documentación (OBLIGATORIO)

- [ ] N+3.1 Actualizar `docs/data-model.md` (`casos.items[].rubro` con valores y regla "desconocido → todos"), `docs/api-spec.yml` (`SiteContentPartial.casos.items[].rubro` como enum), `docs/frontend-standards.md` (ejemplo de filtro cliente con lógica pura en la tabla de patrones), `docs/ESTADO-PROYECTO.md` y el estado de HDU-05 en `docs/backlog/prospectos-oa.md`; verificar rutas y nombres.

## Post-merge (Mauro, en producción)

- [ ] P.1 En `/admin/config` → Casos: "Usar los textos recomendados" → revisar → "Guardar" (producción tiene guardados los 6 casos genéricos, que ganan sobre los defaults); confirmar el filtro en https://www.nubolabs.cl.
