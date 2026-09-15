---
description: Estándares de integraciones externas del sitio de Nubolabs — Firebase (Firestore/Auth), Resend, Vercel Blob y futuros webhooks o automatizaciones (n8n/Make); credenciales por variable, degradación controlada, efectos no bloqueantes, idempotencia y verificación.
alwaysApply: true
---

# Estándares de integraciones — Nubolabs

## 1. Inventario

| Servicio | Para qué | Cómo se llama | Credencial (variable) | Dónde vive el código |
|---|---|---|---|---|
| Firebase Admin — Firestore | Persistir `leads`, `team`, `config/site` | SDK `firebase-admin` (inicialización perezosa) | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | `lib/firebaseAdmin.ts` (`getDb`) |
| Firebase Admin — Auth | Crear y verificar la cookie de sesión del admin | SDK `firebase-admin/auth` | las mismas | `lib/firebaseAdmin.ts` (`getAdminAuth`), `lib/adminAuth.ts`, `app/api/admin/session/route.ts` |
| Firebase cliente — Auth | Login email/password en el navegador | SDK `firebase/auth` | `NEXT_PUBLIC_FIREBASE_*` (públicas) | `lib/firebase.ts`, `app/admin/login/page.tsx` |
| Resend | Aviso de lead nuevo al equipo; informe PDF al cliente | REST `POST https://api.resend.com/emails` con `fetch` (sin SDK) | `RESEND_API_KEY`; opcionales `NOTIFY_EMAIL`, `NOTIFY_FROM`, `REPORT_FROM` | `lib/email.ts` |
| Vercel Blob | Fotos de integrantes del equipo | SDK `@vercel/blob` (`put`) | `BLOB_READ_WRITE_TOKEN` | `app/api/admin/upload/route.ts`; fallback cliente en `components/admin/TeamEditor.tsx` |
| Agenda externa | CTA "Agendar mi sesión" en el informe y correo | Solo URL | `SCHEDULE_URL` | `lib/report.ts`, `lib/email.ts` |

Hoy **no hay webhooks entrantes ni automatizaciones (n8n/Make) conectadas**; la sección §3 fija el patrón para cuando se agreguen (están en el roadmap: aviso por WhatsApp, anti-spam).

## 2. Reglas generales

- **Credenciales solo por variables de entorno.** Nunca en código, docs, chat ni commits. Se documentan por nombre en `.env.local.example` (con comentario de dónde se obtienen) y en el perfil §4. Los valores van en Vercel → Settings → Environment Variables.
- **Degradación controlada:** si una integración no está configurada, el sistema **no rompe**: registra un aviso y sigue. Patrones de referencia del repo:
  - `lib/firebaseAdmin.ts`: `isAdminConfigured` y `getDb()` devuelve `null` → `/api/leads` responde `{ ok: true, persisted: false }` y registra el lead en consola.
  - `lib/email.ts`: sin `RESEND_API_KEY` devuelve `{ skipped: true }` en vez de lanzar.
  - `components/admin/TeamEditor.tsx`: sin `BLOB_READ_WRITE_TOKEN` la foto se reduce en el navegador y se incrusta como data URL.
- **No bloquear el camino crítico:** correos, informes y cualquier notificación se ejecutan **después** de persistir, en `Promise.all`, y sus errores se registran sin propagarse al usuario (`maybeSendClientReport` en `app/api/leads/route.ts`).
- **Resultados, no excepciones:** cada cliente de integración devuelve un objeto de resultado (`EmailResult`: `ok`, `status`, `body` recortado, `skipped`, `error`) para poder diagnosticar sin exponer la clave.
- **Idempotencia:** toda operación que pueda reintentarse (webhooks entrantes, reenvíos de correo, escrituras) debe tolerar duplicados (clave externa, `set merge`, deduplicación por id).
- **Timeouts y reintentos:** definir `AbortSignal.timeout(ms)` en llamadas salientes nuevas; reintentar solo operaciones idempotentes, con backoff, máximo 2–3 intentos.
- **Logs sin secretos:** prefijo de área (`[email]`, `[report]`), estado HTTP, ids y los primeros ~500 caracteres de la respuesta. Nunca tokens, claves ni PII completa.
- **Contratos documentados:** cada integración nueva se agrega a la tabla §1; si expone un endpoint propio (webhook receptor), también a `docs/api-spec.yml`.
- **Verificación de origen** en webhooks entrantes (token compartido en header o firma HMAC) antes de procesar nada.
- **Diagnóstico protegido:** cada integración con credencial debería tener un endpoint o script de comprobación bajo `/api/admin/**` que devuelva el resultado sin exponer la clave (referencia: `app/api/admin/test-email/route.ts`).

