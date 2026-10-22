## Context

Motivación en `proposal.md`; requisitos en `specs/landing/casos-por-rubro/spec.md`. Se implementa después de HDU-01, 03, 02, 10, 04 y 06, y asume en `main`:

- `lib/siteConfig.ts` (HDU-01): tipos (`CaseItem { title; body }`, `SiteContent["casos"] { eyebrow; title; subtitle; items }`), `defaultSiteConfig()` (casos por defecto desde `useCases` de `lib/content.ts`) y `mergeConfig()`, que hoy hace `items: c.casos?.items ?? base.items` (un arreglo guardado reemplaza a los defaults completos).
- `lib/leadOptions.ts` (HDU-03) con `INDUSTRIES` (`gastronomia`, `automotriz`, `construccion`, `servicios`, `comercio`, `otro`, con sus etiquetas) y el tipo `IndustryKey`; lo usa el formulario de 2 pasos.
- `components/landing/UseCases.tsx` (server): HDU-02 cambió sus textos y HDU-06 le quitó el bloque de métricas; sigue con fondo `navy` y grilla de 3 columnas de `title`/`body`.
- Tokens de la HDU-08 (`brand.50`, `line.strong`, `navy`, etc.) y el patrón "Usar los textos recomendados" por sección en el admin; el editor de Casos (propio o dentro de `ConfigEditor.tsx`, según HDU-02) ya edita `title` y `body`.
- Producción: `config/site.content.casos.items` existe con los 6 casos genéricos (el CMS de casos se editó antes), así que **los defaults nuevos no se verán hasta que Mauro los cargue**.
- Referencia visual: `docs/design/propuesta-web-hdu-08.html`, sección "EJEMPLOS POR RUBRO" (`.chips`, `.chip[aria-pressed]`, `.cases`, `.case`, `.case-tag`) y el filtro del script (punto 5).
- **Estado real al iniciar el apply (2026-10-22):** los defaults de Casos viven en `defaultSiteConfig()` de `lib/siteConfig.ts` (no hay `useCases` en `lib/content.ts`) y `mergeConfig()` ya mezcla los casos con `mergeList` (mín. 1, máx. 12; si no queda ningún caso válido se usan los defaults, regla de listas variables de `landing/contenido-pyme`). El editor es `components/admin/config/CasosEditor.tsx` (`SectionCard` + `ListField`, con "Usar los textos recomendados" = `onChange(defaults)`), y `ConfigEditor.tsx` guarda solo las secciones modificadas. `UseCases.tsx` sigue en navy y sin eyebrow; `Metrics.tsx` (HDU-06), cuando hay cifras, es la continuación de esa banda navy (`spaced` si Ejemplos está oculta). Encabezados con `SectionHead`; pruebas de vocabulario en `lib/siteConfig.sections.test.ts` (fija la bajada de Casos de HDU-02, que este cambio quita) y `components/landing/Home.vocabulario.test.tsx`. El preview comparte Firestore con producción: no se guarda contenido desde el preview.

## Goals / Non-Goals

**Goals:**
- Filtro instantáneo en el cliente con el mínimo de JavaScript: el servidor sigue entregando todo el contenido.
- Una sola lista de rubros para formulario y casos (los datos de leads y de contenido cuadran).
- Lógica de filtro y normalización testeada.

**Non-Goals:**
- Persistir el filtro en la URL o en el almacenamiento del navegador.
- Animaciones de reordenamiento más allá de la entrada suave de cada tarjeta.

## Decisions

### 1. Modelo: `rubro` en `CaseItem`
```ts
export type CaseRubro = Exclude<IndustryKey, "otro"> | "todos";
export interface CaseItem { title: string; body: string; rubro: CaseRubro }
```
Nombre del campo en español (regla de `config`). `CASE_RUBROS` = `INDUSTRIES` sin `otro`, importado de `lib/leadOptions.ts` (módulo sin `server-only`, usable en cliente y servidor). *Alternativa descartada:* una lista propia de rubros para casos; se desalinearía con los leads.

