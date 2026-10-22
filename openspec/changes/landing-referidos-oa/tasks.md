## 0. Rama de trabajo

- [ ] 0.1 Crear y cambiar a `feature/landing-referidos-oa` desde `main` actualizado (con HDU-01, 03, 02, 10, 04, 06 y 05 ya mezcladas); verificar con `git branch --show-current` y que existen `lib/leads.ts`, `lib/leadOptions.ts` y `lib/siteConfig.ts`.

## 1. Referido en la API (design.md, decisiones 1 y 2) — TDD

- [ ] 1.1 Agregar a `lib/leads.test.ts` los casos de `referral` (debe fallar): `"oa"` se guarda; `" oa "` se recorta; `"xyz"`, `123`, `""` y ausente se omiten sin error; `source` no cambia en ningún caso. Verificar que `npm test` falla en esos casos.
- [ ] 1.2 Agregar `REFERRALS = ["oa"] as const`, el tipo `Referral` y `REFERRAL_LABELS` a `lib/leadOptions.ts`; sumar `referral?: Referral` a `LeadInput` en `types/lead.ts` y la validación a `normalizeLead()` en `lib/leads.ts`. Verificar que `npm test` pasa y `npx tsc --noEmit` no reporta errores.

## 2. Referido en el navegador (decisión 4) — TDD

- [ ] 2.1 Escribir `lib/referral.test.ts` (debe fallar): `parseReferral` acepta `"oa"`, `["oa"]` y `" oa "`; rechaza `"otro"`, `undefined`, `""`, `["x","oa"]`; `readStoredReferral()` devuelve `null` si `sessionStorage` lanza (mock con `// @vitest-environment jsdom` y `vi.spyOn(Storage.prototype, "getItem")`) y si el valor guardado no es válido.
- [ ] 2.2 Implementar `lib/referral.ts` (`REFERRAL_STORAGE_KEY`, `BANNER_CLOSED_KEY`, `parseReferral`, `rememberReferral`, `readStoredReferral`, todo con `try/catch`); verificar que `npm test` pasa.
- [ ] 2.3 En `components/landing/ContactForm.tsx` y `components/diagnostico/DiagnosticoFlow.tsx`, agregar `referral: readStoredReferral() ?? undefined` al payload en el momento del envío; verificar en el E2E (paso N+2) con la pestaña de red de Playwright que el cuerpo incluye `referral` solo tras pasar por `/oa`.

## 3. CMS de la franja (decisión 6) — TDD

- [ ] 3.1 Agregar a `lib/siteConfig.test.ts` (debe fallar): sin `content.referidos` → textos por defecto de la spec; override solo de `titulo` → `texto` por defecto.
- [ ] 3.2 Agregar `referidos.oa { titulo, texto }` al tipo `SiteContent`, a `defaultSiteConfig()` y a `mergeConfig()` en `lib/siteConfig.ts`; verificar que `npm test` pasa.
- [ ] 3.3 Agregar al editor del CMS (en `components/admin/ConfigEditor.tsx` o en el editor por sección que exista tras HDU-02) el bloque "Franja de referidos (O&A)" con los dos campos y "Usar los textos recomendados", y agregar `referidos` a `MANAGED_KEYS` del contenedor `ConfigEditor.tsx` (si no, el guardado la descarta); verificar en el E2E que el botón rellena los campos.

## 4. Entrada `/oa` y franja (decisiones 3 y 5)

- [ ] 4.1 Extraer la composición de `app/page.tsx` a `components/landing/LandingPage.tsx` (server, prop `referral?: Referral`) sin cambiar el orden ni la visibilidad de secciones; verificar con `npm run build` y comparando en el E2E que `/` se ve igual que antes.
- [ ] 4.2 Crear `components/landing/ReferralTracker.tsx` (cliente, sin UI, `rememberReferral` en `useEffect`) y `components/landing/ReferralBanner.tsx` (cliente, según `.ref` de `docs/design/propuesta-web-hdu-08.html` con tokens de HDU-01, botón "Cerrar aviso" ≥ 44 px, estado cerrado en `sessionStorage`); verificar con `npx tsc --noEmit` y en el E2E.
- [ ] 4.3 `app/page.tsx` lee `searchParams` (Promise) y pasa `referral` solo si `parseReferral(ref)` lo valida; crear `app/oa/page.tsx` con `force-dynamic`, `robots: { index: false, follow: true }` y `alternates.canonical: "/"`. Verificar con `curl -s http://localhost:3000/oa | grep -o 'noindex'` y `curl -s "http://localhost:3000/?ref=oa" | grep -c "Osorio"` (≥ 1), y `curl -s "http://localhost:3000/?ref=otro" | grep -c "Bienvenido, cliente"` (0).

## 5. Panel y correo (decisión 7) — TDD

