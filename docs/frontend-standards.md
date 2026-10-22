---
description: Estándares de frontend del sitio de Nubolabs — Next.js 16 App Router, server vs client components, CMS en Firestore (lib/site.ts), Tailwind con tokens de marca, formularios, accesibilidad, copy en español de Chile y verificación (lint, typecheck, build, E2E con Playwright MCP).
alwaysApply: true
---

# Estándares de frontend — Nubolabs

## 1. Resumen

Tres superficies: la **landing** (`/`) compuesta por secciones de `components/landing/*`; las páginas públicas **`/diagnostico`** (cuestionario + estimador de ahorro), **`/equipo`** y **`/mision-vision`**; y el **panel admin** (`/admin/login` + grupo protegido `app/admin/(panel)/**`). Las páginas son Server Components que leen el CMS desde Firestore y pasan datos por props; la interacción vive en Client Components explícitos.

## 2. Stack

| Elemento | Tecnología / versión |
|---|---|
| Framework | Next.js 16.3 App Router con Turbopack · React 18.3 instalado (el App Router corre con el React 19.3 canary que empaqueta Next; `react` 18.3 sirve a los tests con Testing Library) |
| Lenguaje | TypeScript 5.5 `strict`; alias `@/*` → raíz |
| Estilos | Tailwind CSS 3.4 con tokens de marca (`tailwind.config.ts`) + primitivas en `app/globals.css` |
| Fuentes | Plus Jakarta Sans (`--font-jakarta`, `font-sans`) e IBM Plex Mono (`--font-mono`) vía `next/font/google` en `app/layout.tsx` |
| Estado / datos | Estado local con hooks; datos de servidor por props; mutaciones con `fetch("/api/...")` |
| Imágenes | `next/image`; hosts remotos permitidos: `**.public.blob.vercel-storage.com` (`next.config.js`); data URLs para fotos sin Blob |
| Tests | Vitest 4 (`npm test`): tests `*.test.ts(x)` junto al código, imports explícitos de `vitest`; para componentes, primera línea `// @vitest-environment jsdom` + Testing Library (`@testing-library/react`, matchers de jest-dom ya cargados) · E2E manual con Playwright MCP (el agente lo ejecuta) |
| Lint / formato | ESLint 9 con flat config (`eslint.config.mjs` extiende `eslint-config-next/core-web-vitals`; `npm run lint` = `eslint .`); sin Prettier (respetar el estilo existente: comillas dobles, punto y coma, 2 espacios). Excepción documentada: `@next/next/no-html-link-for-pages` desactivada solo en `components/landing/Nav.tsx` |
| Documentación de Next | Para APIs de Next 16 consultar `node_modules/next/dist/docs/` (documentación de la versión instalada). `AGENTS.md` y `CLAUDE.md` no reciben el bloque gestionado de `next dev` (`agentRules: false` en `next.config.js`) |

## 3. Estructura

```
app/
  layout.tsx              fuentes, metadata global, <html lang="es">
  page.tsx                landing: Nav + secciones según `visible` + Footer   (server, force-dynamic)
  globals.css             @tailwind + primitivas (.container-page, .btn-primary, .btn-ghost, .pill, .card, .field, .text-gradient-brand, .bg-dots)
  diagnostico/page.tsx    monta <DiagnosticoFlow />
  equipo/page.tsx         lista integrantes (getTeamMembers); notFound() si visible.equipo es false
  mision-vision/page.tsx  misión, visión y objetivos desde content.nosotros
  privacidad/page.tsx     política de privacidad desde content.privacidad (siempre visible; texto plano en párrafos)
  admin/login/page.tsx    client: Firebase Auth → POST /api/admin/session
  admin/(panel)/layout.tsx  server: redirect a /admin/login si no hay sesión; sidebar
  admin/(panel)/{page,leads,leads/[id],config,equipo}/page.tsx
components/
  landing/   Nav (client), Hero, HeroPanel (client), Trust, MiniQuote, SectionHead, Problem, Results, Approach, Services, UseCases, Process, ContactForm (client, 2 pasos, prop `aside`), ContactSuccess (client), WhatsappCard, Faq, FinalCta, StickyCta (client), Footer
  diagnostico/  DiagnosticoFlow.tsx (client), AhorroEstimator.tsx (client), cuestionario.ts, ahorro.ts
  admin/     ConfigEditor (contenedor de /admin/config), TeamEditor, DeleteLeadButton, LeadPdfButton, LogoutButton (todos client)
  admin/config/  Field, SectionCard, ListField, types.ts y un <Seccion>Editor por sección del CMS (Hero, Confianza, Problema, Resultados, Enfoque, Servicios, Casos, Proceso, Contact, Faq, Cierre, Nosotros, Privacidad)
  Logo.tsx (Logo, LogoMark) · icons.tsx · LinkedInIcon.tsx
lib/content.ts      textos fijos fuera del CMS (nav, trustLabels, heroFeed/heroFeedMore, resultsVisuals, approachExample, sectionLabels, metrics, contactSection, contact, ctaNote, footerLinks, whatsappCard, newTabNote)
lib/siteConfig.ts   tipos, SECTIONS, defaultSiteConfig() (todos los textos editables por defecto), mergeConfig(), mergeFixedList(), mergeList(), normalizeTags(), renderHighlight(), normalizeContact(), formatWhatsapp(), whatsappLink()  (puro: tests y admin)
lib/inlineLinks.ts  parseInlineLinks(): enlaces internos [texto](/ruta) en textos del CMS, sin HTML  (puro)
lib/qrSvg.ts        qrPath()/qrSvg(): código QR dibujado en el servidor con qrcode-generator
lib/brandColors.ts  colores de marca que se necesitan como valor (NAVY_950); tailwind.config.ts los importa
lib/site.ts         getSiteConfig(), getTeamMembers() + re-exports de lib/siteConfig.ts  (server-only)
lib/leadOptions.ts  GOALS, INDUSTRIES, CONSENT_TEXTS, CONSENT_VERSION y helpers  (puro: formulario, API, correo, PDF y admin)
lib/leads.ts        normalizeLead(), validadores (correo, WhatsApp), honeypot, LEAD_SOURCES, safeScheduleUrl()  (puro)
lib/leadSummary.ts  rubro, objetivos y novedades de un lead para el equipo (correo, ficha PDF y admin)  (puro)
```

