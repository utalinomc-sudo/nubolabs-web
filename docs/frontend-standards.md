---
description: Estándares de frontend del sitio de Nubolabs — Next.js 14 App Router, server vs client components, CMS en Firestore (lib/site.ts), Tailwind con tokens de marca, formularios, accesibilidad, copy en español de Chile y verificación (lint, typecheck, build, E2E con Playwright MCP).
alwaysApply: true
---

# Estándares de frontend — Nubolabs

## 1. Resumen

Tres superficies: la **landing** (`/`) compuesta por secciones de `components/landing/*`; las páginas públicas **`/diagnostico`** (cuestionario + estimador de ahorro), **`/equipo`** y **`/mision-vision`**; y el **panel admin** (`/admin/login` + grupo protegido `app/admin/(panel)/**`). Las páginas son Server Components que leen el CMS desde Firestore y pasan datos por props; la interacción vive en Client Components explícitos.

## 2. Stack

| Elemento | Tecnología / versión |
|---|---|
| Framework | Next.js 14.2 App Router · React 18.3 |
| Lenguaje | TypeScript 5.5 `strict`; alias `@/*` → raíz |
| Estilos | Tailwind CSS 3.4 con tokens de marca (`tailwind.config.ts`) + primitivas en `app/globals.css` |
| Fuentes | Plus Jakarta Sans (`--font-jakarta`, `font-sans`) e IBM Plex Mono (`--font-mono`) vía `next/font/google` en `app/layout.tsx` |
| Estado / datos | Estado local con hooks; datos de servidor por props; mutaciones con `fetch("/api/...")` |
| Imágenes | `next/image`; hosts remotos permitidos: `**.public.blob.vercel-storage.com` (`next.config.js`); data URLs para fotos sin Blob |
| Tests | Ninguno todavía · E2E manual con Playwright MCP (el agente lo ejecuta) |
| Lint / formato | ESLint `next/core-web-vitals`; sin Prettier (respetar el estilo existente: comillas dobles, punto y coma, 2 espacios) |

## 3. Estructura

```
app/
  layout.tsx              fuentes, metadata global, <html lang="es">
  page.tsx                landing: Nav + secciones según `visible` + Footer   (server, force-dynamic)
  globals.css             @tailwind + primitivas (.container-page, .btn-primary, .btn-ghost, .pill, .card, .field)
  diagnostico/page.tsx    monta <DiagnosticoFlow />
  equipo/page.tsx         lista integrantes (getTeamMembers); notFound() si visible.equipo es false
  mision-vision/page.tsx  misión, visión y objetivos desde content.nosotros
  admin/login/page.tsx    client: Firebase Auth → POST /api/admin/session
  admin/(panel)/layout.tsx  server: redirect a /admin/login si no hay sesión; sidebar
  admin/(panel)/{page,leads,leads/[id],config,equipo}/page.tsx
components/
  landing/   Nav (client), Hero, HeroGraphic, Problem, Approach, Services, Process, UseCases, ContactForm (client), Footer
  diagnostico/  DiagnosticoFlow.tsx (client), AhorroEstimator.tsx (client), cuestionario.ts, ahorro.ts
  admin/     ConfigEditor, TeamEditor, DeleteLeadButton, LeadPdfButton, LogoutButton (todos client)
  Logo.tsx (Logo, LogoMark) · icons.tsx · LinkedInIcon.tsx
lib/content.ts   textos por defecto (nav, heroTags, problems, approach, services, useCases…)
lib/site.ts      SECTIONS, defaultSiteConfig(), getSiteConfig(), getTeamMembers(), renderHighlight()  (server-only)
```

Regla: una sección de landing = un componente en `components/landing/`; un editor del admin = un componente en `components/admin/`; lógica pura del diagnóstico en archivos `.ts` junto a sus componentes.

## 4. Convenciones