- [ ] 5.1 Escribir `lib/leadStats.test.ts` (debe fallar): `countLeadsByOrigin` con el escenario de la spec (3 formulario/1 O&A, 2 diagnóstico/2 O&A, 4 antiguos → 3/2/3), `createdAt` inválido o ausente no cuenta, borde exacto de 30 días; `filterLeadsByOrigin` para `todos`, `landing`, `diagnostico`, `oa` y un valor desconocido (se trata como `todos`).
- [ ] 5.2 Implementar `lib/leadStats.ts` (puro, sin `server-only`); verificar que `npm test` pasa.
- [ ] 5.3 Dashboard (`app/admin/(panel)/page.tsx`): bloque "Leads por origen (últimos 30 días)" con `countLeadsByOrigin`, "—" sin Firestore. Lista (`app/admin/(panel)/leads/page.tsx`): `searchParams.origen`, `limit(200)`, filtros como enlaces con `aria-current`, etiqueta "O&A" y etiquetas de origen con tokens (sin hex inline). Detalle (`leads/[id]/page.tsx`): "Referido: O&A". Verificar en el E2E con sesión dev (sin Firestore: estado vacío y "—" sin errores).
- [ ] 5.4 `lib/email.ts`: fila "Origen" con el referido; `lib/leadReport.ts`: etiqueta de origen con "· O&A". Verificar con `npx tsc --noEmit` y leyendo el log `[leads]` del curl del paso N+1 (sin Resend el aviso es no-op; se revisa el HTML generado con un test si el helper es puro, o por lectura del código en el reporte).

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [ ] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/landing-referidos-oa/reports/AAAA-MM-DD-paso-N-verificacion.md`. Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl (OBLIGATORIO — el agente lo ejecuta)

- [ ] N+1.1 Con `npm run dev` (sin `.env.local`, nada se persiste), ejecutar contra `POST http://localhost:3000/api/leads`: (a) lead válido de formulario con `referral: "oa"` y consentimiento → 200; (b) mismo lead con `referral: "xyz"` → 200; (c) diagnóstico con `source: "diagnostico"`, `referral: "oa"` y `meta` con `indiceFriccion` → 200; (d) JSON inválido → 400. En (a)–(c) revisar en la consola del servidor que el lead registrado lleva o no `referral` según corresponda y que en (c) se intenta el informe (`[report]`). Más `GET /oa` (200, `noindex`), `GET /?ref=oa` (franja) y `GET /?ref=otro` (sin franja).
- [ ] N+1.2 Guardar comandos, respuestas y extractos de log en `openspec/changes/landing-referidos-oa/reports/AAAA-MM-DD-paso-N1-curl.md`. Estado de datos: sin Firestore local, nada que restaurar (dejarlo explícito).

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [ ] N+2.1 A 1280 px y 375 px: `/oa` muestra la franja sobre la portada; cerrar la franja, recargar y comprobar que no vuelve; sin scroll horizontal a 375 px; botón cerrar ≥ 44 px.
- [ ] N+2.2 Desde `/oa`, enviar el formulario de la portada y comprobar en la red que el cuerpo de `POST /api/leads` incluye `referral: "oa"` y `source: "landing"`; luego, en la misma pestaña, ir a `/diagnostico`, completarlo y comprobar `referral: "oa"` y `source: "diagnostico"`.
- [ ] N+2.3 En una pestaña nueva abrir `/` y enviar el formulario: el cuerpo no incluye `referral`. Abrir `/?ref=otro`: sin franja.
- [ ] N+2.4 Admin con sesión dev: dashboard con el bloque "Leads por origen" en "—"; `/admin/leads?origen=oa` sin errores y con el filtro "O&A" marcado; bloque "Franja de referidos (O&A)" en el editor y su botón "Usar los textos recomendados".
- [ ] N+2.5 Guardar pasos y capturas en `openspec/changes/landing-referidos-oa/reports/AAAA-MM-DD-paso-N2-e2e.md`.

## N+3. Documentación (OBLIGATORIO)

- [ ] N+3.1 Actualizar `docs/data-model.md` (`leads.referral` y `content.referidos.oa`), `docs/api-spec.yml` (`LeadInput.referral` con enum `["oa"]`, `SiteContentPartial.referidos`), `docs/ESTADO-PROYECTO.md` (ruta `/oa`, link para el correo de O&A, cómo leer "Leads por origen", límites de la atribución por pestaña) y el estado de HDU-07 en `docs/backlog/prospectos-oa.md`; verificar que las rutas y nombres citados existen.

## Post-merge (Mauro, en producción)

- [ ] P.1 Abrir https://www.nubolabs.cl/oa y confirmar la franja; en `/admin/config` → "Franja de referidos (O&A)" revisar y guardar los textos.
- [ ] P.2 Confirmar con Mauricio O. que el botón del correo apunta a `https://www.nubolabs.cl/oa` antes del envío.
- [ ] P.3 Tras el primer lead real de la campaña, verificar en `/admin/leads?origen=oa` que aparece con la etiqueta "O&A".
