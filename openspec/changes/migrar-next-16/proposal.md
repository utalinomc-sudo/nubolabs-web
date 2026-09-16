## Why

Tras el cambio `actualizar-dependencias-seguras`, `npm audit --omit=dev` (medido el 2026-09-16) sigue reportando **10 alertas** en dependencias de producción (1 crítica, 1 alta, 8 moderadas): la crítica y una moderada pertenecen a `next` 14.2.35 (DoS por deserialización de RSC, request smuggling en rewrites, DoS en `remotePatterns`), la alta a la copia de `postcss` 8.4.31 anidada bajo `next`, y las 7 moderadas restantes a la cadena de `firebase-admin` 12.7 (`@google-cloud/firestore`, `@google-cloud/storage`, `gaxios`, `google-gax`, `retry-request`, `teeny-request`, `uuid`). Todas las versiones 14.x y 15.x de Next figuran como vulnerables: no existe parche sin migrar. El sitio está en producción captando leads, por lo que la alerta crítica se cierra ahora.

## What Changes

- **BREAKING (herramientas, no comportamiento):** `next` `^14.2.35` → `^16.3.5` y `eslint-config-next` → `^16.3.5`. Next 16 exige Node ≥ 20.9 (Vercel y local usan 24), acepta React 18 (`peer react ^18.2`) y trae `postcss` 8.5.23 (cierra la alerta alta anidada). Turbopack pasa a ser el bundler por defecto en `next dev` y `next build`.
- **BREAKING (herramientas):** `next lint` desaparece en Next 16. `eslint` `^8.57` → `^9` con configuración plana: se crea `eslint.config.mjs` a partir de `eslint-config-next/core-web-vitals` (equivalente al `next/core-web-vitals` actual, sin reglas nuevas), se borra `.eslintrc.json` y el script `lint` pasa a `eslint .`.
- **BREAKING (herramientas):** `firebase-admin` `^12.1.0` → `^14.4.0` (Node ≥ 22; trae `@google-cloud/firestore` 9 y `@google-cloud/storage` 8, que cierran 5 de las 7 moderadas). Las 2 restantes (`uuid` 9 bajo `gaxios` 6, que `@google-cloud/storage` 8.1.0, la última publicada, sigue fijando) no tienen parche sin salto mayor y quedan documentadas como residuo: pertenecen al módulo opcional de Cloud Storage, que este proyecto no usa ni carga (las fotos van a Vercel Blob). El código usa solo la API modular estable (`firebase-admin/app`, `/firestore`, `/auth`), que no cambia.
- Adaptaciones de código exigidas por las Request APIs asíncronas de Next 16 (sin cambio visible para el usuario):
  - `lib/adminAuth.ts`: `cookies()` pasa a `await cookies()`.
  - `params` como `Promise<{ id: string }>` (`const { id } = await params`) en `app/admin/(panel)/leads/[id]/page.tsx`, `app/api/admin/leads/[id]/route.ts`, `app/api/admin/leads/[id]/pdf/route.ts` y `app/api/admin/team/[id]/route.ts`.
  - `app/layout.tsx`: se añade `data-scroll-behavior="smooth"` al `<html>` porque `app/globals.css` declara `scroll-behavior: smooth` y Next 16 deja de anular ese estilo al navegar; con el atributo el desplazamiento entre páginas y a las anclas (`/#inicio`, `/#contacto`) se comporta igual que hoy.
  - `next.config.js`: se añade `agentRules: false` para que `next dev` 16.3 no inserte su bloque gestionado en `AGENTS.md` y `CLAUDE.md`, que en este repo son punteros a `docs/base-standards.md` (base-standards §6). `images.remotePatterns` y `reactStrictMode` se mantienen.
- Añadido tras el primer preview (2026-09-16): `lib/privateKey.ts` con `normalizePrivateKey` y su test, usada por `lib/firebaseAdmin.ts`, cuya inicialización queda protegida con `try/catch` y log `[firebase-admin]`. Motivo: firebase-admin 14 rechaza la clave privada guardada con comillas, en una sola línea o con espacios sobrantes (formatos que la 12 toleraba) y `cert()` tumbaba todas las páginas dinámicas del preview (design, decisión 13; reporte del paso 2b). `.env.local.example` aclara que en Vercel el valor va sin comillas. El segundo preview mostró la causa real del 500 (`ERR_REQUIRE_ESM` al cargar `firebase-admin/auth`, porque `jwks-rsa` hace `require()` de `jose` 6, solo ESM, y el runtime de Vercel no está en Node ≥ 20.19/22.12): `firebase-admin/auth` pasa a cargarse de forma perezosa y protegida en `getAdminAuth()` (asíncrona) para que el sitio público nunca dependa de él, y fijar Node 24.x en Vercel queda como acción del dueño (design, decisión 14; reporte del paso 2c).
- Mantener `react` y `react-dom` en 18.3 (Next 16 los soporta); `@types/react*` en 18.
- Documentación: versiones y convenciones nuevas (lint con ESLint 9, `params`/`cookies` asíncronos, Turbopack) en los documentos listados en Impact; la HDU `docs/backlog/migrar-next-16.md` ya quedó marcada "en curso" y se cierra al archivar.
- Sin variables de entorno nuevas: `.env.local.example` no cambia.

## Capabilities

### New Capabilities
<!-- Ninguna: migración de framework y dependencias sin comportamiento nuevo. `.openspec.yaml` declara `skip_specs: true`. -->

