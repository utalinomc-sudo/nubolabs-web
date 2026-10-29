## MODIFIED Requirements

### Requirement: Preguntas frecuentes
La portada SHALL mostrar, si la sección `faq` está visible (por defecto sí), una sección con ancla `preguntas` ubicada después del formulario de contacto, con eyebrow "Preguntas frecuentes", título "Lo que nos preguntan antes de partir" y una lista de preguntas en acordeón. Por defecto SHALL tener 7 preguntas, en este orden: "¿Necesito saber de tecnología?", "¿Es una solución estándar o hecha para mi negocio?" (respuesta: "Hecha para tu negocio. Partimos de tu problema y de cómo trabaja tu equipo; usamos piezas probadas donde conviene, pero la solución se arma para tu caso, no para el promedio."), "¿Tengo que cambiar mis sistemas?" (respuesta: "No. Nos conectamos con lo que ya usas y solo proponemos algo nuevo si de verdad te conviene."), "¿Cuánto cuesta?", "¿Qué pasa en la sesión gratuita?", "¿Cuándo voy a ver resultados?" y "¿Qué hacen con mis datos?", con las demás respuestas de la referencia de la HDU-08. Ninguna respuesta por defecto MUST nombrar herramientas ni canales concretos. Todas las preguntas SHALL empezar cerradas; cada una MUST poder abrirse y cerrarse con mouse, toque o teclado, y su estado abierto/cerrado MUST ser perceptible para lectores de pantalla. Eyebrow, título y preguntas (entre 1 y 10, cada una con pregunta y respuesta no vacías) SHALL ser editables desde el CMS.

#### Scenario: Preguntas por defecto
- **WHEN** se abre `/` sin `content.faq` en el CMS
- **THEN** después del formulario aparecen las 7 preguntas por defecto, todas cerradas

#### Scenario: Abrir con teclado
- **WHEN** el visitante enfoca "¿Cuánto cuesta?" con Tab y presiona Enter
- **THEN** la respuesta se despliega, y con Enter otra vez se oculta

#### Scenario: Preguntas guardadas inválidas
- **WHEN** `content.faq.items` guardado no es una lista, o ninguna pregunta tiene pregunta y respuesta
- **THEN** se muestran las 7 preguntas por defecto

#### Scenario: Sección oculta
- **WHEN** el admin oculta "Preguntas frecuentes"
- **THEN** la sección no se muestra, el menú no ofrece "Preguntas" y no queda espacio vacío

### Requirement: CTA final
La portada SHALL mostrar, si la sección `cierre` está visible (por defecto sí), una banda final después de las preguntas frecuentes con eyebrow "Soluciones a tu medida, decisiones con datos", título "Tu negocio tiene su propio problema. Empecemos por entenderlo.", texto "Cuéntanos qué te frena y te mostramos por dónde partir.", el botón "Agendar mi diagnóstico gratis" y la nota "30 minutos · por videollamada · sin compromiso". El botón SHALL llevar a `#contacto`; si la sección de contacto está oculta, SHALL llevar a `/diagnostico`. Eyebrow, título, texto y texto del botón SHALL ser editables desde el CMS.

#### Scenario: Botón de la banda final
- **WHEN** el visitante hace clic en el botón de la banda final con el contacto visible
- **THEN** la página se desplaza al formulario `#contacto`

#### Scenario: Contacto oculto
- **WHEN** la sección de contacto está oculta y el visitante hace clic en el botón de la banda final
- **THEN** llega a `/diagnostico`

### Requirement: Footer del sitio público
Todas las páginas públicas (portada, `/equipo`, `/mision-vision`, `/privacidad`) SHALL mostrar el mismo footer con: el logo y la frase "Resolvemos los problemas concretos de cada negocio con soluciones a su medida y datos claros para decidir."; una columna "Servicios" con "Diagnóstico y plan", "Soluciones a tu medida", "Tareas que avanzan solas" y "Datos y reportes para decidir", todos hacia `/#servicios` (la columna solo si la sección Servicios está visible); una columna "Nubolabs" con "Misión y visión" y "Equipo" (cada uno solo si su página está visible), "Cómo trabajamos" (`/#modelo`, solo si la sección está visible) y "Preguntas frecuentes" (`/#preguntas`, solo si la sección está visible); una columna "Contacto" con el sitio `www.nubolabs.cl`, el WhatsApp de Nubolabs solo si está activado (ver "WhatsApp de contacto configurable") y "Agendar diagnóstico" (`/#contacto`, o `/diagnostico` si la sección de contacto está oculta); el enlace "Privacidad" (`/privacidad`, el mismo texto que exige `sitio/privacidad`); y "© <año actual> Nubolabs · Hecho en Chile". El footer MUST NOT mostrar `hola@nubolabs.ai` ni la frase "Tu operación, en piloto automático".

#### Scenario: Footer en una página interna
- **WHEN** se abre `/equipo`
- **THEN** el footer muestra las 4 columnas, el enlace a privacidad y el año actual, sin `hola@nubolabs.ai`

#### Scenario: Página oculta
- **WHEN** la página "Equipo" está oculta en el CMS
- **THEN** el footer no ofrece el enlace "Equipo"

### Requirement: Textos recomendados en el admin
En `/admin/config`, la sección "Contacto" SHALL permitir editar el número de WhatsApp y los dos interruptores. Las secciones "Preguntas frecuentes" y "CTA final" SHALL ser editables y SHALL ofrecer "Usar los textos recomendados", que reemplaza en el formulario los textos de esa sección por los defaults sin guardar. El editor de preguntas SHALL permitir agregar, quitar y reordenar preguntas dentro del límite de 1 a 10 e indicar el formato `[texto](/ruta)` para enlaces.

#### Scenario: Restablecer preguntas
- **WHEN** el admin borra preguntas y pulsa "Usar los textos recomendados" en "Preguntas frecuentes"
- **THEN** el formulario vuelve a mostrar las 7 preguntas por defecto y nada se guarda hasta pulsar "Guardar cambios"