Regla: una sección de landing = un componente en `components/landing/`; un editor de sección del CMS = un `<Seccion>Editor.tsx` en `components/admin/config/`; otros editores del admin en `components/admin/`; lógica pura del diagnóstico en archivos `.ts` junto a sus componentes.

## 4. Convenciones

### Nombres
- Componentes: archivo PascalCase `.tsx` con **export nombrado** (`export function Hero(...)`). Las páginas (`page.tsx`, `layout.tsx`) son `export default`.
- Props tipadas inline o con `interface Props`; contenido del CMS tipado con `SiteContent["hero"]` etc.
- Identificadores nuevos en inglés; se conservan los nombres de dominio ya existentes en español (`ahorro`, `cuestionario`, `nombre`, `cargo`…).
- Ids de sección de la portada, en orden: `inicio`, el bloque de confianza (`aria-label` "Nos recomiendan", sin ancla de menú), `problema`, `resultados`, `enfoque`, `servicios`, `casos`, `modelo` (Proceso), `contacto`, `preguntas` (FAQ) y la banda final. El menú (`nav` en `lib/content.ts`) enlaza `resultados`, `servicios`, `casos`, `modelo` y `preguntas` (enlaces de escritorio desde 1080 px; bajo eso, menú desplegable); cada ítem declara su `section` y no se muestra si esa sección está oculta. Sin ítem activo fijo. Las secciones ancladas llevan `scroll-mt-20` para quedar bajo el menú fijo.

### Server vs client
- Por defecto todo es Server Component. `"use client"` **solo** en componentes con estado, eventos o Firebase cliente.
- Las páginas que leen el CMS declaran `export const dynamic = "force-dynamic"` y llaman `getSiteConfig()` / `getTeamMembers()` en el servidor; pasan `content` y `visible` por props.
- Prohibido importar `lib/firebaseAdmin.ts`, `lib/site.ts`, `lib/email.ts`, `lib/report.ts`, `lib/leadReport.ts` desde código cliente (`server-only`). Lo único de Firebase en cliente es `lib/firebase.ts` para el login.
- Los componentes de sección aceptan `content?` y caen a `defaultSiteConfig()` si no viene (patrón de `Hero`, `Problem`, `Results`, `Approach`, `Services`, `UseCases`, `Process`). El encabezado de sección (etiqueta mono, h2 y bajada) es `SectionHead`.

