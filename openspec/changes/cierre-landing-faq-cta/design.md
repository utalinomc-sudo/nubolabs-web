## Context

Motivación en `proposal.md`; requisitos en `specs/landing/cierre/spec.md`. Este diseño asume mezclados HDU-01 (`mensaje-principal-pyme`), HDU-03 (`formulario-minimo-consentimiento`) y HDU-02 (`lenguaje-sin-jerga`):

- **De HDU-01:** CMS puro en `lib/siteConfig.ts` (tipos, `SECTIONS`, `defaultSiteConfig()`, `mergeConfig()`, `renderHighlight()`), tokens de la HDU-08 (`navy.950`, `brand.*`, `success.*`, `line.strong`, `shadow-lift`…), `.bg-dots` y el hero con `id="inicio"`; su CTA principal (`content.hero.ctaPrimary`) lleva a `#contacto`.
- **De HDU-03:** formulario de 2 pasos en la sección `id="contacto"` (clave `contacto`), página `/privacidad` (texto en `content.privacidad`) y un enlace simple a `/privacidad` en el footer actual.
- **De HDU-02:** helpers `mergeList` / `mergeFixedList` en `lib/siteConfig.ts`, editores por sección en `components/admin/config/` (`Field`, `SectionCard` con "Usar los textos recomendados", `ListField`) con `ConfigEditor.tsx` como contenedor que guarda solo las claves que administra, `nav` en `lib/content.ts` ("Lo que ganas", "Servicios", "Ejemplos", "Cómo trabajamos") y el orden de `SECTIONS` hero → problema → resultados → enfoque → servicios → casos → proceso → contacto → nosotros → equipo (más las claves que haya sumado HDU-03).
- **Hoy en el código:** `components/landing/Footer.tsx` es un server component sin props (logo, frase, `hola@nubolabs.ai` y año) usado por `app/page.tsx`, `app/equipo/page.tsx` y `app/mision-vision/page.tsx` (y por `app/privacidad/page.tsx` desde HDU-03). `components/landing/Nav.tsx` es cliente y recibe `showEquipo`/`showMision`. No hay preguntas frecuentes, CTA final ni CTA fija.
- **Referencia visual:** `docs/design/propuesta-web-hdu-08.html`, secciones `#preguntas`, `.final`, `.foot` y `.sticky-cta` (con su script de visibilidad, punto 7).

## Goals / Non-Goals

**Goals:**
- Cerrar la portada con las dudas resueltas y un CTA siempre a mano en el celular.
- Un footer único, coherente en todas las páginas públicas y sin datos de contacto inválidos.
- Permitir enlaces internos en textos del CMS sin abrir la puerta a HTML ni a destinos externos.

**Non-Goals:**
- Datos estructurados `FAQPage` para buscadores (va con SEO, roadmap 3; la sección queda lista para sumarlos).
- Animar la apertura del acordeón más allá de la rotación del ícono.

## Decisions

### 1. Datos en `config/site.content`
```ts
faq:    { eyebrow: string; title: string; items: { pregunta: string; respuesta: string }[] /* 1–10 */ }
cierre: { eyebrow: string; title: string; body: string; cta: string }
```
- `faq.items` con `mergeList(stored, defaults, { min: 1, max: 10 }, isValid)` donde `isValid` exige `pregunta` y `respuesta` no vacías tras `trim` (los helpers de HDU-02 aceptan el validador como parámetro). `cierre` se mezcla campo a campo como `hero`.
- Claves en español para lo nuevo (`pregunta`, `respuesta`) y en inglés para lo que repite el patrón existente (`eyebrow`, `title`, `body`, `items`), según `docs/data-model.md`.
- `SECTIONS` suma `faq` ("Preguntas frecuentes") y `cierre` ("CTA final") después de `contacto`; ambas visibles por defecto (los documentos guardados no traen esas claves y `visible` se mezcla sobre los defaults).
- La nota "30 minutos · por videollamada · sin compromiso" no va al CMS: es `ctaNote` en `lib/content.ts`, reutilizable por el formulario de HDU-03 si quiere unificarla.

