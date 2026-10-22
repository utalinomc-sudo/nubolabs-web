## 0. Rama de trabajo

- [x] 0.1 Con `mensaje-principal-pyme`, `formulario-minimo-consentimiento` y `lenguaje-sin-jerga` ya mezclados, crear y cambiar a `feature/cierre-landing-faq-cta` desde `main` actualizado; verificar con `git branch --show-current` y que existen `components/admin/config/ListField.tsx` y `app/privacidad/page.tsx`.

## 1. Enlaces internos seguros (design.md, decisión 2) — TDD

- [x] 1.1 Escribir `lib/inlineLinks.test.ts` (debe fallar): texto sin enlaces → una parte; `[Ver](/privacidad)` → enlace; `[Ir](#contacto)` → enlace; `//evil.com`, `https://…`, `javascript:…` y `mailto:` → solo texto; varios enlaces en una respuesta; corchetes sin paréntesis quedan literales; verificar que `npm test` falla.
- [x] 1.2 Implementar `lib/inlineLinks.ts` (`parseInlineLinks`); verificar que el test de 1.1 pasa.

## 2. Modelo del CMS (decisión 1) — TDD

- [x] 2.1 Escribir en `lib/siteConfig.cierre.test.ts` (deben fallar; archivo aparte como en HDU-02): defaults de `faq` (6 preguntas, la de datos con `[…](/privacidad)`) y de `cierre`; `mergeConfig` con `faq.items` no arreglo, vacío o con preguntas sin respuesta → defaults; 12 preguntas → 10; override parcial de `cierre`; `visible.faq` y `visible.cierre` por defecto `true` con documentos viejos; y sumar `faq` y `cierre` al test de vocabulario de HDU-02 (`lib/siteConfig.sections.test.ts`) y `Faq`, `FinalCta` y el footer nuevo al barrido de `components/landing/Home.vocabulario.test.tsx`. Verificar que `npm test` falla.
- [x] 2.2 Implementar en `lib/siteConfig.ts` los tipos, defaults (textos de `specs/landing/cierre/spec.md` y de la referencia), mezcla y las claves `faq` y `cierre` en `SECTIONS` después de `contacto`; `mergeList` suma el parámetro opcional `isValid`; en `lib/content.ts` agregar `contact` (solo la web), `footerLinks`, `ctaNote` y el ítem "Preguntas" (con `section: "faq"`) en `nav`. Verificar que `npm test` pasa y `npx tsc --noEmit` no reporta errores.
- [x] 2.3 Escribir en `lib/siteConfig.cierre.test.ts` (deben fallar) los casos de `content.contact` (decisión 8): sin `contact` → número `56932590783` y ambos interruptores `false`; `"+56 9 3259-0783"` → `"56932590783"`; interruptores `"true"`, `1` o ausentes → `false`; `formatWhatsapp("56932590783")` → `"+56 9 3259 0783"` y `formatWhatsapp("14155550100")` → `"+14155550100"`; `whatsappLink` → `null` con interruptor apagado o número de 3 o 16 dígitos, y `{ label, url: "https://wa.me/56932590783" }` con interruptor activo. Verificar que `npm test` falla.
- [x] 2.4 Implementar `normalizeContact`, `formatWhatsapp` y `whatsappLink` en `lib/siteConfig.ts` y sumar `contact` a `SiteContent`, a los defaults y a `mergeConfig`; verificar que `npm test` pasa.

## 3. Componentes de la portada (decisiones 3, 4 y 6)

- [x] 3.1 Escribir `components/landing/Faq.test.tsx` (`// @vitest-environment jsdom`, debe fallar): renderiza las preguntas como `details`/`summary` cerrados, la respuesta de datos contiene un enlace a `/privacidad` y una respuesta con `<b>` se muestra literal.
- [x] 3.2 Implementar `components/landing/Faq.tsx` (`id="preguntas"`, diseño de la referencia, chevron con `group-open`); verificar que el test de 3.1 pasa.
- [x] 3.3 Implementar `components/landing/FinalCta.tsx` con `content.cierre`, `ctaNote` y la prop `contactVisible` (`#contacto` o `/diagnostico`); verificar en el E2E (paso N+2) ambos destinos.
- [x] 3.4 Escribir `components/landing/StickyCta.test.tsx` (`// @vitest-environment jsdom`, mock de `IntersectionObserver`, debe fallar): oculto al montar; visible cuando el hero sale y el contacto no está a la vista; oculto cuando el contacto entra; `aria-hidden` y `tabIndex=-1` mientras está oculto.
- [x] 3.5 Implementar `components/landing/StickyCta.tsx` (`"use client"`, decisión 4: `sm:hidden`, área segura, transición por `transform`, `motion-reduce`); verificar que el test de 3.4 pasa.
- [x] 3.6 Actualizar `app/page.tsx` (renderizar `Faq` y `FinalCta` según `visible.faq` / `visible.cierre` después del contacto, `StickyCta` solo si `visible.contacto`, con `label={content.hero.ctaPrimary}`) y verificar que `components/landing/Nav.tsx` muestra "Preguntas" y lo oculta con `sections={{ faq: false }}` (ya filtra por `section`; test en `Nav.test.tsx`); verificar con `npm run build` y en el E2E el orden y el menú.

