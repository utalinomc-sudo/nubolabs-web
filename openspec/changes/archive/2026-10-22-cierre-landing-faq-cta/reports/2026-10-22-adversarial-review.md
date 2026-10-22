# Revisión adversarial — cierre-landing-faq-cta (HDU-10)

- Fecha: 2026-10-22
- Revisor: agente independiente (sin el contexto de la implementación), skill `/adversarial-review`
- Alcance: `git diff main` de `feature/cierre-landing-faq-cta` más los archivos nuevos; artefactos del cambio, specs vigentes relacionadas y la referencia HDU-08.
- Método del revisor: lectura de artefactos y reportes, 70 tests del cambio en verde, `tsc` y `lint`, tests temporales (borrados), pruebas en Chromium con `page.setContent` (sin servidor) y lectura de `next/link` 16.3.5 (`is-local-url.js`, `app-router-instance.js`).

## Veredicto del revisor
**PASS WITH GAPS** — 2 Major (ninguno se activa con los datos por defecto ni con la Firestore actual). Preview publicable para revisar sin guardar; no mezclar ni archivar sin corregirlos.

## Hallazgos y resolución

| # | Severidad | Hallazgo | Resolución |
|---|---|---|---|
| 1 | Major | `[texto](/\evil.com)` pasaba el filtro "interno": los navegadores leen `\` como `/` y el enlace abría otro dominio (también con `next/link` y sin JS) | ✅ `lib/inlineLinks.ts`: patrón `^(?:\/(?![/\\])\|#)[^\s\\]*$` (sin `\` en ninguna parte) **y** comprobación de mismo origen con `new URL`. Casos `/\evil.com`, `/\/evil.com`, `/\\evil.com`, `/\@evil.com` en `lib/inlineLinks.test.ts` y en `Faq.test.tsx`. Spec: escenario "Barra invertida bloqueada"; decisión 2 actualizada |
| 2 | Major | Un número guardado vacío o sin dígitos volvía al default (el número de Germán) y, con los interruptores encendidos, se publicaba | ✅ `normalizeContact`: si hay texto guardado se usan sus dígitos aunque quede vacío (→ `whatsappLink` = `null`); el default solo sin texto guardado. Tests con `""`, `"abc"` y `"   "` e interruptores activos. Spec: escenario "Número borrado"; decisión 8 y `docs/data-model.md` |
| 3 | Minor | Sin test de `FinalCta` ni del destino `/diagnostico` | ✅ `components/landing/FinalCta.test.tsx` (3), incluida la separación sin preguntas |
| 4 | Minor | El pie decía "Política de privacidad"; la spec vigente `sitio/privacidad` exige "Privacidad"; el escenario de la propuesta decía "cualquier página pública" | ✅ Enlace "Privacidad"; spec y propuesta acotadas a las 4 páginas (y `/diagnostico` sin el correo) |
| 5 | Minor | Enlace de la respuesta distinguido solo por color (1,12:1 contra el texto) y menor a 44 px | ✅ Siempre subrayado; spec con la excepción de enlaces en línea (WCAG 2.5.8) |
| 6 | Minor | La CTA fija podía mostrar flecha doble con textos viejos que terminan en "→" | ✅ Misma regla que el hero + test |
| 7 | Minor | Con las preguntas ocultas, la banda final quedaba pegada al formulario | ✅ Prop `spaced` (la portada la pasa con `!visible.faq`) |
| 8 | Minor | `pb-24` del pie en todas las páginas, también sin CTA fija | ✅ Prop `stickyCta` (solo la portada con contacto visible) + test |
| 9 | Minor | Columna "Nubolabs" vacía si todo está oculto | ✅ No se renderiza; test |
| 10 | Minor | Textos de `WhatsappCard` en el JSX y hex `#071327` en `Footer` | ✅ Textos en `lib/content.ts` (`whatsappCard`, `newTabNote`); `NAVY_950` en `lib/brandColors.ts`, que también usa `tailwind.config.ts` |
| 11 | Minor | El enlace de WhatsApp del pie se llamaba solo con el número y no avisaba que abre otra pestaña | ✅ `aria-label` "WhatsApp: +56 9 3259 0783 (abre en otra pestaña)"; aviso oculto en la tarjeta |
| 12 | Minor | Docs: verificación de la tarea 4.1 no literal; faltaba la entrada de HDU-10 en ESTADO y los módulos de `lib/` en frontend-standards | ✅ Corregidos |
| 13 | Minor | `sm:hidden` ocultaba la CTA fija ya en 640 px (la spec dice "hasta 640 px") | ✅ `min-[641px]:hidden`; E2E: visible a 640, oculta a 641 |
| 14 | Pregunta | Los 4 enlaces "Servicios" del pie son fijos; en producción no calzan con los servicios viejos hasta el paso post-merge de HDU-02 | ⏭ Se mantiene (lo pide la spec); el paso P.1 de HDU-02 lo resuelve. Si Mauro edita los servicios, el pie se ajusta en un cambio menor |
| 15 | Pregunta | E2E solo en Chromium; iOS Safari sin probar; `env(safe-area-inset-bottom)` sin `viewport-fit=cover` no tiene efecto | ⏭ Revisar en un iPhone durante el preview (solo mirar). Nota en el diseño: el navegador ya respeta el área segura |

## Re-verificación
`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (**30 archivos, 210 tests**) · `npm run build` ✔. E2E corto: pie con "Privacidad" y `pb-24` solo en la portada; enlace de la respuesta subrayado; CTA fija visible a 640 px y oculta a 641 px; a 375 px no tapa el final del pie y no hay scroll horizontal. Un aviso de hidratación en la consola venía de `caret-color: transparent` que Playwright inyecta en los campos al sacar capturas; recargando sin capturas, la consola queda sin errores.

## Veredicto final
**PASS** tras las correcciones. Publicable en preview (sin guardar contenido desde él) y archivable tras la aprobación y la mezcla.
