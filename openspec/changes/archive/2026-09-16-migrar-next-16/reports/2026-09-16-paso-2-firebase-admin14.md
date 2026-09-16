# Reporte — paso 2: bloque B (firebase-admin 14)

- Fecha: 2026-09-16
- Cambio: migrar-next-16
- Rama: `feature/migrar-next-16`
- Ejecutado por: Claude Code (Fable 5.1), sesión de apply
- Entorno: Windows 11, Node 24.16, npm 11.13, sin `.env.local`

## Comandos
- `npm install firebase-admin@^14.4.0` → 61 paquetes añadidos, 28 eliminados, 31 cambiados; sin `ERESOLVE`
- `npm ls firebase-admin @google-cloud/firestore @google-cloud/storage` → 14.4.0 / 9.1.0 / 8.1.0
- `npx tsc --noEmit` → sin errores (8,7 s); `lib/firebaseAdmin.ts` no necesitó cambios (API modular `cert`, `getApps`, `initializeApp`, `getFirestore`, `getAuth` intacta)
- `npm run build` → ✔ `Compiled successfully in 8.1s` (Turbopack con caché de sistema de archivos) · TypeScript 5,9 s · 22 rutas · 25,3 s en total
- `npm audit --omit=dev` → 2 moderadas (ver abajo); `npm audit fix --dry-run` → "up to date", ningún cambio propuesto
- `npx next dev -p 3100` + matriz de `curl` de los 9 endpoints admin (filas 6–14 de `design.md`, decisión 10)

## Versiones tras el bloque B

| Paquete | Antes | Después |
|---|---|---|
| `firebase-admin` | 12.7.0 | **14.4.0** |
| `@google-cloud/firestore` (opcional) | 7.11.x | **9.1.0** |
| `@google-cloud/storage` (opcional) | 7.22.0 | **8.1.0** |
| `google-auth-library` (raíz) | 9.x | 10.9.1 |

## Audit de producción: antes y después de la migración completa

| Momento | Total | Crítica | Alta | Moderada | Paquetes |
|---|---|---|---|---|---|
| Paso 0 (Next 14.2.35 + firebase-admin 12.7.0) | 10 | 1 | 1 | 8 | `next`, `postcss`, `firebase-admin`, `@google-cloud/firestore`, `@google-cloud/storage`, `gaxios`, `google-gax`, `retry-request`, `teeny-request`, `uuid` |
| Tras bloque A (Next 16.3.5) | 8 | 0 | 0 | 8 | cadena de `firebase-admin` 12 |
| **Tras bloque B (firebase-admin 14.4.0)** | **2** | **0** | **0** | **2** | `uuid` < 11.1.1 (`node_modules/uuid`, 9.0.1) y `gaxios` 6.7.1 que depende de él |

### Residuo: 2 alertas moderadas sin parche publicado

- Cadena: `firebase-admin@14.4.0` → (dependencia **opcional**) `@google-cloud/storage@8.1.0` → `gaxios@^6.0.2` (6.7.1) → `uuid@^9.0.1` (9.0.1). Advisory GHSA-w5hq-g745-h8pq ("Missing buffer bounds check in v3/v5/v6 when buf is provided"), corregido en `uuid` 11.1.1.
- `@google-cloud/storage@8.1.0` es la **última versión publicada** (`dist-tags.latest = 8.1.0`, sin 8.2 ni 9.x) y sigue fijando `gaxios` 6; el resto de la cadena (`firestore`, `google-gax`, `google-auth-library` 10/11) ya usa `gaxios` 7.3.1, que no tiene la alerta.
- `npm audit fix --dry-run` no propone cambios: el mensaje "fix available via npm audit fix" de npm es inexacto porque no existe un `uuid` 9.x/10.x corregido.
- Impacto en este proyecto: **nulo en tiempo de ejecución**. `@google-cloud/storage` solo se carga al llamar a `getStorage()` de `firebase-admin/storage`, y el repo no lo usa (`grep -rn "firebase-admin/storage\|getStorage" app lib components` → vacío); las fotos del equipo van a Vercel Blob o se incrustan como data URL.
- Decisión (recogida en `proposal.md` y `design.md`, decisión 8): se acepta como residuo documentado; se descarta forzar `uuid` 11 con `overrides` porque ocultaría la alerta con una combinación no probada por los autores de `gaxios` 6. Pendiente en `docs/ESTADO-PROYECTO.md`: revisar cuando `@google-cloud/storage` publique una versión con `gaxios` 7 (`npm view @google-cloud/storage dependencies.gaxios`).

Salida íntegra de `npm audit --omit=dev` tras el bloque B:

```
# npm audit report

uuid  <11.1.1
Severity: moderate
uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided - https://github.com/advisories/GHSA-w5hq-g745-h8pq
fix available via `npm audit fix`
node_modules/uuid
  gaxios  6.4.0 - 6.7.1
  Depends on vulnerable versions of uuid
  node_modules/gaxios

2 moderate severity vulnerabilities
```

## Matriz de `curl` de endpoints admin (firebase-admin 14, sin credenciales) comparada con el paso 0

| # | Petición | Código | Cuerpo | Set-Cookie | vs paso 0 |
|---|---|---|---|---|---|
| 6 | `POST /api/admin/session` `{"idToken":"x"}` | **500** | `{"error":"Auth no configurado en el servidor."}` | — | idéntico |
| 7 | `DELETE /api/admin/session` | **200** | `{"ok":true}` | `admin_session=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=lax` | idéntico |
| 8 | `POST /api/admin/config` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 9 | `POST /api/admin/team` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 10 | `DELETE /api/admin/team/abc` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 11 | `DELETE /api/admin/leads/abc` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 12 | `GET /api/admin/leads/abc/pdf` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 13 | `POST /api/admin/upload` (PNG 1×1) | **500** | `{"error":"Almacenamiento de imágenes no configurado (falta BLOB_READ_WRITE_TOKEN)."}` | — | idéntico |
| 14 | `GET /api/admin/test-email` | **200** | `resendKeyPresent: false`, `result.skipped: true` | — | idéntico |

`diff` de las filas 6–14 contra el paso 0: **sin diferencias**. Log del servidor sin errores ni advertencias. Sin credenciales, `getAdminAuth()`/`getDb()` devuelven `null` antes de llamar al SDK: el camino real de `verifySessionCookie`/`createSessionCookie` con firebase-admin 14 se valida en el preview de Vercel (tarea 5.2).

## Estado de datos
- Antes: sin acceso a Firestore, Resend ni Blob.
- Después: idéntico; nada persistido.
- Restaurado: no aplica.

## Resultado
**PASS** — bloque B completo con el residuo de `uuid`/`gaxios` documentado; servidor detenido (puerto 3100 libre).
