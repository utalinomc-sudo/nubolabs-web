## Why

El prospecto que llega por el correo de O&A viene por la confianza de su contador, y hoy la portada no tiene ninguna prueba social que la confirme: es el activo más fuerte de la campaña y no se usa. La HDU-04, ajustada por la HDU-08 (aprobada el 2026-10-21, `docs/backlog/propuesta-valor-hdu-08.md` §8 y §15), pide un bloque de confianza justo después del hero, con testimonios que Mauro pueda cargar desde el CMS apenas el cliente los autorice. El testimonio de Mauricio O. está **pendiente de su visto bueno**, así que el sitio debe verse bien y ser honesto sin él.

## What Changes

- **Nueva sección "Confianza"** (clave `confianza` en `SECTIONS`, inmediatamente después de `hero`, visible por defecto) con el diseño de la referencia `docs/design/propuesta-web-hdu-08.html` (bloque `.trust`): panel navy a la izquierda y "Nuestro compromiso contigo" a la derecha.
- **Contenido editable** en `config/site.content.confianza`: `eyebrow`, `textoPuente`, `testimonios[]` (`nombre`, `cargo`, `empresa`, `texto`, `destacado`) y `compromisos[]` (`titulo`, `texto`).
- **Sin testimonios (estado por defecto):** el panel navy muestra el texto puente "Trabajamos con estudios contables y empresas que nos recomiendan a sus clientes." sin comillas ni nombres de personas. **Ningún testimonio viene por defecto en el código.**
- **Con testimonios:** el destacado (o el primero) va en el panel navy con nombre, cargo, empresa e iniciales; hasta 2 más se muestran como tarjetas compactas bajo el bloque. Nunca más de 3.
- **Tres compromisos por defecto:** "Primera sesión gratis", "Con lo que ya usas" y "Sin letra chica" (textos de la referencia).
- **Cita breve en la sección de agendar** (`#contacto`): bajo los beneficios, el testimonio destacado, solo si existe y la sección de confianza está visible.
- **Editor "Confianza" en `/admin/config`:** textos, compromisos y lista de testimonios (agregar, editar, ordenar, quitar, marcar destacado), con la nota fija "Publica solo testimonios con autorización escrita del cliente" y el botón "Usar los textos recomendados" (no toca los testimonios).

## Capabilities

### New Capabilities
- `landing/confianza`: bloque de prueba social de la portada (texto puente, testimonios autorizados, compromisos) y su cita breve en la sección de agendar, editables desde el CMS.

### Modified Capabilities
<!-- Ninguna: `landing/hero` y el formulario no cambian sus requisitos; la cita breve es un requisito de esta capacidad. -->

## Non-goals

- Logos de clientes con subida de imágenes (se podrá sumar después reutilizando `POST /api/admin/upload`).
- Casos de éxito largos o páginas por cliente (roadmap 5).
- Fotos de las personas del testimonio: se usan iniciales.
- Carrusel o rotación automática de testimonios.
- Publicar el testimonio de Mauricio O.: es un paso de Mauro tras su aprobación (post-merge), no parte del código.

## Criterios de aceptación

#### Scenario: Portada sin testimonios
- **WHEN** un visitante abre `/` y `config/site` no tiene testimonios
- **THEN** inmediatamente después del hero ve el panel con "Trabajamos con estudios contables y empresas que nos recomiendan a sus clientes." y los 3 compromisos, sin comillas ni nombres de personas

#### Scenario: Testimonio autorizado cargado
- **WHEN** el admin agrega un testimonio, lo marca destacado y guarda
- **THEN** en la siguiente carga el panel muestra ese texto con nombre, cargo, empresa e iniciales, y la sección de agendar muestra la cita breve

#### Scenario: Sección oculta
- **WHEN** el admin desactiva "Confianza" en las secciones visibles
- **THEN** el bloque desaparece sin dejar espacio y la cita breve de la sección de agendar tampoco se muestra

#### Scenario: Móvil
- **WHEN** se abre la portada a 375 px
- **THEN** el panel y los compromisos se apilan en una columna sin scroll horizontal

## Impact

- **Código:** `lib/siteConfig.ts` (+ `lib/siteConfig.confianza.test.ts`), `lib/content.ts` (título fijo "Nuestro compromiso contigo"), `components/landing/Trust.tsx` (nuevo, + `Trust.test.tsx`), `app/page.tsx` (orden y props), la sección de agendar de HDU-03 (cita breve), el editor de la sección Confianza en `components/admin/`, `app/admin/(panel)/config/page.tsx` si cambia `initialContent`.
- **API y datos:** sin endpoints nuevos ni cambios en `app/api/**`. `config/site` gana `visible.confianza` y `content.confianza`; `POST /api/admin/config` ya los acepta (merge).
- **Variables de entorno:** ninguna.
- **Documentos a actualizar** (`docs/documentation-standards.md` §3): `docs/data-model.md` (clave `confianza` en `visible` y `content.confianza`), `docs/api-spec.yml` (`SiteContentPartial.confianza`), `docs/ESTADO-PROYECTO.md`, estado de HDU-04 en `docs/backlog/prospectos-oa.md`.
- **Producción:** tras mezclar, Mauro revisa los textos con "Usar los textos recomendados" y, cuando Mauricio O. apruebe, carga su testimonio (HDU-08 §8) como destacado.
