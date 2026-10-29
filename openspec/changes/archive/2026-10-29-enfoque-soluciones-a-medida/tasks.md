## 0. Rama de trabajo

- [x] 0.1 Crear y cambiar a `feature/enfoque-soluciones-a-medida` desde `main` actualizado (`eace7d8`); verificar con `git branch --show-current`. Los archivos sin seguimiento de `ui-ux-pro-max` y `ai-specs/.specboot.json` (instalación de la skill del 2026-10-21) no se tocan ni se incluyen en el commit.

## 1. Pruebas primero (TDD): textos nuevos y regla de vocabulario ampliada (design.md, decisiones 1, 3, 6 y 7)

- [x] 1.1 Actualizar las pruebas de los defaults a los textos de los deltas de `specs/`: `lib/siteConfig.test.ts` (título del hero, etiquetas), `lib/siteConfig.sections.test.ts` (dolores, resultados, título del Enfoque, servicios, pasos del proceso, título de Ejemplos), `lib/siteConfig.casos.test.ts` (casos 1 y 4, título), `lib/siteConfig.confianza.test.ts` (texto puente y compromisos), `lib/siteConfig.cierre.test.ts` (7 preguntas, CTA final), `lib/siteConfig.referidos.test.ts` (texto de /oa) y `lib/leadOptions.test.ts` (etiqueta de `drop_spreadsheets`); verificar que `npm test` falla solo por los textos.
- [x] 1.2 Ampliar la regla de vocabulario en `lib/siteConfig.sections.test.ts` y `components/landing/Home.vocabulario.test.tsx`: sumar `WhatsApp`, `Excel`, `Sheets`, `Google`, `planilla(s)`, `contador(es|a|as)`, `contable(s)` y `contabilidad`; incluir la nota técnica, `nosotros`, `equipo`, `autodiagnostico` y `referidos` en el barrido de los defaults (sin `privacidad` ni `contact`); reemplazar el test "es el lugar de n8n" por "la nota técnica existe, es única, empieza con «Cómo lo hacemos:» y no nombra herramientas"; verificar que la portada contiene el lema; verificar que estos tests fallan con los defaults actuales.
- [x] 1.3 Actualizar las pruebas de componentes y del diagnóstico: `Hero.test.tsx` (título y resalte "tu negocio"), `HeroPanel.test.tsx` (etiqueta "Todo al día" y `aria-label` nuevo), `Results.test.tsx` (títulos; 4 ilustraciones con `aria-hidden`; sin burbujas de chat), `Footer.test.tsx` (frase y enlaces de servicios), `FinalCta.test.tsx`, `Faq.test.tsx` (7 preguntas; "¿Cuánto cuesta?" en la cuarta), `components/admin/ConfigEditor.test.tsx` (7 preguntas al restablecer; botón "Usar los textos recomendados" en Misión y visión), `components/diagnostico/oportunidades.test.ts` (textos de "Control y números"), `lib/email.test.ts` y `app/api/diagnostico/report/route.test.ts` (lema presente, sin "piloto automático"); verificar que fallan.

## 2. Textos por defecto y textos fijos (design.md, decisiones 1, 2, 4, 5 y 6)

- [x] 2.1 Reescribir en `lib/siteConfig.ts` los defaults de hero, confianza, problema, resultados, enfoque, servicios (incluida `notaTecnica`), casos, proceso (incluida la franja de éxito), faq (7), cierre, nosotros, equipo, referidos y la frase del borrador de privacidad ("un asesor de tu empresa"), y la ayuda de `SECTIONS` para `enfoque`, con los textos exactos de `specs/`; verificar que pasan `lib/siteConfig*.test.ts`.
- [x] 2.2 Reescribir en `lib/content.ts`: `siteSlogan` (nuevo), `footerLinks.tagline` y enlaces de servicios, `heroFeed` y `heroFeedMore` (sin WhatsApp ni contador, con tareas de reportes y decisiones), `resultsVisuals` (`followup` en lugar de `chat`; avisos y ecuación nuevos) y `approachExample` (el informe del mes); verificar con `npm test` que pasan `Home.vocabulario.test.tsx` y `siteConfig.sections.test.ts`.
- [x] 2.3 Cambiar en `lib/leadOptions.ts` la etiqueta y el tema de `drop_spreadsheets`, y en `components/diagnostico/oportunidades.ts` el `logro` y el `proximoPaso` de `control`; verificar que pasan `lib/leadOptions.test.ts` y `components/diagnostico/oportunidades.test.ts`.

## 3. Componentes, íconos y metadatos (design.md, decisiones 1, 4 y 5)

