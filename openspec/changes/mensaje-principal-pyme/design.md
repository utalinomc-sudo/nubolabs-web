## Context

Motivación en `proposal.md`. Estado actual relevante:

- `components/landing/Hero.tsx` (server) recibe `content.hero` desde `app/page.tsx` y cae a `defaultSiteConfig()`; el título pasa por `renderHighlight()` y el resalte se pinta con `text-brand`. Las etiquetas salen de `heroTags` en `lib/content.ts` (fijas, con un punto de color cada una).
- `components/landing/HeroGraphic.tsx` dibuja el diagrama "Nubolabs orquestando" (nodos CRM, correo, etc.). Solo lo usa `Hero.tsx`.
- `lib/site.ts` es `server-only` y contiene a la vez lo puro (tipos, `SECTIONS`, `defaultSiteConfig()`, `mergeConfig()`, `renderHighlight()`) y lo que toca Firestore (`getSiteConfig()`, `getTeamMembers()`). Por el `import "server-only"` no se puede importar desde Vitest ni desde componentes cliente, y `components/admin/ConfigEditor.tsx` duplica los tipos del contenido.
- `mergeConfig()` mezcla `content.hero` de forma superficial: **cualquier campo guardado en `config/site` gana sobre el default**. En producción el hero ya fue editado desde el admin, así que cambiar solo los defaults no cambia lo que se ve.
- `components/landing/Nav.tsx` (cliente) tiene el botón "Agendar diagnóstico →" a `/diagnostico` en escritorio y en el menú móvil.
- `app/layout.tsx` declara `description` y `openGraph.description` con "Menos horas manuales".
- `tailwind.config.ts` tiene los tokens de marca (`navy`, `brand`, `brand.light`, `accent`, `ink`, `surface`, `line`) y `docs/frontend-standards.md` prohíbe hex nuevos fuera de los tokens.
- Referencia visual aprobada: `docs/design/propuesta-web-hdu-08.html` (sección HERO y estilos `.hero`, `.auto`, `.feed`, `.float`).
- No hay `.env.local` en el equipo de desarrollo: localmente el sitio corre con defaults y `POST /api/admin/config` responde 500 "Base de datos no configurada".

## Goals / Non-Goals

**Goals:**
- Dejar la base visual de la HDU-08 (tokens) lista para todos los cambios siguientes.
- Poder testear la configuración del sitio con Vitest y compartir sus tipos con el admin sin romper `server-only`.
- Que Mauro pueda llevar el hero de producción a los textos nuevos con un clic.

**Non-Goals:**
- Rediseñar el resto de las secciones (cada HDU rediseña las suyas con la misma referencia).
- Cambiar el comportamiento de `getSiteConfig()` frente a Firestore (lectura, errores y fallback siguen iguales).

## Decisions

### 1. Tokens de la HDU-08 como extensión de `tailwind.config.ts`
Se agregan tonos sin renombrar los existentes (las clases actuales siguen funcionando porque cada grupo conserva `DEFAULT`):

| Grupo | Tokens nuevos | Uso |
|---|---|---|
| `navy` | `DEFAULT #0B1D3A` (igual), `950 #071327`, `800 #12294F`, `700 #1B3766` | Fondos oscuros, footer, degradados |
| `brand` | `dark #0F52D6` (hover del CTA), `deep #0A8FD6` (cian oscuro para texto y degradados sobre blanco), `50 #EBF1FF`, `100 #D9E6FF`, `light-50 #E6F9FF` | Botones, chips, fondos suaves |
| `accent` | `DEFAULT #FF6B5E` (igual), `strong #D63C2F` (texto chico sobre blanco), `50 #FFEFED` | Errores, íconos de dolor |
| `success` (nuevo) | `DEFAULT #138A4D`, `strong #0F7A43`, `50 #E8FBF1`, `live #22C55E` | Marcas de completado e íconos (`DEFAULT`), texto chico sobre `success-50` (`strong`, 5,02:1; `DEFAULT` da 4,09:1 y no cumple), estado "activo" |
| `ink` | `faint #93A5C4` (solo decorativo, no cumple contraste) | Separadores, placeholders |
| `line` | `DEFAULT #E7EDF7` (igual), `strong #D5DFEE` | Bordes de inputs y chips |

