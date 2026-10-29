## Context

Motivación en `proposal.md`; textos finales en los deltas de `specs/`. Estado actual del código que este cambio toca:

- **Textos por defecto del CMS** en `defaultSiteConfig()` (`lib/siteConfig.ts`): hero, confianza, problema, resultados, enfoque, servicios (con `notaTecnica`), casos, cifras, proceso, autodiagnostico, faq, cierre, contact, nosotros, equipo, privacidad y referidos. `mergeConfig()` mezcla lo guardado en `config/site` sobre esos defaults; **todo lo que producción tenga guardado gana** (hero, servicios, casos y probablemente las secciones que Mauro restableció y guardó el 2026-10-22).
- **Textos fijos** en `lib/content.ts`: menú (`nav`), pie (`footerLinks`), tarjeta de WhatsApp, panel del hero (`heroFeed`, `heroFeedMore`), ilustraciones de "Lo que ganas" (`resultsVisuals`), ejemplo antes/después del Enfoque (`approachExample`), rótulos y formulario (`contactSection`).
- **Textos escritos en componentes:** `components/landing/HeroPanel.tsx` (título, subtítulo, etiqueta "Piloto automático", tarjetas flotantes, `aria-label`), `components/diagnostico/DiagnosticoFlow.tsx` (pie "Tu operación, en piloto automático."), `lib/report.ts` (cabecera del PDF), `lib/email.ts` (pie del correo), `app/layout.tsx` y `app/equipo/page.tsx` (metadatos).
- **Ilustraciones por posición:** `components/landing/Results.tsx` (`VISUALS = [ChatVisual, BarsVisual, ChecksVisual, GrowVisual]`), `components/icons.tsx` (`problemIcons`, `serviceIcons`, `promiseIcons`).
- **Opciones del formulario:** `GOALS` en `lib/leadOptions.ts` (clave persistida + etiqueta + tema para la pantalla de éxito). `drop_spreadsheets` se guarda en `leads.goals` y lo muestran el correo interno, el admin y la ficha PDF vía `goalLabel()`.
- **Mapa de oportunidades:** `DIMENSIONS` en `components/diagnostico/oportunidades.ts` (textos `logro` y `proximoPaso`), usados por `/diagnostico`, el PDF, el correo y el bloque "Autodiagnóstico" de la portada.
- **Pruebas que fijan los textos:** `lib/siteConfig*.test.ts`, `components/landing/*.test.tsx` (incluido el barrido `Home.vocabulario.test.tsx`), `lib/leadOptions.test.ts`, `components/diagnostico/oportunidades.test.ts`, `components/admin/ConfigEditor.test.tsx`, `lib/email.test.ts` y `app/api/diagnostico/report/route.test.ts`.
- **Admin:** un editor por sección en `components/admin/config/`; `NosotrosEditor` es el único sin "Usar los textos recomendados".

## Goals / Non-Goals

**Goals:**
- Una sola fuente de los textos nuevos (los deltas de `specs/`) reflejada en defaults, textos fijos, tests y admin, sin tocar estructura, estilos ni datos.
- Que la regla de vocabulario (tests) impida que vuelvan WhatsApp como servicio, el contador, las planillas y las herramientas nombradas.
- Que Mauro pueda cargar los textos nuevos en producción solo con "Usar los textos recomendados" en cada sección.

**Non-Goals:**
- Migrar o escribir `config/site` por script (ver Migration Plan).
- Cambiar el diseño visual: solo cambian los textos de las ilustraciones, una ilustración (seguimiento de venta en lugar de chat) y los íconos por posición.
- Tocar `cuestionario.ts`, `ahorro.ts`, el cálculo del mapa, los endpoints o los tipos persistidos.

## Decisions

### 1. Un lema nuevo para todo el sitio
"Tu operación, en piloto automático" se reemplaza por **"Soluciones a tu medida, decisiones con datos."** en los 5 lugares donde aparece: eyebrow por defecto de la CTA final (`content.cierre.eyebrow`, editable), frase del pie (`footerLinks.tagline` en `lib/content.ts`, fija), pie de `/diagnostico`, cabecera del PDF (`lib/report.ts`) y pie del correo (`lib/email.ts`). Se centraliza en `lib/content.ts` como `siteSlogan` y los tres últimos lo importan, para que el próximo cambio de lema sea un solo punto. *Alternativa descartada:* dejar el lema viejo en PDF y correo "porque son del diagnóstico": contradiría el enfoque en el único documento que el cliente se guarda.

