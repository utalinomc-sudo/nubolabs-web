## Context

Ver `proposal.md` (Why). Hechos medidos el 2026-09-16 que condicionan el diseño:

**Versiones disponibles en npm**
- `next@16.3.5` (última): `engines.node >=20.9.0`, `peer react ^18.2.0 || ^19`, trae `postcss@8.5.23` (cierra la alerta alta anidada). Turbopack por defecto en `dev` y `build`; `next lint` y la opción `eslint` de `next.config` eliminados; acceso síncrono a `cookies()`, `headers()`, `params` y `searchParams` eliminado; `next dev` 16.3 inserta un bloque gestionado en `AGENTS.md`/`CLAUDE.md` salvo `agentRules: false`; deja de anular `scroll-behavior: smooth` al navegar salvo `data-scroll-behavior="smooth"` en `<html>`.
- `eslint-config-next@16.3.5`: `peer eslint >=9.0.0`; exporta `.`, `./core-web-vitals`, `./typescript` y `./parser` como flat configs; depende de `eslint-plugin-react-hooks ^7`, `eslint-plugin-react ^7.37`, `eslint-plugin-import ^2.32`, `eslint-plugin-jsx-a11y ^6.10`, `typescript-eslint ^8.46`.
- `eslint@9.39.5` (última 9.x; existe 10.10.0, fuera de alcance).
- `firebase-admin@14.4.0`: `engines.node >=22`; dependencias opcionales `@google-cloud/firestore ^9.1.0` y `@google-cloud/storage ^8.1.0` (cierran las 7 moderadas). Cambios mayores de 13 y 14: Node mínimo, eliminación del namespace legado (`import * as admin from "firebase-admin"`), de Instance ID y de los tipos legados de FCM; nada de eso se usa aquí.
- Node local 24.16, Vercel 24.x (`engines.node: "24.x"` ya declarado), npm 11.

