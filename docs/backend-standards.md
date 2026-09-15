---
description: Estándares de backend del sitio de Nubolabs — Next.js 14 Route Handlers, Firebase Admin (Firestore + sesión admin), Resend, generación de PDF con pdf-lib, forma de errores, validación, logging y verificación.
alwaysApply: true
---

# Estándares de backend — Nubolabs

## 1. Resumen

El backend son los **Route Handlers de Next.js** en `app/api/**/route.ts` (runtime Node.js, desplegados como funciones en Vercel) más librerías de servidor en `lib/` marcadas con `import "server-only"`. No hay servidor aparte, ORM ni migraciones: la persistencia es Firestore a través del Admin SDK.

Endpoints públicos: recepción de leads y generación del informe PDF. Endpoints protegidos (`/api/admin/**`): sesión, CMS, equipo, leads, subida de fotos y diagnóstico de correo. Contrato completo en `docs/api-spec.yml`.

## 2. Stack

| Elemento | Tecnología / versión |
|---|---|
| Runtime | Node.js (`export const runtime = "nodejs"` en cada handler) · Next.js 14.2 |
| Capa HTTP | Route Handlers del App Router (`NextResponse`) |
| Persistencia | Firestore vía `firebase-admin` 12 (`lib/firebaseAdmin.ts`) |
| Auth | Firebase Auth: ID token del cliente → cookie de sesión `admin_session` (5 días) verificada con `verifySessionCookie` (`lib/adminAuth.ts`) |
| Correo | Resend por API REST con `fetch` (`lib/email.ts`), sin SDK |
| Archivos | Vercel Blob (`@vercel/blob`, `app/api/admin/upload/route.ts`) |
| PDF | `pdf-lib` (`lib/report.ts` informe al cliente, `lib/leadReport.ts` ficha interna) |
| Tests | Vitest 4 (`npm test`) para la lógica de `lib/` y helpers puros (tests `*.test.ts` junto al archivo, entorno `node`); los endpoints se verifican además con `curl` |

## 3. Estructura

```
app/api/
  leads/route.ts                      POST  público   guarda lead + avisa por correo + envía informe
  diagnostico/report/route.ts         POST  público   devuelve el informe PDF para descarga
  admin/session/route.ts              POST/DELETE     crea / borra la cookie de sesión
  admin/config/route.ts               POST  protegido guarda (merge) config/site
  admin/team/route.ts                 POST  protegido crea o actualiza integrante
  admin/team/[id]/route.ts            DELETE protegido elimina integrante
  admin/leads/[id]/route.ts           DELETE protegido elimina lead
  admin/leads/[id]/pdf/route.ts       GET   protegido ficha del lead en PDF
  admin/upload/route.ts               POST  protegido sube imagen a Vercel Blob (multipart)
  admin/test-email/route.ts           GET   protegido dispara correo de prueba y devuelve la respuesta de Resend
lib/
  firebaseAdmin.ts   getDb(), getAdminAuth(), isAdminConfigured  (inicialización perezosa, nunca rompe sin env)
  adminAuth.ts       getAdminSession() → { email } | null
  email.ts           sendLeadNotification(), sendClientReport()  (no-op si falta RESEND_API_KEY)
  report.ts          reportDataFromLead(), buildReportPdf()
  leadReport.ts      buildLeadDetailPdf()
  site.ts            getSiteConfig(), getTeamMembers(), SECTIONS, defaultSiteConfig()
types/lead.ts        LeadInput, Lead
```

Regla: lógica reutilizable va en `lib/` con `import "server-only"`; los handlers quedan delgados (parsear, validar, autorizar, llamar a `lib/`, responder).

## 4. Convenciones

### Endpoints y contratos
- Un `route.ts` por recurso; exporta solo los métodos que existen (`POST`, `GET`, `DELETE`). Parámetros dinámicos tipados: `{ params }: { params: { id: string } }`.
- Siempre `export const runtime = "nodejs"`. Agrega `export const dynamic = "force-dynamic"` en lecturas que no deben cachearse (PDFs, diagnósticos).
- Rutas nuevas siguen el patrón `/api/<recurso>` (público) o `/api/admin/<recurso>[/[id]]` (protegido) y se documentan en `docs/api-spec.yml` en el mismo cambio.
- Respuestas de éxito: `{ ok: true, ...datos }` (por ejemplo `{ ok: true, id }`, `{ ok: true, persisted: false }`).

### Validación de entrada
- `await req.json()` siempre dentro de `try/catch` → `400 { error: "JSON inválido." }`.
- Campos obligatorios y formato se validan antes de tocar la base: `trim()` de strings, regex de email (`isValidEmail` en `app/api/leads/route.ts`), normalización (LinkedIn sin protocolo → `https://`), límites (imagen ≤ 5 MB).
- Tipar el body como `Partial<Tipo>` o `Record<string, unknown>` y castear explícitamente campo a campo; nunca confiar en la forma del JSON.

### Errores y respuestas
- Forma única de error: `NextResponse.json({ error: "<mensaje en español para el usuario>" }, { status })`.
- Códigos: `400` entrada inválida · `401` sin sesión (`"No autorizado."`) · `404` no existe · `500` fallo interno o servicio no configurado (`"Base de datos no configurada."`).
- Nunca devolver stack traces ni mensajes internos; el detalle va a `console.error` con prefijo de área.

