## Why

Los textos del sitio (hero, dolores, servicios, ejemplos, compromisos, preguntas, cierre, misión y visión) venden hoy "automatizar lo repetitivo" y, en concreto, responder WhatsApp, dejar atrás las planillas y mandarle la información al contador, con herramientas nombradas (n8n, Make, Excel, Google Sheets). Mauro pidió el 2026-10-29 cambiar el enfoque de todos los textos: Nubolabs identifica el problema particular de cada cliente, construye una solución a su medida y deja buena data y reportabilidad para tomar decisiones. No se debe mencionar que automatizamos WhatsApp (no es el foco), ni que damos soluciones contables, ni herramientas concretas.

## What Changes

- **Nuevo eje del mensaje** en todo el sitio público: soluciones a medida para el problema de cada cliente + datos y reportes claros para decidir. Lema que reemplaza a "Tu operación, en piloto automático" en el CTA final, el pie, el pie de `/diagnostico`, el informe PDF y el correo al cliente: **"Soluciones a tu medida, decisiones con datos."**
- **Hero**: título "Soluciones hechas para **tu negocio**, con datos para decidir mejor.", bajada nueva, etiqueta "A la medida de tu negocio" en lugar de "Sin cambiar tus sistemas"; panel "Tu negocio hoy" con tareas de ejemplo sin WhatsApp ni contador y la etiqueta "Todo al día" en lugar de "Piloto automático"; metadatos (`description`, Open Graph) con la promesa nueva.
- **Secciones de la portada** (defaults del CMS): dolores, "Lo que ganas" ("Decides con datos" reemplaza a "Tienes el control"; ilustración de seguimiento de una venta en lugar de un chat), Enfoque ("Primero entendemos tu problema, después construimos la solución." con el ejemplo antes/después del informe del mes), Servicios ("Soluciones a tu medida", "Tareas que avanzan solas", "Datos y reportes para decidir", "Información ordenada y conectada"; nota técnica sin herramientas), Ejemplos por rubro (sin WhatsApp ni contador), compromisos de Confianza, Proceso, 7 preguntas frecuentes (nueva: "¿Es una solución estándar o hecha para mi negocio?"), CTA final y pie.
- **Regla de vocabulario ampliada**: además de la jerga ya prohibida, los textos por defecto del sitio MUST NOT nombrar herramientas ni canales concretos (WhatsApp, Excel, Google Sheets, n8n, Make, planillas) ni servicios contables o al contador. La nota técnica deja de ser la excepción. El canal de contacto de Nubolabs (campo WhatsApp del formulario, número y QR configurables, apagados por defecto) no cuenta: es un dato de contacto, no un servicio.
- **Misión, visión, objetivos e historia del equipo** reescritos al nuevo eje; `/equipo` cambia su `description`.
- **Franja de `/oa`**: texto sin "contador" ("Osorio & Asociados nos recomendó porque resolvemos problemas concretos…").
- **Formulario**: el objetivo "Dejar atrás las planillas" pasa a "Resolver un problema puntual de mi operación" (misma clave persistida `drop_spreadsheets`).
- **Mapa de oportunidades**: la dimensión "Control y números" dice "Decides con datos: …" y su próximo paso habla de un reporte claro (sin cambiar preguntas, cálculo ni umbrales).
- **Admin**: ayudas de los editores actualizadas (ilustraciones de "Lo que ganas", Enfoque, nota técnica) y botón "Usar los textos recomendados" también en "Misión y visión", para poder cargar los textos nuevos en producción.
- **Borrador de privacidad**: "(por ejemplo, un asesor de tu empresa)" en lugar de "tu estudio contable".

## Capabilities

### New Capabilities
<!-- Ninguna: el cambio reescribe textos y reglas de capacidades que ya existen. -->

### Modified Capabilities
- `landing/hero`: título, bajada y etiquetas por defecto; etiqueta del panel ("Todo al día"); metadatos con la promesa nueva.
- `landing/contenido-pyme`: regla de vocabulario sin excepción para la nota técnica y con herramientas, canales y contabilidad prohibidos; textos por defecto de ¿Te suena?, Lo que ganas, Enfoque (requisito reemplazado), Servicios, Proceso y encabezado de Ejemplos; regla nueva del enfoque del mensaje y del lema en todo el sitio público.
- `landing/casos-por-rubro`: los 14 casos y el título por defecto.
- `landing/confianza`: texto puente y compromisos por defecto.
- `landing/cierre`: 7 preguntas frecuentes por defecto, textos de la CTA final, frase y enlaces de servicios del pie.
- `leads/formulario-contacto`: etiqueta del objetivo `drop_spreadsheets`.
- `leads/origen-referidos`: texto por defecto de la franja de `/oa`.
- `diagnostico/mapa-oportunidades`: textos de la dimensión "Control y números"; lema en el informe PDF y el correo.

