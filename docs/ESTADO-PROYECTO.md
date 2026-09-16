# Estado del proyecto — Nubolabs

> Documento de contexto para retomar el trabajo (incluso desde una conversación nueva o después de mover la carpeta). Última actualización: **2026-09-16**.

## Resumen
Sitio de agencia de IA & automatización. **En producción: https://nubolabs.cl** (apex 308 → www, HTTPS de Vercel).

- **Stack:** Next.js 16.3 (App Router, Turbopack) · React 18.3 · TypeScript · Tailwind 3 · Firebase (firebase-admin 14) · Vercel. Lint con ESLint 9 (`eslint.config.mjs`). Migrado el 2026-09-16 (cambio `migrar-next-16`).
- **Diseño:** dirección "1b claro & azul". Paleta: navy `#0B1D3A`, brand `#1565FF`, cian `#00C2FF`, acento naranjo `#FF6B5E`. Fuentes Plus Jakarta Sans + IBM Plex Mono.
- **Repo:** GitHub `utalinomc-sudo/nubolabs-web`, rama `main`. Cada push a `main` → auto-deploy en Vercel (~15–30 s).
- **Vercel:** proyecto `nubolabs-web`, equipo **ConCar** (Hobby). Dominio en NIC Chile delegado a nameservers de Vercel.
- **Correo del proyecto (Google/Firebase):** `mauricio.nubolabs@gmail.com`. **Cuenta de Resend:** `utalinomc@gmail.com` (dominio `nubolabs.cl` verificado el 2026-09-15; la `RESEND_API_KEY` de Vercel pertenece a esta cuenta).

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
  - Leads (`/admin/leads`) lista + detalle (`/admin/leads/[id]`) con procesos **expandibles** y **fechas en hora de Chile** (`America/Santiago`). Botón **Exportar PDF**: ficha interna completa (contacto, índice, todas las preguntas/respuestas, abiertas y montos por proceso) vía `GET /api/admin/leads/[id]/pdf` → `lib/leadReport.ts`.
  - **Eliminar lead**: botón con modal que exige escribir "eliminar" (`components/admin/DeleteLeadButton.tsx`, `DELETE /api/admin/leads/[id]`).
  - **Contenido** (`/admin/config`): editor CMS.
  - **Nuestro equipo** (`/admin/equipo`): historia + integrantes.
- **CMS ("MVP práctico"):** `lib/site.ts` lee `config/site` en Firestore (merge sobre defaults en el código).
  - Editable desde admin: **visibilidad por sección** + **Hero** (título con `**resalte**` azul) + **Servicios** (lista) + **Casos de uso** (lista) + **Equipo** (historia).
  - Página pública **`/equipo`**; integrantes (foto, cargo, habilidades, **LinkedIn**, orden) en colección `team`. El link de LinkedIn se edita en el admin y sale como ícono junto al nombre (`components/LinkedInIcon.tsx`).
  - Menú **"Nosotros"** (dropdown en `components/landing/Nav.tsx`, después de "Casos de uso") con dos sub-páginas: **Misión y visión** (`/mision-vision`) y **Equipo** (`/equipo`). Misión, visión y objetivos son editables desde el CMS (`content.nosotros`, sección "Misión y visión" en `ConfigEditor`), con toggle de visibilidad `nosotros`. El logo del nav enlaza a `/#inicio`.
  - Fotos suben a **Vercel Blob** (`/api/admin/upload`). APIs admin: `/api/admin/config`, `/api/admin/team[/id]`, `/api/admin/upload` (todas protegidas).
- **Email de leads (Resend):** `lib/email.ts` envía por cada lead vía API REST de Resend.
  - Asunto: `Nuevo LEAD - nombre - empresa - teléfono`. Destino: `mauricio.nubolabs@gmail.com` (`NOTIFY_EMAIL`). From: `Nubolabs <avisos@nubolabs.cl>` (`NOTIFY_FROM`).
  - `RESEND_API_KEY` cargada en Vercel (rotada el 2026-09-15 a la cuenta con el dominio verificado) y probada (status 200). Campo **Teléfono** agregado a los dos formularios.
  - Diagnóstico: `GET /api/admin/test-email` (protegido) devuelve la respuesta de Resend sin exponer la key.
