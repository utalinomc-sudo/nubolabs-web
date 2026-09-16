# Reporte — paso 1: bloque A (Next 16 + ESLint 9)

- Fecha: 2026-09-16
- Cambio: migrar-next-16
- Rama: `feature/migrar-next-16`
- Ejecutado por: Claude Code (Fable 5.1), sesión de apply
- Entorno: Windows 11, Node 24.16, npm 11.13, sin `.env.local`

## Versiones tras el bloque A

| Paquete | Antes | Después |
|---|---|---|
| `next` | 14.2.35 | **16.3.5** |
| `eslint` | 8.57.1 | **9.39.5** |
| `eslint-config-next` | 14.2.35 | **16.3.5** |
| `react` / `react-dom` | 18.3.1 | 18.3.1 (sin cambios, non-goal) |
| `postcss` anidado bajo `next` | 8.4.31 (alerta alta) | 8.5.23 |
| `firebase-admin` | 12.7.0 | 12.7.0 (bloque B) |

Instalación en dos órdenes (`npm install next@^16.3.5` y `npm install -D eslint@^9 eslint-config-next@^16.3.5`) sin `ERESOLVE`.

## Cambios aplicados

| Archivo | Cambio |
|---|---|
| `package.json` | rangos de `next`, `eslint`, `eslint-config-next`; script `lint` → `eslint .` |
| `eslint.config.mjs` (nuevo) | flat config con `eslint-config-next/core-web-vitals`, `globalIgnores` (`.next`, `out`, `build`, `next-env.d.ts`, `ai-specs`, `.claude`, `openspec`, `docs`) y una excepción por archivo (ver decisiones) |
| `.eslintrc.json` | eliminado (`git rm`) |
| `lib/adminAuth.ts` | `const store = await cookies(); store.get(COOKIE)` |
| `app/admin/(panel)/leads/[id]/page.tsx` | `params: Promise<{ id: string }>` + `const { id } = await params` |
| `app/api/admin/leads/[id]/route.ts`, `app/api/admin/leads/[id]/pdf/route.ts`, `app/api/admin/team/[id]/route.ts` | misma firma; `await params` inmediatamente después de la comprobación de sesión (antes de `getDb()`), de modo que la matriz sin credenciales también ejercita el acceso asíncrono |
| `app/layout.tsx` | `data-scroll-behavior="smooth"` en `<html>` |
| `next.config.js` | `agentRules: false` con comentario |
| `tsconfig.json` | `jsx: "react-jsx"` e `include` con `.next/dev/types/**/*.ts` (ver decisiones) |

`npx @next/codemod@canary next-async-request-api . --dry --print`: 62 archivos procesados, **0 modificaciones propuestas** → no queda ningún acceso síncrono fuera de los 5 archivos inventariados.

## Decisiones tomadas durante el bloque

1. **Tarea 1.2 — excepción de lint.** `npm run lint` con la configuración nueva reportó un único error: `@next/next/no-html-link-for-pages` en `components/landing/Nav.tsx:19` (`<a href="/#inicio">` del logo). La regla existía en la 14, pero en `eslint-config-next` 16 reconoce rutas del App Router y ahora marca ese enlace. Según `design.md` (decisión 4) no se refactoriza: la regla se desactiva **solo para ese archivo** en `eslint.config.mjs`, con comentario que cita este cambio. Queda como pendiente en `docs/ESTADO-PROYECTO.md` evaluar `<Link>` (tarea 4.3).
2. **Tarea 1.5 — `tsconfig.json`.** El primer `next dev` reconfiguró el archivo: `include` + `.next/dev/types/**/*.ts` (esperado) y `jsx: "preserve"` → `"react-jsx"`, que Next 16 declara **obligatorio** y reaplica en cada arranque, por lo que revertirlo sería inútil. Se conservan esos dos valores y se restauró el formato compacto original (Next había reescrito el JSON en varias líneas). `design.md` (riesgo de `tsconfig.json`) y la tarea 1.5 se actualizaron con este criterio antes de aplicarlo. `npx tsc --noEmit` pasa con `react-jsx`.
3. **`agentRules: false` funciona:** tras `next dev` 16.3.5 y la carga de `/` en el navegador (Playwright), `git status` no muestra cambios en `AGENTS.md` ni `CLAUDE.md`. `next-env.d.ts` (ignorado por git) fue regenerado por Next con las referencias a `.next/dev/types`.
4. **Turbopack:** `next dev` arranca como `Next.js 16.3.5 (Turbopack)` en 7,4 s; `next build` compila con Turbopack sin flags.

