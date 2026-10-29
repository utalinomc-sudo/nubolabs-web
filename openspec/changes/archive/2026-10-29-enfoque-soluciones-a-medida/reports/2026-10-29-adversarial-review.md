# Revisión adversarial — enfoque-soluciones-a-medida (HDU-11)

- Fecha: 2026-10-29
- Revisor: sesión independiente de Claude Code (otra ventana), con `/adversarial-review`
- Veredicto recibido: **FAIL (2 Major, 6 Minor)**
- Resolución en esta sesión: sección R de `tasks.md` (R.1 a R.9); textos nuevos en los deltas de `specs/` y en `design.md` (decisiones 10 a 12 y D3/D5/D6)

## Resolución

| # | Hallazgo | Qué se hizo |
|---|---|---|
| 1 | Major · tareas del panel "Tu negocio hoy" cortadas (título a 1093/1280 px, detalles a 375 px y con letra 20 px) | Spec `landing/hero`: ejemplo que cabe, largos máximos (título ≤ 37, detalle ≤ 29), detalle en dos líneas reservadas bajo 640 px y escenario "Tareas que rotan sin cortes". `lib/content.ts`: las 12 tareas acortadas, incluidas las 4 preexistentes (D1). `HeroPanel.tsx`: detalle `max-sm:line-clamp-2 max-sm:min-h-[2rem] sm:truncate` (D2, opción recomendada). `HeroPanel.test.tsx`: prueba de largos máximos. E2E a 1093, 1280 y 375 px dejando rotar las 7 tareas con letra 16 y 20 px |
| 2 | Major · "Usar los textos recomendados" en Misión y visión sin spec | Delta `landing/contenido-pyme`: requisito MODIFIED "Textos recomendados en el admin" con Misión y visión y el escenario "Restablecer Misión y visión"; referencia en design.md decisión 8 y en la tarea 4.1 |
| 3 | Minor · excepción del canal de contacto demasiado corta | Delta `landing/contenido-pyme` (regla de vocabulario y requisito del enfoque): la excepción cubre etiqueta y placeholder del campo WhatsApp, su mensaje de error y la pantalla de éxito; design.md decisión 2 |
| 4 | Minor · regex frágil (`Excel` sin `\b`, `contables?` sin `\b` inicial, `\bnube\b` solo en la portada) | `\bExcel\b`, `\bcontador…\b`, `\bcontables?\b` y `\bnube\b` en los dos tests; prueba nueva de que "excelente", "incontables" y "nubecita" no disparan la regla y "Excel", "contador", "contables" y "nube" sí |
| 5 | Minor · comentario desactualizado de `notaTecnica` | Comentario del tipo `SiteContent` en `lib/siteConfig.ts` reescrito |
| 6 | Minor · "Autodiagnóstico" en las listas de restablecer | Quitado de P.1 (`tasks.md`), del Migration Plan (`design.md`) y de `docs/ESTADO-PROYECTO.md` |
| 7 | Minor · "Seguimiento al cliente" en 3 líneas a 375 px | Meta "mañana 10:00" en `resultsVisuals.followup`; design.md decisión 4 |
| 8 | Minor · repeticiones de "a tu medida" / "datos para decidir" y visión de 60 palabras | Versión mínima (D7): visión en dos frases, paso 3 del proceso "Pensado para cómo trabajas…", ecuación "Soluciones hechas para ti"; deltas y tests actualizados. El resto queda para que Mauro decida |

Decisiones tomadas en esta sesión (Mauro puede revertirlas): D1 acortar también los textos preexistentes; D2 detalle en dos líneas en móvil; D3 mantener la etiqueta nueva con la clave `drop_spreadsheets`; D4 mantener los avisos operativos y cambiar el caso de comercio ("Sabes qué productos dejan margen y cuáles no, antes de reponer.") y el detalle "Clientes · avisado a tiempo"; D5 mantener "planillas" en el cuestionario; D6 sin botón en `/admin/equipo`; D7 retoque mínimo.

## Texto recibido (verbatim)

