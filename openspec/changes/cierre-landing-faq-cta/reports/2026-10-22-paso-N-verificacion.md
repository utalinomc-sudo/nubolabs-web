# Reporte — paso N: verificación obligatoria

- Fecha: 2026-10-22
- Cambio: cierre-landing-faq-cta (HDU-10)
- Rama: `feature/cierre-landing-faq-cta` (desde `main` 109f5f4)
- Ejecutado por: Claude Code (Opus 5.5), sesión de apply
- Entorno: Windows 11, Node 24.16, sin `.env.local`; servidor de desarrollo detenido durante el build

## Comandos

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ sin errores ni avisos (exit 0) |
| `npx tsc --noEmit` | ✔ sin errores (exit 0) |
| `npm test` | ✔ Test Files 29 passed · **Tests 204 passed** (exit 0) |
| `npm run build` | ✔ compilado con Turbopack (exit 0) |

Dependencia nueva: `qrcode-generator` **2.0.4** exacta (MIT, sin dependencias, con tipos). `npm audit --omit=dev` ya marcaba alertas en dependencias existentes (`next`, `firebase`, `@firebase/*`, `@grpc/grpc-js`, `sharp`, `gaxios`, `uuid`, `source-map-js`, `@fastify/busboy`); ninguna es de `qrcode-generator`. Queda anotado en `docs/ESTADO-PROYECTO.md`.

Tests nuevos o ampliados (los de lógica fallaron antes de implementar):
- `lib/inlineLinks.test.ts` (6): rutas y anclas, destinos externos y peligrosos (`//`, `https:`, `javascript:alert(1)`, `mailto:`, con espacios) como texto, varios enlaces, corchetes y HTML literales.
- `lib/siteConfig.cierre.test.ts` (11): defaults de `faq`, `cierre` y `contact`; `SECTIONS` con `faq` y `cierre` después de `contacto`, visibles por defecto; mezcla de `faq.items` (no lista, vacía, incompletas, máximo 10, recorte); override parcial de `cierre`; formas inesperadas; `normalizeContact`, `formatWhatsapp` y `whatsappLink` (pie y QR, número de 3 y de 16 dígitos).
- `lib/qrSvg.test.ts` (3): SVG cuadrado con un solo `path`, determinista, un cuadrado por módulo oscuro y sin el texto de entrada.
- `components/landing/Faq.test.tsx` (3), `StickyCta.test.tsx` (5, con `IntersectionObserver` simulado), `Footer.test.tsx` (3), `WhatsappCard.test.tsx` (1).
- `components/admin/ConfigEditor.test.tsx` (+2: preguntas 1–10 con ayuda de enlaces y restablecer; contacto con interruptores en el payload y número inválido). La guarda de HDU-02 (`MANAGED_KEYS` = claves de `SiteContent` menos `equipo`) falló hasta montar los editores nuevos.
- `components/landing/Nav.test.tsx`, `lib/siteConfig.sections.test.ts` y `components/landing/Home.vocabulario.test.tsx` ampliados con "Preguntas", `faq`/`cierre` en la prueba de vocabulario y `Faq`/`FinalCta`/pie nuevo en el barrido de la portada.

## Decisiones tomadas durante el apply (registradas en `design.md`, la spec y `tasks.md`)
- `mergeList` suma el validador opcional `isValid` (preguntas con pregunta y respuesta).
- `Nav` ya filtraba por `section` (HDU-02): "Preguntas" solo suma `section: "faq"`. El pie usa el mismo patrón (`sections={visible}`) y oculta también "Cómo trabajamos" y la columna Servicios si sus secciones están ocultas.
- Enlaces de escritorio del menú desde 1080 px (a 1024 px, con 5 ítems, los textos se partían).
- `Field` del admin: la ayuda pasa a `aria-describedby` (antes formaba parte del nombre del campo).
- `/diagnostico` también pierde `hola@nubolabs.ai` (su pie propio).
- La CTA final usa `brand-dark` → `navy` para el contraste del texto claro; el logo del pie, "labs" en celeste sobre fondo oscuro (`Logo` acepta `bg`).

## Estado de datos
- Sin acceso a Firestore, Resend ni Blob; ningún comando escribe datos.

## Re-verificación tras la revisión adversarial (sección R de `tasks.md`)

`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (**30 archivos, 210 tests**) · `npm run build` ✔. Tests nuevos o ampliados: `lib/inlineLinks.test.ts` (+1, barra invertida y mismo origen; falló antes del arreglo), `lib/siteConfig.cierre.test.ts` (número borrado; falló antes), `Faq.test.tsx` (barra invertida), `FinalCta.test.tsx` (3), `Footer.test.tsx` (+1 y columna vacía), `StickyCta.test.tsx` (+1, flecha). Detalle en `2026-10-22-adversarial-review.md`.

## Resultado
PASS
