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
| Framework | Next.js (App Router, Turbopack) + React | 16.3 / 18.3 | Server Components por defecto; `"use client"` solo donde hay interacción. El App Router corre con el React 19.3 canary que empaqueta Next; `react` 18.3 instalado sirve a los tests (Testing Library) |
| UI / estilos | Tailwind CSS | 3.4 | Tokens de marca en `tailwind.config.ts`; primitivas `.btn-primary`, `.card`, `.field`… en `app/globals.css` |
| Backend | Next.js Route Handlers (`app/api/**/route.ts`, `runtime = "nodejs"`) | 16.3 | No hay servidor aparte. `params` y `cookies()` son asíncronos (`await`) |
| Base de datos | Firestore vía Firebase Admin SDK | firebase-admin 14 | Colecciones `leads`, `team` y documento `config/site` |
| Auth | Firebase Auth (email/password) + cookie de sesión httpOnly verificada en servidor | firebase 11 (cliente) / firebase-admin 14 | Solo para `/admin` |
| Hosting / deploy | Vercel | — | Cada push a `main` despliega automáticamente (~30 s) |
| Gestor de paquetes | npm | 11 | `package-lock.json` versionado |
| Runtime | Node.js | 24.x declarado en `package.json` → `engines.node` · local 24.16 | **24.x confirmado en Vercel** (Settings → Build and Deployment) el 2026-09-16. firebase-admin 14 exige Node ≥ 22: no bajar de 24.x. El runtime de funciones de Vercel **no ofrece `require(esm)`** aunque el proyecto esté en 24.x (visto en producción el 2026-09-16, también con build sin caché): por eso `package.json` fija con `overrides` `jose` 5 (CommonJS) bajo `jwks-rsa`, dependencia de `firebase-admin/auth`, vigilado por `lib/firebaseAdminAuthDeps.test.ts`. No quitar ese override |
| Otras librerías | `pdf-lib` 1.17 (PDFs), `@vercel/blob` 2.8 (fotos) | | Migrado a Next 16.3 + firebase-admin 14.4 el 2026-09-16 (cambio `migrar-next-16`) |

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
| Unit tests | **Vitest 4** (`npm test`, entorno `node` por defecto; config en `vitest.config.mts`). Tests co-ubicados `*.test.ts(x)` con imports explícitos de `vitest`. Testing Library instalada para componentes (activar jsdom por archivo con `// @vitest-environment jsdom`). Tests actuales: `components/diagnostico/ahorro.test.ts` (11 casos) y `lib/privateKey.test.ts` (9 casos, normalización de `FIREBASE_PRIVATE_KEY`) |
| E2E | Playwright MCP, ejecutado por el agente contra `npm run dev` (http://localhost:3000). El sitio corre sin credenciales de Firebase: los leads no se persisten y `/admin` queda abierto con sesión "dev" |
| Lint / formato | ESLint 9 con flat config: `eslint.config.mjs` extiende `eslint-config-next/core-web-vitals`; `npm run lint` = `eslint .` (el comando de lint integrado en Next desapareció en la 16). Excepción documentada: `@next/next/no-html-link-for-pages` desactivada solo en `components/landing/Nav.tsx`. No hay Prettier |
| Type check | `npx tsc --noEmit` |
| Cobertura objetivo | Sin umbral exigido; toda funcionalidad nueva incluye sus tests (TDD, base-standards §1) |
| **Comandos obligatorios antes de dar por terminada una tarea** | `npm run lint` · `npx tsc --noEmit` · `npm test` · `npm run build` (los cuatro pasan al 2026-09-16 con Next 16.3 y Turbopack) |

## 6. Idiomas

| Artefacto | Idioma |
|---|---|
| Código (identificadores) | Inglés para identificadores **nuevos** (confirmado el 2026-09-15). Se respetan tal cual los campos ya persistidos en Firestore en español (`nombre`, `cargo`, `habilidades`, `orden`, `mision`, `vision`…) y los nombres de dominio ya existentes (`ahorro`, `cuestionario`): **no renombrar** |
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
| Pull requests | `/commit` solo hace push de la rama; el PR se crea únicamente cuando el usuario lo pide después (decisión del 2026-09-15). Sin protección de rama |
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
| (ninguno) | Todos los TBD detectados en el bootstrap quedaron resueltos el 2026-09-15 | Agregar filas aquí cuando aparezca algo nuevo por definir |

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
