## 0. Rama de trabajo

- [ ] 0.1 Crear y cambiar a `feature/diagnostico-mapa-oportunidades` desde `main` actualizado (con todos los cambios previos de la HDU-08 mezclados, incluido HDU-07); verificar con `git branch --show-current` y que existen `lib/siteConfig.ts`, `lib/leads.ts` y `components/landing/LandingPage.tsx`.

## 1. Cálculo del mapa (design.md, decisiones 1–3) — TDD

- [ ] 1.1 Escribir `components/diagnostico/oportunidades.test.ts` (debe fallar): `areaScore` (todas 1 → 0, todas 5 → 100, `null` ignorados, sin respuestas → `null`); `opportunityLevel` (60 alta, 59 media, 35 media, 34 baja); `buildOpportunityMap` con los escenarios de la spec (62,5 → 63 alta; "Tres principales" Ventas/Orden/Control con empate por orden de tabla; "Todo bajo" → solo Control; dimensión sin datos fuera de principales; `proximoPaso` de la primera); `areaScoresFromMeta` con formato nuevo (`id`), antiguo (`area`/`corto`) y entradas inválidas (`friccion` no numérica, `meta` no objeto); `withOpportunityMap` reemplaza un `oportunidades` manipulado y elimina `ahorro`. Verificar que `npm test` falla por falta del módulo.
- [ ] 1.2 Implementar `components/diagnostico/oportunidades.ts` (`DIMENSIONS` con los textos de la spec, `areaScore`, `opportunityLevel`, `areaScoresFromMeta`, `buildOpportunityMap`, `withOpportunityMap`); verificar que `npm test` pasa, incluidos los 11 tests de `ahorro.test.ts` sin cambios.

## 2. API y datos (decisión 3)

- [ ] 2.1 En `app/api/leads/route.ts`, aplicar `withOpportunityMap(meta)` a los leads con `source: "diagnostico"` antes de guardar; verificar con el curl del paso N+1 (el log `[leads]` sin Firebase muestra `meta.oportunidades` recalculado y sin `ahorro`).
- [ ] 2.2 Cambiar `reportDataFromLead()` en `lib/report.ts` a la nueva condición (al menos un área con puntaje, formato nuevo o antiguo) y a `ReportData.mapa` (sin `indice`, `nivel`, `areas`, `ahorro`); ajustar `maybeSendClientReport()` a la nueva forma. Verificar con `npx tsc --noEmit` y con los curl del paso N+1 (nuevo → 200, antiguo → 200, sin áreas → 400).

## 3. Informe y correo al cliente (decisión 4)

- [ ] 3.1 Reescribir en `buildReportPdf()` los bloques "TU MAPA DE OPORTUNIDADES", "TUS OPORTUNIDADES PRINCIPALES" y "PRÓXIMO PASO SUGERIDO", eliminar "AHORRO ESTIMADO" y el bloque del índice, y actualizar título/asunto del documento; verificar descargando el PDF en el E2E (paso N+2) y abriéndolo: sin índice, sin "$", sin horas.
- [ ] 3.2 Escribir el test de `buildClientReportHtml` (`lib/email.test.ts` con `vi.mock("server-only", () => ({}))`, debe fallar): incluye la oportunidad principal y el próximo paso, escapa HTML del nombre, no contiene "fricción" ni "ahorro".
- [ ] 3.3 Extraer `buildClientReportHtml(input)` en `lib/email.ts`, cambiar `ClientReportInput` (`oportunidadPrincipal`, `proximoPaso`) y adaptar `sendClientReport()` y su llamada en `app/api/leads/route.ts`; verificar que el test de 3.2 pasa.

## 4. `/diagnostico` (decisión 5)

