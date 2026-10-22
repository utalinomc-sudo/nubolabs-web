## 0. Rama de trabajo

- [ ] 0.1 Con `mensaje-principal-pyme` ya mezclado, crear y cambiar a `feature/formulario-minimo-consentimiento` desde `main` actualizado; verificar con `git branch --show-current` y que `lib/siteConfig.ts` existe.

## 1. Opciones y normalización compartidas (design.md, decisiones 1 y 2) — TDD

- [ ] 1.1 Escribir `lib/leadOptions.test.ts` (debe fallar): `GOALS` e `INDUSTRIES` con las claves y etiquetas del diseño; `goalLabel`/`industryLabel` devuelven la etiqueta o `null`; `describeGoals([])` y `describeGoals(["other"])` → `null`; `describeGoals(["sell_more"])` → "vender más"; `describeGoals(["sell_more","collect_on_time"])` → "vender más y cobrar a tiempo"; tres objetivos → "a, b y c". Verificar que `npm test` falla por falta del módulo.
- [ ] 1.2 Implementar `lib/leadOptions.ts` (sin `server-only`) con `GOALS`, `INDUSTRIES`, tipos, helpers, `CONSENT_TEXTS` y `CONSENT_VERSION`; verificar que 1.1 pasa.
- [ ] 1.3 Escribir `lib/leads.test.ts` (debe fallar): `isValidPhone` ("+56 9 1234 5678" sí, "1234" no, 16 dígitos no); `isHoneypotFilled`; `normalizeLead` con: cuerpo no objeto → error; sin nombre o correo; correo inválido; teléfono corto → error de WhatsApp; sin `contactConsent` o con `"true"` string → "Necesitamos tu permiso para contactarte."; lead válido mínimo → `marketingConsent: false`, `consentAt` = `now`, `consentText` solo `contact`, `consentVersion`; `marketingConsent: true` → `consentText.marketing`; `consentText` enviado por el cliente ignorado; `goals` con inválidos y repetidos → solo válidos únicos, campo omitido si queda vacío; `industry` inválido omitido; `source` desconocido → `"landing"`; truncado de largos; `meta` no objeto descartado. Verificar que `npm test` falla.
- [ ] 1.4 Implementar `lib/leads.ts` (`LEAD_SOURCES`, `LeadSource`, validadores, `normalizeLead`) y actualizar `types/lead.ts` (`LeadInput` con `goals?`, `industry?`, `contactConsent?`, `marketingConsent?`, `website?`; `LeadRecord`/`Lead` con los campos de consentimiento); verificar que 1.3 pasa y `npx tsc --noEmit` limpio.

## 2. Endpoint `POST /api/leads` (decisión 3)

- [ ] 2.1 Reescribir `app/api/leads/route.ts` con honeypot → `normalizeLead` → persistencia → efectos, y log sin PII cuando no hay Firebase; verificar con los `curl` del paso N+1 (casos OK, 400 y honeypot) contra `npm run dev`.

## 3. Formulario de la portada (decisión 4)

- [ ] 3.1 Agregar `contactSection` a `lib/content.ts` (eyebrow, título, bajada, 3 "qué te llevas", textos de pasos, errores, éxito y "qué pasa ahora") según `docs/design/propuesta-web-hdu-08.html`; verificar por lectura que no queda copy hardcodeado en el JSX al terminar 3.3.
- [ ] 3.2 Escribir `components/landing/ContactForm.test.tsx` (`// @vitest-environment jsdom`, debe fallar): saltar paso 1 → "Paso 2 de 2"; "Volver" conserva selección y texto; chips con `aria-pressed` (múltiple en objetivos, único y deseleccionable en rubro); envío vacío → 3 errores, foco en nombre y `fetch` no llamado; sin consentimiento → error junto a la casilla y `fetch` no llamado; envío válido → `fetch` con `goals`, `industry`, `contactConsent: true`, `marketingConsent`, `source` y `website: ""`; respuesta 500 → muestra `error` y conserva datos; éxito con `scheduleUrl` → botón "Elegir horario" con `target="_blank"`; éxito sin `scheduleUrl` → "Te escribimos en menos de 24 horas" y sin botón; texto "Conversamos 30 minutos sobre cómo vender más y cobrar a tiempo.".
- [ ] 3.3 Reescribir `components/landing/ContactForm.tsx` (props `source`, `scheduleUrl`; honeypot; foco; estilos con tokens y primitivas) y pasar `scheduleUrl` desde `app/page.tsx` (validando `http(s)://`); verificar que 3.2 pasa y `npm run build` compila.