### 2. El canal WhatsApp de contacto no cambia
El pedido es no vender la automatización de WhatsApp. El campo WhatsApp del formulario y de `/diagnostico`, los textos de la pantalla de éxito ("Te contactamos por WhatsApp o correo"), el número en el pie y la tarjeta con QR (configurables y apagados por defecto, `landing/cierre`) siguen igual: son datos de contacto de Nubolabs, no un servicio. Las pruebas de vocabulario los excluyen por construcción: el barrido de la portada se hace con los defaults (interruptores apagados y el formulario en el paso 1), y el barrido de los defaults no incluye `contactSection` ni `whatsappCard`. La excepción de la spec (`landing/contenido-pyme`) cubre explícitamente los textos de los formularios sobre cómo te contactamos: etiqueta y placeholder del campo WhatsApp, el mensaje de error "Revisa el WhatsApp…" y la pantalla de éxito "Te contactamos por WhatsApp o correo" (hallazgo 3 de la revisión adversarial).

### 3. Vocabulario: la nota técnica deja de ser la excepción
`FORBIDDEN_CI` de `lib/siteConfig.sections.test.ts` y de `components/landing/Home.vocabulario.test.tsx` suma `WhatsApp`, `Excel`, `Sheets`, `Google`, `planilla(s)`, `contador(es|a|as)`, `contable(s)` y `contabilidad`; `n8n` y `Make` ya estaban. Se quita la exclusión de `[data-nota-tecnica]` en el barrido y el test "la nota técnica es el lugar de n8n" pasa a comprobar que la nota existe, es única, empieza con "Cómo lo hacemos:" y no nombra herramientas. El barrido de los defaults suma `nosotros`, `equipo`, `autodiagnostico` y `referidos`; excluye `privacidad` (nombra a Vercel, Google Firebase y Resend por transparencia legal y el campo WhatsApp como dato guardado) y `contact` (número). *Alternativa descartada:* una lista aparte de "herramientas" con excepción por sección; una sola regla es más fácil de mantener y de leer en la spec.

### 4. Ilustración de "Vendes más": seguimiento de una venta
`ChatVisual` (burbujas de chat con "respuesta automática") se reemplaza por `FollowUpVisual`: tres filas con punto de estado (consulta recibida · 9:40 ✓, cotización enviada · 10:12 el mismo día ✓, seguimiento al cliente · mañana 10:00; el meta corto y la fila con `flex-wrap` evitan que el texto se parta en tres líneas a 375 px: si no cabe, la hora baja a una segunda línea alineada a la derecha, hallazgo 7 de la revisión), con los textos en `resultsVisuals.followup` (`lib/content.ts`), `data-viz` y `aria-hidden="true"` como las demás. Las otras tres ilustraciones conservan su forma; cambian textos ("Vencimiento del contrato · avisa 10 días antes" en vez de "Declaración mensual · avisa el día 10"; "Soluciones hechas para ti" en la ecuación, para no repetir "a tu medida"). *Alternativa descartada:* mantener el chat con otro texto: sigue leyéndose como "respondemos tus mensajes por ti".

### 5. Íconos por posición
Los dolores y los servicios cambian de contenido, así que se reasignan los íconos existentes (sin dibujar nuevos): `problemIcons = [IconChart, IconClock, IconWallet, IconLayers, IconNote, IconWrench]` y `serviceIcons = [IconWrench, IconZap, IconChart, IconLayers]`. `promiseIcons` e `includeIcons` siguen igual. La ayuda de `ResultadosEditor` describe las ilustraciones nuevas.

### 6. Etiqueta del objetivo `drop_spreadsheets`
La clave se conserva (`GoalKey` está persistida en `leads.goals` y en `docs/api-spec.yml`); cambian `label` ("Resolver un problema puntual de mi operación") y `topic` ("resolver un problema puntual de tu operación"). Los leads antiguos con esa clave pasan a mostrarse con la etiqueta nueva en correo, admin y ficha; se acepta porque el sitio lleva una semana en producción y la clave no cambia. *Alternativa descartada:* una clave nueva `solve_specific` con la vieja oculta en el formulario: exige filtrar `GOALS` en el formulario, el admin y los tests por un dato casi sin uso.

