## Context

Motivación en `proposal.md`; requisitos en `specs/landing/confianza/spec.md`. Este cambio se implementa después de HDU-01, HDU-03, HDU-02 y HDU-10, y asume que ya están en `main`:

- **HDU-01** dejó la configuración pura en `lib/siteConfig.ts` (tipos, `SECTIONS`, `defaultSiteConfig()`, `mergeConfig()`, helpers de normalización con tests en `lib/siteConfig.test.ts`), `lib/site.ts` re-exportando, los tokens de diseño de la HDU-08 en `tailwind.config.ts` (`navy.700/800/950`, `brand.50/100/light-50/deep`, `success.*`, `line.strong`, sombras `lift`/`form`) y el patrón "Usar los textos recomendados" por sección en el admin.
- **HDU-03** reconstruyó la sección de agendar (`#contacto`) con su columna de texto (beneficios) y el formulario de 2 pasos.
- **HDU-02** pudo haber dividido `components/admin/ConfigEditor.tsx` en editores por sección dentro de `components/admin/`; este diseño habla de "el editor de la sección Confianza" para que valga en ambos casos.
- `app/page.tsx` es un Server Component que lee `getSiteConfig()` y renderiza cada sección según `visible[key]`, en el orden de `SECTIONS`.
- `mergeConfig()` mezcla superficialmente cada bloque; los arreglos guardados reemplazan a los default completos.
- `POST /api/admin/config` guarda `content` con `set(..., { merge: true })` sin validar la forma: la normalización ocurre al leer.
- Referencia visual: `docs/design/propuesta-web-hdu-08.html`, sección "CONFIANZA (HDU-04)" (`.trust-box`, `.quote`, `.promise`) y `.mini-quote` en la sección de agendar.
- **Estado real al iniciar el apply (2026-10-22, tras HDU-02 y HDU-10):** el admin está dividido en `components/admin/config/` (`Field`, `FieldRow`, `SectionCard` con `onReset`, `ListField` con claves estables y mín./máx.) y `ConfigEditor.tsx` guarda solo las secciones modificadas de `MANAGED_KEYS` (su test exige que `MANAGED_KEYS` + `equipo` sean todas las claves de `SiteContent`). `mergeConfig()` ya no mezcla superficialmente: usa `pickText`, `mergeList`/`mergeFixedList` y `mergeVisible` (solo booleanos). `ContactForm` recibe `aside` (contenido bajo los beneficios; hoy la tarjeta de WhatsApp de HDU-10). Los encabezados usan `SectionHead` y los textos fijos viven en `lib/content.ts`. El preview comparte Firestore con producción: no se guarda contenido desde el preview.

## Goals / Non-Goals

**Goals:**
- Prueba social honesta desde el día 1: el estado sin testimonios debe verse completo, no "vacío".
- Que cargar un testimonio autorizado sea una tarea de 1 minuto en el admin, sin despliegue.
- Lógica de validación y orden de testimonios testeable en Vitest.

**Non-Goals:**
- Moderación, aprobación en dos pasos o registro de quién autorizó el testimonio (la autorización la gestiona Mauro fuera del sistema).
- Cambiar el diseño de otras secciones.

## Decisions

### 1. Modelo de contenido en `lib/siteConfig.ts`
```ts
export interface Testimonio { nombre: string; cargo: string; empresa: string; texto: string; destacado: boolean }
export interface Compromiso { titulo: string; texto: string }
// SiteContent
confianza: { eyebrow: string; textoPuente: string; testimonios: Testimonio[]; compromisos: Compromiso[] };
```
Campos en español (regla de `docs/data-model.md` §4 para `config`). `SECTIONS` gana `{ key: "confianza", label: "Confianza (Nos recomiendan)", hint: "Texto puente, testimonios y compromisos bajo el hero" }` inmediatamente después de `hero`; `defaultSiteConfig()` la deja visible.

