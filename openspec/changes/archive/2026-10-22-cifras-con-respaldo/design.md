## Context

Motivación en `proposal.md`; requisitos en `specs/landing/cifras/spec.md`. Se implementa después de HDU-01, HDU-03, HDU-02, HDU-10 y HDU-04, y asume en `main`:

- `lib/siteConfig.ts` (HDU-01) con tipos, `SECTIONS`, `defaultSiteConfig()`, `mergeConfig()` y helpers de normalización testeados en `lib/siteConfig.test.ts`; `lib/site.ts` re-exporta.
- Tokens de la HDU-08 en `tailwind.config.ts` (`navy.700/800`, `brand.light`, `ink.faint`, etc.) y el patrón "Usar los textos recomendados" por sección en el admin.
- La clave `confianza` (HDU-04) ya en `SECTIONS`.
- Hoy `metrics` vive en `lib/content.ts` y lo consume solo `components/landing/UseCases.tsx` (bloque con borde superior bajo la grilla de casos, más la nota mono "* cifras referenciales de ejemplo"). HDU-02 pudo haber reescrito los textos de `UseCases.tsx`, pero no el bloque de métricas; HDU-05, que va después, rediseña la sección completa.
- `mergeConfig()` mezcla `visible` con `mergeVisible` (solo valores booleanos guardados ganan): una clave nueva ausente en Firestore toma el default.
- **Estado real al iniciar el apply (2026-10-22):** editores por sección en `components/admin/config/` (`SectionCard`, `ListField` con mín./máx., `Field`); `ConfigEditor.tsx` guarda solo las secciones modificadas de `MANAGED_KEYS` (su test exige todas las claves de `SiteContent` menos `equipo`); `SectionHead` para encabezados; pruebas de vocabulario en `lib/siteConfig.sections.test.ts` y `components/landing/Home.vocabulario.test.tsx`. El preview comparte Firestore con producción: no se guarda contenido desde el preview.

## Goals / Non-Goals

**Goals:**
- Que ninguna cifra sin fuente llegue a la portada, por diseño (no por disciplina del editor).
- Publicar la cifra real del piloto sin despliegue.

**Non-Goals:**
- Validar en el servidor que las cifras tengan fuente: se filtra al leer y al mostrar.
- Rediseñar los casos de uso (HDU-05).

## Decisions

### 1. Modelo de contenido
```ts
export interface Cifra { valor: string; texto: string; fuente: string }
// SiteContent
cifras: { items: Cifra[]; frase: string };
```
`SECTIONS` gana `{ key: "cifras", label: "Cifras de resultados", hint: "Oculta hasta tener datos reales con fuente" }` después de `casos` (orden final: …, servicios, casos, cifras, proceso, …). `defaultSiteConfig()` fija `visible.cifras = false` (es la única sección oculta por defecto; *ajuste del apply:* `SECTIONS` admite `defaultHidden: true` y `defaultSiteConfig()` lo respeta), `items: []` y `frase: "Medimos cada proyecto con los indicadores que tú elijas, y en el diagnóstico te mostramos los números de tu caso."` (adaptación de la HDU-06 sin "horas ahorradas", HDU-08 §9).

*Alternativa descartada:* dejar las cifras de ejemplo como default oculto. Cualquier activación accidental publicaría números inventados.

### 2. Validación al leer y al mostrar
- `normalizeCifras(value): Cifra[]` — si no es arreglo, `[]`; recorta los 3 campos y conserva todos los ítems (también los incompletos) para que el admin pueda terminarlos.
- `visibleCifras(items): Cifra[]` — solo los que tienen `valor`, `texto` y `fuente` con contenido según `hasContent()` (al menos una letra o dígito: un espacio invisible U+200B pegado desde Word o WhatsApp, o "." / "-", no cuentan; *ajuste de la revisión adversarial*), máximo 4. Lo usan el componente público y el aviso del editor.
- `mergeConfig()`: `items: normalizeCifras(c.cifras?.items)` y `frase`: si se guardó texto, se usa recortado aunque quede `""` (permite apagar la frase); si no hay texto guardado (o no es string), la frase por defecto.