**Inventario del código afectado (grep sobre `app/`, `lib/`, `components/`, `types/`)**
- `cookies()` solo en `lib/adminAuth.ts:21`. No hay `headers()`, `searchParams`, `draftMode()`, `middleware.ts`, rutas paralelas, `opengraph-image`, `sitemap`, `unstable_*`, `experimental`, configuración `webpack` ni opción `eslint` en `next.config.js`.
- `params` en `app/admin/(panel)/leads/[id]/page.tsx:69`, `app/api/admin/leads/[id]/route.ts:8`, `app/api/admin/leads/[id]/pdf/route.ts:10` y `app/api/admin/team/[id]/route.ts:8`, todos tipados `{ params: { id: string } }`.
- `firebase-admin` solo en `lib/firebaseAdmin.ts` con la API modular (`cert`, `getApps`, `initializeApp`, `getFirestore`, `getAuth`); consumidores usan `collection/doc/get/set/add/delete/orderBy/limit` y `verifySessionCookie`/`createSessionCookie` (`lib/adminAuth.ts`, `app/api/admin/session/route.ts`). La cookie se escribe con `NextResponse.cookies.set`, que no cambia.
- `next/image` solo en `app/equipo/page.tsx:50` con `unoptimized` (fotos como data URL o Blob): los nuevos defaults de `images` (`qualities`, `minimumCacheTTL`, `localPatterns`, `maximumRedirects`) no aplican; `remotePatterns` se conserva.
- `next/font/google` en `app/layout.tsx` (Plus Jakarta Sans, IBM Plex Mono); Tailwind 3 vía `postcss.config.js` (Turbopack lo soporta).
- `app/globals.css:10` declara `scroll-behavior: smooth` en `html`; la landing usa anclas `#inicio`, `#servicios`, `#modelo`, `#casos`, `#contacto` (`components/landing/Nav.tsx`, `Hero.tsx`).
- `next lint` lintaba solo `app/`, `components/`, `lib/`, `pages/`, `src/`. `eslint .` alcanzará además `next.config.js`, `postcss.config.js`, `tailwind.config.ts`, `vitest.config.mts`, `vitest.setup.ts` y `ai-specs/skills/writing-skills/render-graphs.js` (copiado en `.claude/skills/`).
- `.gitignore` ya ignora `next-env.d.ts`, `.next/`, `*.tsbuildinfo`; `.eslintrc.json` está versionado.
- No existe `.env.local` en la máquina local: `getAdminSession()` devuelve la sesión "dev", `getDb()`/`getAdminAuth()` devuelven `null` y ningún dato se persiste. El camino `401` y `verifySessionCookie` solo se ejercita con credenciales (preview de Vercel).
- Línea base del cambio anterior (`archive/2026-09-16-actualizar-dependencias-seguras/reports/`): lint 44 s, tsc 6 s, 11 tests, build 105 s (webpack); `curl` a `/api/leads` y `/api/diagnostico/report` documentados.
- Playwright MCP está disponible en el entorno como herramientas de plugin (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill_form`, `browser_take_screenshot`, …).

## Goals / Non-Goals

**Goals:**
- Migrar en dos bloques verificables por separado (Next 16 + ESLint 9, luego firebase-admin 14) dentro de una misma rama, para poder aislar cualquier regresión.
- Que el diff de código sea mínimo, explícito y revisable: solo las adaptaciones exigidas por Next 16 y el cambio de lint; nada de refactors oportunistas.
- Que el proceso deje evidencia reproducible: matriz de `curl` de los 11 endpoints, E2E completo con Playwright MCP y reportes en `openspec/changes/migrar-next-16/reports/`.

**Non-Goals:**
- Ver `proposal.md` (Non-goals). Además, a nivel de diseño: no usar los helpers de tipos generados (`PageProps`, `RouteContext` de `next typegen`), no activar `reactCompiler`, `cacheComponents` ni `turbopack.*`, no reordenar las comprobaciones de los handlers para "ejercitar" `params` sin base de datos.

## Decisions

1. **Instalación manual con rangos fijados, no `npx @next/codemod@canary upgrade latest`.** El codemod `upgrade` instala `react@latest`/`react-dom@latest` (19) y `@types/react` 19, que son non-goals. Se ejecuta en una sola orden para evitar `ERESOLVE` entre `eslint@8` y `eslint-config-next@16`:
   `npm install next@^16.3.5 && npm install -D eslint@^9 eslint-config-next@^16.3.5` (o ambos en un solo `npm install`). Como contraste, se corre `npx @next/codemod@canary next-async-request-api . --dry --print` solo para confirmar que no hay más archivos con acceso síncrono que los 5 inventariados; las ediciones se hacen a mano.
2. **Firma explícita de `params`:** `{ params }: { params: Promise<{ id: string }> }` y `const { id } = await params` como primera línea tras la comprobación de sesión (handlers) o al inicio de la función (página). Alternativa descartada: `PageProps<'/admin/leads/[id]'>`/`RouteContext` generados por `next typegen` (dependen de tipos generados en `.next/` y añaden una convención nueva). `docs/backend-standards.md` §4 pasa a documentar la firma con `Promise`.
3. **`cookies()` asíncrono:** `const store = await cookies(); const token = store.get(COOKIE)?.value;` en `lib/adminAuth.ts`. La función ya era `async`; el resto no cambia.
4. **ESLint 9 con flat config equivalente a la actual.** `eslint.config.mjs`:
   ```js
   import { defineConfig, globalIgnores } from "eslint/config";
   import nextVitals from "eslint-config-next/core-web-vitals";

   export default defineConfig([
     ...nextVitals,
     globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "ai-specs/**", ".claude/**", "openspec/**", "docs/**"]),
   ]);
   ```
   Script `"lint": "eslint ."`. Se borra `.eslintrc.json` (ESLint 9 lo ignora y su presencia confunde). No se incluye `eslint-config-next/typescript` (añadiría reglas de `typescript-eslint` que hoy no rigen). Si los archivos de configuración de la raíz (CommonJS) generan avisos, se añade un bloque `{ files: ["*.config.js"], languageOptions: { sourceType: "commonjs" } }`. Si alguna regla nueva de los plugins de la 16 (por ejemplo `react-hooks` 7) marca código existente, **no se refactoriza**: la regla se desactiva en `eslint.config.mjs` con un comentario que cita este cambio y el hallazgo se anota como pendiente en `docs/ESTADO-PROYECTO.md`. Alternativa descartada: ESLint 10 (fuera de alcance; `typescript-eslint` 8.46 y la documentación de Next apuntan a 9).
5. **Turbopack con la configuración por defecto.** `dev` y `build` sin flags ni bloque `turbopack`. Respaldo: si el preview muestra diferencias de CSS o fuentes que no se explican, `"build": "next build --webpack"` documentado en `ESTADO-PROYECTO.md` como deuda. `next build` ya no imprime tamaños por ruta; no es una regresión.
6. **`data-scroll-behavior="smooth"` en `<html>` (`app/layout.tsx`).** Conserva exactamente el comportamiento actual de navegación con `scroll-behavior: smooth` global. Alternativa descartada: quitar la regla de `globals.css` (cambiaría el scroll a anclas dentro de la landing, non-goal).
7. **`agentRules: false` en `next.config.js`.** `AGENTS.md` y `CLAUDE.md` son punteros administrados por specboot (base-standards §6) y no deben recibir un bloque gestionado por `next dev`. Para no perder la ventaja (docs de la versión instalada en `node_modules/next/dist/docs/`), se añade una línea en `docs/frontend-standards.md` §2 y `docs/backend-standards.md` §2 indicando consultar esa carpeta para APIs de Next 16. Alternativa descartada: versionar el bloque (Next lo recomienda) porque rompe la regla de fuente única del repo.
8. **`firebase-admin@^14.4.0` en un paso separado, después de que Next 16 esté verde.** Solo cambia `package.json`/lockfile; el código no se toca. Se verifica con `npm ls @google-cloud/firestore @google-cloud/storage` (9.x / 8.x), `npx tsc --noEmit`, los `curl` de los endpoints admin (camino sin credenciales) y el login real del dueño en el preview (camino con `verifySessionCookie`).
   **Residuo comprobado el 2026-09-16:** tras instalar, `npm audit --omit=dev` conserva 2 moderadas (`uuid` < 11.1.1 y `gaxios` 6.4–6.7 que depende de él) porque `@google-cloud/storage@8.1.0` (última versión publicada) fija `gaxios ^6.0.2` → `uuid ^9.0.1`, y la corrección de `uuid` está en la 11.1.1; `npm audit fix --dry-run` no propone cambios. `@google-cloud/storage` es dependencia opcional de firebase-admin que solo se carga al llamar a `getStorage()`, y el proyecto no usa Cloud Storage (fotos en Vercel Blob). Se acepta como residuo documentado (reporte del paso 2 y pendiente en `ESTADO-PROYECTO.md`). Alternativa descartada: `overrides` en `package.json` forzando `uuid` 11 bajo `gaxios` 6, porque silencia la alerta con una combinación no probada por sus autores y añade mantenimiento sin beneficio real.
9. **Propagación de versiones a la documentación por edición directa de las líneas inventariadas**, no con `/bootstrap-project --update` (regeneraría estándares completos por un cambio de versión). Inventario (grep del 2026-09-16): `README.md:5,10`; `docs/ESTADO-PROYECTO.md:8` + pendientes 6 y 7; `docs/base-standards.md:2`; `docs/frontend-standards.md:2,16,23`; `docs/backend-standards.md:2,18,20,56`; `docs/project-profile.md:32,34,35,36` y fila "Lint / formato" de §5; `openspec/config.yaml:11`; `ai-specs/agents/backend-developer.md:3` y `ai-specs/agents/frontend-developer.md:3` (luego `/sync-agent-symlinks` para re-copiar a `.claude/agents/`).
10. **Matriz de `curl` sin `.env.local` (respuestas esperadas, idénticas a las actuales).** Se ejecuta antes de tocar nada (línea base, `main`) y después de cada bloque:

   | Petición | Esperado |
   |---|---|
   | `POST /api/leads` `{name,email,source}` válidos | `200 {"ok":true,"persisted":false}` |
   | `POST /api/leads` `{"name":"x"}` | `400 {"error":"Nombre y email son obligatorios."}` |
   | `POST /api/leads` cuerpo no JSON | `400 {"error":"JSON inválido."}` |
   | `POST /api/diagnostico/report` con `meta.indiceFriccion` | `200`, `Content-Type: application/pdf`, cuerpo empieza por `%PDF-` |
   | `POST /api/diagnostico/report` `{}` | `400 {"error":"Faltan datos del diagnóstico para generar el informe."}` |
   | `POST /api/admin/session` `{"idToken":"x"}` | `500 {"error":"Auth no configurado en el servidor."}` |
   | `DELETE /api/admin/session` | `200 {"ok":true}` y `Set-Cookie: admin_session=; Max-Age=0` |
   | `POST /api/admin/config` `{"visible":{"hero":true}}` | `500 {"error":"Base de datos no configurada."}` |
   | `POST /api/admin/team` `{"nombre":"x"}` | `500 {"error":"Base de datos no configurada."}` |
   | `DELETE /api/admin/team/abc` | `500 {"error":"Base de datos no configurada."}` |
   | `DELETE /api/admin/leads/abc` | `500 {"error":"Base de datos no configurada."}` |
   | `GET /api/admin/leads/abc/pdf` | `500 {"error":"Base de datos no configurada."}` |
   | `POST /api/admin/upload` multipart con un PNG pequeño | `500 {"error":"Almacenamiento de imágenes no configurado (falta BLOB_READ_WRITE_TOKEN)."}` |
   | `GET /api/admin/test-email` | `200` con `resendKeyPresent: false` y `result.skipped: true` |
   | `GET /admin/leads/abc` (página) | `200` con el texto "Firebase no está configurado." (ejercita `await params` en la página) |

   Nota: en los handlers con `[id]` la comprobación `getDb()` responde antes de leer `params`, así que sin credenciales el `await params` de las rutas API lo garantizan `npx tsc --noEmit` y la validación de tipos de rutas de `next build`; el camino real lo cubre el preview (eliminar lead y exportar PDF desde el panel).
11. **E2E con Playwright MCP obligatorio, sin sustitución.** La HDU exige el recorrido completo; si el servidor MCP no conecta en la sesión de `apply`, la tarea queda abierta y se retoma en una sesión con Playwright (no se reemplaza por `curl`, a diferencia del cambio anterior).
12. **Degradación sin credenciales:** sin cambios de diseño. Firebase ausente → sesión "dev" y `500 "Base de datos no configurada."` en rutas admin; Resend ausente → envío `skipped`; Blob ausente → foto incrustada como data URL (`components/admin/TeamEditor.tsx`). La migración no toca esos caminos.

## Risks / Trade-offs

- [Reglas nuevas de `eslint-config-next@16` (react-hooks 7, jsx-a11y, import) marcan código existente] → decisión 4: desactivar la regla con comentario y registrar pendiente; nunca refactorizar en este cambio.
- [`eslint .` alcanza archivos que `next lint` no lintaba] → `globalIgnores` de la decisión 4 y bloque CommonJS para `*.config.js` si hace falta.
- [Turbopack compila CSS/fuentes distinto a webpack (tokens de Tailwind, `next/font`)] → comparación visual del preview contra producción en 375 px y 1280 px (E2E y dueño); respaldo `--webpack` documentado.
- [`firebase-admin` 14 cambia tipos de `Firestore`/`Auth` o el comportamiento de `verifySessionCookie`] → `npx tsc --noEmit`, `curl` admin y login real en el preview; rollback trivial del commit.
- [Quedan 2 alertas moderadas de `uuid`/`gaxios` bajo `@google-cloud/storage` (decisión 8)] → documentadas en el reporte del paso 2 y como pendiente en `docs/ESTADO-PROYECTO.md`; se revisa cuando `@google-cloud/storage` publique una versión con `gaxios` 7 (`npm view @google-cloud/storage dependencies.gaxios`).
- [`next build` valida las firmas de las rutas y falla por un `params` sin `Promise`] → los 4 archivos están inventariados; el dry-run del codemod confirma que no hay más.
- [Next 16 modifica automáticamente `tsconfig.json` al primer `dev`/`build`] → revisar el diff y conservar solo los cambios documentados: `include` gana `.next/dev/types/**/*.ts` y `jsx` pasa a `react-jsx` (cambio que Next 16 declara obligatorio y reaplica en cada arranque, por lo que revertirlo sería inútil); se restaura el formato compacto original del archivo; cualquier otra edición se revierte y se anota.
- [`next dev` altera `AGENTS.md`/`CLAUDE.md`] → `agentRules: false`; se comprueba con `git status` tras el primer `npm run dev`.
- [Camino `401`/sesión real no verificable en local] → preview de Vercel con login del dueño antes de mezclar; es la misma limitación del cambio anterior.
- [Tiempo de build y caché de Vercel con lockfile nuevo] → Vercel reinstala según `package-lock.json`; si falla no despliega y se investiga en la rama.
- [Cambio de tamaño medio en una sola rama] → dos bloques con verificación intermedia y reporte propio (Next 16 + ESLint 9; firebase-admin 14), de modo que un fallo se atribuya al bloque correcto antes de seguir.

## Migration Plan

1. Rama `feature/migrar-next-16` desde `main` (tarea 0). Línea base: `npm audit --omit=dev` y la matriz de `curl` contra `main`.
2. Bloque A: instalar Next 16 + ESLint 9, adaptar los 6 archivos, `eslint.config.mjs`, `next.config.js`; verificar (lint, tsc, test, build, `curl`) y reportar.
3. Bloque B: `firebase-admin` 14; verificar (tsc, build, `curl` admin, `npm audit --omit=dev` = 0) y reportar.
4. E2E completo con Playwright MCP y reporte; documentación.
5. Sin commits intermedios durante `apply`: se siguen las etapas del flujo (`/opsx:verify` → `/adversarial-review` → `/opsx:archive` → `/commit`). `/commit` crea commits enfocados en este orden: dependencias y código (Next 16 + ESLint 9 + firebase-admin 14), documentación y artefactos del cambio; luego hace push de la rama. Preview automático de Vercel; el dueño valida login real, un lead (detalle y PDF) y el aspecto del sitio. Merge a `main` solo tras esa validación; Vercel despliega.
6. Rollback: `git revert` de los commits de la rama (restaura `package.json`, lockfile y código; no hay migración de datos ni variables nuevas).
