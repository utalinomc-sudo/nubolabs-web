## 0. Rama de trabajo

- [ ] 0.1 Crear y cambiar a `feature/confianza-recomendacion` desde `main` actualizado (con HDU-01, HDU-03, HDU-02 y HDU-10 ya mezcladas); verificar con `git branch --show-current` y que `lib/siteConfig.ts` existe.

## 1. Configuración y lógica pura (design.md, decisiones 1 y 2) — TDD

- [ ] 1.1 Agregar a `lib/siteConfig.test.ts` (deben fallar): `normalizeTestimonios` (no arreglo → `[]`; recorta; descarta sin `nombre` o sin `texto`; `destacado` solo `true` estricto), `normalizeCompromisos` (no arreglo o vacío → `null`; descarta sin `titulo`; máximo 3), `pickTestimonios` (destacado primero; sin destacado el primero; máximo 3 en total; lista vacía → `principal: null`), `initials` ("Mauricio Osorio" → "MO", "Ana" → "A", espacios extra), `mergeConfig` (sin `content.confianza` → defaults con `testimonios: []`; `testimonios` guardados se normalizan; `compromisos: []` → defaults) y `SECTIONS` con `confianza` justo después de `hero`; verificar que `npm test` falla por lo que falta.
- [ ] 1.2 Implementar en `lib/siteConfig.ts` los tipos `Testimonio`, `Compromiso`, `SiteContent["confianza"]`, la entrada de `SECTIONS`, los defaults (sin testimonios) y las 4 funciones, y la mezcla en `mergeConfig()`; agregar el título fijo "Nuestro compromiso contigo" a `lib/content.ts`; verificar que `npm test` pasa y `npx tsc --noEmit` queda limpio.

## 2. Bloque en la portada (decisiones 3, 4 y 6)

- [ ] 2.1 Escribir `components/landing/Trust.test.tsx` (`// @vitest-environment jsdom`, debe fallar): sin testimonios muestra el texto puente y no hay `blockquote`; con un testimonio destacado lo muestra en `blockquote` con autor e iniciales `aria-hidden`; con 3 testimonios renderiza 1 principal + 2 tarjetas; los 3 compromisos por defecto aparecen.
- [ ] 2.2 Implementar `components/landing/Trust.tsx` con el diseño de la referencia (`.trust-box`, `.quote`, `.promise` de `docs/design/propuesta-web-hdu-08.html`) usando solo tokens de Tailwind, y agregar `IconShield` a `components/icons.tsx` si falta; verificar que el test de 2.1 pasa.
- [ ] 2.3 En `app/page.tsx`, renderizar `Trust` tras el hero según `visible.confianza` y pasar `testimonio={visible.confianza ? principal : null}` (vía `pickTestimonios`) a la sección de agendar; en esa sección (HDU-03) mostrar la cita breve solo si llega un testimonio; verificar con `npm run build` y en el E2E (N+2) que sin testimonios no aparece la cita.

## 3. Editor del admin (decisión 5)

- [ ] 3.1 Crear el editor de la sección Confianza (componente propio en `components/admin/` o bloque del editor existente, según dejó HDU-02): eyebrow, texto puente, 3 compromisos, lista de testimonios (agregar, editar, subir, bajar, quitar, destacado único), aviso fijo de autorización escrita y botón "Usar los textos recomendados" que no toca los testimonios; agregar `confianza` a `MANAGED_KEYS` del contenedor `ConfigEditor.tsx` (si no, el guardado la descarta) y extender su test; ajustar `app/admin/(panel)/config/page.tsx` para pasar `content.confianza`; verificar en el E2E (N+2.3) el comportamiento del botón y del destacado único.

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [ ] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/confianza-recomendacion/reports/AAAA-MM-DD-paso-N-verificacion.md` (plantilla de `docs/openspec-tasks-mandatory-steps.md` §5). Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl

- No aplica: el cambio no toca `app/api/**` (el guardado usa `POST /api/admin/config` sin modificarlo).

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [ ] N+2.1 Con `npm run dev` (sin Firebase: defaults), a 1280 px y 375 px: el bloque aparece justo después del hero con el texto puente y los 3 compromisos, sin comillas ni nombres; la sección de agendar no muestra cita; sin scroll horizontal a 375 px (`scrollWidth <= innerWidth`).
- [ ] N+2.2 Ocultar el bloque no se puede guardar localmente (sin Firestore): verificar el ocultamiento con el test de componente/página o en el preview de Vercel junto a Mauro, y dejarlo anotado en el reporte.
- [ ] N+2.3 En `/admin/config` (sesión dev local): agregar 2 testimonios, marcar el segundo como destacado (el primero se desmarca), pulsar "Usar los textos recomendados" y comprobar que los testimonios siguen y que eyebrow, texto puente y compromisos vuelven a los defaults; comprobar el aviso de autorización. Sin datos que restaurar (no hay Firestore local).
- [ ] N+2.4 Guardar capturas y pasos en `openspec/changes/confianza-recomendacion/reports/AAAA-MM-DD-paso-N2-e2e.md`.

## N+3. Documentación (OBLIGATORIO)

- [ ] N+3.1 Actualizar `docs/data-model.md` (clave `confianza` en `visible`, `content.confianza` con sus campos y la regla "sin testimonios por defecto"), `docs/api-spec.yml` (`SiteContentPartial.confianza`), `docs/ESTADO-PROYECTO.md` (fecha, qué cambió, pasos post-merge) y el estado de HDU-04 en `docs/backlog/prospectos-oa.md`; verificar que las rutas y nombres citados existen.

## Post-merge (Mauro, en producción)

- [ ] P.1 En `/admin/config` → Confianza: revisar textos (o "Usar los textos recomendados") y guardar; confirmar en https://www.nubolabs.cl el bloque con el texto puente bajo el hero.
- [ ] P.2 Cuando Mauricio O. confirme su testimonio por escrito, agregarlo (HDU-08 §8) como destacado y guardar; confirmar que aparece en el bloque y como cita en la sección de agendar.
