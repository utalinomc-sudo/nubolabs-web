## 0. Rama de trabajo

- [ ] 0.1 Con `mensaje-principal-pyme` y `formulario-minimo-consentimiento` ya mezclados, crear y cambiar a `feature/lenguaje-sin-jerga` desde `main` actualizado; verificar con `git branch --show-current` y que existen `lib/siteConfig.ts` y `lib/leadOptions.ts`.

## 1. Modelo del CMS y mezcla tolerante (design.md, decisiones 1, 2 y 7) — TDD

- [ ] 1.1 Escribir en `lib/siteConfig.test.ts` (deben fallar): `mergeFixedList` (no arreglo → defaults; posición inválida → default de esa posición; más ítems → recorta al largo fijo), `mergeList` (no arreglo → defaults; menos de `min` válidos → defaults; más de `max` → recorta; strings recortados), `mergeConfig` para `problema`, `resultados`, `enfoque`, `servicios` (`destacado`, `acompanamiento`, `notaTecnica`, `items` viejos con la forma `{ title, body, result }` siguen válidos) y `proceso` (`exito`), y `visible.resultados` por defecto `true` cuando el documento no trae la clave; verificar que `npm test` falla.
- [ ] 1.2 Escribir el test de vocabulario de la decisión 7 (regex sobre todos los strings de los defaults, `nav`, `resultsVisuals` y `approachExample`, excluyendo `servicios.notaTecnica`) y el test de que `notaTecnica` contiene "n8n"; verificar que falla con los defaults actuales.
- [ ] 1.3 Implementar en `lib/siteConfig.ts` los tipos nuevos, `mergeFixedList`, `mergeList`, los defaults de la HDU-08 (§2, §3, §5.1; textos exactos en `specs/landing/contenido-pyme/spec.md`), los casos sin jerga (decisión 6), y reordenar `SECTIONS` (decisión 4) con la clave `resultados`; en `lib/content.ts` agregar `resultsVisuals` y `approachExample`, actualizar `nav` y retirar `problems`, `approach`, `steps` y `services`. Verificar que `npm test` pasa y `npx tsc --noEmit` no reporta errores.

## 2. Secciones de la portada (decisión 3)

- [ ] 2.1 Agregar a `components/icons.tsx` los íconos que falten (`IconMoon`, `IconHelp`, `IconNote`, `IconUserX`, `IconZap`, `IconWrench`, `IconRefresh`, `IconLayers`, `IconTrend`) con el estilo existente y actualizar `problemIcons`/`serviceIcons`; verificar con `npx tsc --noEmit`.
- [ ] 2.2 Escribir `components/landing/Results.test.tsx` (`// @vitest-environment jsdom`, debe fallar): renderiza 4 resultados con título y texto, la línea de cierre y el contenedor de cada ilustración con `aria-hidden="true"`; con `content` que trae textos propios los muestra.
- [ ] 2.3 Implementar `components/landing/Results.tsx` (`id="resultados"`, bento 7/5/5/7, ilustraciones por posición de la referencia); verificar que el test de 2.2 pasa.
- [ ] 2.4 Reescribir `components/landing/Problem.tsx` con `content.problema` (grilla de dolores, cierre navy con `renderHighlight` y enlace a `#resultados`); verificar en el E2E (paso N+2) los 6 dolores y el enlace.
- [ ] 2.5 Reescribir `components/landing/Approach.tsx` con `content.enfoque` y `approachExample` (sección navy, pasos, antes/después con tachados); verificar en el E2E.
- [ ] 2.6 Reescribir `components/landing/Services.tsx` (destacado, 4 servicios con "lo que ganas" alineado, acompañamiento, nota técnica con `data-nota-tecnica`); verificar en el E2E que la nota técnica es el único lugar con "n8n".
- [ ] 2.7 Reescribir `components/landing/Process.tsx` (`id="modelo"`, 4 pasos con "Recibes" de alto común, franja "Tú defines qué es éxito"); verificar en el E2E.
- [ ] 2.8 Actualizar `app/page.tsx` al orden de la decisión 4 (con `Results` y `Process` después de `UseCases`) y `components/landing/Nav.tsx` (ítems nuevos, sin activo fijo, escritorio y móvil); verificar con `npm run build` y en el E2E el orden y los enlaces del menú.

## 3. Admin por sección (decisión 5)

