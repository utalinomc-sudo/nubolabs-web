## Context

Motivación en `proposal.md`; requisitos en `specs/diagnostico/mapa-oportunidades/spec.md`, `specs/landing/autodiagnostico/spec.md` y el delta de `specs/diagnostico/estimador-ahorro/spec.md`. Este diseño asume mezclados todos los cambios previos de la HDU-08 (§15: HDU-01, 03, 02, 10, 04, 06, 05 y 07). Estado relevante:

- `components/diagnostico/cuestionario.ts`: `AREAS` (6 áreas con `id`: `carga`, `plazos`, `info`, `procesos`, `conocimiento`, `clientes`), `ESCALA`, `ABIERTAS` (`mayorProblema`, `solucionMagica`) y `nivelFriccion()` (umbrales 60/35).
- `components/diagnostico/DiagnosticoFlow.tsx` (cliente, estilos inline): calcula `indice` y `areaBars`; arma `meta = { rubro, indiceFriccion, nivelFriccion, areas[{ area, corto, promedio, friccion, respuestas }], abiertas, ahorro }` — **`areas` no guarda el `id`**; envía a `POST /api/leads` y luego descarga el PDF con `POST /api/diagnostico/report`. El paso opcional usa `AhorroEstimator.tsx` + `ahorro.ts`. Tras HDU-03, la tarjeta de contacto ya pide WhatsApp y los dos consentimientos; tras HDU-07, el payload lleva `referral`.
- `lib/report.ts` (`server-only`): `reportDataFromLead()` devuelve `null` si falta `meta.indiceFriccion`; `buildReportPdf()` dibuja índice de fricción, barras por área, focos, "En tus palabras", ahorro estimado y CTA (`SCHEDULE_URL`).
- `app/api/leads/route.ts`: `maybeSendClientReport()` (solo `source === "diagnostico"`) usa `reportDataFromLead()` y `sendClientReport()` de `lib/email.ts`, que arma chips "ÍNDICE DE FRICCIÓN" y "AHORRO ESTIMADO/MES".
- `lib/leadReport.ts` (ficha interna) y `app/admin/(panel)/leads/[id]/page.tsx` muestran índice, áreas, abiertas y ahorro; la lista `leads/page.tsx` tiene columnas "Fricción" y "Ahorro/mes".
- Spec vigente `openspec/specs/diagnostico/estimador-ahorro/spec.md` (6 requisitos, tests en `components/diagnostico/ahorro.test.ts`).
- CMS en `lib/siteConfig.ts` (HDU-01) con `SECTIONS` en el orden final acordado (… `proceso`, `autodiagnostico`, `contacto` …); la portada se compone en `components/landing/LandingPage.tsx` (HDU-07).
- Referencia visual del bloque: `.selfdx` y `.map` en `docs/design/propuesta-web-hdu-08.html`.
- **Estado real al iniciar el apply (2026-10-22):**
  - La `description` de `app/diagnostico/page.tsx` y el encabezado de `/diagnostico` ya quedaron sin jerga en HDU-02. Solo falta el título de la pestaña ("Diagnóstico operativo — Nubolabs"), que pasa a "Autodiagnóstico — Nubolabs".
  - El CMS tiene un editor por sección en `components/admin/config/` (`SectionCard` con "Usar los textos recomendados"). `ConfigEditor.tsx` guarda solo las secciones modificadas de `MANAGED_KEYS`, y su test exige que estén todas las claves de `SiteContent`.
  - Las pruebas de `siteConfig` van en un archivo por cambio. `lib/siteConfig.sections.test.ts` fija el orden de las primeras secciones, así que hay que ajustarlo al sumar `autodiagnostico` antes de `contacto`.
  - `components/landing/LandingPage.tsx` compone `/` y `/oa`.
  - Existe `app/api/leads/route.test.ts`, con Firestore, correo e informe simulados. `lib/leadReport.test.ts` prueba `buildReportPdf` con un área de nombre libre ("Clientes"), que con la condición nueva ya no cuenta como área.
  - No hay pruebas de `app/api/diagnostico/report/route.ts` ni de `lib/email.ts`.
  - El preview comparte Firestore con producción.