### 7. Siete preguntas frecuentes
Se suma "¿Es una solución estándar o hecha para mi negocio?" en la segunda posición (después de "¿Necesito saber de tecnología?") y "¿Tengo que cambiar mis sistemas?" deja de nombrar herramientas. Las pruebas que contaban 6 (`Faq.test.tsx`, `ConfigEditor.test.tsx`, `siteConfig.cierre.test.ts`) pasan a 7 y la de datos personales queda en el índice 6.

### 8. "Usar los textos recomendados" en Misión y visión
`NosotrosEditor` recibe `defaults` (ya viene en `EditorProps`) y pasa `onReset` a `SectionCard`, igual que los demás editores. Sin esto, Mauro tendría que pegar misión, visión y 5 objetivos a mano en producción. El comportamiento queda en la spec: el delta de `landing/contenido-pyme` modifica el requisito "Textos recomendados en el admin" para sumar Misión y visión, con su escenario (hallazgo 2 de la revisión adversarial). La historia del equipo se edita en `/admin/equipo` (`TeamEditor`) y no tiene restablecer: el texto nuevo queda en el default del código y en el paso post-merge para pegarlo.

### 9. Qué se mantiene a propósito
- "Nubolabs — AI & Automation Agency" como título del documento (marca; `landing/hero` lo exige).
- Las 18 preguntas del cuestionario, que describen la realidad del cliente ("repartida entre correos, carpetas, chats y planillas") y no lo que Nubolabs ofrece; cambiarlas rompería la comparación con los diagnósticos guardados.
- El bloque "Autodiagnóstico" y la frase de Cifras: ya hablan de oportunidades e indicadores.
- `Nubolabs Landing (standalone).html` en la raíz del repo: prototipo de julio, no se publica.

### 10. Tareas del panel que caben en cualquier ancho (hallazgo 1 de la revisión adversarial)
Medido por el revisor: a 1093 px el título útil mide 258 px y a 1280 px 316 px; a 375 px el detalle mide 179 px. El revisor midió 37 caracteres como límite del título con letra de 16 px; el E2E de esta sesión mostró que con letra base de 20 px a 1093 px un título de 33 ya se corta y que a 375 px un título de 27 a 29 puede necesitar tres líneas, así que el límite queda en **29 caracteres para el título** (los más largos, como "Cotización lista y enviada", caben en dos líneas a 375 px con letra de 20 px) y **29 para el detalle** ("Cobranza · factura por vencer" cabe justo a 375 px con letra de 16 px). Se aplican a las 12 tareas, también a las 4 preexistentes que sobraban a 375 px (decisión D1: mismo archivo, mismo E2E). Para la letra base de 20 px en móvil (D2, opción recomendada), el detalle pasa de una línea truncada a `line-clamp-2` con alto reservado de dos líneas bajo 640 px (`max-sm:line-clamp-2 max-sm:min-h-[2rem]`), como ya hace el título; desde 640 px sigue en una línea (`sm:truncate`). Así el panel no cambia de alto al rotar y ningún texto se corta en las combinaciones medidas (1024, 1093 y 1280 px con letra de 16 px; 1093, 1280 y 375 px con letra de 20 px). Límite conocido y escrito en la spec: a 1024 px con letra de 20 px el panel mide 371 px y casi todos los detalles terminan en puntos suspensivos (truncado, sin desborde); cubrirlo exigiría reservar dos líneas también en escritorio y haría el hero mucho más alto. `HeroPanel.test.tsx` fija los largos máximos. *Alternativa descartada:* acortar todo a ~22 caracteres (los textos dejan de decir algo) o acotar la spec a los títulos.

