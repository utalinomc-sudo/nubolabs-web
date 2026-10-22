## Purpose

Define cómo termina la portada y el sitio público de Nubolabs para que el prospecto resuelva sus dudas y agende: preguntas frecuentes, CTA final, CTA fija en móvil, footer y su edición desde el CMS.

## ADDED Requirements

### Requirement: Preguntas frecuentes
La portada SHALL mostrar, si la sección `faq` está visible (por defecto sí), una sección con ancla `preguntas` ubicada después del formulario de contacto, con eyebrow "Preguntas frecuentes", título "Lo que nos preguntan antes de partir" y una lista de preguntas en acordeón. Por defecto SHALL tener 6 preguntas: "¿Necesito saber de tecnología?", "¿Tengo que cambiar mis sistemas?", "¿Cuánto cuesta?", "¿Qué pasa en la sesión gratuita?", "¿Cuándo voy a ver resultados?" y "¿Qué hacen con mis datos?", con las respuestas de la referencia de la HDU-08. Todas las preguntas SHALL empezar cerradas; cada una MUST poder abrirse y cerrarse con mouse, toque o teclado, y su estado abierto/cerrado MUST ser perceptible para lectores de pantalla. Eyebrow, título y preguntas (entre 1 y 10, cada una con pregunta y respuesta no vacías) SHALL ser editables desde el CMS.

#### Scenario: Preguntas por defecto
- **WHEN** se abre `/` sin `content.faq` en el CMS
- **THEN** después del formulario aparecen las 6 preguntas por defecto, todas cerradas

#### Scenario: Abrir con teclado
- **WHEN** el visitante enfoca "¿Cuánto cuesta?" con Tab y presiona Enter
- **THEN** la respuesta se despliega, y con Enter otra vez se oculta

#### Scenario: Preguntas guardadas inválidas
- **WHEN** `content.faq.items` guardado no es una lista, o ninguna pregunta tiene pregunta y respuesta
- **THEN** se muestran las 6 preguntas por defecto

#### Scenario: Sección oculta
- **WHEN** el admin oculta "Preguntas frecuentes"
- **THEN** la sección no se muestra, el menú no ofrece "Preguntas" y no queda espacio vacío

### Requirement: Enlaces internos en las respuestas
Las respuestas de las preguntas frecuentes SHALL convertir el formato `[texto](destino)` en un enlace cuando el destino es interno: empieza con una sola `/` o con `#`, no contiene espacios ni `\` y resuelve al mismo origen del sitio. Cualquier otro destino (por ejemplo `https://…`, `//…` o `javascript:…`) MUST mostrarse como texto plano, sin enlace. El texto de las respuestas MUST NOT interpretarse como HTML. La respuesta por defecto de "¿Qué hacen con mis datos?" SHALL enlazar a `/privacidad`.

#### Scenario: Enlace a privacidad
- **WHEN** el visitante abre "¿Qué hacen con mis datos?"
- **THEN** la respuesta incluye un enlace que lleva a `/privacidad`

#### Scenario: Destino externo bloqueado
- **WHEN** una respuesta guardada contiene `[clic](javascript:alert(1))` o `[sitio](https://ejemplo.com)`
- **THEN** se muestra el texto "clic" o "sitio" sin enlace