## Goals / Non-Goals

**Goals:**
- Una sola función pura para el mapa, usada en cliente, API, informe, ficha y panel.
- Que ningún lead antiguo pierda información ni rompa una vista.
- Que el visitante no vea horas ni pesos en ningún punto del flujo público.

**Non-Goals:**
- Migrar los estilos inline de `DiagnosticoFlow.tsx` a Tailwind (solo se tocan las piezas que cambian, con tokens donde se reescribe).
- Persistir estimaciones internas o asociarlas a un lead.

## Decisions

### 1. Módulo puro `components/diagnostico/oportunidades.ts` (TDD)
Junto a `cuestionario.ts` y `ahorro.ts` (patrón de `docs/frontend-standards.md` §3), sin `"use client"` ni `server-only`, para importarlo desde `DiagnosticoFlow.tsx`, `app/api/leads/route.ts`, `lib/report.ts`, `lib/leadReport.ts` y las páginas del admin.

```ts
export type DimensionId = "ventas" | "control" | "orden" | "equipo";
export type OpportunityLevel = "alta" | "media" | "baja";
export const DIMENSIONS: { id: DimensionId; nombre: string; areas: AreaId[]; logro: string; proximoPaso: string }[];
export function areaScore(respuestas: (number | null)[]): number | null;           // round(((prom-1)/4)*100)
export function areaScoresFromMeta(meta: unknown): Partial<Record<AreaId, number>>; // por id o, si falta, por nombre/corto vía AREAS
export function buildOpportunityMap(scores: Partial<Record<AreaId, number>>): OpportunityMap;
export function opportunityLevel(score: number): OpportunityLevel;               // ≥60 alta, ≥35 media
```
`OpportunityMap = { dimensiones: { id, nombre, puntaje: number | null, nivel: OpportunityLevel | null }[]; principales: DimensionId[]; proximoPaso: string }`. Los textos de la tabla de la spec viven en `DIMENSIONS`. *Ajustes del apply y de la revisión adversarial:* el módulo también exporta `OPPORTUNITY_LABELS`, `dimensionName`, `mapFromMeta` (mapa de un lead guardado, recalculado siempre desde `areas`), `normalizeDiagnosticMeta` (reemplaza a `withOpportunityMap`, ver decisión 3) y `diagnosticSummary` (resumen interno del lead). `areaScoresFromMeta` busca un área por `id`, después por nombre y después por nombre corto, en ese orden.
- `areaScoresFromMeta` acepta el formato nuevo (`areas[].id` + `friccion`) y el antiguo (`areas[].area`/`corto` + `friccion`), ignorando entradas inválidas. Así el informe y el panel funcionan con leads de antes.
- `nivelFriccion()` se mantiene en `cuestionario.ts` para el uso interno (ficha y detalle).
- *Alternativa descartada:* recalcular desde `areas[].respuestas` en vez de `friccion`. `friccion` ya es el puntaje redondeado por área y existe en todos los leads; recalcular desde respuestas no agrega precisión.

### 2. Nombres en `meta`
`meta` conserva la convención en español de `docs/data-model.md` §2.1 (`indiceFriccion`, `areas`, `abiertas`): el campo nuevo es `meta.oportunidades` (forma `OpportunityMap` + `version: 1`) y `meta.areas[].id`. Los campos de primer nivel del lead siguen en inglés (regla de `leads`).