- **Informe automático en PDF (mejora #2):** PDF de marca generado con `pdf-lib` (`lib/report.ts`). Incluye
  índice de fricción, barras por área, áreas críticas, "en tus palabras" y ahorro estimado. Dos vías:
  - **Descarga directa (activa ya):** al terminar el diagnóstico aparece el botón **"Descargar mi informe (PDF)"**
    que hace `POST /api/diagnostico/report` y baja el PDF. No depende de Resend.
  - **Envío por correo al cliente:** `POST /api/leads` también llama a `sendClientReport` (`lib/email.ts`) con el
    PDF adjunto + CTA para agendar. Todo no-bloqueante (si falla, el lead igual se guarda).
    ✅ **Operativo desde el 2026-09-15:** dominio `nubolabs.cl` verificado en Resend; el informe sale desde
    `Nubolabs <informe@nubolabs.cl>` (`REPORT_FROM`) y llega a cualquier correo (probado con un diagnóstico real).
    Var opcional: `SCHEDULE_URL` (destino del botón "Agendar mi sesión").

## Variables de entorno en Vercel (referencia; valores solo en Vercel)
- `NEXT_PUBLIC_FIREBASE_*` (6, públicas) — config cliente.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — Admin SDK (secreto).
- `RESEND_API_KEY` — envío de correo (secreto). `NOTIFY_FROM` y `REPORT_FROM` **ya cargadas** (`avisos@nubolabs.cl` / `informe@nubolabs.cl`). Opcionales: `NOTIFY_EMAIL`, `SCHEDULE_URL`.
- `BLOB_READ_WRITE_TOKEN` — **falta crearla** (crear Blob store en Vercel → Storage).
- Plantilla completa en `.env.local.example`.

## Pendientes / próximos pasos
1. ~~**Crear el Blob store en Vercel** para subir fotos del equipo~~ **Ya no bloquea:** si falta `BLOB_READ_WRITE_TOKEN`, la foto se reduce en el navegador (JPEG ≤512px) y se **incrusta como data URL** en Firestore (`components/admin/TeamEditor.tsx`). *Opcional:* crear el Blob store (Storage → Create → Blob) para servir las fotos desde CDN en vez de incrustarlas; si el token existe, se usa automáticamente.
2. **Hacer editables por texto** las 3 secciones que hoy solo se muestran/ocultan: **Problemas, Enfoque, Proceso** (sus textos siguen en `lib/content.ts`).
3. ~~**Verificar dominio `nubolabs.cl` en Resend**~~ ✅ **Hecho el 2026-09-15:** registros DKIM, SPF, MX y DMARC agregados en Vercel DNS, dominio verificado, `NOTIFY_FROM` y `REPORT_FROM` cargadas en Vercel, `RESEND_API_KEY` rotada a la cuenta correcta, informe al cliente probado de punta a punta.
4. **Limpiar leads de prueba** en Firestore (Prueba Detalle, Prueba Cuestionario, mau, ff, y el lead "mau / nada" del 2026-09-15).
5. **Endurecer `calc` en `components/diagnostico/ahorro.ts`** para que un porcentaje repetitivo no numérico se trate como 0 (hoy daría `NaN`; la UI siempre envía un número, así que no afecta a usuarios). Hallazgo del primer test; hacerlo como cambio OpenSpec con su test.
6. ~~**Actualizar dependencias de producción con alertas de seguridad.**~~ **Parcialmente hecho el 2026-09-16** (cambio `actualizar-dependencias-seguras`): `npm audit fix` sin forzar, `@vercel/blob` 2.8 y `firebase` (SDK cliente) 10 → 11 bajaron las alertas de producción de 21 a 10 (cerradas `undici`, `fast-xml-parser` y todo `@firebase/*`). Las 10 restantes se cerraron el mismo 2026-09-16 con la migración a Next 16 y firebase-admin 14 (pendiente 7). ✅
7. ~~**Migrar a Next 16 y firebase-admin 14**~~ ✅ **Hecho el 2026-09-16** (cambio `migrar-next-16`, rama `feature/migrar-next-16`; se mezcla a `main` tras validar el preview de Vercel con login real): `next` 14.2.35 → **16.3.5** (Turbopack por defecto en `dev` y `build`), `firebase-admin` 12.7 → **14.4.0**, `eslint` 8 → **9.39** con flat config (`eslint.config.mjs`; `npm run lint` = `eslint .`, `next lint` desapareció), `cookies()` y `params` asíncronos en `lib/adminAuth.ts` y las 4 rutas con `[id]`, `data-scroll-behavior="smooth"` en el `<html>` (Next 16 ya no anula el scroll suave global al navegar) y `agentRules: false` en `next.config.js` (para que `next dev` no inserte su bloque en `AGENTS.md`/`CLAUDE.md`). `npm audit --omit=dev` pasó de 10 alertas (1 crítica, 1 alta, 8 moderadas) a **2 moderadas residuales** sin parche (pendiente 8). Lint, tipos, 11 tests, build, `curl` a los 11 endpoints (idénticos a la línea base) y E2E completo con Playwright MCP en 1280 y 375 px en verde; reportes y capturas en `openspec/changes/migrar-next-16/reports/`. Nota: el App Router de Next 16 corre con el **React 19.3 canary que empaqueta Next**; `react` 18.3 sigue instalado (tests con Testing Library).  Tras el primer preview (error 500 en todas las páginas dinámicas) se añadió `lib/privateKey.ts` con su test: firebase-admin 14 rechaza la clave privada guardada con comillas, en una sola línea o con espacios sobrantes (la 12 lo toleraba); ahora se normaliza y un fallo de inicialización deja el sitio como sin credenciales, con aviso `[firebase-admin]` en el log, en vez de tumbarlo (reporte `2026-09-16-paso-2b-clave-privada.md`). El segundo preview mostró la causa real: `Failed to load external module firebase-admin…/auth: ERR_REQUIRE_ESM` (`jwks-rsa` hace `require()` de `jose` 6, solo ESM, que exige Node ≥ 20.19/22.12) ; `firebase-admin/auth` ahora se carga de forma perezosa y protegida (el sitio público no lo necesita). Node en Vercel ya estaba en 24.x: el tercer preview, redesplegado **sin caché de build**, funcionó por completo (login real, leads, PDF, CMS), así que el fallo se atribuye a una caché de build heredada de Next 14 (reportes `2026-09-16-paso-2c-auth-esm.md` y `2026-09-16-paso-5-preview.md`).
8. **Residuo de seguridad de `@google-cloud/storage`** (2 alertas moderadas: `uuid` < 11.1.1 bajo `gaxios` 6, que `@google-cloud/storage` 8.1.0 sigue fijando). Sin impacto: es dependencia opcional de `firebase-admin` para Cloud Storage, que el sitio no usa ni carga. Cuando `npm view @google-cloud/storage dependencies.gaxios` muestre `^7`, actualizar y comprobar `npm audit --omit=dev` en 0.
9. **Deuda menor detectada durante la migración** (código preexistente, comportamiento idéntico en producción con Next 14; sin cambios funcionales en `migrar-next-16`): (a) `components/landing/Nav.tsx` usa `<a href="/#inicio">` en el logo y la regla `@next/next/no-html-link-for-pages` quedó desactivada solo para ese archivo en `eslint.config.mjs` → evaluar `<Link>`; (b) `components/diagnostico/DiagnosticoFlow.tsx` mezcla el atajo `border` con `borderStyle`/`borderColor` en la tarjeta del paso opcional: React 19 lo avisa en la consola de desarrollo y la tarjeta "Estimación de ahorro" pierde su borde definido al activarse → separar los estilos o dar `key` distinta a las dos tarjetas; (c) a 375 px el enlace "← Volver a nubolabs.cl" de `/diagnostico` desborda 16 px y la tabla de `/admin/leads` desborda la página → ajustar `flex-wrap`/`min-width: 0`.
10. ~~**Fijar Node.js 24.x en Vercel**~~ ✅ Confirmado el 2026-09-16: el proyecto ya estaba en 24.x y `package.json` declara `engines.node: "24.x"`. Regla que queda: **no bajar de Node 24** (`firebase-admin` 14 exige ≥ 22 y su módulo de auth necesita `require(esm)`); si un despliegue mostrara `ERR_REQUIRE_ESM` en `firebase-admin…/auth`, redesplegar sin caché de build. Con el código actual el sitio público seguiría en pie y el login respondería `500 Auth no configurado` con el aviso `[firebase-admin]` en los logs.

## Roadmap propuesto (ver `docs/Mejoras-Nubolabs.pdf`, ordenado por impacto)
1. **Pipeline / mini-CRM de leads** (estados + notas + tasa de conversión; el campo `status` ya se guarda pero no se usa) — *siguiente recomendado*.
2. ~~**Informe de diagnóstico en PDF + respuesta automática al cliente**~~. ✅ **Implementado y operativo** (dominio verificado en Resend el 2026-09-15).
3. **SEO + analítica** (hoy NO hay sitemap/robots/OpenGraph/analytics).
4. **Aviso por WhatsApp + anti-spam/rate-limiting** (formularios y login hoy sin protección).
5. **Blog / casos de éxito administrable** (reusa el patrón CMS).


## Flujo de trabajo con IA (specboot + OpenSpec) — desde 2026-09-08
El repo tiene instalada la plantilla **nubolabs-specboot** (repo privado `utalinomc-sudo/nubolabs-specboot`, tag `v0.1.0`; copia local en `C:\dev\nubolabs-specboot`; se instala con `npx github:utalinomc-sudo/nubolabs-specboot . --copy --tools claude`) y **OpenSpec 1.12** (perfil `custom`).

- **Fuente única de datos del proyecto:** `docs/project-profile.md` (`status: FILLED`). Reglas base en `docs/base-standards.md` (`CLAUDE.md` apunta ahí). Estándares por capa: `frontend-standards.md`, `backend-standards.md`, `integration-standards.md`; contrato en `docs/api-spec.yml`; colecciones en `docs/data-model.md`.
- **Agentes** (planifican, no implementan): `backend-developer`, `frontend-developer`, `integration-developer`, `product-strategy-analyst` en `ai-specs/agents/`, copiados a `.claude/agents/`.
- **Skills** en `ai-specs/skills/` (copias en `.claude/skills/`): `bootstrap-project`, `enrich-us`, `commit`, `adversarial-review`, `code-auditing`, `sync-agent-symlinks`, `update-docs`, `using-git-worktrees`, `writing-skills`, `explain`, `meta-prompt`, `show-spec-working`. Instalación en **modo copia** (Windows sin symlinks): tras editar `ai-specs/` correr `/sync-agent-symlinks`.
- **Flujo por feature:** `/enrich-us` → `/opsx:ff` (o `/opsx:propose`) → `/opsx:apply` → `/opsx:verify` → `/adversarial-review` → `/opsx:archive` → `/commit`. Comandos OpenSpec en `.claude/commands/opsx/`; specs y cambios en `openspec/`.
- **Verificación obligatoria por tarea:** `npm run lint` · `npx tsc --noEmit` · `npm test` · `npm run build` (+ `curl` si toca `app/api/**`, + E2E con Playwright MCP si toca UI). Desde el 2026-09-16 `npm run lint` es ESLint 9 con `eslint.config.mjs` (flat config) y `npm run build` compila con Turbopack.
- **Tests unitarios (desde 2026-09-15, cambio `agregar-tests-vitest`):** Vitest 4 con `npm test` (config `vitest.config.mts`, entorno `node`, jsdom por archivo + Testing Library para componentes). Primer test: `components/diagnostico/ahorro.test.ts` (11 casos sobre la fórmula de ahorro; spec en `openspec/specs/diagnostico/estimador-ahorro/`).
- Pendientes detectados en el bootstrap (perfil §11): **todos resueltos el 2026-09-15** (dominio en Resend, Node 24.x, PRs solo push, identificadores en inglés, `metadataBase` → `https://www.nubolabs.cl`, runner de tests).