- [ ] 4.1 En `components/diagnostico/cuestionario.ts`, cambiar `ABIERTAS[0]` a `{ id: "mejorar", label: "¿Qué es lo que más te gustaría mejorar en tu negocio este año?" }`; verificar con `npx tsc --noEmit` (el estado de `DiagnosticoFlow` usa los ids).
- [ ] 4.2 En `components/diagnostico/DiagnosticoFlow.tsx`: quitar el estimador (estado, bloque opcional y bloque de ahorro del panel), agregar `id` a `areas`, calcular `oportunidades` con `buildOpportunityMap`, reemplazar el panel del índice por "TU MAPA DE OPORTUNIDADES" (nivel en texto y "sin datos"), y actualizar badge, título, bajada y tarjeta de éxito; verificar en el E2E que no aparecen "índice de fricción", "ahorro", "$" ni "h/mes" (búsqueda en `document.body.innerText`).
- [ ] 4.3 Actualizar `description` en `app/diagnostico/page.tsx`; verificar con `curl -s http://localhost:3000/diagnostico | grep 'name="description"'` sin "ahorrar".

## 5. Estimador interno (decisión 6)

- [ ] 5.1 Crear `components/admin/EstimadorInterno.tsx` (cliente: `AhorroEstimator` + totales con `calcTotals`/`fmtCLP`, sin `fetch`) y `app/admin/(panel)/estimador/page.tsx`; agregar "Estimador de ahorro" al menú de `app/admin/(panel)/layout.tsx`. Verificar en el E2E (sesión dev) que un proceso por defecto muestra ≈ $155.187/mes y que la pestaña de red no registra escrituras.

## 6. Panel con el mapa (decisión 7)

- [ ] 6.1 Lista `app/admin/(panel)/leads/page.tsx`: columna "Mayor oportunidad" (con cálculo de respaldo), quitar "Ahorro/mes"; detalle `leads/[id]/page.tsx`: bloque "Mapa de oportunidades" arriba del índice, manteniendo índice, abiertas y ahorro antiguo; ficha `lib/leadReport.ts`: sección "MAPA DE OPORTUNIDADES". Verificar con `npx tsc --noEmit`, `npm run build` y en el preview con un lead antiguo real (paso post-merge P.1), ya que localmente no hay Firestore.

## 7. Bloque "Autodiagnóstico" en la landing (decisión 8) — TDD