### Modified Capabilities
<!-- Ninguna: los 11 endpoints de docs/api-spec.yml y las colecciones de docs/data-model.md conservan sus contratos; la única spec existente (`diagnostico/estimador-ahorro`) no cambia. -->

## Non-goals

- Subir a React 19 o adoptar funciones nuevas de Next 16 (`cacheComponents`, `proxy`, React Compiler, typed routes, `next.config.ts`).
- Añadir reglas de lint nuevas (por ejemplo `eslint-config-next/typescript`) o migrar a ESLint 10.
- Cambiar diseño, textos, rutas, contratos de API o campos persistidos.
- Migrar el SDK cliente `firebase` más allá de la 11 actual; subir `@types/node` (queda en 20, `skipLibCheck` evita conflictos).
- Ajustar la configuración de Turbopack o volver a webpack, salvo como respaldo documentado si el preview muestra diferencias visuales.

## Impact

- **Dependencias:** `package.json` (`next`, `eslint-config-next`, `eslint`, `firebase-admin`, script `lint`) y `package-lock.json`.
- **Código de aplicación:** los 6 archivos listados en What Changes (`lib/adminAuth.ts`, 4 rutas dinámicas, `app/layout.tsx`) más `next.config.js`; se crea `eslint.config.mjs` y se elimina `.eslintrc.json`. Tras el primer preview se añaden `lib/privateKey.ts` y `lib/privateKey.test.ts`, y `lib/firebaseAdmin.ts` pasa a normalizar la clave y a proteger la inicialización. `next-env.d.ts` está ignorado por git y lo regenera Next.
- **Comportamiento:** ninguno esperado. Superficies con riesgo que se verifican explícitamente: sesión del admin (`verifySessionCookie`/`createSessionCookie` con firebase-admin 14), páginas y rutas con `[id]`, CSS/fuentes bajo Turbopack, scroll a anclas de la landing, y el alcance de `eslint .` (ahora también lint a los archivos de configuración de la raíz; `ai-specs/**`, `.claude/**`, `openspec/**` y `docs/**` se ignoran).
- **Degradación sin credenciales:** sin cambios; `getDb()`/`getAdminAuth()` siguen devolviendo `null` y `getAdminSession()` la sesión "dev" en local.
- **Verificación:** `npm run lint` (ESLint 9), `npx tsc --noEmit`, `npm test`, `npm run build` (Turbopack); `curl` a los 11 endpoints de `docs/api-spec.yml` contra `npm run dev`; E2E completo con Playwright MCP (landing, `/diagnostico` hasta el PDF, `/equipo`, `/mision-vision`, `/admin/login`, leads con detalle/PDF/eliminación, CMS y equipo con subida de foto); `npm audit --omit=dev` sin alertas críticas, altas ni moderadas fuera del residuo documentado de `@google-cloud/storage`; revisión del preview de Vercel por el dueño con login real antes de mezclar.
- **Documentación a actualizar (documentation-standards §3):** `docs/ESTADO-PROYECTO.md` (pendientes 6 y 7, stack), `docs/project-profile.md` §2 y §5, `docs/frontend-standards.md` §2, `docs/backend-standards.md` §2 y §4 (tipado de `params`), `README.md` (versión del stack), `openspec/config.yaml` (contexto "Next.js 14"), y `docs/backlog/migrar-next-16.md` (cerrar al archivar). `docs/api-spec.yml`, `docs/data-model.md` y `.env.local.example` no cambian.

## Criterios de aceptación (escenarios)

- **Cuando** se ejecuta `npm audit --omit=dev` tras instalar, **entonces** no queda ninguna alerta crítica ni alta, y las únicas moderadas son las 2 de `uuid`/`gaxios` bajo `@google-cloud/storage` (sin parche publicado; módulo no usado), documentadas en el reporte del paso 2 y en `docs/ESTADO-PROYECTO.md`; `npm ls next firebase-admin eslint eslint-config-next --depth=0` muestra 16.3.x, 14.4.x, 9.x y 16.3.x.
- **Cuando** se ejecutan `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`, **entonces** los cuatro terminan sin errores; `lint` corre ESLint 9 con `eslint.config.mjs` y `build` compila con Turbopack.
- **Cuando** se hace `curl` a cada endpoint de `docs/api-spec.yml` contra `npm run dev` sin `.env.local`, **entonces** cada uno responde exactamente igual que antes de la migración (matriz de respuestas esperadas en `design.md`), incluidas las rutas con `[id]`.
- **Cuando** se recorre con Playwright MCP la landing (incluido el scroll a `/#contacto` y `/#inicio`), `/diagnostico` hasta descargar el PDF, `/equipo`, `/mision-vision`, `/admin/login` y el panel (`/admin`, `/admin/leads`, detalle de un lead, `/admin/config`, `/admin/equipo`), **entonces** todo renderiza y funciona igual que en producción, en 375 px y 1280 px.
- **Cuando** el dueño abre el preview de Vercel de la rama e inicia sesión con Firebase Auth, **entonces** entra al panel, ve un lead (detalle y PDF) y cierra sesión; el sitio público se ve idéntico a producción.
- **Cuando** se ejecuta `next dev` con Next 16.3, **entonces** `AGENTS.md` y `CLAUDE.md` quedan sin cambios (`git status` limpio para esos archivos).