## Non-goals

- Cambiar la estructura, el orden o el diseño de las secciones; solo cambian textos, ilustraciones de ejemplo e íconos por posición.
- Quitar el canal de contacto por WhatsApp (campo del formulario, número en el pie y QR, configurables desde el admin y apagados por defecto): el pedido es no vender la automatización de WhatsApp, no dejar de usarlo para contactar.
- Renombrar la marca ("Nubolabs — AI & Automation Agency" sigue como título del documento) ni claves persistidas (`GoalKey`, campos del CMS, `team`).
- Cambiar las 18 preguntas del cuestionario, la escala, el cálculo del mapa ni el estimador interno (`/admin/estimador`).
- Cargar los textos nuevos en el Firestore de producción por script: lo hace Mauro desde `/admin/config` con "Usar los textos recomendados" (paso post-merge).

## Criterios de aceptación

#### Scenario: Portada sin WhatsApp, contador ni herramientas
- **WHEN** un visitante recorre `/` con los textos por defecto (incluida la nota técnica)
- **THEN** no aparecen "WhatsApp", "Excel", "Sheets", "Google", "n8n", "Make", "planilla", "contador" ni "contable", y sí el lema "Soluciones a tu medida, decisiones con datos."

#### Scenario: Hero con el enfoque nuevo
- **WHEN** se abre `/` sin overrides del hero
- **THEN** el título es "Soluciones hechas para tu negocio, con datos para decidir mejor." con "tu negocio" resaltado, y el panel muestra "Todo al día"

#### Scenario: Servicios a medida y datos
- **WHEN** se abre la sección Servicios por defecto
- **THEN** los 4 servicios son "Soluciones a tu medida", "Tareas que avanzan solas", "Datos y reportes para decidir" e "Información ordenada y conectada", y la nota técnica no nombra herramientas

#### Scenario: Lema en el informe y el correo
- **WHEN** se genera el informe PDF o el correo del diagnóstico
- **THEN** ambos cierran con "Soluciones a tu medida, decisiones con datos." y ninguno dice "piloto automático"

#### Scenario: Textos recomendados en todas las secciones
- **WHEN** el admin pulsa "Usar los textos recomendados" en Hero, Confianza, ¿Te suena?, Lo que ganas, Enfoque, Servicios, Ejemplos, Cómo trabajamos, Preguntas frecuentes, CTA final, Franja de referidos o Misión y visión
- **THEN** el formulario muestra los textos nuevos de esa sección sin guardar todavía

## Impact

- **Código:** `lib/siteConfig.ts` (defaults y `SECTIONS`), `lib/content.ts` (menú, pie, panel del hero, ilustraciones, ejemplo antes/después), `lib/leadOptions.ts` (etiqueta de un objetivo), `components/diagnostico/oportunidades.ts` (textos de una dimensión), `components/landing/{HeroPanel,Results,Approach}.tsx`, `components/icons.tsx` (íconos por posición), `components/admin/config/{Resultados,Enfoque,Servicios,Nosotros}Editor.tsx`, `components/diagnostico/DiagnosticoFlow.tsx` (pie), `lib/report.ts` y `lib/email.ts` (lema), `app/layout.tsx` y `app/equipo/page.tsx` (metadatos) y sus tests.
- **API y datos:** sin endpoints ni campos nuevos. Las claves del CMS y de los leads no cambian; `docs/api-spec.yml` no cambia.
- **Variables de entorno:** ninguna.
- **Documentos a actualizar** (`docs/documentation-standards.md` §3): `docs/ESTADO-PROYECTO.md` (fecha, enfoque nuevo, paso post-merge), `docs/frontend-standards.md` (tono y regla de vocabulario), `docs/data-model.md` (nota técnica ya no nombra herramientas), `docs/backlog/prospectos-oa.md` (HDU-11) y `docs/avance.json` (historia nueva, pendiente de fusionar).
- **Producción:** Firestore tiene guardados textos de hero, servicios, casos y otras secciones que ganan sobre los defaults. Tras mezclar, Mauro respalda `config/site` y usa "Usar los textos recomendados" en cada sección y guarda; la historia del equipo (`/admin/equipo`) se pega a mano.