### Nombres
- Componentes: archivo PascalCase `.tsx` con **export nombrado** (`export function Hero(...)`). Las páginas (`page.tsx`, `layout.tsx`) son `export default`.
- Props tipadas inline o con `interface Props`; contenido del CMS tipado con `SiteContent["hero"]` etc.
- Identificadores nuevos en inglés; se conservan los nombres de dominio ya existentes en español (`ahorro`, `cuestionario`, `nombre`, `cargo`…).
- Ids de sección para anclas del nav: `inicio`, `servicios`, `modelo`, `casos` (ver `nav` en `lib/content.ts`).

### Server vs client
- Por defecto todo es Server Component. `"use client"` **solo** en componentes con estado, eventos o Firebase cliente.
- Las páginas que leen el CMS declaran `export const dynamic = "force-dynamic"` y llaman `getSiteConfig()` / `getTeamMembers()` en el servidor; pasan `content` y `visible` por props.
- Prohibido importar `lib/firebaseAdmin.ts`, `lib/site.ts`, `lib/email.ts`, `lib/report.ts`, `lib/leadReport.ts` desde código cliente (`server-only`). Lo único de Firebase en cliente es `lib/firebase.ts` para el login.
- Los componentes de sección aceptan `content?` y caen a `defaultSiteConfig()` si no viene (patrón de `Hero`, `Services`, `UseCases`).

### CMS y visibilidad
- Cada sección o página tiene toggle en `SECTIONS` (`lib/site.ts`). Se renderiza solo si `visible[key]`; las páginas ocultas devuelven `notFound()`.
- Sección nueva editable: agregar clave a `SECTIONS`, default en `defaultSiteConfig()`, mezcla en `mergeConfig()`, tipo en `SiteContent`, editor en `components/admin/ConfigEditor.tsx` y fila en `docs/data-model.md`.
- Textos fijos que no son del CMS viven en `lib/content.ts`, nunca hardcodeados en el JSX.
- `title` del hero admite `**resalte**` → `renderHighlight()` produce `<span className="text-brand">`.

### Estado y datos
- Estado local con `useState`; sin librerías de estado global.
- Mutaciones: `fetch("/api/…", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })`, leer `res.json()`, y si `!res.ok` mostrar `json.error`. Estado de envío como unión: `"idle" | "loading" | "ok" | "error"` (ver `ContactForm.tsx`, `app/admin/login/page.tsx`).
- Tras mutar datos que rendericen páginas server, llamar `router.refresh()`.
- Los formularios públicos no deben bloquearse por fallos secundarios (`DiagnosticoFlow` confirma aunque el backend falle).

### Estilos y diseño
- Solo tokens de `tailwind.config.ts`: colores `navy`, `brand`, `brand-light`, `accent`, `ink`/`ink-muted`/`ink-soft`, `surface`/`surface-soft`/`surface-muted`, `line`; sombras `shadow-card`, `shadow-float`, `shadow-cta`; ancho `max-w-content` (1200 px). **No introducir hex nuevos**; si hace falta un color, agregarlo como token.
- Primitivas antes que clases repetidas: `.container-page`, `.btn-primary`, `.btn-ghost`, `.pill`, `.card`, `.field`.
- Tipografía: títulos `font-extrabold` con `tracking` negativo y `text-balance`; cuerpo `text-ink-muted leading-relaxed`; eyebrows `text-xs font-bold tracking-[2.5px] text-brand`.
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
npm run build
```

Y cuando la tarea toque un flujo de usuario, prueba E2E con **Playwright MCP** contra `npm run dev` (http://localhost:3000; funciona sin credenciales de Firebase: los leads no persisten y `/admin` abre con sesión dev): navegar, completar el flujo (por ejemplo `/diagnostico` hasta la descarga del PDF, o el formulario de contacto hasta el estado `ok`), verificar estados de carga/error/éxito y responsive en 375 px y 1280 px, capturar evidencia y documentarla en `openspec/changes/<cambio>/reports/`.