- [x] 3.1 `components/landing/HeroPanel.tsx`: subtítulo "Resuelto y al día mientras atendías", etiqueta "Todo al día", `aria-label` "Ejemplo: lo que una solución a tu medida deja resuelto cada día" y tarjeta flotante "Reporte del día listo · Ventas, costos y margen al cierre"; verificar que pasa `HeroPanel.test.tsx` y, en el E2E, que el panel no cambia de alto al rotar.
- [x] 3.2 `components/landing/Results.tsx`: reemplazar `ChatVisual` por `FollowUpVisual` (3 filas con estado, `data-viz`, `aria-hidden`) leyendo `resultsVisuals.followup`; actualizar el comentario de cabecera; verificar que pasa `Results.test.tsx` y el E2E a 1280 y 375 px.
- [x] 3.3 `components/icons.tsx`: `problemIcons = [IconChart, IconClock, IconWallet, IconLayers, IconNote, IconWrench]` y `serviceIcons = [IconWrench, IconZap, IconChart, IconLayers]`; actualizar el comentario de `components/landing/Approach.tsx`; verificar con `npx tsc --noEmit` y en el E2E que cada dolor y servicio muestra su ícono.
- [x] 3.4 Lema en `components/diagnostico/DiagnosticoFlow.tsx` (pie), `lib/report.ts` (cabecera del PDF) y `lib/email.ts` (pie del correo) importando `siteSlogan`; metadatos en `app/layout.tsx` (`description` y Open Graph) y `app/equipo/page.tsx` (`description`); verificar que pasan `lib/email.test.ts`, `app/api/diagnostico/report/route.test.ts` y `components/diagnostico/DiagnosticoFlow.test.tsx`, y en el E2E las metas de `/`.

## 4. Admin (design.md, decisiones 5 y 8)