### 2. Enlaces internos seguros (`lib/inlineLinks.ts`)
`parseInlineLinks(text)` devuelve partes `{ text }` o `{ text, href }` reconociendo `[texto](destino)` solo cuando `destino` cumple `/^(\/(?!\/)|#)[^\s]*$/` (ruta interna o ancla). Cualquier otro destino se devuelve como `{ text: "texto" }`. El componente renderiza las partes como nodos de texto y `<Link>`/`<a>`: React escapa todo, así que no hay HTML ni `dangerouslySetInnerHTML`.
- *Alternativas descartadas:* un renderizador de Markdown (dependencia nueva y superficie de ataque mayor para un solo caso); permitir URLs externas (el CMS es de un solo admin, pero un enlace externo en una respuesta no es necesario y abre phishing si la cuenta se compromete).

### 3. Componentes
| Pieza | Componente | Tipo | Notas |
|---|---|---|---|
| Preguntas frecuentes | `components/landing/Faq.tsx` (`id="preguntas"`) | Server | `<details>`/`<summary>` nativos: accesibles por teclado y anuncian expandido/colapsado sin JS. Chevron con `group-open:rotate-180`, `summary` de alto ≥ 64 px, borde `brand-100` al abrir (`open:`) |
| CTA final | `components/landing/FinalCta.tsx` | Server | Banda con degradado `brand` → `navy`, trama `.bg-dots` con máscara, botón claro; prop `contactVisible` decide `#contacto` o `/diagnostico` |
| CTA fija | `components/landing/StickyCta.tsx` | Cliente | Ver decisión 4 |
| Footer | `components/landing/Footer.tsx` (reescrito) | Server | Ver decisión 5 |

### 4. CTA fija en móvil (`StickyCta.tsx`)
- Recibe `label` (de `content.hero.ctaPrimary`) y solo se monta si `visible.contacto`.
- Dos `IntersectionObserver`: uno sobre `#inicio` (hero) y otro sobre `#contacto` (umbral 0,05). Visible = `!heroVisible && !contactVisible`. Estado inicial oculto (sin JS o antes de hidratar no aparece, y no hay salto de contenido porque es `fixed`).
- Clases: `fixed inset-x-3 bottom-3 z-40 sm:hidden`, `pb-[env(safe-area-inset-bottom)]`, transición por `transform` (`translate-y-[140%]` ↔ `translate-y-0`); con `motion-reduce:transition-none`.
- `aria-hidden` y `tabIndex={-1}` mientras está oculto, para que el foco no caiga en un botón invisible.
- Para no tapar el final, el footer suma `pb-24 sm:pb-7` en móvil.
- *Alternativa descartada:* calcular la posición con `scroll` y `getBoundingClientRect`; más costoso y sin ventaja sobre el observer (que ya usa el panel del hero).

### 5. Footer único; la web en código y WhatsApp en el CMS
- Contenido fijo en `lib/content.ts`: `contact = { webUrl: "https://www.nubolabs.cl", webLabel: "www.nubolabs.cl" }` y `footerLinks` (columnas y enlaces). La web no va al CMS: cambia rara vez.
- El WhatsApp sí va al CMS (decisión 8), porque Mauro decidió el 2026-10-22 poder mostrarlo u ocultarlo sin despliegue. El footer recibe la prop `whatsapp: { label: string; url: string } | null`, que las páginas calculan con `whatsappLink(content.contact)` y que solo es distinta de `null` si `showWhatsapp` está activo y el número es válido.
- Props: `showEquipo`, `showMision`, `showFaq` (por defecto `true`), igual que `Nav`. Las páginas que lo usan pasan `visible.equipo`, `visible.nosotros` y `visible.faq`.
- Diseño de la referencia: fondo `navy-950`, 4 columnas en `lg` (marca + 3) que pasan a 2 en `md` y a 1 en móvil; títulos de columna en `font-mono` mayúsculas; barra inferior con "© {año} Nubolabs · Hecho en Chile" y "Política de privacidad". El enlace a privacidad de HDU-03 queda integrado aquí.
- Se elimina `hola@nubolabs.ai` (dominio sin verificar, HDU-08 §14 pregunta 4). Cuando exista `hola@nubolabs.cl` se agrega a `contact` en un cambio menor.

### 6. Navegación
`lib/content.ts` → `nav` suma `{ label: "Preguntas", href: "/#preguntas", key: "faq" }`; `Nav.tsx` recibe `showFaq` y filtra los ítems con `key` oculto (escritorio y móvil). Las páginas pasan `visible.faq`.

