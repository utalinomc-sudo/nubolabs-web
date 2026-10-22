## Why

La portada muestra "+120 h ahorradas al mes por cliente", "minutos donde antes había días" y "−90% de error" bajo los casos de uso, con la nota "cifras referenciales de ejemplo". A un dueño de pyme desconfiado, números redondos sin respaldo le suenan a humo, y además refuerzan la promesa de "horas ahorradas" que la HDU-08 (aprobada el 2026-10-21, `docs/backlog/propuesta-valor-hdu-08.md` §9 y §11) decidió dejar atrás. La HDU-06 pide ocultarlas de inmediato y poder publicar las reales del piloto de O&A desde el CMS el mismo día que existan.

## What Changes

- **Se eliminan las cifras de ejemplo** (`metrics` en `lib/content.ts`) y su bloque bajo los casos de uso, incluida la nota "* cifras referenciales de ejemplo".
- **Nueva sección "Cifras"** (clave `cifras` en `SECTIONS`, después de `casos`) **oculta por defecto** (`visible.cifras = false`).
- **Contenido editable** en `config/site.content.cifras`: `items[]` (`valor`, `texto`, `fuente`) y `frase` (texto cualitativo).
- **Solo cifras con respaldo:** una cifra sin `valor`, `texto` o `fuente` no se muestra; cada cifra visible lleva su fuente en letra chica. Máximo 4.
- **Sin cifras válidas y con la sección visible:** se muestra solo la frase (por defecto "Medimos cada proyecto con los indicadores que tú elijas, y en el diagnóstico te mostramos los números de tu caso."); si tampoco hay frase, la sección no se renderiza.
- **Editor "Cifras" en `/admin/config`:** lista de cifras (agregar, editar, quitar), frase, ayuda "Usa solo datos reales con su fuente; prefiere resultados del negocio (por ejemplo, cotizaciones respondidas el mismo día) antes que horas" y botón "Usar los textos recomendados" (solo la frase).

## Capabilities

### New Capabilities
- `landing/cifras`: cifras de resultados de la portada, ocultas por defecto, publicables solo con fuente desde el CMS.

### Modified Capabilities
- `landing/contenido-pyme`: la regla de vocabulario deja de exceptuar las cifras de Casos ("+120 h", "minutos", "−90%") "hasta HDU-06": esas cifras se eliminan en este cambio (ajuste de la revisión adversarial).

## Non-goals

- Calcular cifras automáticamente a partir de leads o diagnósticos.
- Gráficos o animaciones de conteo.
- Cambiar los casos de uso (HDU-05 `casos-por-rubro`) más allá de quitarles el bloque de cifras.
- Bloquear desde el admin cifras expresadas en horas: es una recomendación, no una regla.

## Criterios de aceptación

#### Scenario: Sin cifras de ejemplo
- **WHEN** un visitante abre `/` con la configuración por defecto
- **THEN** no ve "+120 h", "−90%", "minutos donde antes había días" ni "cifras referenciales de ejemplo"

#### Scenario: Publicar una cifra real
- **WHEN** el admin carga la cifra "Mismo día" · "en responder cotizaciones" · "Piloto con cliente de O&A, 2026", activa la sección y guarda
- **THEN** la portada muestra la cifra después de los casos de uso, con su fuente visible

#### Scenario: Cifra sin fuente
- **WHEN** el admin guarda una cifra con `fuente` vacía y la sección visible
- **THEN** esa cifra no se muestra

#### Scenario: Oculta sin hueco
- **WHEN** la sección está oculta (por defecto)
- **THEN** entre los casos de uso y la sección siguiente no queda espacio vacío

## Impact

- **Código:** `lib/content.ts` (se elimina `metrics`), `lib/siteConfig.ts` (+ `lib/siteConfig.test.ts`), `components/landing/UseCases.tsx` (se quita el bloque de métricas), `components/landing/Metrics.tsx` (nuevo, + `Metrics.test.tsx`), `app/page.tsx`, el editor de la sección Cifras en `components/admin/`, `app/admin/(panel)/config/page.tsx` si cambia `initialContent`.
- **API y datos:** sin endpoints nuevos ni cambios en `app/api/**`. `config/site` gana `visible.cifras` y `content.cifras`; `POST /api/admin/config` ya los acepta.
- **Variables de entorno:** ninguna.
- **Documentos a actualizar** (`docs/documentation-standards.md` §3): `docs/data-model.md`, `docs/api-spec.yml` (`SiteContentPartial.cifras`), `docs/ESTADO-PROYECTO.md`, estado de HDU-06 en `docs/backlog/prospectos-oa.md`.
- **Producción:** las cifras viejas desaparecen al desplegar (no estaban en el CMS). Mauro activa la sección cuando tenga el dato real del piloto de O&A.
