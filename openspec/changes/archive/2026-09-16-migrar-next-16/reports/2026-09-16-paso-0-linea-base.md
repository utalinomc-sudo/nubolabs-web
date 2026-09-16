# Reporte — paso 0: línea base antes de migrar

- Fecha: 2026-09-16
- Cambio: migrar-next-16
- Rama: `feature/migrar-next-16` (creada desde `main` = `origin/main`, commit `5fd2110`)
- Ejecutado por: Claude Code (Fable 5.1), sesión de apply
- Entorno: Windows 11, Node 24.16, npm 11.13, sin `.env.local` (sin credenciales de Firebase, Resend ni Blob)

## Comandos
- `git fetch origin && git checkout -b feature/migrar-next-16` → rama activa; el árbol solo contiene los artefactos del cambio y `.playwright-mcp/` (carpeta local del navegador de Playwright)
- `npm audit --omit=dev` → 10 vulnerabilidades (salida completa guardada para comparar al final)
- `npm ls next react react-dom firebase-admin eslint eslint-config-next --depth=0` → versiones de partida
- `npx next dev -p 3100` + matriz de `curl` de `design.md` (decisión 10) mediante el script `curl-matrix.sh` (15 peticiones)

## Versiones de partida

| Paquete | Versión instalada |
|---|---|
| `next` | 14.2.35 |
| `react` / `react-dom` | 18.3.1 |
| `firebase-admin` | 12.7.0 |
| `eslint` | 8.57.1 |
| `eslint-config-next` | 14.2.35 |

## Audit de producción (línea base)

`npm audit --omit=dev`: **10 vulnerabilidades (1 crítica, 1 alta, 8 moderadas)** en 10 paquetes: `next` (crítica + moderadas), `postcss` 8.4.31 anidado bajo `next` (alta), y la cadena de `firebase-admin`: `firebase-admin`, `@google-cloud/firestore`, `@google-cloud/storage`, `gaxios`, `google-gax`, `retry-request`, `teeny-request`, `uuid` (moderadas). Coincide con lo previsto en `proposal.md`.

## Matriz de `curl` (Next 14.2.35, sin credenciales)

| # | Petición | Código | Cuerpo | Set-Cookie |
|---|---|---|---|---|
| 1 | `POST /api/leads` (lead válido) | **200** | `{"ok":true,"persisted":false}` | — |
| 2 | `POST /api/leads` `{"name":"x"}` | **400** | `{"error":"Nombre y email son obligatorios."}` | — |
| 3 | `POST /api/leads` cuerpo no JSON | **400** | `{"error":"JSON inválido."}` | — |
| 4 | `POST /api/diagnostico/report` con `meta.indiceFriccion` | **200** | PDF 2581 bytes, inicio `%PDF-` | — |
| 5 | `POST /api/diagnostico/report` `{}` | **400** | `{"error":"Faltan datos del diagnóstico para generar el informe."}` | — |
| 6 | `POST /api/admin/session` `{"idToken":"x"}` | **500** | `{"error":"Auth no configurado en el servidor."}` | — |
| 7 | `DELETE /api/admin/session` | **200** | `{"ok":true}` | `admin_session=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=lax` |
| 8 | `POST /api/admin/config` `{"visible":{"hero":true}}` | **500** | `{"error":"Base de datos no configurada."}` | — |
| 9 | `POST /api/admin/team` `{"nombre":"x"}` | **500** | `{"error":"Base de datos no configurada."}` | — |
| 10 | `DELETE /api/admin/team/abc` | **500** | `{"error":"Base de datos no configurada."}` | — |
| 11 | `DELETE /api/admin/leads/abc` | **500** | `{"error":"Base de datos no configurada."}` | — |
| 12 | `GET /api/admin/leads/abc/pdf` | **500** | `{"error":"Base de datos no configurada."}` | — |
| 13 | `POST /api/admin/upload` (PNG 1×1 multipart) | **500** | `{"error":"Almacenamiento de imágenes no configurado (falta BLOB_READ_WRITE_TOKEN)."}` | — |
| 14 | `GET /api/admin/test-email` | **200** | `{"resendKeyPresent":false,"notifyEmail":"(default) mauricio.nubolabs@gmail.com","notifyFrom":"(default) Nubolabs <onboarding@resend.dev>","result":{"skipped":true,"error":"RESEND_API_KEY no está configurada."}}` | — |
| 15 | `GET /admin/leads/abc` (página) | **200** | HTML 14754 bytes, contiene «Firebase no está configurado.» | — |

Las 15 respuestas coinciden con la matriz esperada de `design.md`. Esta tabla es la referencia contra la que se comparan los pasos 1.6, 2.3 y 3.2.

Nota de herramienta: en la primera pasada la fila 13 devolvió `000` porque el `curl` de Git Bash es un binario nativo de Windows y no lee rutas POSIX dentro de `-F file=@…`; se corrigió el script pasando la ruta con `cygpath -w` y se repitió la matriz completa. No es un problema del sitio.

## Log del servidor
Sin errores ni advertencias: cada ruta compiló en su primera petición y respondió con el código esperado. `[leads] Firebase Admin no configurado. Lead recibido (no persistido)` en la fila 1, como corresponde sin credenciales.

## Estado de datos
- Antes: sin acceso a Firestore, Resend ni Blob (no hay `.env.local`).
- Después: idéntico; ningún dato creado, ningún correo enviado (`skipped`), ninguna subida a Blob.
- Restaurado: no aplica.

## Resultado
**PASS** — línea base registrada; el servidor de desarrollo se detuvo al terminar (puerto 3100 liberado).
