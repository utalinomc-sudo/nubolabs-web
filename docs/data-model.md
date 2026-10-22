---
description: Modelo de datos del sitio de Nubolabs — colecciones de Firestore (leads, team, config/site), forma del meta del diagnóstico, usuarios de Firebase Auth y reglas de persistencia.
---

# Modelo de datos — Nubolabs

## 1. Motor de persistencia

**Firestore** (Firebase), accedido solo desde el servidor con el Admin SDK (`lib/firebaseAdmin.ts` → `getDb()`). No hay esquema forzado ni migraciones: la forma de cada documento la fijan los handlers que escriben y los tipos de `types/lead.ts` y `lib/site.ts`. Las fechas se guardan como **strings ISO 8601** y se muestran en `America/Santiago`.

Sin credenciales de Admin (`FIREBASE_*`), `getDb()` devuelve `null`: las lecturas usan los defaults del código y las escrituras públicas no persisten.

## 2. Entidades

### `leads/{id}` — solicitudes de contacto y diagnósticos

Escribe `POST /api/leads`; lee el panel (`app/admin/(panel)/leads/**`); borra `DELETE /api/admin/leads/{id}`. Tipos en `types/lead.ts` (`LeadInput`, `Lead`).

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `name` | string | Sí | Nombre del contacto (trim) |
| `email` | string | Sí | Validado con regex simple |
| `phone` | string | Sí desde 2026-10-22 (antes opcional) | WhatsApp, 8 a 15 dígitos, máx. 30 caracteres |
| `company` | string | No (default `""`) | Empresa (máx. 120) |
| `message` | string | No (default `""`) | Mensaje libre del formulario (máx. 1.000); en diagnósticos, resumen generado (índice, área crítica, ahorro) |
| `source` | string | Sí (default `"landing"`) | `landing` (formulario del home) o `diagnostico` (`LEAD_SOURCES` en `lib/leads.ts`) |
| `status` | string | Sí (siempre `"new"` hoy) | Reservado para el pipeline/mini-CRM del roadmap |
| `createdAt` | string ISO | Sí | Fecha de creación (servidor) |
| `goals` | `GoalKey[]` | No | Objetivos elegidos en el formulario (claves de `GOALS` en `lib/leadOptions.ts`); se omite si queda vacío |
| `industry` | `IndustryKey` | No | Rubro (`gastronomia`, `automotriz`, `construccion`, `servicios`, `comercio`, `otro`) |
| `goalOther` | string | No | Texto de "Otra cosa" (máx. 70); solo si `goals` incluye `other`. El equipo lo ve como "Otra cosa: …" |
| `industryOther` | string | No | Rubro escrito al elegir "Otro" (máx. 70); solo si `industry` es `otro`. El equipo lo ve como "Otro: …" |
| `contactConsent` | `true` | Sí en leads nuevos | Consentimiento obligatorio de contacto (Ley 21.719) |
| `marketingConsent` | boolean | Sí en leads nuevos | Acepta recibir novedades |
| `consentAt` | string ISO | Sí en leads nuevos | Hora del servidor al recibir el consentimiento |
| `consentText` | `{ contact, marketing? }` | Sí en leads nuevos | Texto exacto de cada casilla aceptada (`CONSENT_TEXTS`); nunca el que manda el cliente |
| `consentVersion` | string | Sí en leads nuevos | Versión de los textos (`CONSENT_VERSION`, hoy `2026-10-21`) |
| `meta` | objeto | No | Solo en diagnósticos; ver §2.1. `meta.rubro` sigue guardando el texto del rubro para el informe |

Los leads anteriores al 2026-10-22 no traen `goals`, `industry` ni los campos de consentimiento: todo lector los trata como opcionales (`lib/leadSummary.ts`). Los creados con el campo trampa `website` lleno no se guardan.

#### 2.1 Forma de `meta` (diagnóstico)

Lo arma `components/diagnostico/DiagnosticoFlow.tsx`; lo consumen `lib/report.ts` (`reportDataFromLead`) y `lib/leadReport.ts`.

| Campo | Tipo | Descripción |
|---|---|---|
| `rubro` | string | Rubro declarado por el contacto |
| `indiceFriccion` | number | Índice de fricción global. **Sin este campo no se genera informe** |
| `nivelFriccion` | string | Nivel en texto (p. ej. "Alto") |
| `areas[]` | `{ area, corto, friccion, pct }` | Fricción por área del cuestionario (`components/diagnostico/cuestionario.ts`) |
| `abiertas[]` | `{ pregunta, respuesta }` | Preguntas abiertas respondidas |
| `ahorro` | objeto \| null | Estimación opcional: `totales { horas, semana, mes, anual }` y `procesos[] { nombre, ahorroCLPMes, … }` (cálculo en `components/diagnostico/ahorro.ts`) |