### 7. Admin
`components/admin/config/FaqEditor.tsx` (usa `ListField` con mín. 1 y máx. 10, campos "Pregunta" y "Respuesta" con la ayuda "Para un enlace interno escribe [texto](/ruta)") y `CierreEditor.tsx`; ambos dentro de `SectionCard` con "Usar los textos recomendados". `components/admin/config/ContactEditor.tsx` (decisión 8) muestra el campo "Número de WhatsApp" (ayuda: "Con código de país, por ejemplo +56 9 3259 0783") y dos casillas, "Mostrar WhatsApp en el pie de página" y "Mostrar QR junto al formulario", con una vista previa del texto que se verá. `ConfigEditor.tsx` suma `faq`, `cierre` y `contact` a `MANAGED_KEYS`.

### 8. WhatsApp de contacto configurable (`content.contact`)
Decisión de Mauro del 2026-10-22 (HDU-08 §14, fila 8): fuera del brochure; en la web, oculto por defecto y activable por separado en el pie y junto al formulario. Referencia visual: `docs/design/propuesta-web-hdu-08.html` (bloque `SITE_CONTACT`, `#footWhatsapp` y `#waQr`).
- **Modelo:** `content.contact: { whatsappNumber: string; showWhatsapp: boolean; showWhatsappQr: boolean }`. Default `{ whatsappNumber: "56932590783", showWhatsapp: false, showWhatsappQr: false }`. Va dentro de `content` para reutilizar `POST /api/admin/config` sin tocarlo.
- **Mezcla (`normalizeContact`):** `whatsappNumber` se guarda y se usa solo con dígitos (se quitan `+`, espacios y guiones); los interruptores son `true` solo si el valor guardado es exactamente `true` (cualquier otra cosa → `false`). Un número con menos de 8 o más de 15 dígitos es inválido: no se muestra nada aunque los interruptores estén activos.
- **Texto y enlace (`formatWhatsapp`, `whatsappLink`):** `569XXXXXXXX` → "+56 9 XXXX XXXX"; otros países → "+" y los dígitos. Enlace `https://wa.me/<dígitos>` (formato oficial, sin "+"), con `target="_blank"` y `rel="noopener"`.
- **Tarjeta con QR (`components/landing/WhatsappCard.tsx`, server):** "¿Prefieres escribirnos?" bajo el bloque de texto de la sección `#contacto` (columna izquierda del formulario de HDU-03). El QR se dibuja en el servidor como SVG con `lib/qrSvg.ts` (envuelve `qrcode-generator`, corrección M, color `navy`), así no hay scripts de terceros ni CDN en el navegador. Toda la tarjeta es un enlace a `wa.me`. A ≤ 820 px se oculta el QR (no se puede escanear la propia pantalla) y se muestra un ícono con "Toca aquí y te respondemos por WhatsApp".
- **Independencia:** `showWhatsapp` y `showWhatsappQr` no dependen entre sí ni de `visible.contacto`; la tarjeta solo existe si la sección de contacto se renderiza.
- *Alternativa descartada:* generar el QR en el navegador con un script de CDN, como en la referencia HTML; agrega una dependencia externa en tiempo de ejecución y JavaScript innecesario en un server component.

### Degradación
Sin Firebase, `getSiteConfig()` entrega los defaults y todo se ve igual. Sin JavaScript, el acordeón sigue funcionando (`<details>` nativo) y la CTA fija simplemente no aparece. No intervienen Resend ni Blob.

## Risks / Trade-offs

- [La CTA fija tapa contenido o el aviso de cookies/teclado en móvil] → oculta cerca del formulario (donde se escribe), padding inferior en el footer y área segura; E2E a 375 px.
- [La respuesta "¿Qué hacen con mis datos?" contradice el texto legal de `/privacidad`] → la respuesta es general y enlaza a la política; queda en la revisión de O&A o abogado junto con `/privacidad` (HDU-08 §14 punto 7).
- [Un admin pega un enlace externo esperando que funcione] → la ayuda del editor lo explica y se ve como texto plano, sin romper la página.
- [Footer con más enlaces que hoy en páginas internas] → mismos datos para todo el sitio; enlaces condicionados a la visibilidad para no apuntar a páginas ocultas.
- [Dos componentes cliente nuevos en la portada (panel del hero y CTA fija)] → `StickyCta` es pequeño, sin dependencias, y solo observa dos elementos.

## Migration Plan

1. Mezclar a `main` tras el preview aprobado por Mauro (deploy automático).
2. Las secciones nuevas aparecen con sus defaults (no hay overrides en Firestore). Mauro revisa los textos en `/admin/config` y, si cambia algo, guarda.
3. Rollback: revertir el commit. El código anterior ignora `content.faq`, `content.cierre` y las claves `faq`/`cierre` de `visible`.