Defaults: `eyebrow: "Nos recomiendan"` (se muestra en mayúsculas con la etiqueta en mono, como el resto de las secciones; *ajuste del apply*), `textoPuente: "Trabajamos con estudios contables y empresas que nos recomiendan a sus clientes."`, `testimonios: []`, `compromisos` = los 3 de la referencia. El título "Nuestro compromiso contigo" es texto fijo en `lib/content.ts` (no se pidió editable; frontend-standards §4).

*Alternativa descartada:* precargar el testimonio de Mauricio O. como default. Está pendiente de su aprobación (HDU-08 §14, punto 6) y un default en código se publicaría al desplegar.

### 2. Normalización al leer y selección al mostrar (funciones puras)
- `normalizeTestimonios(value): Testimonio[]` — si no es arreglo, `[]`; convierte cada ítem a strings recortados (`destacado` a booleano estricto) y descarta los que no tengan `nombre` o `texto`. Se usa en `mergeConfig()`: `testimonios: normalizeTestimonios(c.confianza?.testimonios)` (vacío es un estado válido, no cae a default).
- Compromisos con `mergeFixedList(stored, defaults, mergeCompromiso)` (*ajuste de la revisión adversarial*: antes `normalizeCompromisos` descartaba los que quedaban sin título, el admin —que los trata como fijos— no podía recuperarlos y los íconos se corrían): siempre 3 por posición; un título o texto vacío toma el de esa posición.
- `normalizeTestimonios` deja `destacado` solo en el primero que lo tenga (un documento editado a mano podía traer dos y el admin los desmarcaba juntos).
- `contactQuote(visible, confianza)`: el principal si `visible.confianza` no es `false`; si no, `null`. Lo usa `app/page.tsx` y tiene test.
- `pickTestimonios(list): { principal: Testimonio | null; resto: Testimonio[] }` — principal = primer `destacado` o primero; `resto` = los demás en su orden, hasta completar 3 en total.
- `initials(nombre): string` — compone el texto (NFC) y toma la primera **letra Unicode** (`\p{L}`) de las dos primeras palabras que tengan letras, en mayúscula ("Mauricio Osorio" → "MO"; "Ana" → "A"; "😀 Ana López" → "AL"; "(Dr.) Juan" → "DJ"). *Ajuste de la revisión adversarial:* `w[0]` cortaba emojis y tildes escritas por separado.

Todas en `lib/siteConfig.ts` con tests en `lib/siteConfig.test.ts`. *Alternativa descartada:* validar en `POST /api/admin/config`; el endpoint hoy es genérico para todo el CMS y documentos viejos o editados a mano igual necesitarían normalizarse al leer.

### 3. Componente `components/landing/Trust.tsx` (Server Component)
- Props: `content?: SiteContent["confianza"]` con fallback a `defaultSiteConfig()` (patrón de `Hero.tsx`).
- Layout de la referencia: `grid lg:grid-cols-[1.25fr_1fr]` dentro de una tarjeta con borde `line` y `shadow-card`.
  - Izquierda (`bg-gradient-to-br from-navy to-navy-700`, texto blanco, brillo cian decorativo con `overflow-hidden`): con principal → `<figure>` con comillas decorativas `aria-hidden`, `<blockquote>` y `<figcaption>` (avatar de iniciales `aria-hidden` con degradado `brand`, nombre, "cargo · empresa"). Sin principal → eyebrow en mono + texto puente en tamaño grande + ícono de escudo `aria-hidden`.
  - Derecha: título fijo y lista de compromisos con íconos por posición (`IconCalendar`, `IconGrid`, `IconShield`) en mosaicos `brand-50`, `brand-light-50` y `success-50`.
  - `resto` (si hay): tarjetas blancas compactas bajo el bloque (2 columnas desde `sm` solo si hay 2; una sola ocupa todo el ancho), cada una `<figure>` con texto y autor.
- *Ajustes de la revisión adversarial:* columnas con `minmax(0, …)` y `[overflow-wrap:anywhere]` en textos y autores (una URL larga desbordaba a 375 px); `whitespace-pre-line` para respetar los saltos de línea del admin; la cita principal centrada en el panel; iniciales de las tarjetas en `brand-dark` (contraste); `aria-label` de la región desde la etiqueta; prop `spaced` cuando el hero está oculto.
- Ícono nuevo `IconShield` en `components/icons.tsx` si no existe (mismo estilo de trazo).
- `section aria-label="Nos recomiendan"` sin `id` de navegación (no está en el menú).