### `team/{id}` — integrantes del equipo

Escribe `POST /api/admin/team` (crea con `add` o actualiza con `set merge`); borra `DELETE /api/admin/team/{id}`; lee `getTeamMembers()` en `lib/site.ts` (ordenado por `orden` asc). Tipo `TeamMember` en `lib/site.ts`.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `nombre` | string | Sí | Nombre completo |
| `cargo` | string | No | Cargo |
| `habilidades` | string[] | No | Lista de habilidades (trim, sin vacíos) |
| `fotoUrl` | string | No | URL pública de Vercel Blob **o** data URL JPEG ≤ 512 px (fallback sin Blob) |
| `linkedin` | string | No | URL normalizada con `https://` |
| `orden` | number | No (default 0) | Orden de aparición en `/equipo` |
| `createdAt` | string ISO | Sí (al crear) | |
| `updatedAt` | string ISO | Sí | Se actualiza en cada guardado |

### `config/site` — configuración del CMS (documento único)

Escribe `POST /api/admin/config` con `set(patch, { merge: true })`; lee `getSiteConfig()` en `lib/site.ts`, que mezcla el documento con `mergeConfig()` **sobre los defaults** de `defaultSiteConfig()`. Los tipos (`SiteConfig`, `SiteContent`), los defaults y la mezcla viven en `lib/siteConfig.ts` (módulo puro, testeado en `lib/siteConfig.test.ts` y `lib/siteConfig.sections.test.ts`); `lib/site.ts` los re-exporta.

**Mezcla tolerante** (cambio lenguaje-sin-jerga): un texto guardado que no sea string o quede vacío cae a su default. Las listas de largo fijo (`resultados.items`, `enfoque.items`, `proceso.items`) usan `mergeFixedList()`: siempre el largo del default, con cada posición mezclada campo a campo sobre el default de esa posición. Las listas variables usan `mergeList()`: un ítem es válido si es objeto con `title` no vacío; si quedan menos válidos que el mínimo se usan los defaults, se corta en el máximo y un campo vacío de un ítem válido queda `""`. Así un documento viejo o incompleto no rompe la portada.

| Campo | Tipo | Descripción |
|---|---|---|
| `visible` | `Record<string, boolean>` | Visibilidad por sección. Claves válidas = `SECTIONS[].key`, en el orden de la portada: `hero`, `problema`, `resultados`, `enfoque`, `servicios`, `casos`, `proceso`, `contacto`, `faq`, `cierre`, `nosotros`, `equipo`. Una clave ausente cuenta como visible (por eso `resultados` aparece sin migrar documentos) y solo los valores booleanos guardados ganan (un `null` o un texto usan el default). Ocultar una sección también quita su ítem del menú |
| `content.hero` | `{ eyebrow, title, subtitle, ctaPrimary, ctaSecondary, tags? }` | `eyebrow` es opcional: por defecto vacío (sin etiqueta sobre el título). `title` admite `**resalte**` → texto con el degradado de marca (`renderHighlight` + `.text-gradient-brand`). Cada campo guardado gana sobre su default |
| `content.hero.tags` | `string[]` (opcional) | Etiquetas bajo los botones del hero (cambio mensaje-principal-pyme). Al leer se normalizan con `normalizeTags()`: se recortan, se descartan vacías y no-strings y se toman las 3 primeras; si no es arreglo o queda vacía se usan los defaults ("30 minutos, gratis y sin compromiso", "Sin cambiar tus sistemas", "Respuesta en menos de 24 horas"). Documentos sin `tags` siguen siendo válidos |
| `content.problema` | `{ eyebrow, title, subtitle, items[] { title }, cierre, cierreCta }` | "¿Te suena?" (cambio lenguaje-sin-jerga). `items`: 1 a 8 dolores. `cierre` admite `**resalte**`; `cierreCta` es el texto del enlace a `#resultados` |
| `content.resultados` | `{ eyebrow, title, subtitle, items[] { title, body }, cierre }` | "Lo que ganas". `items`: siempre 4 (la ilustración depende de la posición; textos de las ilustraciones en `resultsVisuals` de `lib/content.ts`, fuera del CMS) |
| `content.enfoque` | `{ eyebrow, title, body, items[] { title, body } }` | `items`: siempre 3. El ejemplo antes/después vive en `approachExample` de `lib/content.ts` |
| `content.servicios` | `{ eyebrow, title, subtitle, destacado { etiqueta, title, body, result, incluye[] }, items[] { title, body, result }, acompanamiento { title, body }, notaTecnica }` | `items`: 1 a 6; `result` se muestra como "lo que ganas". `destacado.incluye`: 1 a 4. `notaTecnica` es el único texto de la portada que nombra herramientas y admite `**resalte**`. Los documentos con la forma antigua (`{ eyebrow, title, items }`) siguen siendo válidos: los campos nuevos toman su default |
| `content.casos` | `{ eyebrow, title, subtitle, items[] { title, body } }` | `items`: 1 a 12 |
| `content.proceso` | `{ eyebrow, title, subtitle, items[] { title, body, recibes }, exito { title, items[] } }` | "Cómo trabajamos" (ancla `#modelo`). `items`: siempre 4. `exito.items`: 1 a 6 |
| `content.nosotros` | `{ eyebrow, title, mision, vision, objetivos[] }` | Página `/mision-vision` |
| `content.equipo` | `{ eyebrow, title, historia }` | Página `/equipo` |
| `content.faq` | `{ eyebrow, title, items[] { pregunta, respuesta } }` | Preguntas frecuentes (cambio cierre-landing-faq-cta, ancla `#preguntas`). `items`: 1 a 10; solo se publican las que tienen pregunta y respuesta. `respuesta` admite enlaces internos `[texto](/ruta)` o `[texto](#ancla)` (`lib/inlineLinks.ts`); otros destinos se muestran como texto |
| `content.cierre` | `{ eyebrow, title, body, cta }` | CTA final. El botón lleva a `#contacto` (o a `/diagnostico` si el contacto está oculto) |
| `content.contact` | `{ whatsappNumber, showWhatsapp, showWhatsappQr }` | WhatsApp de contacto de Nubolabs (decisión de Mauro del 2026-10-22). Por defecto `56932590783` y ambos interruptores en `false`. Al leer, `normalizeContact()` deja solo dígitos (un número guardado sin dígitos queda vacío y no se muestra; el default solo aplica si no hay número guardado) y cada interruptor es `true` solo si se guardó exactamente `true`. Con un número de menos de 8 o más de 15 dígitos no se muestra nada. `showWhatsapp` = número en el pie; `showWhatsappQr` = tarjeta con QR junto al formulario |
| `content.privacidad` | `{ titulo, texto }` | Página `/privacidad` (siempre visible, sin clave en `visible`). `texto` en párrafos separados por línea en blanco, mostrado como texto plano. Un campo vacío cae al borrador por defecto de `lib/siteConfig.ts` |

