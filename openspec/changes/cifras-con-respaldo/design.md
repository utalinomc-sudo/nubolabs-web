## Context

Motivación en `proposal.md`; requisitos en `specs/landing/cifras/spec.md`. Se implementa después de HDU-01, HDU-03, HDU-02, HDU-10 y HDU-04, y asume en `main`:

- `lib/siteConfig.ts` (HDU-01) con tipos, `SECTIONS`, `defaultSiteConfig()`, `mergeConfig()` y helpers de normalización testeados en `lib/siteConfig.test.ts`; `lib/site.ts` re-exporta.
- Tokens de la HDU-08 en `tailwind.config.ts` (`navy.700/800`, `brand.light`, `ink.faint`, etc.) y el patrón "Usar los textos recomendados" por sección en el admin.
- La clave `confianza` (HDU-04) ya en `SECTIONS`.
- Hoy `metrics` vive en `lib/content.ts` y lo consume solo `components/landing/UseCases.tsx` (bloque con borde superior bajo la grilla de casos, más la nota mono "* cifras referenciales de ejemplo"). HDU-02 pudo haber reescrito los textos de `UseCases.tsx`, pero no el bloque de métricas; HDU-05, que va después, rediseña la sección completa.
- `mergeConfig()` mezcla `visible` como `{ ...base.visible, ...guardado }`: una clave nueva ausente en Firestore toma el default.

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
`SECTIONS` gana `{ key: "cifras", label: "Cifras de resultados", hint: "Oculta hasta tener datos reales con fuente" }` después de `casos` (orden final: …, servicios, casos, cifras, proceso, …). `defaultSiteConfig()` fija `visible.cifras = false` (es la única sección oculta por defecto), `items: []` y `frase: "Medimos cada proyecto con los indicadores que tú elijas, y en el diagnóstico te mostramos los números de tu caso."` (adaptación de la HDU-06 sin "horas ahorradas", HDU-08 §9).

*Alternativa descartada:* dejar las cifras de ejemplo como default oculto. Cualquier activación accidental publicaría números inventados.

### 2. Validación al leer y al mostrar
- `normalizeCifras(value): Cifra[]` — si no es arreglo, `[]`; recorta los 3 campos y conserva todos los ítems (también los incompletos) para que el admin pueda terminarlos.
- `visibleCifras(items): Cifra[]` — solo los que tienen `valor`, `texto` y `fuente`, máximo 4. Lo usa el componente público.
- `mergeConfig()`: `cifras: { ...base.cifras, ...c.cifras, items: normalizeCifras(c.cifras?.items) }`; una `frase` guardada como `""` se respeta (permite apagar la frase).

Ambas en `lib/siteConfig.ts` con tests. *Alternativa descartada:* descartar los incompletos en `normalizeCifras`; el editor perdería lo que el admin dejó a medias al recargar.

### 3. Componente `components/landing/Metrics.tsx` (Server Component)
- Props: `content?: SiteContent["cifras"]` con fallback a defaults.
- Si `visibleCifras(items)` tiene elementos: banda dentro de `max-w-content` con tarjeta `bg-navy` redondeada, grilla `sm:grid-cols-2 lg:grid-cols-4`; por cifra, `valor` en `text-brand-light` extrabold grande, `texto` en blanco atenuado y "Fuente: …" en mono pequeño `text-ink-faint` (6,7:1 sobre navy).
- Si no hay válidas y `frase.trim()` existe: franja liviana con la frase (`text-ink-soft`, ícono decorativo).
- Si no hay nada: `return null` (sin hueco).
- `section aria-label="Resultados medibles"`, sin `id` de navegación.
- `app/page.tsx`: `{visible.cifras && <Metrics content={content.cifras} />}` después de `casos`.

### 4. Retiro de `metrics`
Se elimina `metrics` de `lib/content.ts` y el bloque correspondiente (incluida la nota mono) de `components/landing/UseCases.tsx`. Se verifica con `grep -rn "metrics\|120 h\|referenciales" app components lib` sin resultados de código.

### 5. Editor de la sección Cifras
Componente propio en `components/admin/` (o bloque del editor existente, según la convención de HDU-02): ayuda fija sobre datos reales con fuente y preferencia por resultados de negocio; lista de cifras con `valor`, `texto` y `fuente` (con placeholder "Ej.: Piloto con cliente de O&A, 2026"), "+ Agregar cifra" (deshabilitado al llegar a 4) y "Quitar"; campo "Frase (si no hay cifras)"; indicador por cifra "No se mostrará: falta la fuente" cuando corresponde; botón "Usar los textos recomendados" que solo repone la frase. La visibilidad se maneja en la lista de secciones existente, cuya etiqueta ya dice "Oculta hasta tener datos reales con fuente".

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
