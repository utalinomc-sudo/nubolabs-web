---
status: FILLED
specboot_version: 0.1.0
last_bootstrap: 2026-09-08
---

<!--
  PERFIL DEL PROYECTO — fuente única de los datos del proyecto.
  Generado por /bootstrap-project (nubolabs-specboot) a partir del repo, README.md y docs/ESTADO-PROYECTO.md.
  Si cambias algo estructural aquí, corre `/bootstrap-project --update` para propagarlo a los estándares,
  agentes y openspec/config.yaml. Lo que no se pudo confirmar está en §11 como TBD.
-->

# Perfil del proyecto — Nubolabs (sitio web y panel)

## 1. Identidad

| Campo | Valor |
|---|---|
| Nombre | `nubolabs-web` — sitio público y panel de administración de Nubolabs |
| Tipo | Web app: landing pública + flujo de diagnóstico + panel admin (leads, CMS, equipo) |
| En una frase | Sitio de la agencia de IA & automatización Nubolabs: capta leads con un diagnóstico operativo, les entrega un informe en PDF y permite administrar contenido, equipo y leads desde `/admin`. |
| Dueño / contacto | Mauricio Contreras · correo del proyecto `mauricio.nubolabs@gmail.com` |
| Repositorio | https://github.com/utalinomc-sudo/nubolabs-web · rama principal `main` |
| Producción | https://nubolabs.cl (Vercel, proyecto `nubolabs-web`, equipo ConCar; apex 308 → www) |

## 2. Stack

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| Lenguaje | TypeScript | 5.5 | `strict: true`; alias `@/*` → raíz del repo |
| Framework | Next.js (App Router) + React | 14.2 / 18.3 | Server Components por defecto; `"use client"` solo donde hay interacción |
| UI / estilos | Tailwind CSS | 3.4 | Tokens de marca en `tailwind.config.ts`; primitivas `.btn-primary`, `.card`, `.field`… en `app/globals.css` |
| Backend | Next.js Route Handlers (`app/api/**/route.ts`, `runtime = "nodejs"`) | 14.2 | No hay servidor aparte |
| Base de datos | Firestore vía Firebase Admin SDK | firebase-admin 12 | Colecciones `leads`, `team` y documento `config/site` |
| Auth | Firebase Auth (email/password) + cookie de sesión httpOnly verificada en servidor | firebase 10 / firebase-admin 12 | Solo para `/admin` |
| Hosting / deploy | Vercel | — | Cada push a `main` despliega automáticamente (~30 s) |
| Gestor de paquetes | npm | 11 | `package-lock.json` versionado |
| Runtime | Node.js | local 24.16 · Vercel: TBD | Ver §11 |
| Otras librerías | `pdf-lib` 1.17 (PDFs), `@vercel/blob` 2.6 (fotos) | | |

## 3. Capas activas

| Capa | Aplica | Documento |
|---|---|---|
| Frontend | Sí | `docs/frontend-standards.md` |
| Backend propio | Sí | `docs/backend-standards.md` |
| Integraciones externas | Sí | `docs/integration-standards.md` |
| API propia documentada | Sí | `docs/api-spec.yml` |
| Modelo de datos | Sí | `docs/data-model.md` |

## 4. Integraciones externas

Nombra la **variable** de la credencial, nunca su valor. Valores solo en Vercel → Settings → Environment Variables (y en `.env.local` local, ignorado por git).

| Servicio | Para qué | Credencial (variable) | Estado |
|---|---|---|---|
| Firebase Admin (Firestore + Auth) | Persistir leads, equipo y config; verificar la cookie de sesión del admin | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Activa en producción |
| Firebase cliente (Auth) | Login del admin en el navegador | `NEXT_PUBLIC_FIREBASE_API_KEY`, `..._AUTH_DOMAIN`, `..._PROJECT_ID`, `..._STORAGE_BUCKET`, `..._MESSAGING_SENDER_ID`, `..._APP_ID` (públicas) | Activa |
| Resend (API REST, sin SDK) | Aviso por correo de cada lead nuevo; envío del informe PDF al cliente | `RESEND_API_KEY`; opcionales `NOTIFY_EMAIL`, `NOTIFY_FROM`, `REPORT_FROM` | Activa: avisos desde `avisos@nubolabs.cl` e informe desde `informe@nubolabs.cl`. Dominio verificado el 2026-09-15; la key pertenece a la cuenta Resend `utalinomc@gmail.com` |
| Vercel Blob | Fotos de integrantes del equipo | `BLOB_READ_WRITE_TOKEN` | Opcional: sin token, la foto se reduce en el navegador y se incrusta como data URL en Firestore |
| Agenda (Calendly, WhatsApp u otro) | Destino del botón "Agendar mi sesión" del informe | `SCHEDULE_URL` | Opcional (default `https://www.nubolabs.cl`) |

