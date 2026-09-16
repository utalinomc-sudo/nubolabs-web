# Reporte — paso 2: verificación obligatoria

- Fecha: 2026-09-16
- Cambio: actualizar-dependencias-seguras
- Rama: `feature/actualizar-dependencias-seguras`
- Ejecutado por: Claude Code (Fable 5.1), sesión de apply
- Entorno: Windows 11, Node 24.16, npm 11

## Audit de producción: antes y después

| Momento | Total | Crítica | Alta | Moderada | Paquetes |
|---|---|---|---|---|---|
| Antes | 21 | 1 | 3 | 17 | `@firebase/*` (8), `@google-cloud/firestore`, `@google-cloud/storage`, `fast-xml-parser`, `firebase`, `firebase-admin`, `gaxios`, `google-gax`, `next`, `postcss`, `retry-request`, `teeny-request`, `undici`, `uuid` |
| Tras `npm audit fix` + `@vercel/blob` 2.8 | 20 | 1 | 2 | 17 | se cierra `fast-xml-parser`; `undici` persiste (copia 6.19.7 anidada bajo `@firebase/auth` 10) |
| Tras `firebase` 11.10 | **10** | 1 | 1 | 8 | `next`, `postcss`, `firebase-admin`, `@google-cloud/firestore`, `@google-cloud/storage`, `gaxios`, `google-gax`, `retry-request`, `teeny-request`, `uuid` |

Segunda pasada de `npm audit fix`: "up to date" (nada más arreglable sin salto mayor; `gaxios` 6.7.1 queda anidado en la cadena de `firebase-admin`).

**Alertas restantes y causa:** las de `next` (crítica + moderadas) y `postcss` (alta, anidado en `next`) solo se cierran con `next@16.3.5`; las de `firebase-admin` y su cadena `@google-cloud/*`, `gaxios`, `google-gax`, `retry-request`, `teeny-request`, `uuid` solo con `firebase-admin@14.4.0`. Ambas son migraciones mayores: HDU `docs/backlog/migrar-next-16.md`.

## Versiones cambiadas (dependencias directas)

| Paquete | Antes | Después | Motivo |
|---|---|---|---|
| `firebase` | 10.14.1 | 11.10.0 | Cierra las 8 alertas `@firebase/*` y la copia vieja de `undici` (decisión condicional de la tarea 1.4, ejecutada) |
| `@vercel/blob` | 2.6.1 | 2.8.0 | Última menor; API `put` sin cambios |
| `next`, `react`, `react-dom`, `firebase-admin`, `pdf-lib` | sin cambios | sin cambios | Fuera de alcance (non-goals) |

Transitivas actualizadas por `npm audit fix`: `undici` 6.28.1 (raíz), `fast-xml-parser` 5.11.1, `@google-cloud/storage` 7.22.0, `strnum`, `browserslist`, `caniuse-lite`, `brace-expansion`, `js-yaml`, entre otras (16 paquetes cambiados, 1 agregado). `firebase` 11 agregó 74 paquetes y cambió 36.

## Comandos de verificación

| Comando | Resultado | Tiempo |
|---|---|---|
| `npm run lint` | ✔ No ESLint warnings or errors | 44 s |
| `npx tsc --noEmit` | sin errores (tipos de `firebase` 11 y `@vercel/blob` 2.8 compatibles) | 6 s |
| `npm test` | Tests 11 passed (11) · Duration 1,15 s | 15 s |
| `npm run build` | ✓ Compiled successfully | 105 s |

## Prueba manual de endpoints (`curl` contra `npx next dev -p 3100`, sin `.env.local`)

| Petición | Resultado |
|---|---|
| `POST /api/leads` con `{ name, email, source }` válidos | `{"ok":true,"persisted":false}` (sin Firebase Admin: no persiste, como antes) |
| `POST /api/leads` con `{"name":"x"}` | `400 {"error":"Nombre y email son obligatorios."}` |
| `POST /api/diagnostico/report` con `meta.indiceFriccion` | `200`, `Content-Type: application/pdf`, 2.799 bytes, cabecera `%PDF-` |

Sin errores en el log del servidor de desarrollo. Servidor detenido al terminar (`taskkill` del PID en el puerto 3100; comprobado que ya no responde).

## Smoke de páginas

`/` 200 · `/diagnostico` 200 · `/equipo` 200 · `/mision-vision` 200 · `/admin/login` 200 · `/admin` 200 (sesión dev sin credenciales).

## Prueba E2E

Playwright MCP no conectó en esta sesión. Sustituida por los `curl` y el smoke anteriores más la revisión del **preview de Vercel por el dueño antes de mezclar**, incluido el login en `/admin/login`, porque `firebase` (SDK cliente usado por el login) subió de versión mayor.

## Estado de datos

- Antes: sin acceso a Firestore (no hay `.env.local`); el lead de prueba no se persistió.
- Después: idéntico. Ningún dato creado ni servicio externo llamado (`RESEND_API_KEY` ausente → envío `skipped`).
- Restaurado: no aplica.

## Resultado

**PASS** — pendiente únicamente la revisión visual y de login en el preview por el dueño antes del merge.