### Persistencia (Firestore)
- Obtener la base con `getDb()`; **puede ser `null`** (sin credenciales). Los endpoints públicos siguen funcionando en ese caso (registran en consola y responden `persisted: false`); los protegidos responden `500`.
- Colecciones y campos según `docs/data-model.md`. Campos nuevos en `team` y `config` siguen en español por consistencia con los existentes; en `leads` en inglés.
- Fechas como strings ISO (`createdAt`, `updatedAt`), no `Timestamp`. Se muestran en `America/Santiago`.
- Actualizaciones parciales con `set(data, { merge: true })`; creación con `add()`. Nunca sobrescribir un documento completo del CMS.

### Autenticación y autorización
- **Primera línea** de todo handler bajo `/api/admin/**`: `const session = await getAdminSession(); if (!session) return 401`.
- La sesión se crea en `POST /api/admin/session` a partir del ID token de Firebase; cookie `httpOnly`, `secure`, `sameSite: "lax"`, `path: "/"`, 5 días. Se borra con `DELETE`.
- Sin credenciales Admin (local), `getAdminSession()` devuelve `{ email: "dev@local" }`: útil para desarrollar, **nunca** un mecanismo de producción.
- No hay roles: cualquier usuario de Firebase Auth del proyecto es admin.

### Efectos secundarios (correo, informe)
- Se ejecutan **después** de persistir el dato principal, en `Promise.all`, y sus errores se registran sin propagarse (patrón `maybeSendClientReport` en `app/api/leads/route.ts`).
- Cada integración devuelve un resultado (`EmailResult`) en vez de lanzar, para poder diagnosticarla.

### Logging
- `console.warn` / `console.error` con prefijo de área: `[leads]`, `[email]`, `[report]`, `[lead-pdf]`.
- Nunca loguear claves ni el cuerpo completo de un lead; sí ids, estado HTTP y los primeros caracteres del error.

### Variables de entorno
- Toda variable nueva se agrega a `.env.local.example` con comentario de dónde se obtiene, al perfil §4 y a `docs/integration-standards.md`. Se lee con `process.env.X` solo en código de servidor (salvo `NEXT_PUBLIC_*`).

## 5. Patrones obligatorios (ejemplos reales)

| Patrón | Ejemplo en el repo |
|---|---|
| Endpoint público con validación, degradación sin Firebase y efectos no bloqueantes | `app/api/leads/route.ts` |
| Endpoint protegido con creación/actualización (`add` vs `set merge`) | `app/api/admin/team/route.ts` |
| Endpoint protegido con parámetro dinámico y `DELETE` | `app/api/admin/leads/[id]/route.ts` |
| Respuesta binaria (PDF) con `Content-Disposition` y `Cache-Control: no-store` | `app/api/admin/leads/[id]/pdf/route.ts` |
| Cookie de sesión desde ID token | `app/api/admin/session/route.ts` |
| Endpoint de diagnóstico protegido que no expone secretos | `app/api/admin/test-email/route.ts` |
| Cliente de un servicio externo con resultado en vez de excepción | `sendViaResend` en `lib/email.ts` |
| Inicialización perezosa y segura de un SDK | `lib/firebaseAdmin.ts` |

## 6. Anti-patrones

- Importar `lib/firebaseAdmin.ts`, `lib/site.ts`, `lib/email.ts` o `lib/report.ts` desde componentes cliente (rompe el build por `server-only`).
- Lanzar excepciones desde un handler en vez de responder JSON con `{ error }`.
- Bloquear la respuesta de `/api/leads` esperando el correo o el informe.
- Guardar `Timestamp` de Firestore o `Date` en vez de ISO string.
- Añadir una variable de entorno sin documentarla en `.env.local.example`.
- Exponer claves, emails de admins u otros secretos en endpoints de diagnóstico.
- Renombrar campos ya persistidos (`nombre`, `cargo`, `habilidades`…): romperías los datos existentes en Firestore.
- Crear endpoints bajo `/api/admin` sin `getAdminSession()`.

## 7. Verificación

Antes de dar por terminada una tarea de backend, ejecutar (el agente, no el usuario):

```
npm run lint
npx tsc --noEmit
npm test
npm run build
```

La lógica extraída a `lib/` (validaciones, transformaciones, armado de datos para PDF o correo) lleva su test unitario; no se testea Firestore ni Resend en unitarios (se cubren con la prueba manual).

Y para cada endpoint nuevo o modificado, prueba manual con `curl` contra `npm run dev` (http://localhost:3000), documentada en `openspec/changes/<cambio>/reports/`:

```bash
# público — sin credenciales locales responde { ok: true, persisted: false }
curl -s -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Prueba curl","email":"prueba@example.com","source":"test"}'

# error de validación esperado (400)
curl -s -X POST http://localhost:3000/api/leads -H "Content-Type: application/json" -d '{"name":"x"}'

# protegido — en local sin Firebase Admin la sesión "dev" deja pasar; con credenciales exige la cookie admin_session
curl -s -X POST http://localhost:3000/api/admin/config -H "Content-Type: application/json" -d '{"visible":{"hero":true}}'
```

Si la prueba corre contra Firestore real (con `.env.local`), **borrar los documentos de prueba** al terminar (`DELETE /api/admin/leads/<id>`, `DELETE /api/admin/team/<id>`) y dejar constancia en el reporte.