## 4. Footer (decisión 5)

- [x] 4.1 Escribir `components/landing/Footer.test.tsx` (debe fallar: columnas, privacidad, año, sin `hola@nubolabs.ai`, enlaces ocultos con `sections`, WhatsApp solo con `whatsapp`) y reescribir `components/landing/Footer.tsx` con `contact` y `footerLinks`, props `sections` y `whatsapp` (resultado de `whatsappLink(content.contact)`), año actual y sin `hola@nubolabs.ai`; pasar las props desde `app/page.tsx`, `app/equipo/page.tsx`, `app/mision-vision/page.tsx` y `app/privacidad/page.tsx`. Verificar con `grep -rn "hola@nubolabs.ai\|8280" app components lib` sin resultados fuera de tests y comentarios (también se quitó del pie propio de `/diagnostico`) y en el E2E el footer de `/` y `/equipo`.
- [x] 4.2 Agregar la dependencia `qrcode-generator` (versión exacta) y escribir `lib/qrSvg.test.ts` (debe fallar): `qrSvg("https://wa.me/56932590783")` devuelve un `<svg>` con `viewBox` cuadrado y un solo `<path>`, y es determinista (dos llamadas → mismo texto). Implementar `lib/qrSvg.ts`; verificar que el test pasa.
- [x] 4.3 Escribir `components/landing/WhatsappCard.test.tsx` (`// @vitest-environment jsdom`, debe fallar): con `link` renderiza un enlace a `https://wa.me/56932590783` con `target="_blank"`, el título "¿Prefieres escribirnos?", el SVG del QR con `role="img"` y `aria-label`, y los textos de escritorio y celular. Implementar `components/landing/WhatsappCard.tsx` (decisión 8) y montarlo en la columna de texto de `#contacto` solo si `whatsappLink` con `showWhatsappQr` no es `null`; verificar que el test pasa y `npm run build`.

## 5. Admin (decisión 7)