- [ ] 7.1 Agregar a `lib/siteConfig.test.ts` (debe fallar): `autodiagnostico` en `SECTIONS` entre `proceso` y `contacto`, visible por defecto; `content.autodiagnostico` por defecto con los textos de la spec; override parcial del título.
- [ ] 7.2 Implementar en `lib/siteConfig.ts` (`SECTIONS`, tipo, default, `mergeConfig`) y agregar al editor del CMS el bloque "Autodiagnóstico" con "Usar los textos recomendados" (`components/admin/config/AutodiagnosticoEditor.tsx`) y sumar `autodiagnostico` a `MANAGED_KEYS` del contenedor `ConfigEditor.tsx` (si no, el guardado la descarta); verificar que `npm test` pasa.
- [ ] 7.3 Crear `components/landing/SelfDiagnosis.tsx` según `.selfdx`/`.map` de `docs/design/propuesta-web-hdu-08.html` con tokens de HDU-01 (sin hex nuevos), ejemplo con `DIMENSIONS`, etiqueta "Ejemplo", sin números visibles; renderizarlo en `components/landing/LandingPage.tsx` según `visible.autodiagnostico`. Verificar en el E2E posición (después de `#modelo`, antes de `#contacto`), botón a `/diagnostico` ≥ 44 px y ausencia de dígitos, "%" y "$" en la tarjeta.

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [ ] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/diagnostico-mapa-oportunidades/reports/AAAA-MM-DD-paso-N-verificacion.md`. Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl (OBLIGATORIO — el agente lo ejecuta)

- [ ] N+1.1 Con `npm run dev` (sin `.env.local`): `POST /api/diagnostico/report` con (a) `meta` nuevo (`areas[].id` + `friccion`) → 200 `application/pdf` (guardar el archivo y comprobar cabecera `%PDF`); (b) `meta` antiguo (`indiceFriccion`, `areas` solo con `area`/`corto`, `ahorro`) → 200; (c) `meta` sin áreas con puntaje → 400 con el `{ error }` de la spec; (d) JSON inválido → 400.
- [ ] N+1.2 `POST /api/leads` con un diagnóstico (`source: "diagnostico"`, datos de contacto y consentimiento válidos de HDU-03, `meta` con `oportunidades` manipulado y un `ahorro` sobrante) → 200 `persisted: false`; comprobar en la consola del servidor que el lead registrado trae el mapa recalculado y no trae `ahorro`.
- [ ] N+1.3 Guardar comandos, respuestas y extractos de log en `openspec/changes/diagnostico-mapa-oportunidades/reports/AAAA-MM-DD-paso-N1-curl.md`. Estado de datos: sin Firestore local, nada que restaurar (dejarlo explícito); no se envían correos (sin Resend).

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [ ] N+2.1 A 1280 px y 375 px, `/diagnostico`: el panel muestra "sin datos" al inicio; responder solo "Clientes y reportes" actualiza solo "Ventas y clientes"; responder las 18, completar el contacto y enviar; la tarjeta de éxito habla del mapa; descargar el PDF y revisar su contenido; en toda la página no aparecen "índice de fricción", "ahorro", "$" ni horas; sin scroll horizontal a 375 px.
- [ ] N+2.2 Portada a 1280 y 375 px: bloque "Autodiagnóstico" entre el proceso y el formulario, con "Ejemplo" y botón a `/diagnostico`; con la sección oculta desde el editor (sesión dev, sin guardar en Firestore se verifica solo el estado del editor) no aplica localmente → se verifica en el preview (P.2).
- [ ] N+2.3 Admin con sesión dev: `/admin/estimador` calcula y no escribe; el menú tiene "Estimador de ahorro"; `/admin/leads` muestra la columna "Mayor oportunidad" (vacía sin Firestore); bloque "Autodiagnóstico" del editor con su botón "Usar los textos recomendados".
- [ ] N+2.4 Guardar pasos y capturas en `openspec/changes/diagnostico-mapa-oportunidades/reports/AAAA-MM-DD-paso-N2-e2e.md`.

## N+3. Documentación (OBLIGATORIO)

- [ ] N+3.1 Actualizar `docs/data-model.md` (§2.1: `areas[].id`, `oportunidades`, `ahorro` solo en leads antiguos; `visible.autodiagnostico`; `content.autodiagnostico`), `docs/api-spec.yml` (`DiagnosticoMeta`, condición del 400 de `/api/diagnostico/report`, `SiteContentPartial.autodiagnostico`), `docs/frontend-standards.md` (estructura: `oportunidades.ts`, `/admin/estimador`, `SelfDiagnosis.tsx`), `docs/project-profile.md` §8 (glosario: "Mapa de oportunidades", "Ahorro estimado" como herramienta interna), `docs/ESTADO-PROYECTO.md` y el estado de HDU-09 en `docs/backlog/prospectos-oa.md`.
- [ ] N+3.2 Al archivar (`/opsx:archive`), actualizar el `## Purpose` de `openspec/specs/diagnostico/estimador-ahorro/spec.md` para decir que el estimador es una herramienta interna del panel y que sus montos no se muestran al cliente; verificar con `openspec validate --specs --strict`.

## Post-merge (Mauro, en producción)

- [ ] P.1 En el preview de Vercel: hacer un diagnóstico de prueba con su propio correo y revisar pantalla, PDF descargado y correo recibido (sin índice ni ahorro); abrir en el panel un lead de diagnóstico antiguo y confirmar mapa + índice + ahorro sin errores; borrar el lead de prueba desde el panel.
- [ ] P.2 En `/admin/config` → "Autodiagnóstico": "Usar los textos recomendados", revisar, guardar y confirmar que el bloque aparece (y que al ocultarlo desaparece sin hueco).
