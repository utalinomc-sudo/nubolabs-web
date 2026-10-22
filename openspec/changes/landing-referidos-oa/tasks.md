## 0. Rama de trabajo

- [x] 0.1 Crear y cambiar a `feature/landing-referidos-oa` desde `main` actualizado (con HDU-01, 03, 02, 10, 04, 06 y 05 ya mezcladas); verificar con `git branch --show-current` y que existen `lib/leads.ts`, `lib/leadOptions.ts` y `lib/siteConfig.ts`.

## 1. Referido en la API (design.md, decisiones 1 y 2) — TDD

- [x] 1.1 Agregar a `lib/leads.test.ts` los casos de `referral` (debe fallar): `"oa"` se guarda; `" oa "` se recorta; `"xyz"`, `123`, `""` y ausente se omiten sin error; `source` no cambia en ningún caso. Verificar que `npm test` falla en esos casos.
- [x] 1.2 Agregar `REFERRALS = ["oa"] as const`, el tipo `Referral` y `REFERRAL_LABELS` a `lib/leadOptions.ts`; sumar `referral?: string` a `LeadInput` (entrada sin validar) y `referral?: Referral` a `LeadRecord` en `types/lead.ts` y la validación a `normalizeLead()` en `lib/leads.ts`. Verificar que `npm test` pasa y `npx tsc --noEmit` no reporta errores.

## 2. Referido en el navegador (decisión 4) — TDD

- [x] 2.1 Escribir `lib/referral.test.ts` (debe fallar): `parseReferral` acepta `"oa"`, `["oa"]` y `" oa "`; rechaza `"otro"`, `undefined`, `""`, `["x","oa"]`; `readStoredReferral()` devuelve `null` si `sessionStorage` lanza (mock con `// @vitest-environment jsdom` y `vi.spyOn(Storage.prototype, "getItem")`) y si el valor guardado no es válido.
- [x] 2.2 Implementar `lib/referral.ts` (`REFERRAL_STORAGE_KEY`, `BANNER_CLOSED_KEY`, `parseReferral`, `rememberReferral`, `readStoredReferral`, todo con `try/catch`); verificar que `npm test` pasa.
- [x] 2.3 En `components/landing/ContactForm.tsx` y `components/diagnostico/DiagnosticoFlow.tsx`, agregar `referral: readStoredReferral() ?? undefined` al payload en el momento del envío; verificar en el E2E (paso N+2) con la pestaña de red de Playwright que el cuerpo incluye `referral` solo tras pasar por `/oa`.

## 3. CMS de la franja (decisión 6) — TDD

- [x] 3.1 Agregar a `lib/siteConfig.referidos.test.ts` (debe fallar; archivo aparte como en las HDU anteriores): sin `content.referidos` → textos por defecto de la spec; override solo de `titulo` → `texto` por defecto; texto vacío o que no es texto → default. Más, en `components/admin/ConfigEditor.test.tsx`, la región "Franja de referidos (O&A)": editar el título y guardar envía solo `content.referidos`; "Usar los textos recomendados" repone los defaults sin guardar.
- [x] 3.2 Agregar `referidos.oa { titulo, texto }` al tipo `SiteContent`, a `defaultSiteConfig()` y a `mergeConfig()` en `lib/siteConfig.ts`; verificar que `npm test` pasa.
- [x] 3.3 Crear `components/admin/config/ReferidosEditor.tsx` con el bloque "Franja de referidos (O&A)" con los dos campos y "Usar los textos recomendados", y agregar `referidos` a `MANAGED_KEYS` del contenedor `ConfigEditor.tsx` (si no, el guardado la descarta); verificar en el E2E que el botón rellena los campos.

## 4. Entrada `/oa` y franja (decisiones 3 y 5)

