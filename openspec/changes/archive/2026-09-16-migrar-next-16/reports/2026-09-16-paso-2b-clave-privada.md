# Reporte — paso 2b: error de servidor en el preview y normalización de `FIREBASE_PRIVATE_KEY`

- Fecha: 2026-09-16
- Cambio: migrar-next-16 (diseño, decisión 13; tareas 2.4–2.6)
- Rama: `feature/migrar-next-16`
- Ejecutado por: Claude Code (Fable 5.1), sesión de apply

## Síntoma
El primer preview de Vercel de la rama (commit `2fafb57`, build "Ready" en 55 s) mostraba al dueño "This page couldn't load — A server error occurred" en la portada. Desde fuera no se podía inspeccionar: la protección de previews de Vercel responde `302` hacia `vercel.com/sso-api` a cualquier petición sin sesión de Vercel.

## Diagnóstico
1. `next start` local del mismo build **sin credenciales**: `/`, `/diagnostico`, `/admin/login`, `/equipo`, `/admin`, `/admin/leads/abc` → 200; `POST /api/leads` inválido → 400. El paquete no es el problema.
2. `next start` local **con credenciales falsas bien formadas** (clave RSA generada al vuelo, `\n` literales como en `.env`): `/` → 200 (Firestore alcanza a Google y devuelve `16 UNAUTHENTICATED`, capturado por `getSiteConfig`), `/admin` → 307 al login. firebase-admin 14 inicializa y `@google-cloud/firestore` 9 funciona en el bundle de producción de Next 16. Las trazas `.nft.json` de todas las rutas incluyen `firebase-admin`, `@google-cloud/firestore`, `google-gax`, `@grpc/grpc-js` y `protobufjs`.
3. Lectura de `lib/site.ts`: las lecturas de Firestore están en `try/catch`, pero `getDb()` crea la app (`cert()` + `initializeApp()`) fuera de él: un error al analizar la clave tumba la página.
4. Prueba de formatos de clave con `cert()` de ambas versiones (script `cert-test.cjs`, clave RSA 2048 generada con `node:crypto`):

| Formato de `FIREBASE_PRIVATE_KEY` (tras el `replace` de `\n` que hacía el código) | firebase-admin 12.7.0 (node-forge) | firebase-admin 14.4.0 (`crypto` nativo) |
|---|---|---|
| PEM PKCS8 correcto | OK | OK |
| `\n` literales normalizados | OK | OK |
| **Entre comillas dobles** (como pide `.env.local.example`) | OK | **ERROR** "Failed to parse private key." |
| CRLF | OK | OK |
| Sin salto final | OK | OK |
| **Una sola línea con espacios** | OK | **ERROR** |
| PKCS1 (`RSA PRIVATE KEY`) | OK | OK |
| `\n` literales sin normalizar | ERROR | ERROR |
| **Espacios al inicio y al final** | OK | **ERROR** |

Conclusión: firebase-admin 13.10+ cambió el analizador de claves y rechaza tres formas que la 12 toleraba. Como `.env.local.example` indica pegar la clave entre comillas, el valor guardado en Vercel muy probablemente las incluye (con la 12 funcionaba en producción).

## Reproducción con `next start` (misma clave falsa, envuelta en comillas)

| Servidor | Código | `/` | `/equipo` | `/diagnostico` (estática) | `/admin` | Log |
|---|---|---|---|---|---|---|
| Worktree del commit `2fafb57` (código anterior), puerto 3301 | anterior | **500** | **500** | 200 | — | `⨯ Error: Failed to parse private key.` `[cause]: error:1E08010C:DECODER routines::unsupported` (uno por petición) |
| Rama con `lib/privateKey.ts`, puerto 3300 | nuevo | **200** | **200** | 200 | 307 → login | `16 UNAUTHENTICATED` capturado (la clave se aceptó y la petición llegó a Google) |
| Rama con clave basura (`esto-no-es-una-clave`), puerto 3302 | nuevo | **200** | **200** | 200 | 307 → login | `[firebase-admin] no se pudo inicializar el SDK; el sitio sigue sin Firestore ni sesión admin: Failed to parse private key.` (una sola vez) |

La página 500 del código anterior es la de error de Next 16 (`<html id="__next_error__">`), la misma que vio el dueño.

## Cambio aplicado (TDD)
- `lib/privateKey.test.ts` (9 casos, escrito antes que el módulo; `npm test` falló con "Cannot find module './privateKey'" y pasó después): vacío → `undefined`; PEM canónico conservado; `\n` literales; comillas dobles y simples; CRLF; una sola línea con espacios; espacios sobrantes; PKCS1 respetado; texto no PEM devuelto recortado. Cada variante válida pasa por `crypto.createPrivateKey`, lo mismo que hace `cert()`.
- `lib/privateKey.ts`: `normalizePrivateKey` (función pura, sin `server-only`) quita comillas envolventes, convierte `\n` literales y CRLF y reconstruye el PEM en forma canónica (cabecera, líneas de 64, pie).
- `lib/firebaseAdmin.ts`: usa `normalizePrivateKey`; `getAdminApp()` captura errores de `cert()`/`initializeApp()`, registra `[firebase-admin] no se pudo inicializar…` (sin la clave) y devuelve `null` memorizado, de modo que el sitio degrada como sin credenciales.
- `.env.local.example`: nota de que en Vercel la clave va sin comillas.

## Verificación tras el cambio
| Comando | Resultado |
|---|---|
| `npm test` | ✔ Test Files 2 passed · Tests 20 passed (11 + 9) |
| `npm run lint` | ✔ sin errores |
| `npx tsc --noEmit` | ✔ sin errores |
| `npm run build` | ✔ Compiled successfully in 8.1s · TypeScript 7.1 s · 31 s en total |
| `next start` con clave entre comillas / clave basura | ✔ 200 en páginas dinámicas (tabla anterior) |

Servidores locales detenidos (puertos 3300, 3301 y 3302 libres); worktree `.worktrees/before` eliminado tras la prueba.

## Estado de datos
- Sin acceso a Firestore real en ningún momento: las credenciales usadas son falsas (proyecto inexistente) y Google respondió `UNAUTHENTICATED`. Nada persistido, nada que restaurar.

## Resultado
**PASS** en local. Pendiente: nuevo push y comprobación del preview de Vercel por el dueño (tarea 5.2). Si el preview volviera a fallar, el log de funciones de Vercel mostrará ahora la causa con el prefijo `[firebase-admin]` en vez de una página en blanco.