## 4. Diagnóstico: paso de contacto (decisión 5)

- [ ] 4.1 En `components/diagnostico/DiagnosticoFlow.tsx`: rubro como `<select>` con `INDUSTRIES`, WhatsApp obligatorio, dos casillas con `CONSENT_TEXTS` y enlace a `/privacidad`, validaciones previas al envío con los mismos mensajes, cuerpo con `industry`, `contactConsent`, `marketingConsent`, `meta.rubro = industryLabel(industry)`, y enlace "Privacidad" en su footer; verificar con `npm test` (sin tests rotos de `ahorro.test.ts`) y en el E2E N+2.3.

## 5. Privacidad (decisión 6) — TDD

- [ ] 5.1 Extender `lib/siteConfig.test.ts` (debe fallar): sin `content.privacidad` → default con "mauricio.nubolabs@gmail.com" y "30 días"; `titulo`/`texto` vacíos o con espacios → default; texto propio → se usa.
- [ ] 5.2 Implementar `privacidad` en `lib/siteConfig.ts` (tipo, borrador por defecto de la decisión 6, merge con fallback por campo vacío); verificar que 5.1 pasa.
- [ ] 5.3 Crear `app/privacidad/page.tsx` (servidor, `force-dynamic`, Nav + Footer, párrafos por líneas en blanco, sin `dangerouslySetInnerHTML`) y el enlace "Privacidad" en `components/landing/Footer.tsx`; verificar con `curl -s http://localhost:3000/privacidad | grep -c "30 días"` ≥ 1.
- [ ] 5.4 En `components/admin/ConfigEditor.tsx` y `app/admin/(panel)/config/page.tsx`: bloque "Privacidad" (título y texto) con "Usar los textos recomendados"; verificar en el E2E N+2.4 que el botón rellena los campos.

## 6. Correo, ficha PDF y admin (decisión 7)

- [ ] 6.1 `lib/email.ts`: filas "Rubro", "Quiere lograr" y "Novedades" en `sendLeadNotification`, y `app/api/leads/route.ts` le pasa esos campos; verificar con `npx tsc --noEmit` y leyendo el HTML generado en un test rápido o en el log de desarrollo (sin `RESEND_API_KEY` no se envía nada).
- [ ] 6.2 `lib/leadReport.ts`: rubro con etiqueta (o `meta.rubro`), filas "Quiere lograr" y "Novedades", mensaje también en leads con áreas; verificar generando un PDF con `buildLeadDetailPdf` desde un test de humo en `lib/leadReport.test.ts` (devuelve bytes `%PDF` para un lead nuevo y uno antiguo sin campos).
- [ ] 6.3 `app/admin/(panel)/leads/page.tsx` y `leads/[id]/page.tsx`: rubro bajo la empresa, pastilla "Novedades", secciones "Lo que quiere lograr" y "Consentimientos", hex reemplazados por tokens; verificar con `npm run build` y en el E2E N+2.4 (con sesión dev y sin Firebase la lista muestra "Firebase aún no está configurado"; el render con datos se valida en el preview de Vercel, paso P.2).

## 7. Variables y enlaces