- [x] 4.1 Extraer la composición de `app/page.tsx` a `components/landing/LandingPage.tsx` (server, prop `referral?: Referral`) sin cambiar el orden ni la visibilidad de secciones; verificar con `npm run build` y comparando en el E2E que `/` se ve igual que antes.
- [x] 4.2 Crear `components/landing/ReferralTracker.tsx` (cliente, sin UI, `rememberReferral` en `useEffect`) y `components/landing/ReferralBanner.tsx` (cliente, según `.ref` de `docs/design/propuesta-web-hdu-08.html` con tokens de HDU-01, botón "Cerrar aviso" ≥ 44 px con `IconX` nuevo, estado cerrado en `sessionStorage` leído con `useSyncExternalStore`), más `components/landing/ReferralBanner.test.tsx` (jsdom: textos, botón con nombre "Cerrar aviso", al cerrar desaparece y guarda la marca, con la marca guardada no se muestra, con `sessionStorage` bloqueado se muestra y se puede cerrar sin error); verificar con `npx tsc --noEmit` y en el E2E.
- [x] 4.3 `app/page.tsx` lee `searchParams` (Promise) y pasa `referral` solo si `parseReferral(ref)` lo valida; crear `app/oa/page.tsx` con `force-dynamic`, `robots: { index: false, follow: true }` y `alternates.canonical: "/"`; `app/page.tsx` declara `noindex` con `generateMetadata` cuando el `ref` es válido. Verificar con `curl -s http://localhost:3000/oa | grep -o 'noindex'` y `curl -s "http://localhost:3000/?ref=oa" | grep -c "Osorio"` (≥ 1), y `curl -s "http://localhost:3000/?ref=otro" | grep -c "Bienvenido, cliente"` (0).

## 5. Panel y correo (decisión 7) — TDD

- [x] 5.1 Escribir `lib/leadStats.test.ts` (debe fallar): `countLeadsByOrigin` con el escenario de la spec (3 formulario/1 O&A, 2 diagnóstico/2 O&A, 4 antiguos → 3/2/3), `createdAt` inválido o ausente no cuenta, borde exacto de 30 días; `filterLeadsByOrigin` para `todos`, `landing`, `diagnostico`, `oa` y un valor desconocido (se trata como `todos`).
- [x] 5.2 Implementar `lib/leadStats.ts` (puro, sin `server-only`); verificar que `npm test` pasa.
- [x] 5.3 Dashboard (`app/admin/(panel)/page.tsx`): bloque "Leads por origen (últimos 30 días)" con `countLeadsByOrigin`, "—" sin Firestore. Lista (`app/admin/(panel)/leads/page.tsx`): `searchParams.origen`, `limit(200)`, filtros como enlaces con `aria-current`, etiqueta "O&A" y etiquetas de origen con tokens (sin hex inline). Detalle (`leads/[id]/page.tsx`): "Referido: O&A". Verificar en el E2E con sesión dev (sin Firestore: estado vacío y "—" sin errores).
- [x] 5.4 TDD: `leadOriginText(lead)` en `lib/leadSummary.ts` con tests en `lib/leadSummary.test.ts` ("landing", "diagnostico · referido O&A", `referral` desconocido ignorado, lead antiguo sin `source` → "landing"); usarlo en `lib/email.ts` (fila "Origen"), en el detalle y en `lib/leadReport.ts` (etiqueta "LANDING · O&A"); el log de la API para leads no persistidos suma `referral`. Verificar con `npm test`, `npx tsc --noEmit` y el log `[leads]` del curl del paso N+1.

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [x] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/landing-referidos-oa/reports/AAAA-MM-DD-paso-N-verificacion.md`. Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl (OBLIGATORIO — el agente lo ejecuta)

- [x] N+1.1 Con `npm run dev` (sin `.env.local`, nada se persiste), ejecutar contra `POST http://localhost:3000/api/leads`: (a) lead válido de formulario con `referral: "oa"` y consentimiento → 200; (b) mismo lead con `referral: "xyz"` → 200; (c) diagnóstico con `source: "diagnostico"`, `referral: "oa"` y `meta` con `indiceFriccion` → 200; (d) JSON inválido → 400. En (a)–(c) revisar en la consola del servidor que el lead registrado lleva o no `referral` según corresponda y que en (c) se intenta el informe (`[report]`). Más `GET /oa` (200, `noindex`), `GET /?ref=oa` (franja) y `GET /?ref=otro` (sin franja).
- [x] N+1.2 Guardar comandos, respuestas y extractos de log en `openspec/changes/landing-referidos-oa/reports/AAAA-MM-DD-paso-N1-curl.md`. Estado de datos: sin Firestore local, nada que restaurar (dejarlo explícito).

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [x] N+2.1 A 1280 px y 375 px: `/oa` muestra la franja sobre la portada; cerrar la franja, recargar y comprobar que no vuelve; sin scroll horizontal a 375 px; botón cerrar ≥ 44 px.
- [x] N+2.2 Desde `/oa`, enviar el formulario de la portada y comprobar en la red que el cuerpo de `POST /api/leads` incluye `referral: "oa"` y `source: "landing"`; luego, en la misma pestaña, ir a `/diagnostico`, completarlo y comprobar `referral: "oa"` y `source: "diagnostico"`.
- [x] N+2.3 En una pestaña nueva abrir `/` y enviar el formulario: el cuerpo no incluye `referral`. Abrir `/?ref=otro`: sin franja.
- [x] N+2.4 Admin con sesión dev: dashboard con el bloque "Leads por origen" en "—"; `/admin/leads?origen=oa` sin errores y con el filtro "O&A" marcado; bloque "Franja de referidos (O&A)" en el editor y su botón "Usar los textos recomendados".
- [x] N+2.5 Guardar pasos y capturas en `openspec/changes/landing-referidos-oa/reports/AAAA-MM-DD-paso-N2-e2e.md`.

