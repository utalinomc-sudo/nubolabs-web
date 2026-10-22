## 0. Rama de trabajo

- [x] 0.1 Crear y cambiar a `feature/confianza-recomendacion` desde `main` actualizado (con HDU-01, HDU-03, HDU-02 y HDU-10 ya mezcladas); verificar con `git branch --show-current` y que `lib/siteConfig.ts` existe.

## 1. Configuración y lógica pura (design.md, decisiones 1 y 2) — TDD

- [x] 1.1 Agregar a `lib/siteConfig.confianza.test.ts` (deben fallar; archivo aparte como en HDU-02 y HDU-10): `normalizeTestimonios` (no arreglo → `[]`; recorta; descarta sin `nombre` o sin `texto`; `destacado` solo `true` estricto), `normalizeCompromisos` (no arreglo o vacío → `null`; descarta sin `titulo`; máximo 3), `pickTestimonios` (destacado primero; sin destacado el primero; máximo 3 en total; lista vacía → `principal: null`), `initials` ("Mauricio Osorio" → "MO", "Ana" → "A", espacios extra), `mergeConfig` (sin `content.confianza` → defaults con `testimonios: []`; `testimonios` guardados se normalizan; `compromisos: []` → defaults) y `SECTIONS` con `confianza` justo después de `hero`; sumar los defaults de `confianza` a la prueba de vocabulario (`lib/siteConfig.sections.test.ts`) y `Trust` al barrido de `components/landing/Home.vocabulario.test.tsx`; verificar que `npm test` falla por lo que falta.
- [x] 1.2 Implementar en `lib/siteConfig.ts` los tipos `Testimonio`, `Compromiso`, `SiteContent["confianza"]`, la entrada de `SECTIONS`, los defaults (sin testimonios) y las 4 funciones, y la mezcla en `mergeConfig()`; agregar el título fijo "Nuestro compromiso contigo" a `lib/content.ts`; verificar que `npm test` pasa y `npx tsc --noEmit` queda limpio.

## 2. Bloque en la portada (decisiones 3, 4 y 6)

- [x] 2.1 Escribir `components/landing/Trust.test.tsx` (`// @vitest-environment jsdom`, debe fallar): sin testimonios muestra el texto puente y no hay `blockquote`; con un testimonio destacado lo muestra en `blockquote` con autor e iniciales `aria-hidden`; con 3 testimonios renderiza 1 principal + 2 tarjetas; los 3 compromisos por defecto aparecen.
- [x] 2.2 Implementar `components/landing/Trust.tsx` con el diseño de la referencia (`.trust-box`, `.quote`, `.promise` de `docs/design/propuesta-web-hdu-08.html`) usando solo tokens de Tailwind, y agregar `IconShield` a `components/icons.tsx` si falta; verificar que el test de 2.1 pasa.
- [x] 2.3 En `app/page.tsx`, renderizar `Trust` tras el hero según `visible.confianza` y, si `visible.confianza` y hay principal (vía `pickTestimonios`), pasar `components/landing/MiniQuote.tsx` (con su test) por la prop `aside` de `ContactForm`, antes de la tarjeta de WhatsApp; verificar con `npm run build` y en el E2E (N+2) que sin testimonios no aparece la cita.

## 3. Editor del admin (decisión 5)