`title` pasa a ser el texto principal (la frase del caso) y `body` el secundario opcional: los 14 defaults tienen `body: ""`. Así los casos viejos con título y descripción siguen viéndose completos.

### 2. Normalización al leer
- `normalizeCaseRubro(value): CaseRubro` — devuelve el valor si está en `CASE_RUBROS`; si no (ausente, desconocido u `"otro"`), `"todos"`.
- *Ajuste del apply:* en vez de una `normalizeCases` propia que respete el arreglo vacío, los casos siguen la regla de las demás listas variables (`landing/contenido-pyme`): `mergeList(casos.items, b.casos.items, { min: 1, max: 18 }, mergeCase, { title: "", body: "", rubro: "todos" })`, con `mergeCase` que recorta `title` y `body` y normaliza `rubro`. Si el valor no es arreglo, viene vacío o ningún caso tiene texto principal, se usan los defaults; para ocultar la sección está su casilla de visibilidad en el admin. Así un guardado vacío por error no deja la portada sin ejemplos y no hay dos reglas distintas para listas. Máximo 18 (3 por grupo; los 14 defaults no caben en el máximo anterior de 12). *Ajuste de la revisión adversarial:* un caso es válido solo si su texto principal tiene letras o números (`hasContent`, como en cifras); un título de solo caracteres invisibles no se publica ni crea un chip. Las demás listas variables siguen con su regla (fuera del alcance; queda como seguimiento).
- Defaults (en `defaultSiteConfig()`): los 14 casos de la HDU-08 §4 con su rubro; encabezado `eyebrow: "Ejemplos por rubro"` (se muestra en mayúsculas por CSS, como las demás etiquetas), `title: "Esto es lo que dejamos funcionando en negocios como el tuyo"`, `subtitle: ""` (no se muestra si está vacío). Esto reemplaza la bajada por defecto fijada por HDU-02, de ahí el delta MODIFIED de `landing/contenido-pyme` ("Textos de los Casos sin jerga").

### 3. Filtro como funciones puras (`components/landing/casesFilter.ts`)
- `availableRubros(items): CaseRubro[]` — rubros distintos de `"todos"` con al menos un caso, en el orden de `CASE_RUBROS`.
- `filterCases(items, filter: "all" | CaseRubro)` — `"all"` → todos; si no, los del rubro más los `"todos"`, en el orden original.
- `resultsLabel(count, filter)` — "Mostrando 6 ejemplos de Gastronomía" / "Mostrando 14 ejemplos" (singular con 1: "Mostrando 1 ejemplo de Comercio").
- *Ajuste del apply y de la revisión adversarial:* si `availableRubros` tiene menos de 2 rubros (todos los casos son "para todos", como los 6 casos viejos de producción, o son de un solo rubro), no se muestran los chips: elegir el único rubro mostraría lo mismo que "Todos".

Ubicación junto a los componentes, como `components/diagnostico/ahorro.ts`; tests en `components/landing/casesFilter.test.ts`.