## 5. Calidad y verificación

| Aspecto | Valor |
|---|---|
| Unit tests | **Ninguno todavía** (TBD, ver §11). Recomendado: Vitest + Testing Library |
| E2E | Playwright MCP, ejecutado por el agente contra `npm run dev` (http://localhost:3000). El sitio corre sin credenciales de Firebase: los leads no se persisten y `/admin` queda abierto con sesión "dev" |
| Lint / formato | ESLint `next/core-web-vitals` (`npm run lint`). No hay Prettier |
| Type check | `npx tsc --noEmit` |
| Cobertura objetivo | No exigida mientras no exista runner |
| **Comandos obligatorios antes de dar por terminada una tarea** | `npm run lint` · `npx tsc --noEmit` · `npm run build` (los tres pasan al 2026-09-08) |

## 6. Idiomas

| Artefacto | Idioma |
|---|---|
| Código (identificadores) | Inglés para identificadores **nuevos**. Se respetan tal cual los campos ya persistidos en Firestore en español (`nombre`, `cargo`, `habilidades`, `orden`, `mision`, `vision`…) y los nombres de dominio ya existentes (`ahorro`, `cuestionario`): **no renombrar** |
| Comentarios en código | Español |
| UI (textos visibles) | Español de Chile (`lang="es"`, `es-CL` en fechas y CLP) |
| Documentación técnica | Español |
| Specs OpenSpec | Español (encabezados estructurales y SHALL/MUST en inglés) |
| Commits / PRs | Español |
| Conversación con el agente | Español |

## 7. Git y entrega

| Aspecto | Valor |
|---|---|
| Ramas | `main` = producción. Cambios spec-driven en `feature/<nombre-del-cambio>`. Fixes pequeños directo a `main` permitidos (equipo de una persona) |
| Commits | Español, imperativo o descriptivo, prefijo de área opcional como en el historial (`Admin:`, `Fix:`, `docs:`, `Equipo:`) |
| Pull requests | Opcionales, sin protección de rama. `/commit` pregunta antes de crear uno |
| Deploy | Push a `main` → Vercel. Secretos solo en Vercel; nunca en el chat ni en commits |

## 8. Glosario del dominio

| Término | Significado en este proyecto |
|---|---|
| Lead | Solicitud de contacto guardada en la colección `leads`. Origen (`source`) `landing` (formulario del home) o `diagnostico` |
| Diagnóstico | Flujo de `/diagnostico`: cuestionario operativo obligatorio (18 preguntas, escala 1–5) + estimador de ahorro opcional (`components/diagnostico/DiagnosticoFlow.tsx`) |
| Índice de fricción | Puntaje del cuestionario con un nivel en texto; se guarda en `meta.indiceFriccion` / `meta.nivelFriccion` del lead |
| Área | Grupo de 3 preguntas del cuestionario (carga y capacidad, seguimiento y plazos, información y documentos, procesos y escala, …) definido en `components/diagnostico/cuestionario.ts` |
| Proceso | Ítem del estimador de ahorro: personas × horas/semana por persona × sueldo × % repetitivo (`components/diagnostico/ahorro.ts`) |
| Ahorro estimado | Horas y CLP por semana, mes y año que calcula `calcTotals` |
| Informe | PDF de marca con los resultados del diagnóstico para el cliente (`lib/report.ts`). La "ficha del lead" es el PDF interno del admin (`lib/leadReport.ts`) |
| CMS | Documento `config/site` en Firestore con visibilidad de secciones y textos editables desde `/admin/config` (`lib/site.ts`) |
| Sección | Bloque de la landing o página con toggle de visibilidad (`SECTIONS` en `lib/site.ts`) |
| Integrante | Miembro del equipo (colección `team`) mostrado en `/equipo` |
| Admin | Usuario de Firebase Auth con acceso al panel `/admin` |

## 9. Datos sensibles y seguridad

- **Secretos:** `FIREBASE_PRIVATE_KEY`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN` viven solo en Vercel (y en `.env.local` local). Nunca se pegan en el chat, commits ni docs; se nombran por variable. `.gitignore` excluye `.env*`, `serviceAccount*.json`.
- **Datos personales que maneja el sistema:** nombre, email, teléfono, empresa, mensaje y respuestas del diagnóstico de cada lead (Firestore y correos de Resend); emails de los admins.
- **Reglas adicionales:**
  - Toda ruta `app/api/admin/**` empieza verificando `getAdminSession()` y responde `401 { error: "No autorizado." }` si no hay sesión.
  - Sin credenciales Admin (solo local), `getAdminSession()` devuelve una sesión "dev": nunca depender de eso en producción.
  - No loguear PII completa ni claves; los logs llevan prefijo de área (`[leads]`, `[email]`, `[report]`).
  - Endpoints de diagnóstico (`/api/admin/test-email`) devuelven resultados sin exponer claves.
  - Sin rate limiting ni anti-spam en formularios ni login hoy (está en el roadmap).

## 10. Modelos de IA

| Etapa | Modelo |
|---|---|
| Planificar (`/enrich-us`, `/opsx:propose`, `/opsx:ff`) | Claude Fable 5.1 u Opus con razonamiento alto |
| Implementar (`/opsx:apply`) | El modelo por defecto de la sesión (Sonnet u Opus según costo); cambiar con `/model` |

## 11. Pendientes de definición (TBD)

| Campo | Por qué falta | Cómo resolverlo |
|---|---|---|
| Runner de tests unitarios | No hay ningún test ni runner en el repo | Decidir (recomendado Vitest + Testing Library), instalar, escribir el primer test para `components/diagnostico/ahorro.ts` y correr `/bootstrap-project --update` |
| Versión de Node en Vercel | No consta en el repo (no hay `engines` en `package.json`) | Vercel → Settings → General → Node.js Version; anotar aquí y en `package.json` `engines` |
| Regla de idioma de identificadores | El código mezcla inglés (`name`, `email`) y español (`nombre`, `cargo`) | Confirmar la regla propuesta en §6 |
| Política de PRs | Un solo desarrollador, sin PRs hasta ahora | Confirmar si `/commit` debe crear PR o solo push |
| `metadataBase` del sitio | `app/layout.tsx` usa `https://nubolabs.ai` pero producción es `https://nubolabs.cl` (afecta Open Graph / SEO) | Confirmar el dominio canónico y corregirlo en un cambio OpenSpec |

## 12. Estructura del repositorio (resumen)

```
app/
  layout.tsx · page.tsx · globals.css · icon.svg
  diagnostico/page.tsx · equipo/page.tsx · mision-vision/page.tsx
  admin/login/page.tsx
  admin/(panel)/layout.tsx · page.tsx · leads/ · leads/[id]/ · config/ · equipo/
  api/leads/route.ts · api/diagnostico/report/route.ts
  api/admin/session · config · team · team/[id] · leads/[id] · leads/[id]/pdf · upload · test-email
components/
  landing/  Nav, Hero, HeroGraphic, Problem, Approach, Services, Process, UseCases, ContactForm, Footer
  diagnostico/  DiagnosticoFlow.tsx, AhorroEstimator.tsx, cuestionario.ts, ahorro.ts
  admin/  ConfigEditor, TeamEditor, DeleteLeadButton, LeadPdfButton, LogoutButton
  Logo.tsx · icons.tsx · LinkedInIcon.tsx
lib/
  content.ts (textos por defecto) · site.ts (CMS + equipo) · firebase.ts (cliente) · firebaseAdmin.ts (servidor)
  adminAuth.ts (sesión) · email.ts (Resend) · report.ts (PDF cliente) · leadReport.ts (PDF interno)
types/lead.ts
docs/  ESTADO-PROYECTO.md · Mejoras-Nubolabs.pdf · mejoras-nubolabs.html · (estándares specboot)
ai-specs/  agentes y skills (fuente canónica) · .claude/ (copias) · openspec/ (specs y cambios)
```