### 11. Textos sobre avisos y recordatorios (decisión D4)
Se mantienen "Cobranza con recordatorios amables y automáticos." y "Aviso al cliente cuando su auto está listo y recordatorio de su próxima mantención.": son avisos operativos de una solución a medida, no mensajería automática como servicio. Se cambian el caso de comercio "Clientes que vuelven con mensajes según lo que compraron." por "Sabes qué productos dejan margen y cuáles no, antes de reponer." (más cerca de decidir con datos) y el detalle "Clientes · mensaje enviado" por "Clientes · avisado a tiempo".

### 12. Copy: repeticiones y visión (hallazgo 8 y decisión D7, versión mínima)
Sin tocar el eje: la visión se parte en dos frases; el paso 3 del proceso dice "Pensado para cómo trabajas…" y la ecuación de "Lo que ganas" "Soluciones hechas para ti", para que "a tu medida" no aparezca en cada bloque. Las demás repeticiones quedan para que Mauro decida si retocarlas en otro cambio.

### Decisiones D3, D5 y D6 de la revisión
- D3: se mantiene la etiqueta nueva con la clave `drop_spreadsheets` (decisión 6).
- D5: el cuestionario sigue nombrando "planillas" en 2 preguntas (decisión 9).
- D6: `/admin/equipo` sigue sin "Usar los textos recomendados"; la historia nueva se pega a mano (P.2).

### Degradación
Sin Firebase, `getSiteConfig()` devuelve los defaults nuevos. Resend y Blob no participan (el lema del correo solo cambia el HTML que ya se arma). Si Firestore tiene textos guardados, se ven esos hasta que Mauro los restablezca: la portada nunca queda rota, solo desactualizada.

## Risks / Trade-offs

- [Producción sigue mostrando los textos viejos porque `config/site` tiene secciones guardadas que ganan sobre los defaults] → paso post-merge explícito (P.0 respaldo, P.1 "Usar los textos recomendados" en cada sección y guardar, P.2 historia del equipo), con revisión de la portada, `/oa`, `/mision-vision` y `/equipo` en producción.
- [El preview de Vercel comparte Firestore con producción: guardar en el admin del preview cambia producción con el código viejo aún en `main`] → en los previews no se guarda contenido; el E2E del admin intercepta el `POST` o solo comprueba el formulario sin guardar.
- [Un lead antiguo con `drop_spreadsheets` se lee como "Resolver un problema puntual de mi operación"] → aceptado (decisión 6); queda escrito en la spec `leads/formulario-contacto`.
- [La regla de vocabulario nueva rompe textos legítimos] → la prueba excluye `privacidad` y `contact`, y la spec deja la excepción del canal de contacto por escrito.
- [El lema nuevo cambia el PDF y el correo que ya reciben clientes] → es texto decorativo de cabecera y pie; el contenido del informe no cambia.
- [El brochure PDF y la imagen del correo de O&A (fuera del repo) quedan con el enfoque viejo] → se informa a Mauro como pendiente; no son parte del sitio.

## Migration Plan

0. Antes de cualquier guardado en producción, copiar el documento `config/site` desde la consola de Firebase como respaldo.
1. Mezclar a `main` tras el preview aprobado por Mauro (deploy automático). En el preview no se guarda contenido (Firestore compartido).
2. En `/admin/config` de producción: "Usar los textos recomendados" en Inicio (Hero), Confianza, ¿Te suena?, Lo que ganas, Enfoque, Servicios, Ejemplos, Cómo trabajamos, Preguntas frecuentes, CTA final, Franja de referidos (O&A) y Misión y visión (Autodiagnóstico no cambia en este cambio, decisión 9: no restablecerlo para no pisar textos propios); revisar; "Guardar cambios". Si `/privacidad` tiene texto guardado, cambiar a mano "tu estudio contable" por "un asesor de tu empresa" (y volver a validarlo con el abogado).
3. En `/admin/equipo`: pegar la historia nueva del equipo (texto en `defaultSiteConfig().content.equipo.historia`) y guardar.
4. Verificar en producción `/`, `/oa`, `/mision-vision`, `/equipo` y un diagnóstico de prueba (PDF y correo con el lema nuevo); borrar el lead de prueba.
5. Rollback: revertir el commit. Los defaults vuelven a los textos anteriores; lo guardado en Firestore en el paso 2 (textos nuevos) seguiría ganando hasta restablecerlo de nuevo, porque el código anterior tiene los mismos campos.