## N+3. Documentación (OBLIGATORIO)

- [x] N+3.1 Actualizar `docs/data-model.md` (`leads.referral` y `content.referidos.oa`), `docs/api-spec.yml` (`LeadInput.referral` con enum `["oa"]`, `SiteContentPartial.referidos`), `docs/ESTADO-PROYECTO.md` (ruta `/oa`, link para el correo de O&A, cómo leer "Leads por origen", límites de la atribución por pestaña) y el estado de HDU-07 en `docs/backlog/prospectos-oa.md`; verificar que las rutas y nombres citados existen.

## R. Revisión adversarial (2026-10-22, agente independiente: PASS WITH GAPS, sin Blocker ni Major)

- [x] R.1 Spec y diseño: franja cerrada "una vez cargada la página" y foco al menú; `/oa` y `/?ref=oa` sin canónica; `/` con `canonical: "/"`; redirección de `/OA` descartada (las redirecciones de Next no distinguen mayúsculas y `/oa` quedaba en bucle); navegación desde `/oa` por el menú (escenario "Del menú a la portada"); texto de `leadOriginText`/`leadReferralLabel`; "entre los últimos 200"; línea del referido en el borrador de `/privacidad`; `openspec validate --strict`.
- [x] R.2 Tests: `app/api/leads/route.test.ts` (diagnóstico referido: se guarda con `referral: "oa"` y `source: "diagnostico"`, se envía el informe y el aviso lleva el referido); `app/page.test.ts` (`generateMetadata`: `noindex` sin canónica con `"oa"` y `["oa"]`; canónica y sin `noindex` con `"otro"` y sin ref; `/oa` sin canónica); `components/landing/LandingPage.test.tsx` (con `getSiteConfig` simulado: sin referido no hay franja y las secciones van en orden; con `"oa"` la franja va antes del menú); foco al cerrar en `ReferralBanner.test.tsx`; texto de privacidad.
- [x] R.3 Código: metadatos de `app/oa/page.tsx` y `app/page.tsx`; "entre los últimos 200" en `app/admin/(panel)/leads/page.tsx`; nota del dashboard con `/?ref=oa`; línea del referido en el borrador de `/privacidad` (`lib/siteConfig.ts`).
- [x] R.4 Docs: `docs/frontend-standards.md` §1 y `docs/project-profile.md` §12 con `/oa`; ESTADO con la navegación desde `/oa` y la limpieza de leads de prueba.
- [x] R.5 Verificar con `npm run lint`, `npx tsc --noEmit`, `npm test` (`--maxWorkers=2`), `npm run build`, curl (`/oa` 200 con `noindex` y sin canónica; `/?ref=oa` igual; `/` y `/?ref=otro` con canónica y sin `noindex`) y E2E `/oa` → "Diagnóstico gratis" del menú → envío con `referral: "oa"`.

## Post-merge (Mauro, en producción)

- [ ] P.1 Abrir https://www.nubolabs.cl/oa y confirmar la franja; en `/admin/config` → "Franja de referidos (O&A)" revisar y guardar los textos.
- [ ] P.2 Confirmar con Mauricio O. que el botón del correo apunta exactamente a `https://www.nubolabs.cl/oa` (en minúsculas: `/OA` da 404) y abrir el link desde un correo de prueba antes del envío.
- [ ] P.3 Tras el primer lead real de la campaña, verificar en `/admin/leads?origen=oa` que aparece con la etiqueta "O&A".
- [ ] P.4 Si se envía un lead de prueba desde `/oa` (en producción o en un preview, que comparten Firestore), borrarlo después en `/admin/leads/<id>` → "Borrar": si no, cuenta como O&A en el dashboard.
- [ ] P.5 Si `/privacidad` tiene texto guardado en Firestore, sumar a mano la línea del referido ("Qué datos guardamos") y validarla con el abogado junto al resto.
