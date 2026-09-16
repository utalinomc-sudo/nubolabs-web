# Reporte — paso 3: verificación obligatoria (N) y prueba de endpoints con curl (N+1)

- Fecha: 2026-09-16
- Cambio: migrar-next-16
- Rama: `feature/migrar-next-16`
- Ejecutado por: Claude Code (Fable 5.1), sesión de apply
- Entorno: Windows 11, Node 24.16, npm 11.13, sin `.env.local`
- Estado del código al ejecutar: bloques A y B completos (Next 16.3.5, ESLint 9.39.5, eslint-config-next 16.3.5, firebase-admin 14.4.0, React 18.3.1)

## Paso N — comandos de verificación (el agente los ejecutó)

| Comando | Resultado | Tiempo | Referencia (cambio anterior, Next 14 + webpack) |
|---|---|---|---|
| `npm run lint` | ✔ sin errores ni avisos (ESLint 9, `eslint.config.mjs`, excepción documentada para `Nav.tsx`) | 11,4 s | 44 s (`next lint`) |
| `npx tsc --noEmit` | ✔ sin errores (`jsx: react-jsx`, tipos de rutas de `.next/types` y `.next/dev/types`) | 5,4 s | 6 s |
| `npm test` | ✔ Test Files 1 passed · Tests 11 passed (11) · 423 ms | 2,0 s | 11 tests |
| `npm run build` | ✔ build de producción con Turbopack, 22 rutas (10 estáticas), sin advertencias | 16,5 s (con caché; 50 s la primera vez) | 105 s |

Tras el build, `git diff --stat` solo muestra en `tsconfig.json` los 2 cambios aceptados en la tarea 1.5 (`jsx` e `include`); `AGENTS.md` y `CLAUDE.md` sin cambios.

## Paso N+1 — prueba manual de endpoints con `curl`

Servidor: `npx next dev -p 3100` (Next 16.3.5, Turbopack). Script `curl-matrix.sh` con las 15 peticiones de `design.md` (decisión 10): los 11 endpoints de `docs/api-spec.yml` (14 casos, incluidos errores de validación) más la página `/admin/leads/abc`.

| # | Petición | Código | Cuerpo | Set-Cookie | vs paso 0 |
|---|---|---|---|---|---|
| 1 | `POST /api/leads` (lead válido) | **200** | `{"ok":true,"persisted":false}` | — | idéntico |
| 2 | `POST /api/leads` `{"name":"x"}` | **400** | `{"error":"Nombre y email son obligatorios."}` | — | idéntico |
| 3 | `POST /api/leads` cuerpo no JSON | **400** | `{"error":"JSON inválido."}` | — | idéntico |
| 4 | `POST /api/diagnostico/report` con `meta.indiceFriccion` | **200** | PDF 2581 bytes, inicio `%PDF-` | — | idéntico |
| 5 | `POST /api/diagnostico/report` `{}` | **400** | `{"error":"Faltan datos del diagnóstico para generar el informe."}` | — | idéntico |
| 6 | `POST /api/admin/session` `{"idToken":"x"}` | **500** | `{"error":"Auth no configurado en el servidor."}` | — | idéntico |
| 7 | `DELETE /api/admin/session` | **200** | `{"ok":true}` | `admin_session=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=lax` | idéntico |
| 8 | `POST /api/admin/config` `{"visible":{"hero":true}}` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 9 | `POST /api/admin/team` `{"nombre":"x"}` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 10 | `DELETE /api/admin/team/abc` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 11 | `DELETE /api/admin/leads/abc` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 12 | `GET /api/admin/leads/abc/pdf` | **500** | `{"error":"Base de datos no configurada."}` | — | idéntico |
| 13 | `POST /api/admin/upload` (PNG 1×1 multipart) | **500** | `{"error":"Almacenamiento de imágenes no configurado (falta BLOB_READ_WRITE_TOKEN)."}` | — | idéntico |
| 14 | `GET /api/admin/test-email` | **200** | `resendKeyPresent: false`, `result.skipped: true` (`RESEND_API_KEY no está configurada.`) | — | idéntico |
| 15 | `GET /admin/leads/abc` (página) | **200** | HTML 22243 bytes, contiene «Firebase no está configurado.» | — | idéntico salvo tamaño del HTML (scripts de desarrollo de Next 16) |

`diff` contra la tabla del paso 0 con los tamaños normalizados: **sin diferencias**. Log del servidor sin errores ni advertencias. Los contratos de `docs/api-spec.yml` no cambian.

Cobertura del cambio de `params`: las filas 10–12 y 15 pasan por `const { id } = await params` (en los handlers se lee antes de `getDb()`); el camino con base de datos real (eliminar un lead, exportar su PDF) se valida en el preview de Vercel (tarea 5.2), igual que `verifySessionCookie` con firebase-admin 14.

Nota de secuencia: el mismo servidor de desarrollo se mantuvo en marcha para la prueba E2E del paso N+2 (reporte `2026-09-16-paso-3-e2e.md`); la detención y la comprobación de que el puerto 3100 ya no responde se registran al final de ese reporte.

## Estado de datos
- Antes: sin acceso a Firestore, Resend ni Blob (no hay `.env.local`).
- Después: idéntico; ningún dato creado, ningún correo enviado (`skipped`), ninguna subida a Blob.
- Restaurado: no aplica (nada que restaurar).

## Resultado
**PASS** — los cuatro comandos obligatorios en verde y los 11 endpoints responden igual que antes de la migración.