## Comandos de verificación

| Comando | Resultado | Tiempo |
|---|---|---|
| `npm run lint` | ✔ sin errores ni avisos (ESLint 9.39.5, flat config) | 12,6 s (antes 44 s con `next lint`) |
| `npx tsc --noEmit` | ✔ sin errores (ejecutado tres veces: tras las ediciones, tras `tsconfig.json` y tras el build) | 8–11 s |
| `npm test` | ✔ Tests 11 passed (11) · Duration 1,12 s | 5,3 s |
| `npm run build` | ✔ `Compiled successfully in 27.5s` (Turbopack) · TypeScript 10,9 s · 10 páginas estáticas · 22 rutas | 50,4 s (antes 105 s con webpack) |

`next build` ya no imprime tamaños por ruta (comportamiento de Next 16, no una regresión).

## Matriz de `curl` (Next 16.3.5, sin credenciales) comparada con el paso 0

| # | Petición | Código | Cuerpo | Set-Cookie | vs paso 0 |
|---|---|---|---|---|---|
| 1 | `POST /api/leads` (lead válido) | **200** | `{"ok":true,"persisted":false}` | — | idéntico |
| 2 | `POST /api/leads` `{"name":"x"}` | **400** | `{"error":"Nombre y email son obligatorios."}` | — | idéntico |
| 3 | `POST /api/leads` cuerpo no JSON | **400** | `{"error":"JSON inválido."}` | — | idéntico |
| 4 | `POST /api/diagnostico/report` con `meta.indiceFriccion` | **200** | PDF 2581 bytes, inicio `%PDF-` | — | idéntico |
| 5 | `POST /api/diagnostico/report` `{}` | **400** | `{"error":"Faltan datos del diagnóstico para generar el informe."}` | — | idéntico |
| 6 | `POST /api/admin/session` `{"idToken":"x"}` | **500** | `{"error":"Auth no configurado en el servidor."}` | — | idéntico |
| 7 | `DELETE /api/admin/session` | **200** | `{"ok":true}` | `admin_session=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=lax` | idéntico |
| 8 | `POST /api/admin/config` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 9 | `POST /api/admin/team` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 10 | `DELETE /api/admin/team/abc` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico (ya con `await params`) |
| 11 | `DELETE /api/admin/leads/abc` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico (ya con `await params`) |
| 12 | `GET /api/admin/leads/abc/pdf` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico (ya con `await params`) |
| 13 | `POST /api/admin/upload` (PNG 1×1) | **500** | `{"error":"Almacenamiento de imágenes no configurado (falta BLOB_READ_WRITE_TOKEN)."}` | — | idéntico |
| 14 | `GET /api/admin/test-email` | **200** | `resendKeyPresent: false`, `result.skipped: true` | — | idéntico |
| 15 | `GET /admin/leads/abc` (página) | **200** | HTML 22243 bytes, contiene «Firebase no está configurado.» | — | idéntico salvo el tamaño del HTML (14754 → 22243 bytes: scripts de desarrollo de Next 16), esperado |

`diff` de las dos tablas con los tamaños normalizados: **sin diferencias**. Log del servidor de desarrollo sin errores ni advertencias.

## Estado de datos
- Antes: sin acceso a Firestore, Resend ni Blob.
- Después: idéntico; nada persistido, ningún correo, ninguna subida.
- Restaurado: no aplica.

## Resultado
**PASS** — bloque A completo; servidor de desarrollo detenido (puerto 3100 libre). Sigue el bloque B (`firebase-admin` 14).