Sombras nuevas: `shadow-lift` (`0 18px 44px rgba(11,29,58,.16)`, paneles flotantes) y `shadow-form` (`0 24px 60px rgba(11,29,58,.10)`). En `app/globals.css` se suman las primitivas `.text-gradient-brand` (degradado `brand` → `brand-deep` recortado al texto) y `.bg-dots` (trama de puntos del hero).

*Por qué `brand-deep` y no el cian de marca en el degradado:* la referencia termina el resalte en `#00C2FF`, que sobre blanco da 2,1:1 y no cumple ni el 3:1 de texto grande. `#0A8FD6` da 3,5:1 y mantiene el tono. *Alternativa descartada:* variables CSS propias como en la referencia HTML; el estándar del repo es Tailwind con tokens.

### 2. Configuración pura en `lib/siteConfig.ts`
Se mueven a `lib/siteConfig.ts` (sin `server-only`): tipos (`SiteContent`, `SiteConfig`, `ServiceItem`, `CaseItem`), `SECTIONS`, `defaultSiteConfig()`, `mergeConfig()`, `renderHighlight()` y el helper nuevo `normalizeTags()`. `lib/site.ts` conserva `import "server-only"`, `getSiteConfig()`, `getTeamMembers()` y `TeamMember`, y re-exporta lo anterior para no tocar los imports existentes.

- Permite `lib/siteConfig.test.ts` sin mocks de `server-only` ni de Firebase.
- `ConfigEditor.tsx` (cliente) importa los tipos y `defaultSiteConfig()` desde `lib/siteConfig.ts` en vez de duplicarlos.
- *Alternativa descartada:* `vi.mock("server-only")` en el test; funciona, pero no resuelve la duplicación de tipos del admin y cada HDU siguiente tendría que repetir los mocks.

### 3. `content.hero.tags` con normalización al leer
`SiteContent["hero"]` gana `tags: string[]`. *Ajustado tras la revisión adversarial (2026-10-22):* `mergeConfig()` ya no hace `{ ...base.hero, ...c.hero }`, porque un `title: null` tumbaba la portada (`renderHighlight` recibe `null`), un `subtitle` objeto rompía el render y un `hero` de tipo texto metía claves basura. Cada campo de texto se toma de lo guardado solo si es string con contenido tras `trim` (`pickText`); si no, se usa el default. `tags` usa `normalizeTags(c.hero?.tags) ?? base.hero.tags`, donde `normalizeTags(value)` devuelve `null` si `value` no es un arreglo; si lo es, recorta cada string, descarta vacíos y no-strings y toma los 3 primeros, devolviendo `null` si queda vacío. Así un documento viejo sin `tags`, uno con `[]` o uno con basura cae a los defaults. Los colores de los puntos de `heroTags` desaparecen: cada etiqueta lleva un check en `success` (referencia `.assure`). `heroTags` sale de `lib/content.ts` y sus textos nuevos pasan a ser el default de `hero.tags`.