### 3. El servidor recalcula el mapa
En `app/api/leads/route.ts`, si `source === "diagnostico"` y `meta` es objeto: `meta.oportunidades = { version: 1, ...buildOpportunityMap(areaScoresFromMeta(meta)) }` antes de guardar (reemplaza lo que mande el cliente) y se elimina `meta.ahorro` si viniera de un cliente desactualizado. El cliente también calcula el mapa (para la pantalla y para el PDF de descarga), pero la fuente de verdad guardada es la del servidor. Va como helper puro `withOpportunityMap(meta)` en `oportunidades.ts` con su test.
- *Ajuste de la revisión adversarial (Major):* `withOpportunityMap` solo reemplazaba el mapa, así que un `meta.areas` mínimo (`{ id, friccion }`) se guardaba tal cual y rompía el detalle y la ficha, que leen `area` y `respuestas`. Pasa a `normalizeDiagnosticMeta(meta)`, que rearma el `meta` con una lista blanca de campos:
  - `areas`: las 6 de `AREAS`, con `id`, `area`, `corto`, `respuestas` (valores enteros de 1 a 5 o `null`), `promedio` y `friccion` recalculada desde las respuestas; el `friccion` recibido se usa solo si el área no trae respuestas válidas y está entre 0 y 100. Las áreas desconocidas y las repetidas se descartan.
  - `indiceFriccion` y `nivelFriccion`: recalculados.
  - `abiertas`: solo las preguntas conocidas (las de `ABIERTAS` y la primera anterior a este cambio), con la respuesta recortada a 1.000 caracteres.
  - `rubro`: hasta 120 caracteres.
  - `oportunidades`: calculado.
  - El resto (incluido `ahorro`) se descarta.
  - El `message` del lead lo arma el servidor con `diagnosticSummary`.
- *Alternativa descartada:* confiar en el `meta.oportunidades` del cliente; cualquiera podría guardar un mapa inventado en el lead.

### 4. Informe y correo al cliente
- *Ajuste de la revisión adversarial:* `POST /api/diagnostico/report` aplica `normalizeDiagnosticMeta` antes de armar el PDF (una pregunta abierta inventada no se dibuja). Responde 400 si el cuerpo no es un objeto (antes, un `null` daba 500) o si `meta` pasa de 64 KB (`META_MAX_BYTES`).
- `reportDataFromLead()` cambia su condición: devuelve datos si `areaScoresFromMeta(meta)` tiene al menos un área (formato nuevo o antiguo); si no, `null` → 400 en `POST /api/diagnostico/report` y sin informe en `maybeSendClientReport()`. `ReportData` pierde `indice`, `nivel`, `areas` y `ahorro`, y gana `mapa: OpportunityMap`. Se ignora `meta.ahorro` aunque venga.
- `buildReportPdf()`: reemplaza el bloque navy del índice por "TU MAPA DE OPORTUNIDADES" (4 filas: nombre, barra con `C.blue`/`C.cyan`, nivel en texto), la sección "Focos" por "TUS OPORTUNIDADES PRINCIPALES" (nombre + texto "lo que puedes lograr"), suma "PRÓXIMO PASO SUGERIDO" y elimina "AHORRO ESTIMADO". `setSubject` pasa a "Mapa de oportunidades". Se mantienen logo, encabezado, "En tus palabras" y CTA.
- `lib/email.ts` `sendClientReport()`: `ClientReportInput` cambia `indice/nivel/ahorroMes` por `oportunidadPrincipal?: string` y `proximoPaso?: string`; el HTML dice "tu mapa de oportunidades" y muestra un chip "TU MAYOR OPORTUNIDAD". Se extrae la construcción del HTML a `buildClientReportHtml(input)` exportada para poder testearla con `vi.mock("server-only", () => ({}))` (test: contiene la oportunidad, no contiene "fricción" ni "ahorro").
- *Ajustes del apply:*
  - Tests nuevos en `app/api/diagnostico/report/route.test.ts` con el PDF real: `meta` nuevo → 200 PDF; antiguo → 200; sin áreas → 400 con el `{ error }` de la spec; JSON inválido → 400.
  - `app/api/leads/route.test.ts` comprueba que el lead guardado trae el mapa recalculado y no trae `ahorro`.
  - La prueba de emojis de `lib/leadReport.test.ts` pasa a un área con nombre real ("Clientes y reportes").

