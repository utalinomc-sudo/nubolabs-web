## Why

La sección de casos de uso es genérica ("Correos con IA", "Portales internos"): un dueño de restaurante, taller o constructora no se reconoce en ella. Los prospectos de O&A vienen de gastronomía, automotriz, construcción, servicios profesionales y comercio, y piensan "esto es lo mío" cuando ven un ejemplo de su rubro. La HDU-05, ajustada por la HDU-08 (aprobada el 2026-10-21, `docs/backlog/propuesta-valor-hdu-08.md` §4), fija 14 ejemplos por rubro orientados a resultados y un filtro para encontrarlos en segundos.

## What Changes

- **Cada caso gana un rubro** (`rubro`: "todos" o una clave de `INDUSTRIES` de `lib/leadOptions.ts`, la misma lista del formulario de HDU-03), editable en el CMS.
- **14 casos por defecto** de la HDU-08 §4: 3 para todos, 3 de gastronomía, 2 de automotriz, 2 de construcción, 2 de servicios profesionales y 2 de comercio, escritos como una frase de resultado.
- **Filtro por rubro en la portada:** chips "Todos" y uno por cada rubro que tenga al menos un caso; al elegir uno se ven los casos de ese rubro más los marcados "todos".
- **Rediseño de la sección** según la referencia (`docs/design/propuesta-web-hdu-08.html`, bloque `#ejemplos`): fondo claro, eyebrow "EJEMPLOS POR RUBRO", título "Esto es lo que dejamos funcionando en negocios como el tuyo", tarjetas con ícono y etiqueta del rubro. El `id` de la sección sigue siendo `casos`.
- **Compatibilidad:** los casos ya guardados sin rubro se tratan como "todos".
- **Editor de Casos en `/admin/config`:** selector de rubro por caso y botón "Usar los textos recomendados" que carga los 14 casos y los textos de la sección en el formulario (sin guardar).

## Capabilities

### New Capabilities
- `landing/casos-por-rubro`: ejemplos de lo que Nubolabs deja funcionando, clasificados por rubro y filtrables en la portada, editables desde el CMS.

### Modified Capabilities
<!-- Ninguna: no hay specs vigentes de la landing. -->

## Non-goals

- Páginas o URLs por rubro y SEO por rubro (roadmap 3).
- Casos de éxito con nombre de cliente (roadmap 5).
- Recordar el filtro elegido entre visitas o preseleccionarlo según el rubro del formulario.
- Cambiar la lista de rubros (vive en `lib/leadOptions.ts`, HDU-03).

## Criterios de aceptación

#### Scenario: Filtrar por rubro
- **WHEN** el visitante elige el chip "Gastronomía"
- **THEN** ve los 3 casos de gastronomía y los 3 "para todos", y el chip queda marcado como presionado

#### Scenario: Rubro sin casos
- **WHEN** ningún caso del CMS tiene el rubro "construcción"
- **THEN** no aparece el chip "Construcción"

#### Scenario: Caso nuevo desde el admin
- **WHEN** el admin agrega un caso con rubro "Construcción" y guarda
- **THEN** aparece al filtrar por Construcción en la siguiente carga, sin despliegue

#### Scenario: Casos antiguos
- **WHEN** `config/site` tiene casos guardados sin rubro
- **THEN** se muestran con la etiqueta "Para todos" y aparecen con cualquier filtro

#### Scenario: Móvil
- **WHEN** se abre la sección a 375 px
- **THEN** los chips pasan a varias líneas, miden al menos 44 px de alto y no hay scroll horizontal

## Impact

- **Código:** `lib/siteConfig.ts` (+ `lib/siteConfig.test.ts`), `lib/content.ts` (`useCases` → 14 casos por defecto), `components/landing/casesFilter.ts` (nuevo, + `casesFilter.test.ts`), `components/landing/UseCases.tsx` (server, rediseño), `components/landing/UseCasesFilter.tsx` (nuevo, cliente), `components/icons.tsx` (íconos de rubro), el editor de la sección Casos en `components/admin/`.
- **API y datos:** sin endpoints nuevos ni cambios en `app/api/**`. `config/site.content.casos.items[]` gana `rubro`; `POST /api/admin/config` ya lo acepta.
- **Variables de entorno:** ninguna.
- **Documentos a actualizar** (`docs/documentation-standards.md` §3): `docs/data-model.md` (`casos.items[].rubro` y sus valores), `docs/api-spec.yml` (`SiteContentPartial.casos.items[].rubro`), `docs/ESTADO-PROYECTO.md`, estado de HDU-05 en `docs/backlog/prospectos-oa.md`.
- **Producción:** Firestore ya tiene `casos.items` guardados (los 6 genéricos), que ganan sobre los defaults: tras mezclar, Mauro pulsa "Usar los textos recomendados" en Casos y guarda.