```
RESULTADO DE LA REVISIÓN ADVERSARIAL - enfoque-soluciones-a-medida (HDU-11)
Rama feature/enfoque-soluciones-a-medida vs main eace7d8. Revisado: proposal, design, tasks, 8 deltas,
reportes N y N+2, git diff main completo. Verificación propia: lint, tsc y npm test (377) en verde;
mediciones con Playwright del panel del hero a 1093/1280/375 px con letra base 16 y 20 px.

VEREDICTO: FAIL (2 Major, 6 Minor). Archivar solo después de corregir los Major.

HALLAZGOS

1. [Major] Tareas del panel "Tu negocio hoy" cortadas (spec hero, delta línea 34 "ninguna tarea visible
   MUST quedar cortada a ningún ancho entre 320 y 1440 px ni con letra aumentada" y escenario línea 52).
   Caso (medido, texto inyectado en la primera fila; el ancho útil del título es 258 px a 1093 y 316 px
   a 1280; el del detalle es 179 px a 375/16 px):
   - lib/content.ts:99 "Consulta de cliente con responsable asignado" (44 car.): título cortado con "…"
     a 1093 px y a 1280 px (line-clamp-1 de HeroPanel.tsx:131). Captura: ../.playwright-mcp/evidencia-1280-titulo-cortado.png
   - lib/content.ts:86 "Decisiones · ventas, costos y margen al cierre" (46 car.): detalle cortado a
     375 px (258/179 px; se ve "…costos y ma…" en reports/e2e/03-portada-375-completa.png) y a 1280 px
     con letra 20 px (322/286). Es una de las 5 tareas iniciales: se ve cortada en cada carga móvil.
   - lib/content.ts:89 y :94 (detalles de 38 y 40 car.): cortados a 375 px (220 y 248 sobre 179).
   - lib/content.ts:99 detalle "Clientes · seguimiento mañana 10:00": cortado a 375 px (211/179).
   Preexistente (no lo introdujo este cambio, pero el requisito se reescribe en este delta): a 375/16 px
   también sobran "Ventas · el mismo día que la pidió" (186/179), "Ventas · repuestos y mano de obra",
   "Cobranza · conciliado con la factura" y "Bodega · esperando tu visto bueno"; con letra 20 px a 375
   casi todos los detalles y 3 títulos sobran. Ver decisión 2.
   Corrección: (a) spec hero, línea 34: cambiar el ejemplo por uno que quepa; (b) lib/content.ts: títulos
   de hasta ~37 caracteres (el límite medido es "Aviso: el auto del cliente está listo") y detalles de
   hasta ~29 ("Cobranza · factura por vencer" cabe justo a 375 px), p. ej. "Consulta con responsable
   asignado", "Decisiones · margen al cierre", "Decisiones · antes de reponer", "Decisiones · vs. el mes
   pasado", "Clientes · seguimiento mañana"; (c) HeroPanel.test.tsx: sumar una prueba de largo máximo
   de título y detalle; (d) E2E a 1093 y 375 px esperando que roten las 7 tareas de heroFeedMore.

2. [Major] Comportamiento sin spec: "Usar los textos recomendados" en Misión y visión
   (components/admin/config/NosotrosEditor.tsx:20; test en components/admin/ConfigEditor.test.tsx:323;
   proposal, criterio "Textos recomendados en todas las secciones"; design.md decisión 8).
   Caso: el requisito vigente openspec/specs/landing/contenido-pyme/spec.md:92 "Textos recomendados en el
   admin" enumera las secciones con el botón y no incluye Misión y visión; ningún delta lo modifica, así
   que al archivar la spec no describirá el botón ni el escenario.
   Corrección: en specs/landing/contenido-pyme/spec.md del cambio, agregar "### Requirement: Textos
   recomendados en el admin" bajo MODIFIED, con el texto vigente más "y Misión y visión" y un escenario:
   WHEN el admin pulsa el botón en "Misión y visión" THEN misión, visión y objetivos vuelven a los
   defaults, nada se guarda, y al guardar se envía solo content.nosotros. Referenciarlo en design 8 y en
   la tarea 4.1.

3. [Minor] Spec: la excepción del canal de contacto (delta contenido-pyme, línea 4) cubre solo "número y
   QR" y "la etiqueta del campo WhatsApp". Quedan fuera, aunque design.md decisión 2 los ampara:
   lib/content.ts:241 "Revisa el WhatsApp…", lib/content.ts:256 "Te contactamos por WhatsApp o correo" y
   el placeholder de components/diagnostico/DiagnosticoFlow.tsx:400.
   Corrección: ampliar la excepción a "los textos de los formularios sobre cómo te contactamos (campo,
   placeholder, error y pantalla de éxito)".

4. [Minor] Tests: regla de vocabulario frágil en lib/siteConfig.sections.test.ts:171 y
   components/landing/Home.vocabulario.test.tsx:30. `Excel` sin `\b` rechaza "excelente/excelencia";
   `contables?\b` sin `\b` inicial rechaza "incontables"; `\bnube\b` está solo en el test de la portada.
   Corrección: `\bExcel\b`, `\bcontables?\b` y sumar `\bnube\b` al barrido de los defaults.

5. [Minor] Comentario desactualizado en lib/siteConfig.ts:88 ("único lugar de la portada donde se nombran
   herramientas"). Corrección: describir la nota técnica como cierre de Servicios sin herramientas.

6. [Minor] tasks.md:55 (P.1) y design.md:74 (Migration Plan paso 2) piden restablecer "Autodiagnóstico",
   pero design.md:55 (decisión 9) dice que ese bloque no cambia; restablecerlo pisaría sin motivo textos
   propios guardados en producción. Corrección: quitarlo de ambas listas (y de ESTADO-PROYECTO.md y
   prospectos-oa.md, que repiten la lista).

7. [Minor] Results a 375 px: en la ilustración de "Vendes más", "Seguimiento al cliente" queda en 3 líneas
   ("al" solo) porque el meta "mañana 10:00 · programado" (lib/content.ts:111) es flex-none
   (components/landing/Results.tsx:47). Corrección: meta "mañana 10:00" o permitir que el meta baje de
   línea bajo 640 px; design.md decisión 4 nombra el texto, actualizarlo ahí.

8. [Minor] Copy: "a tu medida / a su medida" unas 12 veces en la portada (etiqueta del hero, paso 2 del
   Enfoque, servicio 1, paso 3 del proceso, ecuación de "Lo que ganas" en lib/content.ts:125, enlace y
   frase del pie, CTA final, aria-label del panel, metadatos) y "datos para decidir / decides con datos /
   decisiones con datos" unas 15. La visión (lib/siteConfig.ts:393) es una frase de 60 palabras con dos
   ideas mal unidas ("Ser el socio… y que decidir con buenos datos deje de ser un lujo"). Sugerencia:
   variar 3 o 4 (proceso paso 3 "Pensado para cómo trabajas", ecuación "Soluciones hechas para ti") y
   partir la visión en dos frases. Solo si Mauro quiere: cambia specs y tests.

DECISIONES PARA MAURO
D1. Hallazgo 1, textos preexistentes que también sobran a 375 px (4 detalles viejos): ¿se acortan en este
    cambio (recomendado: mismo archivo, mismo E2E) o quedan como pendiente?
D2. Hallazgo 1, escenario "letra 20 px a 375 px": hoy casi todo sobra, viejo y nuevo. Opciones: acortar
    todo a ~22 caracteres (poco realista), permitir que el detalle baje a 2 líneas en móvil reservando
    el alto (cambio de CSS en HeroPanel.tsx:134), o acotar el escenario de la spec a los títulos.
    Recomendación: la segunda.
D3. Objetivo drop_spreadsheets con etiqueta nueva (design 6): aceptable; los leads de la última semana
    con esa clave se verán como "Resolver un problema puntual de mi operación" en la lista del admin, el
    correo interno y la ficha PDF. Si quieres fidelidad histórica, la alternativa es una clave nueva.
D4. Textos que siguen vendiendo mensajería automática sin nombrar WhatsApp: lib/siteConfig.ts:282
    "Cobranza con recordatorios amables y automáticos.", :288 "Aviso al cliente cuando su auto está
    listo…", :294 "Clientes que vuelven con mensajes según lo que compraron." y lib/content.ts:98
    "mensaje enviado". Cumplen la regla; ¿calzan con el enfoque "no automatizamos WhatsApp"?
D5. El cuestionario de /diagnostico nombra "planillas" en 2 preguntas (cuestionario.ts:49 y :59).
    design 9 lo mantiene porque describe la realidad del cliente y cambiarlo rompe la comparación con
    diagnósticos guardados. ¿Se mantiene?
D6. Historia del equipo: /admin/equipo no tiene "Usar los textos recomendados" (P.2 la pega a mano).
    ¿Se mantiene así o se agrega el botón en TeamEditor (cambio chico)?
D7. Hallazgo 8 (repeticiones y visión): ¿se retoca ahora o queda para otro cambio?

ORDEN DE TRABAJO (base-standards §7)
Primero los artefactos: deltas de specs (hero línea 34; contenido-pyme líneas 4 y requisito MODIFIED
nuevo), design.md (decisiones 2, 4, 8 y 9; Migration Plan) y tasks.md (sección R: una tarea por
hallazgo aplicado). Después el código y los tests. Nada de "arreglo rápido" sin spec.

VERIFICACIÓN A REPETIR ANTES DE ARCHIVAR
npm run lint · npx tsc --noEmit · npm test · npm run build · openspec validate
enfoque-soluciones-a-medida --strict · E2E: portada a 1093, 1280 y 375 px dejando rotar las 7 tareas
del panel (ninguna cortada), "Lo que ganas" a 375 px, y /admin/config → Misión y visión → "Usar los
textos recomendados" sin POST. Guardar el reporte en reports/ con fecha nueva.

RECORDATORIO AL COMMITEAR
No incluir ai-specs/.specboot.json (modificado por la instalación de ui-ux-pro-max del 2026-10-21) ni
las carpetas sin seguimiento .claude/skills/ui-ux-pro-max y ai-specs/skills/ui-ux-pro-max (tarea 0.1).
```