### CMS y visibilidad
- Cada sección o página tiene toggle en `SECTIONS` (`lib/siteConfig.ts`, re-exportado por `lib/site.ts`). Se renderiza solo si `visible[key]`; las páginas ocultas devuelven `notFound()`.
- Sección nueva editable: agregar clave a `SECTIONS`, default en `defaultSiteConfig()`, mezcla tolerante en `mergeConfig()` (`pickText` para textos, `mergeFixedList` si el diseño depende de la posición, `mergeList` si el largo es variable), tipo en `SiteContent`, editor `<Seccion>Editor.tsx` en `components/admin/config/` montado en `ConfigEditor.tsx`, **clave en `MANAGED_KEYS`** (si falta, sus ediciones no se guardan; `ConfigEditor.test.tsx` compara `MANAGED_KEYS` con las claves de `SiteContent`). El guardado envía solo las secciones modificadas (`changedKeys`) y fila en `docs/data-model.md`.
- Enlaces en textos del CMS: solo con la forma `[texto](/ruta)` o `[texto](#ancla)` y `parseInlineLinks()` (`lib/inlineLinks.ts`); nunca HTML ni `dangerouslySetInnerHTML`. Otros destinos se muestran como texto.
- Pie (`Footer`) igual en todas las páginas públicas: recibe `sections={visible}` (oculta enlaces a secciones o páginas ocultas) y `whatsapp={whatsappLink(content.contact)}`. La CTA fija en móvil (`StickyCta`) solo se monta si `visible.contacto` y el pie deja `pb-24` en móvil para no quedar tapado.
- Patrón "Usar los textos recomendados": cada editor envuelve sus campos en `SectionCard` con `onReset={() => onChange(defaults)}`; solo cambia el formulario, muestra un aviso y nada se publica hasta "Guardar cambios". Las listas de largo fijo usan `ListField` con `fixed` (sin agregar, quitar ni mover).
- Vocabulario: los textos por defecto de la portada no usan jerga técnica ni "pyme"; `lib/siteConfig.sections.test.ts` lo prueba sobre los defaults y `components/landing/Home.vocabulario.test.tsx` sobre el render completo de la portada (incluye textos fijos). El único lugar con nombres de herramientas es `servicios.notaTecnica`.
- Textos fijos que no son del CMS viven en `lib/content.ts`, nunca hardcodeados en el JSX.
- `title` del hero, `problema.cierre` y `servicios.notaTecnica` admiten `**resalte**` → `renderHighlight()` devuelve las partes y cada componente pinta el resalte (degradado en el hero, celeste en el cierre, negrita en la nota). Los textos del CMS se mezclan con `mergeConfig()`: un campo que no sea texto o quede vacío cae al default (no confiar en la forma de lo guardado).

### Estado y datos
- Estado local con `useState`; sin librerías de estado global.
- Mutaciones: `fetch("/api/…", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })`, leer `res.json()`, y si `!res.ok` mostrar `json.error`. Estado de envío como unión: `"idle" | "loading" | "ok" | "error"` (ver `ContactForm.tsx`, `app/admin/login/page.tsx`).
- Tras mutar datos que rendericen páginas server, llamar `router.refresh()`.
- Los formularios públicos no deben bloquearse por fallos secundarios (`DiagnosticoFlow` confirma aunque el backend falle).

### Estilos y diseño
- Solo tokens de `tailwind.config.ts`: colores `navy` (+ `navy-950/800/700`), `brand` (+ `brand-dark` para hover, `brand-deep` para texto y degradados cian sobre blanco, `brand-50/100`), `brand-light` (+ `brand-light-50`), `accent` (+ `accent-strong` para texto chico, `accent-50`), `success` (+ `success-strong`, `success-50`, `success-live`), `ink`/`ink-muted`/`ink-soft`/`ink-faint` (este último solo decorativo: no cumple contraste para texto), `inverse`/`inverse-strong`/`inverse-muted`/`inverse-faint` (texto sobre fondos navy, todos ≥ 5:1), `surface`/`surface-soft`/`surface-muted`, `line`/`line-strong`; sombras `shadow-card`, `shadow-float`, `shadow-cta`, `shadow-lift`, `shadow-form`; animaciones `animate-feed-in`, `animate-bob`, `animate-bob-slow`, `animate-live-pulse` (siempre con `motion-safe:`); ancho `max-w-content` (1200 px). Los tonos nuevos son los de la HDU-08 §7. **No introducir hex nuevos**; si hace falta un color, agregarlo como token.
- No usar `brand-light` (`#00C2FF`, 2,1:1) para texto sobre blanco; para eso está `brand-deep` (3,5:1, solo texto grande).
- Primitivas antes que clases repetidas: `.container-page`, `.btn-primary`, `.btn-ghost`, `.pill`, `.card`, `.field`, `.text-gradient-brand` (resalte con degradado `brand` → `brand-deep`; sin soporte de `background-clip` queda en `brand`), `.bg-dots` (trama de puntos; la máscara la pone cada sección) y `.bg-dots-inverse` (trama para secciones navy).
- Tarjetas en fila con partes de largo variable (título, texto, caja inferior): usar subgrilla (`row-span-N grid grid-rows-subgrid`) para que las partes queden a la misma altura (ver `Process.tsx` y `Services.tsx`).
- El desplazamiento suave a las anclas solo aplica con `prefers-reduced-motion: no-preference` (`app/globals.css`).
- En grids que mezclan texto con paneles de ancho mínimo grande, usar columnas `minmax(0, …)` para que en móvil no crezcan más que el contenedor.
- Tipografía: títulos `font-extrabold` con `tracking` negativo y `text-balance`; cuerpo `text-ink-muted leading-relaxed`; eyebrows de sección con `SectionHead` (`font-mono text-[12.5px] uppercase tracking-[2.2px] text-brand` con línea degradada; `text-brand-light` sobre navy). El eyebrow del hero es opcional y por defecto no se muestra; si el admin escribe uno, va en una píldora blanca con check (`font-mono text-xs font-semibold tracking-[1.6px] text-navy`).
- Público: los textos públicos no se dirigen solo a pymes (nada de "para dueños de pymes"); hablar de "tu negocio" o "tu empresa" (decisión de Mauro del 2026-10-22, HDU-08 §14 fila 9).
- `success` (`#138A4D`) es para íconos y marcas de completado; para texto chico sobre `success-50` usar `success-strong` (5,02:1; `success` da 4,09:1 y no cumple).
- Responsive mobile-first con breakpoints `md`/`lg`; el sidebar del admin se oculta bajo `md`.
- Dirección de diseño "1b claro & azul": fondo blanco/`surface-soft`, acento azul `brand`, detalles cian y naranjo puntuales.

