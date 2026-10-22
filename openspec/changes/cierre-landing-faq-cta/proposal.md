## Why

Con HDU-01, 03 y 02 la portada ya habla el idioma del dueño de pyme, pero termina en el formulario y en un footer mínimo con un correo (`hola@nubolabs.ai`) que no corresponde al dominio verificado (`nubolabs.cl`). Al prospecto que llega por la recomendación de O&A le quedan dudas típicas antes de agendar ("¿necesito saber de tecnología?", "¿cuánto cuesta?", "¿qué hacen con mis datos?") y en el celular el botón de agendar desaparece apenas pasa el hero. La HDU-08 (`docs/backlog/propuesta-valor-hdu-08.md`, aprobada el 2026-10-21) y su referencia visual (`docs/design/propuesta-web-hdu-08.html`) definen el cierre: preguntas frecuentes, CTA final, CTA fija en móvil y footer nuevo. Es la HDU-10 del backlog (`docs/backlog/prospectos-oa.md`).

## What Changes

- **Preguntas frecuentes** (clave `faq`, ancla `#preguntas`) después del formulario: 6 preguntas por defecto de la referencia (tecnología, sistemas, costo, sesión gratuita, plazos y datos personales), en acordeón accesible, editables desde el CMS (`content.faq`). Las respuestas admiten enlaces internos con la forma `[texto](/ruta)`; la de datos enlaza a `/privacidad`.
- **CTA final** (clave `cierre`): banda con "Tu negocio puede trabajar para ti. Empecemos por una conversación." y el botón "Agendar mi diagnóstico gratis" hacia `#contacto`, editable (`content.cierre`).
- **CTA fija en móvil** (≤ 640 px): botón "Quiero mi diagnóstico gratis" abajo de la pantalla, visible después del hero y oculto mientras el formulario está a la vista; respeta el área segura del teléfono.
- **Footer nuevo** en todas las páginas públicas: marca y frase, columnas Servicios, Nubolabs (con Misión y visión / Equipo según su visibilidad, Cómo trabajamos y Preguntas), Contacto (web, agendar y, si está activado, WhatsApp) y Privacidad. Se elimina `hola@nubolabs.ai` hasta resolver el correo público (HDU-08 §14, pregunta 4).
- **WhatsApp de contacto configurable** (HDU-08 §14, decisión 8 del 2026-10-22): `content.contact` guarda el número (por defecto el de Germán, `56932590783`) y dos interruptores independientes, ambos apagados por defecto: `showWhatsapp` (número en el footer) y `showWhatsappQr` (tarjeta "¿Prefieres escribirnos?" con QR a `wa.me` junto al formulario; en celular, enlace directo). Se editan en `/admin/config` → "Contacto".
- **Navegación:** se agrega "Preguntas" (`/#preguntas`), oculto si la sección está oculta.
- **Admin:** editores "Preguntas frecuentes" y "CTA final" con "Usar los textos recomendados".

## Capabilities

### New Capabilities
- `landing/cierre`: cierre de la portada y del sitio público: preguntas frecuentes, CTA final, CTA fija en móvil, footer y su enlace desde la navegación, con su edición desde el CMS.

### Modified Capabilities
<!-- Ninguna: `landing/contenido-pyme` (HDU-02) no cambia sus requisitos; el ítem "Preguntas" del menú se define aquí. -->

## Non-goals

- Cambiar el formulario de `#contacto` o la página `/privacidad` (HDU-03); solo se enlazan.
- Definir un correo público de contacto (pregunta abierta 4 de la HDU-08 §14).
- Integrar WhatsApp Business o un chat (roadmap 4); el enlace a WhatsApp es un `wa.me` simple.
- Redes sociales en el footer (no hay perfiles definidos además de LinkedIn personal).
- Analítica de clics en las CTA (roadmap 3).

## Criterios de aceptación

#### Scenario: Preguntas frecuentes
- **WHEN** el visitante hace clic en "Preguntas" del menú y abre "¿Qué hacen con mis datos?"
- **THEN** ve la respuesta y un enlace que lleva a `/privacidad`

#### Scenario: CTA final
- **WHEN** el visitante hace clic en "Agendar mi diagnóstico gratis" de la banda final
- **THEN** la página sube al formulario `#contacto`

#### Scenario: CTA fija en móvil
- **WHEN** a 375 px el visitante baja más allá del hero
- **THEN** aparece el botón fijo "Quiero mi diagnóstico gratis", y desaparece cuando el formulario entra en pantalla

#### Scenario: Footer sin correo inválido
- **WHEN** se abre `/`, `/equipo`, `/mision-vision` o `/privacidad`
- **THEN** el footer muestra web, agendar y Privacidad, y no muestra `hola@nubolabs.ai` (tampoco el pie propio de `/diagnostico`)

#### Scenario: WhatsApp apagado por defecto
- **WHEN** `content.contact` no existe en `config/site` o tiene ambos interruptores apagados
- **THEN** ninguna página muestra un número ni un QR de WhatsApp de Nubolabs

#### Scenario: WhatsApp activado desde el admin
- **WHEN** el admin activa "Mostrar WhatsApp en el pie" y "Mostrar QR junto al formulario" y guarda
- **THEN** en la siguiente carga el footer muestra "+56 9 3259 0783" con enlace a `https://wa.me/56932590783` y junto al formulario aparece la tarjeta con el QR, sin despliegue

#### Scenario: Edición desde el admin
- **WHEN** el admin agrega una pregunta frecuente en `/admin/config` y guarda
- **THEN** la portada la muestra en la siguiente carga, sin despliegue

## Impact

- **Código:** `lib/siteConfig.ts` (+ tests; `content.contact` con `normalizeContact` y `formatWhatsapp`), `lib/content.ts` (`contact` solo con la web, `footerLinks`, `ctaNote`, `nav`), `lib/inlineLinks.ts` (nuevo, + `lib/inlineLinks.test.ts`), `lib/qrSvg.ts` (nuevo, + test), `components/landing/{Faq,FinalCta,StickyCta,WhatsappCard}.tsx` (nuevos; `StickyCta` cliente, + tests), `components/landing/Footer.tsx` (reescrito), `components/landing/Nav.tsx` (`showFaq`), `app/page.tsx`, `app/equipo/page.tsx`, `app/mision-vision/page.tsx`, `app/privacidad/page.tsx` (props del footer), `components/admin/config/{Faq,Cierre,Contact}Editor.tsx`, `components/admin/ConfigEditor.tsx`.
- **API y datos:** sin endpoints nuevos. `config/site` suma `content.faq`, `content.cierre` y `content.contact` (`whatsappNumber`, `showWhatsapp`, `showWhatsappQr`), y las claves de visibilidad `faq` y `cierre`. `POST /api/admin/config` ya los acepta.
- **Dependencias:** `qrcode-generator` (MIT, sin dependencias) para dibujar el QR como SVG en el servidor, sin scripts de terceros en el navegador.
- **Variables de entorno:** ninguna.
- **Documentos a actualizar:** `docs/data-model.md`, `docs/api-spec.yml` (`SiteContentPartial`), `docs/frontend-standards.md` (ancla `preguntas`, componentes nuevos, enlaces internos en textos del CMS), `docs/ESTADO-PROYECTO.md`, `docs/backlog/prospectos-oa.md` (estado de HDU-10).
- **Producción:** las secciones nuevas no tienen overrides en Firestore, así que muestran los defaults apenas se despliega; Mauro solo revisa los textos (la respuesta sobre datos personales debe ser coherente con `/privacidad`, que valida O&A o un abogado).