- [x] 3.1 Crear `components/admin/config/ConfianzaEditor.tsx`: eyebrow, texto puente, 3 compromisos, lista de testimonios (agregar, editar, subir, bajar, quitar, destacado único), aviso fijo de autorización escrita y botón "Usar los textos recomendados" que no toca los testimonios; agregar `confianza` a `MANAGED_KEYS` del contenedor `ConfigEditor.tsx` (si no, el guardado la descarta) y extender su test (`app/admin/(panel)/config/page.tsx` ya pasa `content` completo); verificar en el E2E (N+2.3) el comportamiento del botón y del destacado único.

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [x] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/confianza-recomendacion/reports/AAAA-MM-DD-paso-N-verificacion.md` (plantilla de `docs/openspec-tasks-mandatory-steps.md` §5). Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl

- No aplica: el cambio no toca `app/api/**` (el guardado usa `POST /api/admin/config` sin modificarlo).

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [x] N+2.1 Con `npm run dev` (sin Firebase: defaults), a 1280 px y 375 px: el bloque aparece justo después del hero con el texto puente y los 3 compromisos, sin comillas ni nombres; la sección de agendar no muestra cita; sin scroll horizontal a 375 px (`scrollWidth <= innerWidth`).
- [x] N+2.2 Sin Firestore local, verificar con cambios **temporales y no commiteados** de los defaults: (a) `visible.confianza: false` → el bloque y la cita no aparecen y el problema queda tras el hero; (b) 3 testimonios de prueba (uno destacado) → panel con cita, autor e iniciales, 2 tarjetas y la cita breve en `#contacto`, a 1280 y 375 px. Revertir y comprobar con `git diff`. No se guarda nada desde el preview (Firestore compartido).
- [x] N+2.3 En `/admin/config` (sesión dev local): agregar 2 testimonios, marcar el segundo como destacado (el primero se desmarca), pulsar "Usar los textos recomendados" y comprobar que los testimonios siguen y que eyebrow, texto puente y compromisos vuelven a los defaults; comprobar el aviso de autorización. Sin datos que restaurar (no hay Firestore local).
- [x] N+2.4 Guardar capturas y pasos en `openspec/changes/confianza-recomendacion/reports/AAAA-MM-DD-paso-N2-e2e.md`.

## N+3. Documentación (OBLIGATORIO)

- [x] N+3.1 Actualizar `docs/data-model.md` (clave `confianza` en `visible`, `content.confianza` con sus campos y la regla "sin testimonios por defecto"), `docs/api-spec.yml` (`SiteContentPartial.confianza`), `docs/ESTADO-PROYECTO.md` (fecha, qué cambió, pasos post-merge) y el estado de HDU-04 en `docs/backlog/prospectos-oa.md`; verificar que las rutas y nombres citados existen.

## R. Revisión adversarial (2026-10-22, agente independiente: PASS WITH GAPS, solo Minor)

- [x] R.1 Compromisos siempre 3 por posición (`mergeFixedList`), destacado único al leer, `initials` con NFC y letras Unicode, y `contactQuote` (helper de la cita) — tests en `lib/siteConfig.confianza.test.ts`; spec (escenarios "Compromiso con título vacío" e "Iniciales con emojis o signos") y design actualizados.
- [x] R.2 Portada: cortes de palabra y `minmax(0, …)` (URL larga sin scroll a 375 px, comprobado en el navegador con un testimonio temporal), saltos de línea respetados, cita centrada, una tarjeta a todo el ancho, iniciales chicas en `brand-dark`, región con el nombre de la etiqueta, separación sin hero. Tests en `Trust.test.tsx` (compromisos editados, orden de tarjetas, nombre de la región).
- [x] R.3 Admin: ayuda de compromisos (vacío → recomendado), aviso de autorización con fondo blanco (contraste 4,6:1) y aclaración de que no hay borradores.
- [x] R.4 Verificar con `npm run lint`, `npx tsc --noEmit`, `npm test` (`--maxWorkers=2`) y `npm run build`.

## Antes de mezclar (agente, con Mauro)

- [x] M.1 Confirmar con Mauro que en la consola de Firebase `config/site.content.confianza.testimonios` no existe, está vacío o solo tiene testimonios autorizados: el preview comparte Firestore y un testimonio guardado desde ahí se publicaría al mezclar.

## Post-merge (Mauro, en producción)

- [ ] P.1 Antes de guardar, copiar `config/site` desde la consola de Firebase. En `/admin/config` → Confianza: revisar textos (o "Usar los textos recomendados") y guardar; confirmar en https://www.nubolabs.cl el bloque con el texto puente bajo el hero.
- [ ] P.2 Cuando Mauricio O. confirme su testimonio por escrito, agregarlo (HDU-08 §8) como destacado y guardar; confirmar que aparece en el bloque y como cita en la sección de agendar.
