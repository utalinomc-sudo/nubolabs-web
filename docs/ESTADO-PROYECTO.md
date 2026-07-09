# Estado del proyecto — Nubolabs

> Documento de contexto para retomar el trabajo (incluso desde una conversación nueva o después de mover la carpeta). Última actualización: **2026-07-09**.

## Resumen
Sitio de agencia de IA & automatización. **En producción: https://nubolabs.cl** (apex 308 → www, HTTPS de Vercel).

- **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Firebase · Vercel.
- **Diseño:** dirección "1b claro & azul". Paleta: navy `#0B1D3A`, brand `#1565FF`, cian `#00C2FF`, acento naranjo `#FF6B5E`. Fuentes Plus Jakarta Sans + IBM Plex Mono.
- **Repo:** GitHub `utalinomc-sudo/nubolabs-web`, rama `main`. Cada push a `main` → auto-deploy en Vercel (~15–30 s).
- **Vercel:** proyecto `nubolabs-web`, equipo **ConCar** (Hobby). Dominio en NIC Chile delegado a nameservers de Vercel.
- **Correo del proyecto (Google/Firebase/Resend):** `mauricio.nubolabs@gmail.com`.

## ⚠️ Regla de seguridad
Los secretos (`FIREBASE_PRIVATE_KEY`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`) van **directo en Vercel → Settings → Environment Variables**, **nunca** pegados en el chat. Los `NEXT_PUBLIC_FIREBASE_*` sí son públicos.

## Lo que YA funciona en producción
- **Landing** modular (`components/landing/*`) + página **`/diagnostico`**:
  - Cuestionario operativo obligatorio (18 preguntas → índice de fricción) + estimador de ahorro **opcional**.
  - Lógica de cálculo en `components/diagnostico/ahorro.ts` (horas **por persona** × personas × 4.33; totales semana/mes/año).
  - Flujo principal en `components/diagnostico/DiagnosticoFlow.tsx`.
- **Firebase / leads:** persisten en Firestore colección `leads`. `lib/firebase.ts` (cliente) y `lib/firebaseAdmin.ts` (Admin SDK, `server-only`). Endpoint `POST /api/leads`.
- **Admin protegido:** login `/admin/login` (Firebase Auth) → cookie de sesión verificada (`lib/adminAuth.ts`, `app/api/admin/session`). Rutas guardadas en `app/admin/(panel)/`.
- **Panel admin:**
  - Dashboard (`/admin`) con KPIs de leads.
  - Leads (`/admin/leads`) lista + detalle (`/admin/leads/[id]`) con procesos **expandibles** y **fechas en hora de Chile** (`America/Santiago`).
  - **Eliminar lead**: botón con modal que exige escribir "eliminar" (`components/admin/DeleteLeadButton.tsx`, `DELETE /api/admin/leads/[id]`).
  - **Contenido** (`/admin/config`): editor CMS.
  - **Nuestro equipo** (`/admin/equipo`): historia + integrantes.
- **CMS ("MVP práctico"):** `lib/site.ts` lee `config/site` en Firestore (merge sobre defaults en el código).
  - Editable desde admin: **visibilidad por sección** + **Hero** (título con `**resalte**` azul) + **Servicios** (lista) + **Casos de uso** (lista) + **Equipo** (historia).
  - Página pública **`/equipo`**; integrantes (foto, cargo, habilidades, orden) en colección `team`.
  - Fotos suben a **Vercel Blob** (`/api/admin/upload`). APIs admin: `/api/admin/config`, `/api/admin/team[/id]`, `/api/admin/upload` (todas protegidas).
- **Email de leads (Resend):** `lib/email.ts` envía por cada lead vía API REST de Resend.
  - Asunto: `Nuevo LEAD - nombre - empresa - teléfono`. Destino: `mauricio.nubolabs@gmail.com`. From: `onboarding@resend.dev`.
  - `RESEND_API_KEY` **ya cargada en Vercel y probada** (status 200). Campo **Teléfono** agregado a los dos formularios.
  - Diagnóstico: `GET /api/admin/test-email` (protegido) devuelve la respuesta de Resend sin exponer la key.

## Variables de entorno en Vercel (referencia; valores solo en Vercel)
- `NEXT_PUBLIC_FIREBASE_*` (6, públicas) — config cliente.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — Admin SDK (secreto).
- `RESEND_API_KEY` — envío de correo (secreto). Opcionales: `NOTIFY_EMAIL`, `NOTIFY_FROM`.
- `BLOB_READ_WRITE_TOKEN` — **falta crearla** (crear Blob store en Vercel → Storage).
- Plantilla completa en `.env.local.example`.

## Pendientes / próximos pasos
1. **Crear el Blob store en Vercel** (Storage → Create → Blob) para habilitar la subida de fotos del equipo (`BLOB_READ_WRITE_TOKEN`). Sin él sale inicial de color en vez de foto.
2. **Hacer editables por texto** las 3 secciones que hoy solo se muestran/ocultan: **Problemas, Enfoque, Proceso** (sus textos siguen en `lib/content.ts`).
3. **Verificar dominio `nubolabs.cl` en Resend** para enviar desde `hola@nubolabs.cl` y evitar spam.
4. **Limpiar leads de prueba** en Firestore (Prueba Detalle, Prueba Cuestionario, mau, ff, etc.).

## Roadmap propuesto (ver `docs/Mejoras-Nubolabs.pdf`, ordenado por impacto)
1. **Pipeline / mini-CRM de leads** (estados + notas + tasa de conversión; el campo `status` ya se guarda pero no se usa) — *siguiente recomendado*.
2. **Informe de diagnóstico en PDF + respuesta automática al cliente**.
3. **SEO + analítica** (hoy NO hay sitemap/robots/OpenGraph/analytics).
4. **Aviso por WhatsApp + anti-spam/rate-limiting** (formularios y login hoy sin protección).
5. **Blog / casos de éxito administrable** (reusa el patrón CMS).