### 5. `/diagnostico` sin estimador
- Se eliminan del flujo `ahorroActivo`, `procesos`, el bloque "PASO OPCIONAL" y el bloque "AHORRO ESTIMADO" del panel; `meta` deja de llevar `ahorro`; `areas` suma `id`; se agrega `oportunidades` (calculado en cliente para la pantalla y el PDF).
- El panel navy "TU ÍNDICE DE FRICCIÓN" pasa a "TU MAPA DE OPORTUNIDADES": 4 filas con barra y nivel en texto ("sin datos" si no hay respuestas) más "N de 18 preguntas respondidas"; el aviso al pie dice que el resultado es referencial y se revisa en la sesión.
- Textos: badge "AUTODIAGNÓSTICO · 5 MINUTOS"; título "¿Dónde está la mayor oportunidad de tu negocio?"; bajada sin "fricción" ni "automatización"; tarjeta de éxito "Tu informe en PDF con tu mapa de oportunidades está listo". `app/diagnostico/page.tsx`: `description` sin "estima cuánto podrías ahorrar".
- `ABIERTAS[0]` pasa a `{ id: "mejorar", label: "¿Qué es lo que más te gustaría mejorar en tu negocio este año?" }` (el `id` es interno; en el lead se guarda el texto de la pregunta).
- `AhorroEstimator.tsx` y `ahorro.ts` no cambian y dejan de importarse desde `DiagnosticoFlow.tsx`.
- *Ajustes del apply:*
  - El `message` interno del lead (lo ve el equipo en el panel y en el aviso por correo) pasa a "Autodiagnóstico — Mayor oportunidad: X. Índice de fricción N (nivel)." y deja de mencionar el ahorro.
  - La nota al pie del panel queda "Resultado referencial. En la sesión lo revisamos contigo y lo convertimos en un plan concreto." (sin "automatización").
  - El título de la pestaña pasa a "Autodiagnóstico — Nubolabs".
  - El informe PDF y el correo cambian el rótulo "INFORME DE DIAGNÓSTICO OPERATIVO" por "TU MAPA DE OPORTUNIDADES". Su introducción y su CTA dejan de hablar de "automatizar" ("priorizar por dónde partir").
  - El E2E a 375 px encontró scroll horizontal previo a este cambio: el encabezado de `/diagnostico` ("Nubolabs · DIAGNÓSTICO" más "← Volver a nubolabs.cl") medía 391 px. Se arregló ocultando la etiqueta "DIAGNÓSTICO" bajo 640 px y dejando que el enlace baje de línea.

### 6. Estimador interno `/admin/estimador`
`app/admin/(panel)/estimador/page.tsx` (server, protegido por `app/admin/(panel)/layout.tsx`, que redirige sin sesión) monta `components/admin/EstimadorInterno.tsx` (cliente): estado local de `procesos` con `blank()`, `AhorroEstimator` y un resumen con `calcTotals()` y `fmtCLP` (semana, mes, año, horas). Sin `fetch` ni escritura. Se agrega "Estimador de ahorro" al menú del panel. *Alternativa descartada:* borrar el estimador; sigue siendo útil para que Mauro arme propuestas, y su spec y tests ya existen.

### 7. Panel con el mapa
- Lista: columna "Mayor oportunidad" = nombre de `principales[0]` del mapa; se quita "Ahorro/mes" (el dato sigue en el detalle). Se mantiene "Fricción" como dato interno. *Ajuste del apply:* lista, detalle y ficha usan `mapFromMeta`, que recalcula siempre desde `areas` (nadie lee `meta.oportunidades` guardado). Da el mismo resultado que guardó el servidor y sirve igual para los leads antiguos. *Revisión adversarial:* el detalle y la ficha leen `respuestas` y el nombre del área de forma defensiva. La ficha deja de decir "El cliente no agregó el paso opcional de estimación de ahorro" en los leads sin estimación.
- Detalle (`leads/[id]/page.tsx`): bloque "Mapa de oportunidades" arriba del índice (mismo cálculo de respaldo); índice, áreas, abiertas y "Estimación de ahorro" (solo si existe) se mantienen.
- Ficha PDF (`lib/leadReport.ts`): sección "MAPA DE OPORTUNIDADES" antes de las áreas; el resto igual (incluida la estimación de ahorro de leads antiguos).