Todas las secciones de la portada son editables desde `/admin/config` (cambio lenguaje-sin-jerga). El admin guarda solo las claves de `MANAGED_KEYS` (`components/admin/ConfigEditor.tsx`): `content.equipo` se edita en `/admin/equipo` y no se pisa. Cada guardado envía la visibilidad y **solo las secciones que cambiaron** (`changedKeys`); una sección nunca guardada sigue mostrando los defaults del código. Una sección guardada alguna vez queda fija en Firestore: un default nuevo del código no se ve en ella hasta pulsar "Usar los textos recomendados" en esa sección y guardar.

### Usuarios admin — Firebase Authentication

No están en Firestore. Proveedor email/password; se crean a mano en la consola de Firebase. Cualquier usuario autenticado del proyecto es admin (sin roles). La sesión se materializa en la cookie `admin_session` (5 días) y se representa en servidor como `AdminSession { email }` (`lib/adminAuth.ts`).

## 3. Relaciones

```
Firebase Auth (usuarios admin) ──cookie admin_session──▶ /admin/** y /api/admin/**

leads/{id}  ── independiente (sin referencias a otras colecciones)
team/{id}   ── independiente; se lista en /equipo ordenado por `orden`
config/site ── documento único; sus defaults viven en código (lib/siteConfig.ts)
```

No hay relaciones entre colecciones ni subcolecciones.

## 4. Reglas

- **No renombrar campos existentes** (`nombre`, `cargo`, `habilidades`, `orden`, `fotoUrl`, `mision`, …): hay datos guardados con esos nombres.
- Campos nuevos: en `leads` en inglés; en `team` y `config` en español, por consistencia con cada colección.
- Escrituras parciales siempre con `set(..., { merge: true })`; nunca reemplazar `config/site` completo.
- Todo campo nuevo se refleja aquí, en `docs/api-spec.yml` (si entra por la API) y en los tipos de `types/` o `lib/site.ts` en el mismo cambio.
- Al agregar una sección nueva al CMS: sumar la clave a `SECTIONS`, su default a `defaultSiteConfig()`, su mezcla tolerante a `mergeConfig()`, su editor `<Seccion>Editor.tsx` en `components/admin/config/` montado en `ConfigEditor.tsx` y **su clave a `MANAGED_KEYS`** (si no, sus ediciones no se guardan).
- Leads de prueba creados durante verificaciones se borran al terminar (`DELETE /api/admin/leads/{id}`). Hoy hay leads de prueba pendientes de limpieza en producción (ver `docs/ESTADO-PROYECTO.md`).