### 4. Panel "Tu negocio hoy" (`components/landing/HeroPanel.tsx`, cliente)
- Reemplaza a `HeroGraphic.tsx`, que se elimina (único consumidor: `Hero.tsx`).
- Datos ilustrativos en `lib/content.ts`: `heroFeed` (5 tareas iniciales) y `heroFeedMore` (7 que rotan), cada una `{ icon, tone, title, detail }` con `icon` ∈ claves de íconos y `tone` ∈ `"brand" | "accent" | "cyan" | "success"`. No van al CMS: son ejemplo de producto, no copy comercial. Textos tomados de la referencia (sin cifras ni clientes reales).
- Rotación con `setInterval` de 3,2 s que solo corre si (a) `IntersectionObserver` reporta el panel visible, (b) `document.hidden` es falso y (c) `matchMedia("(prefers-reduced-motion: reduce)")` no aplica; se escucha el evento `change` de esa consulta para detener la rotación si el visitante activa la preferencia con la página abierta. *Pendiente para un cambio propio:* un control para pausar la animación (WCAG 2.2.2, hallazgo menor de la revisión adversarial); hoy se mitiga con "reducir movimiento" y con la pausa fuera de pantalla. Estado: lista de 5 `{ id, ...task }` con `id` incremental para animar solo la que entra (`animate-` con keyframes en `tailwind.config.ts`, `feedIn` 0,6 s). Limpieza del intervalo y del observer en el `useEffect`.
- Render inicial determinista (las 5 de `heroFeed`) para que el HTML del servidor y la hidratación coincidan.
- Alto estable sin cifras mágicas (CLS 0). *Ajustado tras el E2E y la revisión adversarial (2026-10-22):* un `min-h` no basta (al rotar podía entrar una tarea de 2 líneas y la tarjeta crecía) y un alto fijo en px (478/488) cortaba la última tarea en anchos intermedios (1024–1140 px, donde la bajada del encabezado pasa a 2 líneas) y con la letra del navegador aumentada. Solución: **todas las filas miden lo mismo** y la tarjeta toma su alto natural, que no cambia al rotar porque el encabezado no cambia y cada fila nueva ocupa lo mismo que la que sale. Desde `sm` el título va en 1 línea (`line-clamp-1`, con "…" si no cabe, solo entre 1024 y ~1100 px en los 2 títulos más largos); en móvil, 2 líneas reservadas siempre (`line-clamp-2` + `min-h-[2.7em]`, que escala con la letra); el detalle va en 1 línea (`truncate`). A menos de 640 px se ocultan los ítems desde el 5.º (`max-sm:[&>li:nth-child(n+5)]:hidden`).
- En móvil la etiqueta "Piloto automático" va bajo el título del panel y el relleno y los íconos son más compactos, para que los títulos quepan en 2 líneas.
- Accesibilidad: `<figure aria-label="Ejemplo: tareas que avanzan solas en tu negocio">`, lista con `aria-live="off"`, íconos `aria-hidden`.
- Tarjetas flotantes "Nada pendiente" y "Y tú, enfocado en crecer" como en la referencia; la superior va con `-top-7` para no tapar la etiqueta "Piloto automático" (corrección hecha en la referencia) y **se oculta en móvil**, donde tapaba el título del panel. Ambas son decorativas (`aria-hidden`) y su flotación, como el pulso de "Piloto automático", usa `motion-safe:` (keyframes `bob` y `livePulse` además de `feedIn`).
- El `grid` del hero usa columnas `minmax(0, …)`: con columnas `auto`, en móvil la columna crecía al ancho mínimo del panel y la sección (`overflow-hidden`) cortaba el texto.
- Íconos extra respecto de la lista de abajo: `IconFile` (tarea de cotización) e `IconArrowRight` (flecha del CTA principal, como en la referencia).
- Íconos nuevos en `components/icons.tsx` con el estilo existente (trazo 2, extremos redondeados): `IconWallet`, `IconChat`, `IconPackage`, `IconCheck`, `IconBell`, `IconUsers`, `IconCalendar`, `IconChart`.

### 5. CTA y anclas
- Hero: principal `href="#contacto"`, secundario `href="#modelo"` (ids existentes; `docs/frontend-standards.md` §4 fija `inicio`, `servicios`, `modelo`, `casos`). El formulario nuevo (HDU-03) se monta en el mismo `#contacto`.
- Nav: "Diagnóstico gratis" → `/#contacto` en escritorio y menú móvil (con `/` para que funcione desde `/equipo` y `/mision-vision`). Se mantiene la excepción de ESLint de `Nav.tsx`. El botón que abre el menú en móvil pasa a 44 × 44 px.
- *Respaldo si la sección está oculta (tras la revisión adversarial, alineado con `landing/cierre` de HDU-10):* `Hero` recibe `contactVisible` y `processVisible`; `Nav` recibe `showContact`. Con el contacto oculto, el CTA principal y el del menú van a `/diagnostico`; con el proceso oculto, el CTA secundario no se muestra. Las páginas pasan `visible.contacto` y `visible.proceso`.
- Si el texto guardado de un botón ya termina en "→" (como el "Solicitar diagnóstico →" que hoy está en producción), el hero no agrega el ícono de flecha.
- *Alternativa descartada:* mantener `/diagnostico` como destino. La HDU-08 §5.2 mueve la puerta de entrada al formulario corto; el cuestionario de 18 preguntas pasa a ser complemento (HDU-09).