- [x] 4.1 Actualizar las ayudas de `components/admin/config/ResultadosEditor.tsx` (ilustraciones nuevas), `EnfoqueEditor.tsx` (título nuevo y ejemplo del informe del mes) y `ServiciosEditor.tsx` (nota técnica sin herramientas), y agregar `onReset` con `defaults` a `NosotrosEditor.tsx` (requisito "Textos recomendados en el admin" del delta `landing/contenido-pyme`, escenario "Restablecer Misión y visión"); verificar que pasa `components/admin/ConfigEditor.test.tsx` y, en el E2E de `/admin/config`, que "Usar los textos recomendados" en Misión y visión carga los textos nuevos sin guardar.

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [x] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/enfoque-soluciones-a-medida/reports/2026-10-29-paso-N-verificacion.md` (plantilla de `docs/openspec-tasks-mandatory-steps.md` §5). Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl

- No aplica: el cambio no toca `app/api/**` (el informe y el correo cambian solo un texto, cubierto por sus tests).

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [x] N+2.1 Con `npm run dev` sin `.env.local`, a 1280 px y 375 px: portada completa con los textos nuevos (hero con "tu negocio" resaltado y panel "Todo al día", dolores, "Decides con datos" con la ilustración de seguimiento, Enfoque con el informe del mes, servicios nuevos, ejemplos, proceso, 7 preguntas, CTA final y pie con el lema); sin scroll horizontal a 375 px; capturas por sección.
- [x] N+2.2 Barrido de vocabulario sobre el texto visible de `/` con `browser_evaluate` (`document.body.innerText`, sin excluir la nota técnica): 0 coincidencias de la regex ampliada (jerga + WhatsApp, Excel, Sheets, Google, n8n, Make, planilla, contador, contable, pyme); el lema aparece; `<meta name="description">` y `og:description` con la promesa nueva.
- [x] N+2.3 `/oa` (franja nueva), `/mision-vision` (misión, visión y objetivos nuevos), `/equipo` (historia nueva) y `/diagnostico` (pie con el lema; 18 preguntas intactas; informe descargado con el lema en la cabecera).
- [x] N+2.4 `/admin/config` (sesión dev, sin guardar): las ayudas nuevas de Lo que ganas, Enfoque y Servicios; "Usar los textos recomendados" en Misión y visión carga los textos nuevos y no envía nada; sin datos que restaurar (local sin Firestore).
- [x] N+2.5 Guardar capturas y pasos en `openspec/changes/enfoque-soluciones-a-medida/reports/2026-10-29-paso-N2-e2e.md` (capturas en `reports/e2e/`).

## N+3. Documentación (OBLIGATORIO)

- [x] N+3.1 Actualizar `docs/ESTADO-PROYECTO.md` (fecha, enfoque nuevo, lema, paso post-merge P.0 a P.3), `docs/frontend-standards.md` (tono con el lema nuevo y regla de vocabulario ampliada), `docs/data-model.md` (la nota técnica ya no nombra herramientas), `docs/backlog/prospectos-oa.md` (HDU-11 `enfoque-soluciones-a-medida`, en curso) y `docs/avance.json` (HDU-11 pendiente, sin cambiar el avance publicado); verificar que las rutas citadas existen.

## R. Revisión adversarial (2026-10-29, otra ventana: FAIL, 2 Major y 6 Minor; `reports/2026-10-29-adversarial-review.md`)

- [x] R.1 (Major 1) Spec `landing/hero`: ejemplo que cabe, largos máximos (título 29, detalle 29; el E2E con letra de 20 px bajó el título de 37 a 29), detalle en dos líneas reservadas bajo 640 px y escenario "Tareas que rotan sin cortes"; design.md decisión 10. Verificar con `openspec validate --strict`.
- [x] R.2 (Major 1) `lib/content.ts`: las 12 tareas de `heroFeed` y `heroFeedMore` con título ≤ 29 y detalle ≤ 29 caracteres (incluidas las 4 preexistentes que sobraban a 375 px, decisión D1); `components/landing/HeroPanel.tsx`: detalle `max-sm:line-clamp-2 max-sm:min-h-[2rem] sm:truncate` (decisión D2); `components/landing/HeroPanel.test.tsx`: prueba de largo máximo. Verificar con `npm test` y en el E2E (R.9).
- [x] R.3 (Major 2) Spec `landing/contenido-pyme`: requisito MODIFIED "Textos recomendados en el admin" con Misión y visión y su escenario; referencia en design.md decisión 8 y en la tarea 4.1. Verificar con `openspec validate --strict`.
- [x] R.4 (Minor 3) Spec `landing/contenido-pyme`: excepción ampliada a los textos de los formularios sobre cómo te contactamos (campo, placeholder, error y pantalla de éxito); design.md decisión 2.
- [x] R.5 (Minor 4) Tests: `\bExcel\b`, `\bcontador…\b` y `\bcontables?\b` con límites de palabra, y `\bnube\b` también en el barrido de los defaults (`lib/siteConfig.sections.test.ts`, `components/landing/Home.vocabulario.test.tsx`). Verificar que `npm test` sigue en verde y que "excelente" e "incontables" no disparan la regla.
- [x] R.6 (Minor 5) Comentario de `notaTecnica` en el tipo `SiteContent` (`lib/siteConfig.ts`): cierre de Servicios sin herramientas.
- [x] R.7 (Minor 6) Quitar "Autodiagnóstico" de la lista de secciones a restablecer en P.1, design.md (Migration Plan) y `docs/ESTADO-PROYECTO.md`.
- [x] R.8 (Minor 7 y 8, decisiones D4 y D7) `lib/content.ts`: meta "mañana 10:00" en la ilustración de seguimiento y "Soluciones hechas para ti" en la ecuación; `lib/siteConfig.ts`: visión en dos frases, paso 3 del proceso "Pensado para cómo trabajas…", caso de comercio "Sabes qué productos dejan margen y cuáles no, antes de reponer." y detalle "Clientes · avisado a tiempo"; specs `contenido-pyme` y `casos-por-rubro` y tests actualizados. Verificar con `npm test`.
- [x] R.9 Repetir la verificación: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `openspec validate enfoque-soluciones-a-medida --strict` y E2E (portada a 1093, 1280 y 375 px dejando rotar las 7 tareas con letra base 16 y 20 px sin cortes; "Lo que ganas" a 375 px; `/admin/config` → Misión y visión → "Usar los textos recomendados" sin POST); reportes `reports/2026-10-29-paso-R-verificacion.md` y `reports/2026-10-29-paso-R-e2e.md`.

## Post-merge (Mauro, en producción)

- [ ] P.0 Antes de guardar: copiar el documento `config/site` desde la consola de Firebase como respaldo.
- [ ] P.1 En `/admin/config`: "Usar los textos recomendados" en Inicio (Hero), Confianza, ¿Te suena?, Lo que ganas, Enfoque, Servicios, Ejemplos, Cómo trabajamos, Preguntas frecuentes, CTA final, Franja de referidos (O&A) y Misión y visión (Autodiagnóstico no cambia: no restablecerlo); revisar; "Guardar cambios". Si Privacidad tiene texto guardado, cambiar a mano "tu estudio contable" por "un asesor de tu empresa".
- [ ] P.2 En `/admin/equipo`: pegar la historia nueva del equipo y guardar.
- [ ] P.3 Verificar en https://www.nubolabs.cl la portada, `/oa`, `/mision-vision` y `/equipo` (sin WhatsApp como servicio, sin contador, sin herramientas, con el lema), hacer un diagnóstico de prueba (PDF y correo con el lema) y borrar el lead de prueba.
