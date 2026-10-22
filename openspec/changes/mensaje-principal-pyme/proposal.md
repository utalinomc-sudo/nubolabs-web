## Why

El hero de nubolabs.cl habla de tecnología ("automatizaciones con IA que trabajan en la nube") y el prospecto que llegará por la recomendación de O&A es un dueño de pyme que no sabe de tecnología. La HDU-08 (aprobada el 2026-10-21, `docs/backlog/propuesta-valor-hdu-08.md`) fijó además que la promesa no se acota a "ahorro de horas": el dueño compra ventas, control, orden y crecimiento. Es lo primero que ve el visitante, así que va primero (fase 1, antes del correo de O&A).

## What Changes

- **Nuevo mensaje del hero (defaults del CMS):** sin etiqueta superior (eyebrow vacío; el admin puede escribir una), título "Que tu negocio **trabaje para ti**, no al revés.", bajada de la HDU-08 §2, CTA principal "Quiero mi diagnóstico gratis" hacia el formulario de la landing (`#contacto`) y secundario "Ver cómo trabajamos" (`#modelo`).
- **Etiquetas del hero editables desde el CMS** (`content.hero.tags`, 3 textos) con los defaults "30 minutos, gratis y sin compromiso", "Sin cambiar tus sistemas" y "Respuesta en menos de 24 horas". Hoy viven fijas en `lib/content.ts` (`heroTags`).
- **Panel "Tu negocio hoy"** en lugar del diagrama `HeroGraphic`: tareas de ejemplo que se completan solas (cotización, cobranza, WhatsApp, pedido, resumen para el contador), con animación sutil que respeta "reducir movimiento". Es ilustrativo: sin cifras ni nombres de clientes.
- **Navegación:** el botón del menú pasa a "Diagnóstico gratis" y lleva a `/#contacto` (hoy "Agendar diagnóstico →" a `/diagnostico`), en escritorio y en el menú móvil.
- **Metadatos para compartir** (`description` y Open Graph) con la nueva promesa; se elimina "Menos horas manuales".
- **Tokens de diseño de la HDU-08 §7** en `tailwind.config.ts` (tonos de navy, brand, acento, éxito y línea). Son la base visual de los cambios siguientes (HDU-03, 02, 10, 04, 06, 05, 07, 09).
- **Refactor sin cambio de comportamiento:** `defaultSiteConfig()` y `mergeConfig()` pasan a un módulo puro (`lib/siteConfig.ts`, sin `server-only`) para poder testearlos; `lib/site.ts` los re-exporta.

## Capabilities

### New Capabilities
- `landing/hero`: mensaje principal de la portada, sus llamados a la acción, etiquetas editables, panel ilustrativo "Tu negocio hoy" y metadatos para compartir.

### Modified Capabilities
<!-- Ninguna: no hay specs vigentes de la landing. -->

## Non-goals

- Cambiar el resto de las secciones o su vocabulario (HDU-02 `lenguaje-sin-jerga`).
- Rediseñar el formulario de contacto (HDU-03 `formulario-minimo-consentimiento`); hasta que salga, `#contacto` sigue mostrando el formulario actual.
- Cambiar el `<title>` ni el logo, que mantienen "AI & Automation Agency" como marca.
- Analítica o medición de clics (roadmap 3).
- Cargar los textos en el Firestore de producción por script: lo hace Mauro desde `/admin/config` (ver design.md, decisión 6).

## Criterios de aceptación

#### Scenario: Primera impresión sin jerga
- **WHEN** un visitante abre `/` sin overrides del hero en el CMS
- **THEN** ve el título "Que tu negocio trabaje para ti, no al revés.", y ni el título ni la bajada contienen "horas", "IA", "nube" ni "automatización"

#### Scenario: El CTA principal lleva al formulario
- **WHEN** el visitante hace clic en "Quiero mi diagnóstico gratis" o en "Diagnóstico gratis" del menú
- **THEN** la página baja al formulario de contacto (`#contacto`) sin salir de la portada

#### Scenario: Etiquetas editables
- **WHEN** el admin cambia una etiqueta del hero en `/admin/config` y guarda
- **THEN** la portada la muestra en la siguiente carga, sin despliegue

#### Scenario: Movimiento reducido
- **WHEN** el sistema del visitante tiene "reducir movimiento" activado
- **THEN** el panel "Tu negocio hoy" se muestra estático y completo

#### Scenario: Móvil
- **WHEN** se abre la portada a 375 px
- **THEN** no hay scroll horizontal y los botones del hero miden al menos 44 px de alto

## Impact

- **Código:** `tailwind.config.ts`, `app/globals.css` (primitiva de texto con degradado), `app/layout.tsx` (metadata), `lib/site.ts` → `lib/siteConfig.ts` (+ `lib/siteConfig.test.ts`), `lib/content.ts` (`heroTags` → default de `hero.tags`, `heroFeed` nuevo), `components/landing/Hero.tsx`, `components/landing/HeroPanel.tsx` (nuevo, cliente), `components/landing/HeroGraphic.tsx` (se elimina), `components/landing/Nav.tsx`, `components/icons.tsx`, `components/admin/ConfigEditor.tsx`.
- **API y datos:** sin endpoints nuevos. `config/site.content.hero` gana el campo opcional `tags: string[]`; `POST /api/admin/config` ya lo acepta (guarda `content` con merge).
- **Variables de entorno:** ninguna.
- **Documentos a actualizar** (`docs/documentation-standards.md` §3): `docs/data-model.md` (`content.hero.tags`), `docs/api-spec.yml` (`SiteContentPartial.hero.tags`), `docs/frontend-standards.md` (tokens nuevos y primitiva), `docs/ESTADO-PROYECTO.md`, `docs/backlog/prospectos-oa.md` (estado de HDU-01).
- **Producción:** tras mezclar, Mauro actualiza el hero guardado en Firestore desde `/admin/config`, porque los overrides existentes ganan sobre los defaults.