- [ ] 7.1 Agregar `NEXT_PUBLIC_SCHEDULE_URL` a `.env.local.example` con comentario (pública, se fija en build, URL `https://` de Calendly u otra; si falta, el formulario dice "Te escribimos en menos de 24 horas"); verificar con `grep NEXT_PUBLIC_SCHEDULE_URL .env.local.example`.

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [ ] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/formulario-minimo-consentimiento/reports/AAAA-MM-DD-paso-N-verificacion.md`. Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl (OBLIGATORIO — el agente lo ejecuta)

- [ ] N+1.1 Con `npm run dev` (sin `.env.local`: nada se persiste ni se envía), ejecutar contra `POST http://localhost:3000/api/leads` y guardar comandos y respuestas en `reports/AAAA-MM-DD-paso-N1-curl.md`:
  - lead válido mínimo (`name`, `email`, `phone`, `contactConsent: true`) → 200 `{ ok: true, persisted: false }`;
  - sin `contactConsent` → 400 "Necesitamos tu permiso para contactarte.";
  - `contactConsent: "true"` (string) → 400;
  - `phone: "1234"` → 400;
  - correo inválido → 400; sin nombre → 400;
  - `goals: ["sell_more","hackear","sell_more"]`, `industry: "mineria"`, `source: "x"` → 200 (el log de desarrollo muestra 1 objetivo, sin industria y origen `landing`, sin PII);
  - campo `website: "spam"` → 200 `persisted: false` y log `[leads] honeypot`;
  - cuerpo `{no json` → 400 "JSON inválido.".
  Estado de datos: sin Firestore local, no hay nada que restaurar (dejar constancia).

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [ ] N+2.1 Portada a 1280 y 375 px: saltar paso 1, volver, elegir objetivos y rubro; errores al salir de cada campo y al enviar vacío; sin consentimiento no envía; envío válido muestra el éxito con el texto de objetivos; sin `NEXT_PUBLIC_SCHEDULE_URL` no aparece el botón; sin scroll horizontal a 375 px; campos y botones ≥ 44 px; flujo completo solo con teclado.
- [ ] N+2.2 Repetir el éxito con `NEXT_PUBLIC_SCHEDULE_URL=https://example.com/agenda` en el arranque de `npm run dev` y comprobar el botón "Elegir horario" con `target="_blank"`.
- [ ] N+2.3 `/diagnostico`: responder todo, intentar enviar sin consentimiento (error), luego con WhatsApp, rubro y consentimiento → confirmación y descarga del PDF como hoy; enlace "Privacidad" en el footer.
- [ ] N+2.4 `/privacidad` muestra el borrador; en `/admin/config` (sesión dev) el bloque Privacidad y "Usar los textos recomendados" rellenan los campos; `/admin/leads` carga sin errores.
- [ ] N+2.5 Guardar capturas y pasos en `reports/AAAA-MM-DD-paso-N2-e2e.md`. Sin datos que restaurar (sin Firestore local).

## N+3. Documentación (OBLIGATORIO)

- [ ] N+3.1 Actualizar `docs/api-spec.yml` (`LeadInput` con `phone` y `contactConsent` obligatorios, `goals`, `industry`, `marketingConsent`, `website`; respuestas 400 nuevas; respuesta honeypot), `docs/data-model.md` (campos nuevos de `leads` y `content.privacidad`), `.env.local.example`, `docs/integration-standards.md` (fila de agenda con `NEXT_PUBLIC_SCHEDULE_URL`), `docs/project-profile.md` §4, `docs/frontend-standards.md` (estructura: `lib/leadOptions.ts`, `lib/leads.ts`, `/privacidad`), `docs/ESTADO-PROYECTO.md` (fecha, qué cambió, pasos post-merge) y el estado de HDU-03 en `docs/backlog/prospectos-oa.md`; verificar que las rutas y nombres citados existen.

## Post-merge (Mauro, en producción)

- [ ] P.1 Definir `NEXT_PUBLIC_SCHEDULE_URL` en Vercel (Production y Preview) cuando exista la agenda y redeployar; confirmar que el botón "Elegir horario" aparece tras un envío.
- [ ] P.2 En el preview o en producción, enviar un lead de prueba con un correo propio, revisar el aviso por correo, el detalle del admin y la ficha PDF, y **borrarlo** desde el admin ("Eliminar"); dejar constancia en `docs/ESTADO-PROYECTO.md`.
- [ ] P.3 Revisar el borrador de `/privacidad` desde `/admin/config` y pedir su validación a O&A o a un abogado antes del 1-dic-2026.