### 4. Cita breve en `#contacto`
`app/page.tsx` calcula `const { principal } = pickTestimonios(content.confianza.testimonios)` y, si `visible.confianza` y hay principal, pasa la cita por la prop `aside` de `ContactForm` (*ajuste del apply*: la prop ya existe desde HDU-10; la cita va antes de la tarjeta de WhatsApp, como en la referencia). La cita es un componente server propio, `components/landing/MiniQuote.tsx`, que renderiza (estilo `.mini-quote`: borde izquierdo `brand`, fondo blanco, cursiva) solo si recibe un testimonio. Se muestra el texto completo, sin recortes automáticos, para no alterar las palabras de la persona.

*Alternativa descartada:* un campo "frase corta" por testimonio; agrega carga al admin y el contrato de datos de la HDU-08 no lo contempla.

### 5. Editor de la sección Confianza
En `components/admin/config/ConfianzaEditor.tsx` (*ajuste del apply*: patrón de HDU-02), dentro de `SectionCard`:
- Campos eyebrow y texto puente; 3 compromisos fijos (título + texto, sin agregar/quitar porque los íconos van por posición).
- Lista de testimonios con `ListField` (0 a 6; la portada muestra hasta 3): nombre, cargo, empresa, texto (textarea, ayuda "Ideal: 2 a 3 líneas") y casilla "Destacado"; subir, bajar, quitar y "+ Agregar testimonio". Al marcar un destacado se desmarcan los demás (solo uno). Los compromisos usan `ListField` fijo (sin agregar ni quitar).
- Aviso fijo sobre la lista: "Publica solo testimonios con autorización escrita del cliente."
- "Usar los textos recomendados": carga `defaultSiteConfig().content.confianza` en eyebrow, texto puente y compromisos, sin tocar `testimonios` y sin guardar.
- El guardado sigue siendo el botón general (`POST /api/admin/config`); `confianza` se suma a `MANAGED_KEYS` y, como el resto, solo se envía si cambió.

### 6. Orden en la portada
`app/page.tsx` renderiza `{visible.confianza && <Trust content={content.confianza} />}` inmediatamente después del hero, siguiendo el orden final de `SECTIONS` (hero, confianza, problema, …).

### Degradación
Sin Firebase: `getSiteConfig()` devuelve defaults → bloque con texto puente y compromisos; la cita de `#contacto` no aparece. No hay integraciones nuevas (Resend y Blob no participan).

## Risks / Trade-offs

- [Se publica un testimonio sin autorización] → aviso fijo en el editor, ningún testimonio por defecto y paso post-merge explícito con la aprobación de Mauricio O.
- [Testimonio muy largo descuadra el panel] → el panel crece en alto (no se recorta); el editor muestra una ayuda "Ideal: 2 a 3 líneas".
- [Un documento viejo de `config/site` con forma rara rompe la sección] → normalización al leer con tests de entradas inválidas.
- [Bloque navy pesado justo después del hero en móvil] → en ≤ 820 px se apila y el panel usa padding reducido como en la referencia.
- [El editor del admin sigue creciendo] → los testimonios van en su propio componente de editor (`TrustEditor.tsx` o el nombre que use la convención de HDU-02).

## Migration Plan

1. Mezclar a `main` tras el preview de Vercel aprobado por Mauro. En el preview no se guarda contenido (Firestore compartido).
2. En producción, `config/site` no tiene `content.confianza`: se ven los defaults (texto puente). Mauro revisa en `/admin/config` → Confianza y guarda si ajusta algo.
3. Cuando Mauricio O. confirme el testimonio (HDU-08 §8), Mauro lo agrega como destacado y guarda.
4. Rollback: revertir el commit de mezcla; el código anterior ignora `visible.confianza` y `content.confianza`.