- [x] 5.1 Crear `components/admin/config/FaqEditor.tsx` y `CierreEditor.tsx` (con `SectionCard` y "Usar los textos recomendados"; `ListField` de 1 a 10 con ayuda de enlaces) y sumar `faq` y `cierre` al contenedor `ConfigEditor.tsx` (render y constante `MANAGED_KEYS`, con su test); verificar en el E2E que los editores aparecen y que restablecer devuelve las 6 preguntas sin guardar.
- [x] 5.2 Crear `components/admin/config/ContactEditor.tsx` (número de WhatsApp, casillas "Mostrar WhatsApp en el pie de página" y "Mostrar QR junto al formulario", vista previa con `formatWhatsapp`) y sumar `contact` a `MANAGED_KEYS` (actualizar su test); verificar en el E2E que el payload armado incluye `content.contact` con los interruptores elegidos.

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [x] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/cierre-landing-faq-cta/reports/AAAA-MM-DD-paso-N-verificacion.md` (plantilla de `docs/openspec-tasks-mandatory-steps.md` §5). Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl

- No aplica: el cambio no toca `app/api/**` (el admin sigue usando `POST /api/admin/config` sin cambios).

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [x] N+2.1 Con `npm run dev`, a 1280 px: orden contacto → preguntas → CTA final → footer; "Preguntas" del menú baja a `#preguntas`; abrir y cerrar "¿Cuánto cuesta?" con teclado (Tab + Enter); el enlace de "¿Qué hacen con mis datos?" lleva a `/privacidad`; el botón de la banda final baja a `#contacto`; la CTA fija no aparece en ningún punto del recorrido.
- [x] N+2.2 A 375 px: la CTA fija aparece al pasar el hero, desaparece cuando el formulario entra en pantalla y reaparece al bajar a las preguntas; no tapa el final del footer; sin scroll horizontal (`scrollWidth <= innerWidth`).
- [x] N+2.3 Footer en `/`, `/equipo`, `/mision-vision` y `/privacidad`: columnas, privacidad, año actual, ausencia de `hola@nubolabs.ai` y, con los defaults (local sin Firestore), ausencia de cualquier número, enlace `wa.me` o QR de WhatsApp de Nubolabs.
- [x] N+2.3b WhatsApp activado: como localmente no hay Firestore, levantar `npm run dev` con un cambio local **no commiteado** de los defaults (`showWhatsapp`/`showWhatsappQr` en `true`; no se agrega código de prueba al sitio) y comprobar a 1280 px el número en el footer y la tarjeta con QR (decodificarlo y confirmar `https://wa.me/56932590783`), y a 375 px el enlace directo sin QR. Revertir el cambio local al terminar (verificar con `git diff`) y dejar constancia en el reporte. El guardado real desde el admin se valida en producción después de mezclar (el preview comparte Firestore con producción).
- [x] N+2.4 En `/admin/config` (sesión dev local): ocultar "Preguntas frecuentes" en el formulario, comprobar con el `POST` interceptado que el payload incluye `visible.faq: false` y solo las secciones editadas; editar y restablecer preguntas y CTA final. El guardado real se valida en producción después de mezclar (no se guarda desde el preview: Firestore compartido); la desaparición del ítem "Preguntas" está cubierta por el test de `Nav`. Sin datos que restaurar.
- [x] N+2.5 Guardar capturas y pasos en `openspec/changes/cierre-landing-faq-cta/reports/AAAA-MM-DD-paso-N2-e2e.md`.

## N+3. Documentación (OBLIGATORIO)

- [x] N+3.1 Actualizar `docs/data-model.md` (`content.faq`, `content.cierre`, claves `faq` y `cierre`), `docs/api-spec.yml` (`SiteContentPartial`), `docs/frontend-standards.md` (ancla `preguntas`, `Faq`/`FinalCta`/`StickyCta`, footer con props de visibilidad, regla de enlaces internos `[texto](/ruta)` en textos del CMS), `docs/ESTADO-PROYECTO.md` (fecha, qué cambió, correo público pendiente) y el estado de HDU-10 en `docs/backlog/prospectos-oa.md`; verificar que las rutas citadas existen.

## R. Revisión adversarial (2026-10-22, agente independiente: PASS WITH GAPS, 2 Major)

- [x] R.1 Enlaces del CMS: rechazar `\` y exigir mismo origen en `lib/inlineLinks.ts` (`/\evil.com` abría otro dominio); casos en `lib/inlineLinks.test.ts` y `components/landing/Faq.test.tsx`; spec con el escenario "Barra invertida bloqueada" y decisión 2 actualizada.
- [x] R.2 WhatsApp: un número guardado sin dígitos ya no vuelve al default (`normalizeContact`); tests con interruptores activos; spec con el escenario "Número borrado", decisión 8 y `docs/data-model.md`.
- [x] R.3 Menores: `FinalCta.test.tsx` (incluye `/diagnostico`); columna "Nubolabs" vacía oculta; enlace "Privacidad" (coherente con `sitio/privacidad`); enlace de la respuesta siempre subrayado; sin flecha doble en la CTA fija; separación de la banda final sin preguntas; `pb-24` del pie solo con la CTA fija; nombre accesible del WhatsApp; textos de `WhatsappCard` en `lib/content.ts`; color del logo desde `lib/brandColors.ts`; CTA fija oculta desde 641 px.
- [x] R.4 Docs: entrada de HDU-10 en `docs/ESTADO-PROYECTO.md`, módulos de `lib/` en `docs/frontend-standards.md`, verificación de la tarea 4.1 precisada.
- [x] R.5 Verificar con `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` y un E2E corto.

## Post-merge (Mauro, en producción)

- [ ] P.1 Antes de guardar, copiar `config/site` desde la consola de Firebase. Revisar en https://www.nubolabs.cl las preguntas frecuentes, la banda final y el footer (en celular, la CTA fija); ajustar textos en `/admin/config` si hace falta y guardar. WhatsApp queda apagado: activarlo solo si se decide, desde `/admin/config` → "Contacto". Confirmar con O&A o el abogado que la respuesta sobre datos personales calza con `/privacidad`.