#### Scenario: Barra invertida bloqueada
- **WHEN** una respuesta guardada contiene `[otro](/\evil.com)` (los navegadores leen `\` como `/`)
- **THEN** se muestra el texto "otro" sin enlace

#### Scenario: HTML en la respuesta
- **WHEN** una respuesta guardada contiene `<b>hola</b>`
- **THEN** se muestra literalmente `<b>hola</b>` como texto

### Requirement: CTA final
La portada SHALL mostrar, si la sección `cierre` está visible (por defecto sí), una banda final después de las preguntas frecuentes con eyebrow "Tu operación, en piloto automático", título "Tu negocio puede trabajar para ti. Empecemos por una conversación.", texto "Cuéntanos qué quieres lograr y te mostramos por dónde partir.", el botón "Agendar mi diagnóstico gratis" y la nota "30 minutos · por videollamada · sin compromiso". El botón SHALL llevar a `#contacto`; si la sección de contacto está oculta, SHALL llevar a `/diagnostico`. Eyebrow, título, texto y texto del botón SHALL ser editables desde el CMS.

#### Scenario: Botón de la banda final
- **WHEN** el visitante hace clic en el botón de la banda final con el contacto visible
- **THEN** la página se desplaza al formulario `#contacto`

#### Scenario: Contacto oculto
- **WHEN** la sección de contacto está oculta y el visitante hace clic en el botón de la banda final
- **THEN** llega a `/diagnostico`

### Requirement: CTA fija en móvil
En pantallas de hasta 640 px de ancho, la portada SHALL mostrar un botón fijo (sin repetir la flecha si el texto guardado ya termina en "→") en la parte inferior con el mismo texto del botón principal del hero (por defecto "Quiero mi diagnóstico gratis") que lleva a `#contacto`. El botón SHALL estar oculto mientras el hero esté en pantalla y mientras el formulario de contacto esté en pantalla, y visible en el resto del recorrido. MUST respetar el área segura inferior del dispositivo y MUST NOT tapar de forma permanente el contenido final de la página. En pantallas de más de 640 px MUST NOT mostrarse. Si la sección de contacto está oculta, el botón MUST NOT existir.

#### Scenario: Aparece después del hero
- **WHEN** a 375 px el visitante baja hasta "Lo que ganas"
- **THEN** el botón fijo es visible y lleva a `#contacto`

#### Scenario: Se oculta junto al formulario
- **WHEN** el formulario de contacto entra en pantalla
- **THEN** el botón fijo se oculta

#### Scenario: Escritorio
- **WHEN** se abre la portada a 1280 px y se recorre completa
- **THEN** el botón fijo nunca aparece

### Requirement: Footer del sitio público
Todas las páginas públicas (portada, `/equipo`, `/mision-vision`, `/privacidad`) SHALL mostrar el mismo footer con: el logo y la frase "Ordenamos tu negocio y dejamos funcionando solo lo repetitivo. Tu operación, en piloto automático."; una columna "Servicios" con "Diagnóstico y plan", "Tareas que avanzan solas", "Clientes atendidos al instante" y "Tus números claros", todos hacia `/#servicios` (la columna solo si la sección Servicios está visible); una columna "Nubolabs" con "Misión y visión" y "Equipo" (cada uno solo si su página está visible), "Cómo trabajamos" (`/#modelo`, solo si la sección está visible) y "Preguntas frecuentes" (`/#preguntas`, solo si la sección está visible); una columna "Contacto" con el sitio `www.nubolabs.cl`, el WhatsApp de Nubolabs solo si está activado (ver "WhatsApp de contacto configurable") y "Agendar diagnóstico" (`/#contacto`, o `/diagnostico` si la sección de contacto está oculta); el enlace "Privacidad" (`/privacidad`, el mismo texto que exige `sitio/privacidad`); y "© <año actual> Nubolabs · Hecho en Chile". El footer MUST NOT mostrar `hola@nubolabs.ai`.

#### Scenario: Footer en una página interna
- **WHEN** se abre `/equipo`
- **THEN** el footer muestra las 4 columnas, el enlace a privacidad y el año actual, sin `hola@nubolabs.ai`

#### Scenario: Página oculta
- **WHEN** la página "Equipo" está oculta en el CMS
- **THEN** el footer no ofrece el enlace "Equipo"

### Requirement: WhatsApp de contacto configurable
El número de WhatsApp de Nubolabs y dos interruptores independientes SHALL guardarse en `config/site` como `content.contact` (`whatsappNumber`, `showWhatsapp`, `showWhatsappQr`) y editarse en `/admin/config`. Sin datos guardados, el número por defecto SHALL ser `56932590783` y ambos interruptores SHALL estar apagados. Con `showWhatsapp` activo, el footer SHALL mostrar el número con formato "+56 9 XXXX XXXX" y enlace a `https://wa.me/<dígitos>`. Con `showWhatsappQr` activo, la sección de contacto SHALL mostrar una tarjeta "¿Prefieres escribirnos?" con un código QR que abre `https://wa.me/<dígitos>`; en pantallas de hasta 820 px de ancho SHALL mostrar un enlace directo en lugar del QR. Si el número guardado tiene menos de 8 o más de 15 dígitos (incluido un número borrado o sin dígitos), el sitio MUST NOT mostrar ni el número ni la tarjeta; el número por defecto solo se usa cuando no hay un número guardado. Mientras ambos interruptores estén apagados, ninguna página pública MUST mostrar un número, un enlace ni un QR de WhatsApp de Nubolabs.

#### Scenario: Valores por defecto
- **WHEN** `config/site` no tiene `content.contact`
- **THEN** ninguna página pública muestra un número, un enlace `wa.me` ni un QR de WhatsApp de Nubolabs

#### Scenario: Solo el número en el pie
- **WHEN** el admin activa "Mostrar WhatsApp en el pie de página" con el número `+56 9 3259 0783` y guarda
- **THEN** el footer de todas las páginas públicas muestra "+56 9 3259 0783" con enlace a `https://wa.me/56932590783`, y no aparece la tarjeta con QR

#### Scenario: Solo el QR
- **WHEN** el admin activa solo "Mostrar QR junto al formulario"
- **THEN** a 1280 px la sección de contacto muestra la tarjeta con un QR que al escanearse abre `https://wa.me/56932590783`, y el footer no muestra el número

#### Scenario: QR en celular
- **WHEN** el QR está activo y se abre la portada a 375 px
- **THEN** la tarjeta muestra "Toca aquí y te respondemos por WhatsApp" sin el código QR y enlaza a `https://wa.me/56932590783`

#### Scenario: Número inválido
- **WHEN** el número guardado es "123" y ambos interruptores están activos
- **THEN** no se muestra ni el número ni la tarjeta

#### Scenario: Número borrado
- **WHEN** el admin borra el número, deja ambos interruptores activos y guarda
- **THEN** no se muestra ningún número ni tarjeta (no vuelve el número por defecto)

### Requirement: "Preguntas" en la navegación
La navegación principal (escritorio y menú móvil) SHALL incluir "Preguntas" con destino `/#preguntas` después de "Cómo trabajamos", solo cuando la sección `faq` está visible. Bajo 1080 px de ancho los enlaces SHALL ofrecerse en el menú desplegable; desde 1080 px, en una sola línea sin que ningún texto se parta.

#### Scenario: Menú con preguntas
- **WHEN** el visitante abre el menú con la sección de preguntas visible
- **THEN** ve "Preguntas" y al pulsarlo llega a `#preguntas`

### Requirement: Textos recomendados en el admin
En `/admin/config`, la sección "Contacto" SHALL permitir editar el número de WhatsApp y los dos interruptores. Las secciones "Preguntas frecuentes" y "CTA final" SHALL ser editables y SHALL ofrecer "Usar los textos recomendados", que reemplaza en el formulario los textos de esa sección por los defaults sin guardar. El editor de preguntas SHALL permitir agregar, quitar y reordenar preguntas dentro del límite de 1 a 10 e indicar el formato `[texto](/ruta)` para enlaces.

#### Scenario: Restablecer preguntas
- **WHEN** el admin borra preguntas y pulsa "Usar los textos recomendados" en "Preguntas frecuentes"
- **THEN** el formulario vuelve a mostrar las 6 preguntas por defecto y nada se guarda hasta pulsar "Guardar cambios"

### Requirement: Cierre usable en móvil y accesible
A 375 px de ancho la portada y las páginas internas MUST NOT tener scroll horizontal. Los botones y enlaces de estas piezas SHALL medir al menos 44 px de alto (los enlaces del footer al menos 32 px con separación suficiente; los enlaces dentro de un párrafo, como el de una respuesta, se rigen por la excepción de texto en línea de WCAG 2.5.8 y van siempre subrayados) y todo texto SHALL cumplir contraste WCAG AA sobre su fondo.

#### Scenario: Móvil
- **WHEN** se abre `/` a 375 × 812 px y se baja hasta el footer
- **THEN** el ancho del documento no supera el de la pantalla y el footer se lee en una columna