### 5b. Sin etiqueta superior por defecto (pedido de Mauro, 2026-10-22)
La HDU-08 había fijado el eyebrow "PARA DUEÑOS DE PYMES". Mauro lo retiró de todas las piezas (web, brochure y referencia visual) para no excluir a empresas grandes. El default de `content.hero.eyebrow` pasa a `""` y `Hero.tsx` solo dibuja la píldora (check + texto) si el eyebrow tiene contenido; el admin puede escribir uno cuando quiera (campo "Etiqueta superior (opcional)"). Como `pickText` cae al default cuando lo guardado está vacío, guardar el campo vacío también deja el hero sin etiqueta. Un test de defaults impide que vuelva a aparecer "pyme" en los textos por defecto del hero.

### 6. Migración de los textos de producción
Como los overrides de `config/site` ganan sobre los defaults, el editor del hero en `ConfigEditor.tsx` suma el botón **"Usar los textos recomendados"**, que carga en el formulario los defaults de `defaultSiteConfig().content.hero` (eyebrow, título, bajada, botones y etiquetas) sin guardar; Mauro revisa y pulsa "Guardar". Es el mismo patrón que usarán las HDU siguientes para sus secciones.

*Alternativa descartada:* script que reescriba `config/site` en producción. Exige credenciales de Admin fuera de Vercel (prohibido pegarlas en el chat, base-standards §9) y pisa ediciones que Mauro pudo haber hecho a propósito.

### 7. Metadatos
`app/layout.tsx`: `description` = "Ordenamos cómo funciona tu empresa y dejamos funcionando solas las tareas que hoy te frenan. Vende más, ten el control y crece sin desordenarte."; `openGraph.description` = "Que tu negocio trabaje para ti, no al revés. Diagnóstico gratis de 30 minutos." `title` y `openGraph.title` no cambian.

### Degradación
Sin Firebase: `getSiteConfig()` devuelve los defaults nuevos (comportamiento actual). El cambio no agrega integraciones; Resend y Blob no participan. Sin JavaScript, el panel muestra las 5 tareas iniciales estáticas.

## Risks / Trade-offs

- [El hero de producción sigue mostrando los textos viejos tras el deploy porque Firestore tiene overrides] → botón "Usar los textos recomendados" (decisión 6) y paso post-merge explícito en `tasks.md`.
- [La animación del panel distrae o consume batería] → rota solo visible, pausa con la pestaña oculta y respeta "reducir movimiento"; una sola tarea entra cada 3,2 s.
- [Desplazamiento de contenido al rotar] → alto reservado y ocultamiento por CSS (no por JS) del 5.º ítem en móvil.
- [El resaltado con degradado pierde contraste] → `brand-deep` como color final (3,5:1); se mide en el E2E.
- [`ConfigEditor.tsx` crece con cada HDU] → este cambio solo agrega los campos del hero; si supera ~400 líneas en HDU-02, se divide en editores por sección (decisión de ese cambio).
- [El formulario de `#contacto` sigue siendo el viejo hasta HDU-03] → aceptable: el CTA funciona igual; HDU-03 va inmediatamente después.

## Migration Plan

**Ojo: el preview de Vercel usa el mismo Firestore que producción** (`docs/ESTADO-PROYECTO.md`). Por eso el preview muestra el layout nuevo con los textos viejos guardados, y **guardar en el admin del preview cambia producción en el acto**. Los textos nuevos con el código viejo se ven bien (el código anterior solo ignora `tags`), así que no hay estado roto, pero el orden debe ser consciente:

1. Preview: revisar layout, panel, menú y responsive con los textos viejos; para ver los textos nuevos sin guardar, usar "Usar los textos recomendados" en el admin del preview y mirar el formulario (no la portada). Si Mauro decide guardar desde el preview, la portada de producción cambia de texto de inmediato, con el diseño anterior, hasta mezclar.
2. Mezclar a `main` (deploy automático).
3. Justo después, en `/admin/config` → Hero: "Usar los textos recomendados" → revisar → "Guardar cambios" (si no se hizo en el paso 1). Verificar la portada en producción. Ahí se valida también el escenario "Etiquetas editables" (guardar una etiqueta y verla en la siguiente carga), que localmente no se puede probar.
4. Rollback: revertir el commit de mezcla. Los datos son compatibles hacia atrás (el código anterior ignora `hero.tags`).
