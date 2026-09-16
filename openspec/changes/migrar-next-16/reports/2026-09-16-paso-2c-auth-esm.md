# Reporte — paso 2c: `ERR_REQUIRE_ESM` en `firebase-admin/auth` y carga perezosa protegida

- Fecha: 2026-09-16
- Cambio: migrar-next-16 (diseño, decisión 14; tarea 2.7)
- Rama: `feature/migrar-next-16`
- Ejecutado por: Claude Code (Fable 5.1), sesión de apply

## Síntoma y causa real
El segundo preview de Vercel (commit `fbee74f`) seguía con error de servidor. El log de funciones de Vercel (captura del dueño) muestra en cada `GET /` → 500:

```
Error: Failed to load external module firebase-admin-a14c8a5423a75469/auth: Error [ERR_REQUIRE_ESM]: …
```

Cadena: `lib/firebaseAdmin.ts` importaba `firebase-admin/auth` en la cabecera → `firebase-admin/auth` (CommonJS) → `jwks-rsa` 4.1.0 (CommonJS, `const jose = require('jose')`) → `jose` 6.2.12, que es **solo ESM** (`"type": "module"`, exports sin entrada `require`). Un `require()` de un módulo ESM solo funciona en Node ≥ 20.19 o ≥ 22.12 (`jwks-rsa` lo declara: `engines: ^20.19.0 || ^22.12.0 || >= 23.0.0`). Por tanto el runtime del preview corre con un Node anterior, pese a `engines.node: "24.x"` en `package.json` (Vercel documenta que ese campo fija la versión y que 24.x está disponible).

La hipótesis anterior (clave privada con comillas, paso 2b) era correcta como riesgo real de firebase-admin 14, pero no era la causa de este 500: el módulo de auth no llegaba a cargar.

## Reproducción local (mismo build de producción)

| Runtime | `/` | `/equipo` | `/diagnostico` (estática) | `/admin` | Log |
|---|---|---|---|---|---|
| Node 24.16 (require(esm) activo) | 200 | 200 | 200 | 307/200 | limpio |
| Node 20.20.2 real (`npx --package=node@20`) | 200 | 200 | 200 | 200 | limpio |
| Node 24.16 con `--no-experimental-require-module` (simula Node < 20.19 / 22.12) — **código anterior** | **500** | — | 200 | **500** | `⨯ Error: Failed to load external module firebase-admin-a14c8a5423a75469/auth: Error [ERR_REQUIRE_ESM]: require() of ES Module …\node_modules\jose\dist\webapi\index.js` (idéntico al log de Vercel, mismo hash) |

## Cambio aplicado (diseño, decisión 14)
- `lib/firebaseAdmin.ts`: `firebase-admin/auth` ya no se importa en la cabecera (solo `import type`). `getAdminAuth()` pasa a ser asíncrona y carga el módulo con `import()` dentro de `try/catch`; si falla, memoriza el fallo, registra `[firebase-admin] no se pudo cargar firebase-admin/auth (¿Node anterior a 20.19/22.12 sin require(esm)?); el panel queda sin sesión: …` y devuelve `null`. El sitio público solo usa `firebase-admin/app` y `/firestore` (cadena CommonJS pura), así que deja de depender del módulo problemático.
- `lib/adminAuth.ts` y `app/api/admin/session/route.ts`: `await getAdminAuth()`.
- Documentación: `docs/project-profile.md` §2 (fila Runtime: comprobar Node 24.x en Vercel) y `docs/ESTADO-PROYECTO.md` (pendiente 7 ampliado y nuevo pendiente 10). Lista del preview (`2026-09-16-paso-5-preview.md`) con la comprobación de la versión de Node.

La corrección de plataforma sigue siendo necesaria: **Node.js 24.x en Vercel** (Settings → Build and Deployment → Node.js Version; verificar en el log de build). Sin ella el sitio público funciona, pero el login del panel responde `500 Auth no configurado en el servidor.`.

## Verificación tras el cambio (build de producción nuevo, credenciales falsas con la clave entre comillas)

| Runtime | `/` | `/equipo` | `/admin` (sin cookie) | `POST /api/admin/session` `{"idToken":"x"}` | Log |
|---|---|---|---|---|---|
| Node 24 con `--no-experimental-require-module` (como Vercel hoy) | **200** | **200** | 307 → login | **500** `{"error":"Auth no configurado en el servidor."}` (controlado) | `16 UNAUTHENTICATED` capturado en Firestore + `[firebase-admin] no se pudo cargar firebase-admin/auth …: Failed to load external module firebase-admin-a14c8a5423a75469/auth: Error [ERR_REQUIRE_ESM]…` una sola vez |
| Node 24 normal (como Vercel con 24.x) | 200 | 200 | 307 → login | 401 `{"error":"No se pudo crear la sesión."}` (el módulo de auth cargó; el token falso se rechaza) | `16 UNAUTHENTICATED` capturado |

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ |
| `npx tsc --noEmit` | ✔ |
| `npm test` | ✔ 2 archivos, 20 tests |
| `npm run build` | ✔ Compiled successfully in 6.7s · 27,6 s en total |
| Matriz de `curl` (15 peticiones) contra `npx next dev -p 3100` sin credenciales | idéntica a la línea base del paso 0 (`diff` con tamaños normalizados vacío); log limpio |

Servidores locales detenidos (puertos 3100, 3300, 3301 y 3302 libres).

## Alternativas descartadas
- `overrides` de `jose` a 5.x (tiene CommonJS): `jwks-rsa` 4 declara `jose ^6.1.3`; forzar otra mayor en la librería que verifica las firmas de los tokens es un riesgo que no se puede probar sin credenciales reales.
- Bundlear `firebase-admin` con `transpilePackages`: arrastra gRPC y protobuf al bundle del servidor y no elimina la exigencia de Node ≥ 22 de firebase-admin 14.

## Estado de datos
- Credenciales falsas en todas las pruebas (proyecto inexistente; Google respondió `UNAUTHENTICATED`). Nada persistido, nada que restaurar.

## Resultado
**PASS** en local. Pendiente: push, ajuste de Node 24.x en Vercel por el dueño y comprobación del preview (tarea 5.2).