### 8. Bloque "Autodiagnóstico" en la landing
- CMS: clave `autodiagnostico` en `SECTIONS` (después de `proceso`, antes de `contacto`), `content.autodiagnostico { eyebrow, title, body, cta }` con los defaults de la spec, mezcla en `mergeConfig()`, editor con "Usar los textos recomendados" y tests en `lib/siteConfig.test.ts`.
- *Ajustes de la revisión adversarial:*
  - El ejemplo sigue el orden de la tabla (ventas, control, orden, equipo), como pide la spec "siempre en este orden".
  - Los chips de nivel usan `text-accent-strong` sobre blanco con borde (4,6:1) y `text-brand-dark` sobre `brand-50` (5,8:1): con los tonos de la referencia daban 4,1 y 4,3:1, bajo AA. Lo mismo en el detalle del lead.
  - En `/diagnostico`, los colores nuevos del panel usan tokens (`text-accent`, `text-brand-light`, `text-inverse-strong`) en vez de hex.
  - Bajo 960 px el panel queda debajo del cuestionario, como antes de este cambio. Se acepta: el resultado se ve al terminar.
- `components/landing/SelfDiagnosis.tsx` (server) según `.selfdx`/`.map` de la referencia con tokens de HDU-01 (`bg-navy` → `navy-700`, tarjeta blanca `shadow-lift`, chips de nivel `bg-accent-50 text-accent-strong` / `bg-brand-50 text-brand`). El ejemplo usa `DIMENSIONS` para los nombres, anchos de barra fijos ilustrativos y niveles en texto, sin números visibles; etiqueta "Ejemplo". Botón `href="/diagnostico"`, `min-h-11`.
- Se renderiza en `LandingPage.tsx` si `visible.autodiagnostico`.
- *Ajustes del apply:*
  - Como en la referencia, la sección no tiene padding superior: sigue al proceso, que ya deja su espacio. Con `spaced` (si "Cómo trabajamos" está oculta) suma el padding superior, igual que `FinalCta` y `Trust`.
  - Las pruebas van en `lib/siteConfig.autodiagnostico.test.ts` y `components/landing/SelfDiagnosis.test.tsx`.
  - El editor es `components/admin/config/AutodiagnosticoEditor.tsx`.
  - El barrido de vocabulario de la portada suma el bloque.

### Degradación
- Sin Firebase: `POST /api/leads` responde `persisted: false` (el log muestra el `meta.oportunidades` calculado); el panel no tiene leads; la descarga del PDF funciona igual (no depende de Firestore).
- Sin Resend: no hay correo al cliente ni aviso interno; el lead se guarda y la descarga directa del PDF sigue disponible.
- Blob no participa.

## Risks / Trade-offs

- [Un lead antiguo con `areas` sin `friccion` numérica] → `areaScoresFromMeta` lo ignora; el mapa queda "sin datos" y las vistas no fallan (test con ese caso).
- [Visitantes con la página abierta durante el deploy envían `meta.ahorro`] → el servidor lo descarta (decisión 3); sin impacto.
- [`DiagnosticoFlow.tsx` es grande y con estilos inline] → cambios acotados al panel, la tarjeta y los textos; los E2E de 1280/375 cubren regresiones visuales.
- [El cliente pierde una cifra "tangible" que antes enganchaba] → la HDU-08 lo decidió así; el mapa y el próximo paso dan un entregable concreto, y el estimador queda para la propuesta comercial.
- [Coherencia de textos entre pantalla, PDF, correo y landing] → todos salen de `DIMENSIONS` en `oportunidades.ts`.

## Migration Plan

1. Mezclar tras el preview aprobado (Mauro hace un diagnóstico de prueba con su correo y revisa pantalla, PDF descargado y correo recibido; luego borra ese lead de prueba).
2. En `/admin/config`: revisar la sección "Autodiagnóstico" ("Usar los textos recomendados") y guardar; confirmar su visibilidad.
3. Sin migración de datos: los leads antiguos se leen con el cálculo de respaldo.
4. Rollback: revertir el commit. Los leads nuevos tendrán `meta.oportunidades` (el código anterior lo ignora) y no tendrán `meta.ahorro` (el código anterior ya trata la ausencia como "sin estimación").