Ambas en `lib/siteConfig.ts` con tests. *Alternativa descartada:* descartar los incompletos en `normalizeCifras`; el editor perdería lo que el admin dejó a medias al recargar.

### 3. Componente `components/landing/Metrics.tsx` (Server Component)
- Props: `content?: SiteContent["cifras"]` con fallback a defaults.
- Si `visibleCifras(items)` tiene elementos: banda navy a todo el ancho que **continúa la de "Ejemplos"** (línea superior `white/10`, como el bloque de cifras anterior; *ajuste de la revisión adversarial*: una tarjeta navy separada 48 px de otra banda navy se veía cortada), con `pt-16` si "Ejemplos" está oculta (`spaced`); columnas según la cantidad (1; 2; 3; 2→4); `<ul role="list">`; por cifra, `valor` en `text-brand-light` extrabold grande, `texto` en `inverse` y "Fuente: …" en mono pequeño `inverse-muted` (7,8:1 sobre navy; `ink-faint` es solo decorativo según los estándares).
- Si no hay válidas y la frase tiene contenido (`hasContent`): franja liviana con la frase (`text-ink-soft`, ícono decorativo).
- Si no hay nada: `return null` (sin hueco).
- `section aria-label="Resultados medibles"`, sin `id` de navegación.
- `app/page.tsx`: `{visible.cifras && <Metrics content={content.cifras} />}` después de `casos`.

### 4. Retiro de `metrics`
Se elimina `metrics` de `lib/content.ts` y el bloque correspondiente (incluida la nota mono) de `components/landing/UseCases.tsx`. Se verifica con `grep -rn "metrics\|120 h\|referenciales" app components lib` sin resultados de código.

### 5. Editor de la sección Cifras
`components/admin/config/CifrasEditor.tsx` (*ajuste del apply*, patrón de HDU-02) con `SectionCard` y `ListField` (0 a 4): ayuda fija sobre datos reales con fuente y preferencia por resultados de negocio; lista de cifras con `valor`, `texto` y `fuente` (con placeholder "Ej.: Piloto con cliente de O&A, 2026"), "+ Agregar cifra" (deshabilitado al llegar a 4) y "Quitar"; campo "Frase (si no hay cifras)"; indicador por cifra "No se mostrará: falta la fuente" cuando corresponde; botón "Usar los textos recomendados" que solo repone la frase. La visibilidad se maneja en la lista de secciones existente, cuya etiqueta ya dice "Oculta hasta tener datos reales con fuente"; su casilla parte desmarcada aunque la visibilidad cargada no traiga la clave (`?? !s.defaultHidden`).

### Degradación
Sin Firebase: defaults → sección oculta, nada se renderiza. Sin integraciones nuevas.

## Risks / Trade-offs

- [Mauro activa la sección sin cifras válidas] → se muestra solo la frase, nunca números sin fuente.
- [Se publican cifras en horas, contra el espíritu de la HDU-08] → ayuda visible en el editor; es una decisión editorial, no se bloquea.
- [Una fuente vaga como "clientes" pasa el filtro] → el placeholder muestra el formato esperado ("Piloto con cliente de O&A, 2026"); la revisión es editorial.
- [Conflicto con HDU-05 al tocar `UseCases.tsx`] → este cambio solo quita el bloque de métricas; HDU-05 parte desde ese archivo ya limpio.

## Migration Plan

1. Mezclar a `main` tras el preview aprobado. Las cifras de ejemplo desaparecen al desplegar (no estaban en Firestore).
2. Producción no tiene `visible.cifras` → oculta. Cuando haya el dato real del piloto de O&A, Mauro lo carga con su fuente en `/admin/config` → Cifras, activa la sección y guarda.
3. Rollback: revertir el commit; el código anterior vuelve a mostrar las cifras de ejemplo e ignora `content.cifras`.
