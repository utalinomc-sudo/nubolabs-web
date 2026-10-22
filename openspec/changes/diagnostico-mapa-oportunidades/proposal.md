## Why

El diagnóstico interactivo (`/diagnostico`) entrega hoy un "índice de fricción" y, de forma opcional, un "ahorro estimado" en horas y pesos. La HDU-08 (aprobada el 2026-10-21, `docs/backlog/propuesta-valor-hdu-08.md` §5.3 y §14.5) decidió no acotar el valor de Nubolabs al ahorro de horas: el dueño de pyme quiere vender más, tener el control, que nada se olvide y crecer sin desordenarse. El resultado del diagnóstico, su informe y su correo deben hablar ese mismo idioma, y la landing debe ofrecer el autodiagnóstico como complemento de la sesión gratuita, no como la puerta de entrada (eso pasó al formulario corto de HDU-03).

## What Changes

- **"Tu mapa de oportunidades"** reemplaza al índice de fricción como resultado visible: 4 dimensiones de negocio (Ventas y clientes, Control y números, Orden y seguimiento, Equipo y crecimiento) que agrupan las 6 áreas actuales del cuestionario, cada una con nivel de oportunidad alta / media / baja, las 3 oportunidades principales y un próximo paso sugerido. **Las 18 preguntas y la escala no cambian.**
- **Cálculo puro y testeado** del mapa a partir de las respuestas, usado igual en el navegador, en `POST /api/leads` (que lo recalcula antes de guardar) y en el informe PDF.
- **Informe PDF y correo al cliente** muestran el mapa, las oportunidades principales y el próximo paso; dejan de mostrar índice de fricción y ahorro en CLP/horas.
- **Pregunta abierta nueva:** "¿Qué es lo que más te gustaría mejorar en tu negocio este año?" reemplaza a "¿Cuál es el problema que más tiempo le quita al equipo hoy?". La pregunta de la "solución mágica" se mantiene.
- **BREAKING (para el visitante):** el **estimador de ahorro sale del flujo público** y pasa a una herramienta interna del panel (`/admin/estimador`, protegida, sin guardar datos) para preparar propuestas. El cálculo (`components/diagnostico/ahorro.ts`) y sus 11 tests no cambian.
- **Compatibilidad:** los leads ya guardados (con `indiceFriccion`, `areas` y `meta.ahorro`) se siguen viendo completos en el panel y en la ficha PDF interna; el panel calcula su mapa a partir de sus `areas`.
- **Bloque "Autodiagnóstico · 5 minutos" en la landing** (sección nueva `autodiagnostico`, editable y ocultable desde el CMS) con un ejemplo ilustrativo del mapa y el botón a `/diagnostico`.
- Textos de `/diagnostico` (encabezado, metadatos, tarjeta de éxito) alineados al nuevo resultado y al lenguaje sin jerga.

## Capabilities

### New Capabilities
- `diagnostico/mapa-oportunidades`: cómo se calcula, muestra, guarda y entrega (pantalla, informe PDF y correo) el mapa de oportunidades del diagnóstico.
- `landing/autodiagnostico`: bloque de la portada que invita al autodiagnóstico con un ejemplo del mapa.

### Modified Capabilities
- `diagnostico/estimador-ahorro`: los montos dejan de mostrarse al visitante, en el informe y en el correo al cliente; el estimador pasa a existir solo en el panel interno.

## Non-goals

- Cambiar las preguntas, la escala 1–5 o las 6 áreas del cuestionario (`components/diagnostico/cuestionario.ts`).
- Cambiar las fórmulas del estimador de ahorro o guardar las estimaciones internas.
- Borrar o migrar `indiceFriccion`, `areas` o `meta.ahorro` de los leads existentes.
- Rediseñar visualmente todo `/diagnostico` (solo cambian el panel de resultado, la tarjeta de contacto/éxito y los textos); su estilo inline se migra a tokens en un cambio aparte si hace falta.
- Recomendaciones personalizadas con IA en el informe.

## Criterios de aceptación