## 3. Patrones por tipo

### Llamadas salientes a APIs REST
Referencia: `sendViaResend` en `lib/email.ts`.
1. Leer la credencial de `process.env`; si falta → `return { skipped: true, error: "<VARIABLE> no está configurada." }`.
2. `fetch` con `Authorization: Bearer …`, `Content-Type: application/json`, body serializado y (en código nuevo) `signal: AbortSignal.timeout(10_000)`.
3. Capturar `res.text()` siempre; si `!res.ok` → `console.error("[area] …", res.status, texto)`.
4. Devolver `{ ok: res.ok, status, body: texto.slice(0, 500), … }`. Envolver todo en `try/catch` → `{ ok: false, error }`.

### Webhooks entrantes (n8n, Make, WhatsApp, formularios externos)
Sin ejemplo en el repo todavía; al agregar uno:
1. Ruta `app/api/webhooks/<origen>/route.ts` con `runtime = "nodejs"` y `dynamic = "force-dynamic"`.
2. Verificar `req.headers.get("x-webhook-token")` contra `WEBHOOK_<ORIGEN>_TOKEN` (o firma HMAC del cuerpo) → `401` si no coincide.
3. Parsear y validar el cuerpo como cualquier endpoint (`backend-standards.md` §4).
4. Idempotencia: usar el id externo como id de documento (`set merge`) o rechazar duplicados.
5. Responder `200 { ok: true }` rápido; el trabajo pesado va después de persistir y no bloquea.
6. Documentar en `docs/api-spec.yml` y en la tabla §1.

### Correo / notificaciones
Referencia: `sendLeadNotification` y `sendClientReport` en `lib/email.ts`.
- HTML inline con la paleta de marca (`#0B1D3A`, `#1565FF`, `#00C2FF`), `escapeHtml` para todo texto del usuario, `replyTo` al correo del proyecto, adjuntos en base64.
- `from` configurable: `NOTIFY_FROM` = `Nubolabs <avisos@nubolabs.cl>`, `REPORT_FROM` = `Nubolabs <informe@nubolabs.cl>`. El dominio `nubolabs.cl` está verificado en Resend (cuenta `utalinomc@gmail.com`) desde el 2026-09-15. Un remitente fuera de un dominio verificado (por ejemplo `onboarding@resend.dev`) hace que Resend **solo entregue al dueño de la cuenta**.
- Llamar siempre desde el servidor, después de persistir, sin bloquear.

### Almacenamiento de archivos
Referencia: `app/api/admin/upload/route.ts`.
- `multipart/form-data` → validar tipo/tamaño (≤ 5 MB) → `put(key, file, { access: "public", addRandomSuffix: true, contentType })` → responder `{ ok: true, url }`.
- Claves con prefijo de carpeta (`team/…`). Los hosts permitidos para `next/image` están en `next.config.js` (`**.public.blob.vercel-storage.com`).
- Fallback sin token: reducir en cliente e incrustar como data URL (ya implementado para fotos del equipo).

### Firebase (SDKs)
- Inicialización perezosa y única (`getApps().length ? getApps()[0] : initializeApp(...)`), separada cliente/servidor (`lib/firebase.ts` vs `lib/firebaseAdmin.ts` con `server-only`).
- `FIREBASE_PRIVATE_KEY` llega con `\n` escapados: normalizar con `.replace(/\\n/g, "\n")`.

## 4. Cómo agregar una integración nueva

1. Registrarla en el perfil §4 y en la tabla §1 (nombre de la variable, no el valor).
2. Agregar la variable a `.env.local.example` con un comentario de dónde se obtiene, y cargarla en Vercel.
3. Implementar detrás de una función en `lib/<servicio>.ts` con `import "server-only"`, siguiendo §2 y §3.
4. Si expone endpoint (webhook), documentarlo en `docs/api-spec.yml`.
5. Prueba manual documentada (el agente la ejecuta) y, si tiene credencial, endpoint de diagnóstico protegido.
6. Actualizar `docs/ESTADO-PROYECTO.md` (variables en Vercel y estado de la integración).

## 5. Verificación

```
npm run lint
npx tsc --noEmit
npm run build
```

Más la prueba manual de la integración (con la variable presente y ausente, para comprobar la degradación) documentada en `openspec/changes/<cambio>/reports/`. Nunca probar contra servicios de pago o correos de clientes reales sin autorización explícita.
