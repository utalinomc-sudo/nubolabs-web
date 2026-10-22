## Context

Motivación en `proposal.md`; requisitos en `specs/leads/origen-referidos/spec.md`. Este diseño asume mezclados HDU-01, 03, 02, 10, 04, 06 y 05 (orden de `docs/backlog/propuesta-valor-hdu-08.md` §15). Estado relevante:

- `app/page.tsx` (server, `force-dynamic`) lee `getSiteConfig()` y compone `Nav`, las secciones según `visible` y `Footer`. No recibe `searchParams`.
- `app/api/leads/route.ts` valida con `normalizeLead()` de `lib/leads.ts` (HDU-03), guarda en `leads` y en paralelo llama `sendLeadNotification()` y `maybeSendClientReport()`. **`maybeSendClientReport()` solo actúa si `lead.source === "diagnostico"`**, y el dashboard (`app/admin/(panel)/page.tsx`) cuenta "Vía diagnóstico" con el mismo criterio.
- `lib/leadOptions.ts` (HDU-03, sin `server-only`) exporta `GOALS` e `INDUSTRIES`; `lib/leads.ts` exporta `LEAD_SOURCES = ["landing", "diagnostico"]`.
- `components/landing/ContactForm.tsx` (HDU-03) y `components/diagnostico/DiagnosticoFlow.tsx` arman el payload en el cliente y hacen `fetch("/api/leads")`.
- `app/admin/(panel)/leads/page.tsx` trae los últimos 100 leads con `orderBy("createdAt", "desc").limit(100)` y pinta `source` como etiqueta (colores hex inline, ver riesgo de tokens). El detalle `leads/[id]/page.tsx` y la ficha `lib/leadReport.ts` muestran `source`.
- El CMS vive en `lib/siteConfig.ts` (HDU-01): `SECTIONS`, tipos, `defaultSiteConfig()`, `mergeConfig()`, con tests en `lib/siteConfig.test.ts`; el editor del admin tiene por sección el botón "Usar los textos recomendados".
- Referencia visual de la franja: `.ref` en `docs/design/propuesta-web-hdu-08.html` (fondo navy, ícono escudo cian, texto, botón cerrar de 44 px).

## Goals / Non-Goals

**Goals:**
- Medir la campaña sin romper el informe al cliente ni los KPIs existentes.
- Un solo árbol de componentes para `/` y `/oa` (no duplicar la portada).
- Que el referido sobreviva al paso portada → `/diagnostico` en la misma pestaña.

**Non-Goals:**
- Referidores dinámicos administrables (`/r/<codigo>`); la lista queda en código.
- Índices compuestos de Firestore o paginación del listado de leads.

## Decisions

### 1. Campo nuevo `referral` en vez de `source: "oa"`
El backlog decía "los leads de `/oa` quedan con `source: "oa"`". Se cambia por un campo aparte, `referral` (inglés, convención de `leads`), y `source` sigue siendo el formulario (`landing` | `diagnostico`).

- *Por qué:* con `source: "oa"` un diagnóstico referido **no recibiría su informe PDF** (`maybeSendClientReport()` filtra por `source === "diagnostico"`), el KPI "Vía diagnóstico" lo dejaría fuera y se perdería saber si el referido usó el formulario o el diagnóstico. Son dos dimensiones distintas (qué formulario / quién recomendó).
- *Alternativa descartada:* `source: "oa"` + cambiar el disparador del informe a "tiene `meta.indiceFriccion`". Arregla el informe, pero sigue mezclando dimensiones y obliga a tocar cada lugar que interpreta `source`.
- `REFERRALS = ["oa"] as const` y su etiqueta (`{ oa: "O&A" }`) van en `lib/leadOptions.ts` (lo usan cliente y servidor). `LEAD_SOURCES` de HDU-03 no cambia.

### 2. Validación en `normalizeLead()` (TDD)
`normalizeLead()` suma `referral`: si `typeof body.referral === "string"` y su `trim()` está en `REFERRALS`, se copia al lead; en cualquier otro caso se omite (sin error). Tests nuevos en `lib/leads.test.ts`: válido, con espacios, desconocido, no-string, ausente, y que `source` no cambia.

### 3. Composición compartida `components/landing/LandingPage.tsx`
Se extrae de `app/page.tsx` la composición (Nav + secciones por `visible` + Footer) a un Server Component `LandingPage({ referral?: Referral })`, que lee `getSiteConfig()` y, si hay `referral`, antepone `<ReferralBanner content={content.referidos.oa} />` y monta `<ReferralTracker referral={referral} />`.

- `app/page.tsx`: `export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> })`; `const { ref } = await searchParams`; pasa `referral` solo si `parseReferral(ref)` lo valida.
- `app/oa/page.tsx`: `<LandingPage referral="oa" />` con `export const dynamic = "force-dynamic"` y `export const metadata = { robots: { index: false, follow: true }, alternates: { canonical: "/" } }`.
- *Alternativa descartada:* `redirect("/?ref=oa")` desde `/oa`; cambia la URL que ve el visitante y suma un salto.
- *Alternativa descartada:* `middleware`/`proxy` que reescriba `/oa`; más maquinaria para una ruta.

