## Purpose

Define la página pública de privacidad de nubolabs.cl: qué informa sobre el tratamiento de los datos de los leads, cómo se edita desde el CMS y desde dónde se enlaza, como apoyo al consentimiento exigido por la Ley 21.719.

## ADDED Requirements

### Requirement: Página pública de privacidad
El sitio SHALL publicar `/privacidad` con un título y un texto. El texto SHALL mostrarse como párrafos (separados por líneas en blanco) y como texto plano: MUST NOT interpretar HTML ni scripts escritos en el CMS. La página SHALL estar siempre disponible (no tiene interruptor de visibilidad).

#### Scenario: Visita a la página
- **WHEN** un visitante abre `/privacidad`
- **THEN** ve el título y el texto en párrafos, con la navegación y el pie del sitio

#### Scenario: HTML escrito en el CMS
- **WHEN** el texto guardado contiene `<script>alert(1)</script>`
- **THEN** la página lo muestra como texto literal y no ejecuta nada

### Requirement: Contenido mínimo por defecto
Sin texto en el CMS, `/privacidad` SHALL mostrar un borrador que informe: quién es el responsable (Nubolabs) y su correo de contacto (`mauricio.nubolabs@gmail.com`); para qué se usan los datos (responder la solicitud y coordinar el diagnóstico; novedades solo con la casilla marcada); qué datos se guardan; qué proveedores los tratan y que eso implica transferencia fuera de Chile (Google Firebase y Resend); cuánto tiempo se conservan; los derechos de acceso, rectificación, supresión, oposición, portabilidad y bloqueo; cómo ejercerlos y el plazo de respuesta de 30 días corridos; y que el consentimiento para novedades se puede retirar en cualquier momento.

#### Scenario: Sin texto en el CMS
- **WHEN** `config/site` no tiene `content.privacidad`
- **THEN** la página muestra el borrador con el correo `mauricio.nubolabs@gmail.com` y la mención de "30 días"

### Requirement: Edición desde el admin
El título y el texto SHALL ser editables desde `/admin/config` y guardarse en `config/site` como `content.privacidad.titulo` y `content.privacidad.texto`. Un título o texto guardado vacío (o solo con espacios) SHALL reemplazarse por el default para no publicar una página en blanco. El editor SHALL ofrecer "Usar los textos recomendados" para cargar el borrador por defecto sin guardar.

#### Scenario: Texto vacío
- **WHEN** el admin guarda el texto de privacidad vacío
- **THEN** `/privacidad` sigue mostrando el borrador por defecto

#### Scenario: Texto editado
- **WHEN** el admin guarda un texto nuevo
- **THEN** `/privacidad` lo muestra en la siguiente carga, sin despliegue

### Requirement: Enlaces a la política
La casilla de consentimiento obligatoria de los formularios SHALL enlazar a `/privacidad` con el texto "Cómo cuidamos tus datos". El pie de la portada y el pie de `/diagnostico` SHALL incluir un enlace "Privacidad" a `/privacidad`.

#### Scenario: Desde el formulario
- **WHEN** el visitante pulsa "Cómo cuidamos tus datos" en el formulario
- **THEN** se abre `/privacidad` en una pestaña nueva y el formulario conserva lo escrito