### 4. Componentes
- `components/landing/UseCases.tsx` (server): `section id="casos"` con fondo `surface-soft` (sale el `navy`), eyebrow con la primitiva de la HDU-08, título y subtítulo si existe; si no hay casos válidos, `return null`. Pasa `items` (serializables) a `UseCasesFilter`.
- `components/landing/UseCasesFilter.tsx` (`"use client"`): estado `filter` (`"all"` inicial); chips como `<button type="button" aria-pressed>` dentro de `role="group" aria-label="Filtrar ejemplos por rubro"`, con ícono por rubro y `min-h-11`; grilla `sm:grid-cols-2 lg:grid-cols-3` de tarjetas (`.case`: etiqueta mono con ícono + `title` en negrita + `body` opcional); región `sr-only aria-live="polite"` con `resultsLabel`. Los casos ocultos se quitan del render (no `display:none`), y el HTML del servidor trae todos (estado inicial `"all"`), lo que cubre el caso sin JavaScript.
- Íconos por rubro en `components/icons.tsx` (mismo trazo): `IconUtensils` (gastronomía), `IconCar` (automotriz), `IconBuilding` (construcción), `IconBriefcase` (servicios), `IconBag` (comercio); "todos" usa el `IconGrid` existente. Mapa `rubro → ícono` en `UseCasesFilter.tsx`.
- Chips: `flex flex-wrap` (regla `chip-collection-reflow` de ui-ux-pro-max), sin scroll horizontal.
- *Ajuste de la revisión adversarial:* como `aria-pressed` anuncia un botón que se puede soltar, pulsar de nuevo el chip del rubro elegido vuelve a "Todos". El ícono de la etiqueta de cada tarjeta va en `text-brand`, como en la referencia.
- *Ajuste del apply:* encabezado con `SectionHead` (`aria-labelledby="h-casos"`); fondo `bg-surface-soft` y padding de sección de la HDU-08 (`py-[76px] lg:py-[104px]`). Los textos fijos ("Todos", "Para todos", "Filtrar ejemplos por rubro" y el mensaje de resultados) van en `casesLabels` de `lib/content.ts`, como `metricsLabels`, y entran al barrido de vocabulario de la portada.

### 5. Editor de Casos
En el editor existente de Casos (`components/admin/config/CasosEditor.tsx`): selector "Rubro" por caso (`<select>` con "Para todos" + `CASE_RUBROS` con sus etiquetas; *ajuste del apply:* componente `SelectField` nuevo junto a `Field` en `components/admin/config/Field.tsx`), etiquetas de campo "Texto principal" y "Detalle (opcional)", lista de 1 a 18 casos, nuevos casos con `rubro: "todos"`, y el botón "Usar los textos recomendados" de `SectionCard`, que ya carga los defaults completos de la sección (encabezado + 14 casos) en el formulario sin guardar y muestra el aviso común "Textos recomendados cargados…".

### 6. Banda de cifras (*ajuste del apply*)
Con Ejemplos en `surface-soft`, la banda navy de `Metrics.tsx` con cifras ya no continúa una banda navy: pasa a ser una banda propia con padding arriba y abajo (`py-16 lg:py-20`), sin la línea superior, y se elimina la prop `spaced` (y su uso en `app/page.tsx`). La spec `landing/cifras` no fija ese detalle visual, así que no lleva delta. La franja liviana con la frase no cambia.

*Alternativa descartada:* que el botón agregue los defaults a los casos existentes; duplicaría casos y dejaría los 6 genéricos de producción.

### Degradación
Sin Firebase: defaults → 14 casos con filtro. Sin JavaScript: todos los casos visibles y chips inertes. Sin integraciones nuevas.

## Risks / Trade-offs

- [Producción sigue mostrando los 6 casos viejos como "Para todos"] → paso post-merge explícito con "Usar los textos recomendados"; los casos viejos igual se ven bien gracias a la normalización.
- [14 tarjetas con "Todos" alargan la página en móvil] → tarjetas compactas (1 frase); el chip del rubro reduce a 5–6. Se evaluará en el E2E a 375 px; si es excesivo, se considera mostrar 6 con "Ver todos" en un cambio aparte.
- [Desalineación con HDU-03 si cambia `INDUSTRIES`] → se importa la constante, no se copia; los tests de `casesFilter` usan `CASE_RUBROS`.
- [Hidratación] → el estado inicial del cliente (`"all"`) coincide con el HTML del servidor.

## Migration Plan

1. Mezclar a `main` tras el preview aprobado.
2. En `/admin/config` → Casos: "Usar los textos recomendados" → revisar → "Guardar"; verificar el filtro en https://www.nubolabs.cl.
3. Rollback: revertir el commit; el código anterior ignora `rubro` y muestra `title`/`body` de los casos guardados. Si ya se hizo el paso 2, ese código corta en 12 casos (no se verían los 2 de Comercio) y la bajada guardada vacía vuelve a su default anterior ("Ejemplos reales de lo que dejamos funcionando en empresas como la tuya."); para volver al estado previo exacto, restaurar el respaldo de `config/site`.