- [ ] 3.1 Extraer `Field`, `SectionCard` (con "Usar los textos recomendados") y `ListField` (agregar, quitar, subir, bajar, mín./máx.) a `components/admin/config/`; verificar con `npx tsc --noEmit`.
- [ ] 3.2 Crear `HeroEditor` (conserva las 3 etiquetas y "Usar los textos recomendados" de HDU-01), `ProblemaEditor`, `ResultadosEditor`, `EnfoqueEditor`, `ServiciosEditor`, `CasosEditor`, `ProcesoEditor`, `NosotrosEditor` y `PrivacidadEditor` (migra el bloque de HDU-03) (listas fijas sin agregar/quitar en resultados, enfoque y proceso), y dejar `ConfigEditor.tsx` como contenedor que guarda solo las claves de la constante exportada `MANAGED_KEYS` (`hero`, `problema`, `resultados`, `enfoque`, `servicios`, `casos`, `proceso`, `nosotros`, `privacidad`), con un test de `pickManaged(content)` que verifique que el payload trae exactamente esas claves; actualizar `app/admin/(panel)/config/page.tsx` para pasar `content` y `defaults`. Verificar en el E2E (paso N+2.3) que cada editor muestra sus campos y que el restablecer de una sección no toca las otras.

## 4. Textos de `/diagnostico` (decisión 6)

- [ ] 4.1 Cambiar en `components/diagnostico/DiagnosticoFlow.tsx` solo la etiqueta, el título y la bajada del encabezado, y en `app/diagnostico/page.tsx` la `description`; verificar con `git diff --stat` que no cambian `cuestionario.ts`, `ahorro.ts` ni la lógica, y que `npm test` (incluye `ahorro.test.ts`) sigue en verde.

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [ ] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/lenguaje-sin-jerga/reports/AAAA-MM-DD-paso-N-verificacion.md` (plantilla de `docs/openspec-tasks-mandatory-steps.md` §5). Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl

- No aplica: el cambio no toca `app/api/**` (el admin sigue usando `POST /api/admin/config` sin cambios).

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [ ] N+2.1 Con `npm run dev`, a 1280 px y 375 px: orden de secciones hero → ¿Te suena? → Lo que ganas → Enfoque → Servicios → Casos → Proceso → Contacto; cada ítem del menú (escritorio y móvil) lleva a su sección; enlace "Mira lo que cambia" baja a `#resultados`; sin scroll horizontal a 375 px (`scrollWidth <= innerWidth`).
- [ ] N+2.2 Barrido de vocabulario sobre el texto visible: `browser_evaluate` que clona `document.body`, quita `[data-nota-tecnica]` y busca la regex de la decisión 7 en `innerText` → 0 coincidencias; "n8n" aparece una sola vez en la página completa.
- [ ] N+2.3 En `/admin/config` (sesión dev local): los editores de ¿Te suena?, Lo que ganas, Enfoque, Servicios, Casos y Proceso muestran sus campos; editar un texto y pulsar "Usar los textos recomendados" en esa sección lo devuelve al default sin tocar otra sección; listas fijas sin botones de agregar/quitar. El guardado real se valida en el preview de Vercel (localmente no hay Firestore). Sin datos que restaurar.
- [ ] N+2.4 `/diagnostico` muestra el encabezado nuevo y las 18 preguntas sin cambios.
- [ ] N+2.5 Guardar capturas y pasos en `openspec/changes/lenguaje-sin-jerga/reports/AAAA-MM-DD-paso-N2-e2e.md`.

## N+3. Documentación (OBLIGATORIO)

- [ ] N+3.1 Actualizar `docs/data-model.md` (`content.problema`, `resultados`, `enfoque`, `proceso`, campos nuevos de `servicios`, clave `resultados` y orden de `SECTIONS`; quitar la nota de que Problemas/Enfoque/Proceso no son editables), `docs/api-spec.yml` (`SiteContentPartial`), `docs/frontend-standards.md` (anclas `resultados`/`modelo`, estructura `components/admin/config/`, patrón "Usar los textos recomendados"), `docs/ESTADO-PROYECTO.md` (fecha, pendiente 2 cerrado, paso post-merge) y el estado de HDU-02 en `docs/backlog/prospectos-oa.md`; verificar que las rutas citadas existen.

## Post-merge (Mauro, en producción)

- [ ] P.1 En `/admin/config`: "Usar los textos recomendados" en **Servicios** y **Casos**, revisar ¿Te suena?, Lo que ganas, Enfoque y Proceso, y "Guardar cambios"; confirmar en https://www.nubolabs.cl que no aparecen "agentes IA" ni "n8n, Make, APIs" fuera de la nota técnica y que el diagnóstico no sale duplicado en Servicios.