### 4. Referido en la sesión del navegador (`lib/referral.ts`, cliente-seguro)
- `REFERRAL_STORAGE_KEY = "nubolabs_ref"` y `BANNER_CLOSED_KEY = "nubolabs_ref_banner_closed"`.
- `parseReferral(value: unknown): Referral | null` (puro, testeable): acepta string o primer elemento de arreglo, recorta y valida contra `REFERRALS`.
- `rememberReferral(r)`, `readStoredReferral()`: envuelven `sessionStorage` en `try/catch` (navegación privada o bloqueo → no hace nada / devuelve `null`).
- `ReferralTracker` (`"use client"`, sin UI) llama `rememberReferral()` en un `useEffect`.
- `ContactForm.tsx` y `DiagnosticoFlow.tsx` agregan `referral: readStoredReferral() ?? undefined` al payload **en el momento del envío** (no al montar), así funciona aunque el tracker monte después.
- *Por qué `sessionStorage` y no cookie:* no viaja al servidor ni requiere aviso de cookies, y el alcance "esta pestaña" es exactamente el de la campaña. *Alternativa descartada:* `localStorage` (persistiría semanas y atribuiría leads futuros sin relación con el correo).

### 5. `ReferralBanner` (cliente)
Franja según `.ref` de la referencia, con tokens de HDU-01 (`bg-navy`, ícono en `brand-light`, texto `text-white/85`, título en blanco). Estado `closed` inicial leído de `sessionStorage` (`BANNER_CLOSED_KEY`) dentro de un `useEffect` para no romper la hidratación: el servidor siempre renderiza la franja y el cliente la oculta si estaba cerrada (parpadeo mínimo aceptado; alternativa de leer en servidor descartada porque `sessionStorage` no existe allí). Botón `aria-label="Cerrar aviso"`, `min-h-11 min-w-11`. `role="region"` + `aria-label="Recomendación"`.

### 6. CMS: `content.referidos.oa`
Tipo `referidos: { oa: { titulo: string; texto: string } }` en `SiteContent`, default con los textos de la spec, mezcla profunda en `mergeConfig()` (`{ oa: { ...base.referidos.oa, ...(c.referidos?.oa ?? {}) } }`) y bloque "Franja de referidos (O&A)" en el editor con "Usar los textos recomendados". No lleva clave en `SECTIONS`: la franja solo existe en `/oa`, no es una sección de la portada. Tests en `lib/siteConfig.test.ts` (sin override, override parcial).

### 7. Admin y medición
- **Lista:** `app/admin/(panel)/leads/page.tsx` recibe `searchParams` (Promise) y lee `origen` ∈ `todos | landing | diagnostico | oa`. Se sigue consultando `orderBy("createdAt", "desc").limit(200)` y se filtra en memoria con `filterLeadsByOrigin()` (puro, en `lib/leadStats.ts`). *Alternativa descartada:* `where("referral", "==", "oa")` + `orderBy("createdAt")`, que exige crear un índice compuesto en Firestore; con el volumen actual no se justifica. Filtros como enlaces (`<Link href="?origen=oa">`) con el activo marcado (`aria-current="page"`). Etiquetas con tokens (`bg-brand-50 text-brand`, `bg-accent-50 text-accent-strong`, `bg-navy text-white` para "O&A") en vez de los hex actuales.
- **Dashboard:** `countLeadsByOrigin(leads, now)` en `lib/leadStats.ts` devuelve `{ landing, diagnostico, oa }` de los últimos 30 días (`createdAt` ISO válido y `now - 30 días <= createdAt <= now`). Se reutiliza la lectura de `getStats()` (ya trae toda la colección). Tests en `lib/leadStats.test.ts` con fechas fijas (escenario de la spec, `createdAt` inválido, borde de 30 días).
- **Detalle y ficha PDF:** etiqueta "Referido: O&A" junto al origen; `lib/leadReport.ts` agrega "· O&A" a la etiqueta de origen.
- **Correo interno:** `lib/email.ts` arma "Origen" como `landing · referido O&A` cuando hay `referral`.

### Degradación
- Sin Firebase: `/oa` muestra los defaults del CMS; `POST /api/leads` responde `{ ok: true, persisted: false }` como hoy; el dashboard muestra "—".
- Sin Resend: nada cambia (el correo interno ya es no-op).
- Sin `sessionStorage`: el lead sale sin `referral`; ningún flujo se bloquea.
- Blob no participa.

## Risks / Trade-offs

- [El correo sale con `nubolabs.cl` en vez de `/oa`] → coordinar el link con Mauricio O. antes del envío (tarea post-merge); `/?ref=oa` sirve como plan B.
- [Atribución incompleta: el visitante vuelve otro día por Google o abre otra pestaña] → aceptado y documentado en `ESTADO-PROYECTO.md`; se mide un mínimo, no el total.
- [El filtro en memoria solo ve los últimos 200 leads] → suficiente para el volumen actual; si se supera, crear el índice compuesto y pasar a consulta.
- [Parpadeo de la franja al recargar tras cerrarla] → mínimo y solo en `/oa`; aceptado.
- [Contenido duplicado `/oa` vs `/`] → `noindex` + `canonical` a `/`.

## Migration Plan

1. Mezclar tras el preview aprobado. Los leads antiguos no tienen `referral` y se muestran igual.
2. En `/admin/config` → "Franja de referidos (O&A)": revisar textos ("Usar los textos recomendados") y guardar.
3. Confirmar con Mauricio O. que el botón del correo apunte a `https://www.nubolabs.cl/oa`.
4. Rollback: revertir el commit. `referral` queda guardado en los leads nuevos y el código anterior lo ignora.