### Copy, formato y locale
- Textos en español de Chile, tono directo de Nubolabs ("Tu operación, en piloto automático").
- Moneda con `fmtCLP` (`Intl.NumberFormat("es-CL", { currency: "CLP" })`, en `components/diagnostico/ahorro.ts`); fechas con `timeZone: "America/Santiago"`.
- Mensajes de error visibles al usuario provienen del `{ error }` de la API o son frases cortas en español.

### Accesibilidad
- HTML semántico (`header`, `main`, `section`, `nav`), `id` en secciones ancladas, `aria-label` en enlaces solo-ícono (ver logo del nav).
- Inputs con `name`, `placeholder` y `required`; botones con estado `disabled` durante `loading`.
- Imágenes con `alt` descriptivo; fotos del equipo con fallback de inicial (`Inicial` en `app/equipo/page.tsx`).
- Contraste: texto sobre `navy` en blanco; enlaces en `brand`.

## 5. Patrones obligatorios (ejemplos reales)

| Patrón | Ejemplo en el repo |
|---|---|
| Página server que lee el CMS y compone secciones por visibilidad | `app/page.tsx` |
| Página que oculta con `notFound()` y lista datos de Firestore | `app/equipo/page.tsx` |
| Sección con contenido del CMS y fallback a defaults | `components/landing/Hero.tsx` |
| Formulario cliente con estados y manejo de `{ error }` | `components/landing/ContactForm.tsx` |
| Flujo multi-paso con cálculo puro separado | `components/diagnostico/DiagnosticoFlow.tsx` + `ahorro.ts` / `cuestionario.ts` |
| Editor del admin que hace POST y refresca | `components/admin/TeamEditor.tsx`, `ConfigEditor.tsx` |
| Acción destructiva con confirmación escrita | `components/admin/DeleteLeadButton.tsx` |
| Nav cliente con visibilidad por props | `components/landing/Nav.tsx` |
| Layout protegido con redirect en servidor | `app/admin/(panel)/layout.tsx` |

## 6. Anti-patrones

- Importar librerías `server-only` en un componente cliente (rompe el build).
- Hardcodear textos en el JSX que deberían estar en `lib/content.ts` o en el CMS.
- Colores hex nuevos o estilos inline en vez de tokens y primitivas.
- `any`, props sin tipar, `fetch` sin manejo de error ni estado de carga.
- Renderizar una sección sin respetar `visible[key]`.
- Renombrar campos del CMS o de `team` (hay datos guardados).
- Usar `<img>` para fotos remotas en vez de `next/image` (salvo data URLs pequeñas ya contempladas).
- Bloquear la confirmación de un formulario público por un fallo de correo/informe.

## 7. Verificación

Antes de dar por terminada una tarea de frontend, ejecutar (el agente, no el usuario):

```
npm run lint
npx tsc --noEmit
npm test
npm run build
```

La lógica pura (cálculos, formateo, transformaciones como `components/diagnostico/ahorro.ts`) lleva su test unitario junto al archivo; los componentes con estados relevantes pueden llevar test con Testing Library.

Y cuando la tarea toque un flujo de usuario, prueba E2E con **Playwright MCP** contra `npm run dev` (http://localhost:3000; funciona sin credenciales de Firebase: los leads no persisten y `/admin` abre con sesión dev): navegar, completar el flujo (por ejemplo `/diagnostico` hasta la descarga del PDF, o el formulario de contacto hasta el estado `ok`), verificar estados de carga/error/éxito y responsive en 375 px y 1280 px, capturar evidencia y documentarla en `openspec/changes/<cambio>/reports/`.