#### Scenario: Resultado con mapa
- **WHEN** un visitante responde las 18 preguntas en `/diagnostico`
- **THEN** ve "Tu mapa de oportunidades" con las 4 dimensiones y su nivel, y no ve "índice de fricción" ni montos de ahorro

#### Scenario: Sin estimador público
- **WHEN** un visitante recorre `/diagnostico` completo
- **THEN** no encuentra el paso "Estimar mi ahorro" ni ningún monto en CLP u horas ahorradas

#### Scenario: Informe sin ahorro
- **WHEN** el visitante envía el diagnóstico y descarga su informe PDF
- **THEN** el informe muestra el mapa, sus 3 oportunidades principales y el próximo paso sugerido, sin índice de fricción ni montos

#### Scenario: Estimador interno
- **WHEN** un admin con sesión abre `/admin/estimador` y agrega un proceso
- **THEN** ve los mismos totales de ahorro que calculaba el diagnóstico, y nada se guarda en Firestore

#### Scenario: Lead antiguo
- **WHEN** el admin abre el detalle de un lead de diagnóstico creado antes de este cambio, con `meta.ahorro`
- **THEN** ve su mapa de oportunidades calculado desde sus áreas, su índice de fricción y su estimación de ahorro, sin errores

#### Scenario: Bloque en la landing
- **WHEN** un visitante llega al bloque "Autodiagnóstico · 5 minutos" de la portada y pulsa el botón
- **THEN** llega a `/diagnostico`

## Impact

- **Código:** `components/diagnostico/oportunidades.ts` + `oportunidades.test.ts` (nuevos), `components/diagnostico/cuestionario.ts` (pregunta abierta), `components/diagnostico/DiagnosticoFlow.tsx` (panel de resultado, sin estimador, `areas[].id`, textos), `app/diagnostico/page.tsx` (metadata), `app/api/leads/route.ts` (recalcula el mapa; disparo del informe), `lib/report.ts` (informe), `lib/email.ts` (correo al cliente), `lib/leadReport.ts` (ficha interna: suma el mapa), `app/admin/(panel)/leads/page.tsx` y `leads/[id]/page.tsx`, `app/admin/(panel)/estimador/page.tsx` + `components/admin/EstimadorInterno.tsx` (nuevos), `app/admin/(panel)/layout.tsx` (menú), `components/landing/SelfDiagnosis.tsx` (nuevo), `components/landing/LandingPage.tsx` o `app/page.tsx` (render de la sección), `lib/siteConfig.ts` (+ tests) y el editor del CMS.
- **API:** `POST /api/leads` y `POST /api/diagnostico/report` aceptan `meta.areas[].id` y responden igual; `POST /api/leads` guarda `meta.oportunidades` calculado en el servidor. El informe se genera si hay respuestas por área (o el formato antiguo con `indiceFriccion`).
- **Datos:** `leads.meta.oportunidades` (nuevo), `leads.meta.areas[].id` (nuevo); se mantienen `indiceFriccion`, `nivelFriccion`, `areas`; `meta.ahorro` deja de escribirse en leads nuevos. `config/site`: `visible.autodiagnostico` y `content.autodiagnostico { eyebrow, title, body, cta }`.
- **Variables de entorno:** ninguna (el informe sigue usando `SCHEDULE_URL`).
- **Documentos a actualizar:** `docs/data-model.md` (§2.1 forma de `meta`, `content.autodiagnostico`, `visible`), `docs/api-spec.yml` (`DiagnosticoMeta`, `SiteContentPartial.autodiagnostico`, descripción del 400 del informe), `docs/frontend-standards.md` (estructura: `/admin/estimador`, `oportunidades.ts`), `docs/project-profile.md` §8 glosario ("mapa de oportunidades"; "ahorro estimado" pasa a herramienta interna), `docs/ESTADO-PROYECTO.md`, `docs/backlog/prospectos-oa.md` (estado de HDU-09) y, al archivar, el `Purpose` de `openspec/specs/diagnostico/estimador-ahorro/spec.md`.
