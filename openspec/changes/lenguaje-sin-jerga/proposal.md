## Why

Después del hero (HDU-01) y del formulario (HDU-03), el resto de la portada sigue hablando "de tecnología" (n8n, Make, APIs, CRM, ERP, agentes IA) y vende "horas ahorradas", mientras que el prospecto de O&A es un dueño de pyme que no sabe de tecnología y compra resultados de negocio. La HDU-08 (`docs/backlog/propuesta-valor-hdu-08.md` §2, §3 y §5.1, aprobada el 2026-10-21) fijó los textos nuevos y la referencia visual (`docs/design/propuesta-web-hdu-08.html`). Además cierra el pendiente 2 de `docs/ESTADO-PROYECTO.md`: Problemas, Enfoque y Proceso siguen sin poder editarse desde el CMS.

## What Changes

- **Barrido de vocabulario** de la landing con la tabla de reemplazos de HDU-02 (`docs/backlog/prospectos-oa.md`) más los ajustes de la HDU-08: fuera "n8n", "Make", "API", "CRM", "ERP", "agentes", "IA", "nube", "ROI estimado" y "horas ahorradas" de todo texto visible, salvo una única **nota técnica** chica al final de Servicios.
- **"¿Te suena?" (Problemas) editable desde el CMS** (`content.problema`): 6 dolores en idioma de dueño y la línea de cierre "No es falta de ganas: tu negocio creció y la forma de trabajar no."
- **Sección nueva "Lo que ganas"** (clave `resultados`, ancla `#resultados`): 4 resultados (Vendes más, Tienes el control, Nada se olvida, Creces sin desordenarte) con mini-ilustraciones decorativas y la línea de cierre sobre el equipo. Textos en el CMS.
- **Enfoque editable** (`content.enfoque`): "Primero ordenamos, después automatizamos." con 3 pasos y la ilustración "antes / después" de una cotización (texto ilustrativo en código).
- **Servicios rediseñados y editables**: servicio destacado "Diagnóstico y plan de mejora" (etiqueta, qué incluye, resultado), 4 servicios con "lo que ganas", "Acompañamiento mensual" y la nota técnica (`content.servicios.destacado`, `acompanamiento`, `notaTecnica`, `subtitle`).
- **Proceso editable** (`content.proceso`): 4 pasos con "Recibes" y la franja "Tú defines qué es éxito" (`exito`). El paso de medición deja de hablar de horas. La sección pasa **después de "Casos"** en la portada.
- **Navegación**: se agrega "Lo que ganas" (`/#resultados`), "Casos de uso" pasa a "Ejemplos" y se quita "Inicio" (el logo ya lleva al inicio) junto con el resaltado fijo del primer ítem.
- **Casos**: solo se cambian los textos por defecto que tenían jerga (el rediseño por rubro es HDU-05).
- **`/diagnostico`**: solo el encabezado y la metadata pierden la jerga; resultados, estimador e informe quedan para HDU-09.
- **Admin**: `components/admin/ConfigEditor.tsx` se divide en editores por sección y cada sección suma "Usar los textos recomendados".

## Capabilities

### New Capabilities
- `landing/contenido-pyme`: textos y estructura de las secciones de contenido de la portada (Problemas, Lo que ganas, Enfoque, Servicios, Proceso), su vocabulario sin jerga, su orden, la navegación hacia ellas y su edición desde el CMS.

### Modified Capabilities
<!-- Ninguna: `landing/hero` (HDU-01) no cambia sus requisitos; las demás specs de la landing aún no existen. -->

## Non-goals

- Rediseñar Casos por rubro (HDU-05) ni ocultar las cifras "+120 h" / "−90%" (HDU-06); este cambio solo quita la jerga de los textos por defecto de Casos.
- Preguntas frecuentes, CTA final, CTA fija en móvil y footer (HDU-10).
- Resultado del diagnóstico, estimador de ahorro e informe PDF (HDU-09).
- Cambiar textos del hero (HDU-01) o del formulario (HDU-03).
- Cargar los textos en el Firestore de producción por script.

## Criterios de aceptación

#### Scenario: Portada sin jerga
- **WHEN** un visitante recorre `/` con los textos por defecto
- **THEN** las palabras "n8n", "Make", "API", "CRM", "ERP", "agente(s)", "IA", "ROI" y la expresión "horas ahorradas" solo aparecen dentro de la nota técnica de Servicios

#### Scenario: Lo que ganas
- **WHEN** el visitante hace clic en "Lo que ganas" del menú
- **THEN** llega a la sección `#resultados` con los 4 resultados y la línea de cierre

#### Scenario: Problemas, Enfoque y Proceso editables
- **WHEN** el admin edita un dolor de "¿Te suena?", un paso del Enfoque o el "Recibes" de un paso del Proceso y guarda
- **THEN** la portada lo muestra en la siguiente carga, sin despliegue

#### Scenario: Textos recomendados
- **WHEN** el admin pulsa "Usar los textos recomendados" en la sección Servicios
- **THEN** el editor se rellena con los textos por defecto de la HDU-08 sin guardar todavía

#### Scenario: Orden de la portada
- **WHEN** se abre `/` con todas las secciones visibles
- **THEN** el orden es: hero, ¿Te suena?, Lo que ganas, Enfoque, Servicios, Casos, Proceso, Contacto

## Impact

- **Código:** `lib/siteConfig.ts` (+ `lib/siteConfig.test.ts`), `lib/content.ts`, `app/page.tsx`, `components/landing/{Problem,Results (nuevo),Approach,Services,Process,UseCases,Nav}.tsx`, `components/icons.tsx`, `components/admin/ConfigEditor.tsx` → `components/admin/config/*` (editores por sección), `app/admin/(panel)/config/page.tsx`, `components/diagnostico/DiagnosticoFlow.tsx` (solo encabezado), `app/diagnostico/page.tsx` (metadata).
- **API y datos:** sin endpoints nuevos. `config/site` suma `content.problema`, `content.resultados`, `content.enfoque`, `content.proceso` y los campos `subtitle`, `destacado`, `acompanamiento`, `notaTecnica` de `content.servicios`; clave de visibilidad nueva `resultados`. `POST /api/admin/config` ya los acepta (merge de `content`).
- **Variables de entorno:** ninguna.
- **Documentos a actualizar:** `docs/data-model.md`, `docs/api-spec.yml` (`SiteContentPartial`), `docs/frontend-standards.md` (anclas, editores del admin, secciones editables), `docs/ESTADO-PROYECTO.md` (cierra el pendiente 2), `docs/backlog/prospectos-oa.md` (estado de HDU-02).
- **Producción:** Firestore ya guarda `servicios.items` y `casos.items` antiguos, que ganan sobre los defaults: tras mezclar, Mauro usa "Usar los textos recomendados" en Servicios, Casos y las secciones nuevas, y guarda.
