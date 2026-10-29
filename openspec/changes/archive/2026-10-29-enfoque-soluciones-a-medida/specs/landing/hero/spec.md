## MODIFIED Requirements

### Requirement: Mensaje orientado a resultados de negocio
Sin overrides en el CMS, el hero SHALL mostrar el título "Soluciones hechas para tu negocio, con datos para decidir mejor." con "tu negocio" resaltado, y la bajada "Cada empresa tiene problemas propios. Los identificamos contigo, construimos la solución que calza con tu forma de trabajar y te dejamos datos ordenados y reportes claros para decidir. Tú nos cuentas qué te frena; nosotros lo resolvemos." El título y la bajada por defecto MUST NOT contener las palabras "horas", "IA", "nube", "automatización" ni "automatizaciones", y MUST NOT nombrar herramientas ni canales concretos ("WhatsApp", "Excel", "Sheets", "n8n", "Make") ni al contador. Por defecto el hero MUST NOT mostrar etiqueta superior (eyebrow), y ningún texto por defecto MUST limitar el público a pymes (decisión de Mauro del 2026-10-22: no excluir a empresas grandes). Si el admin escribe una etiqueta superior en el CMS, el hero SHALL mostrarla sobre el título; si la deja vacía, no se muestra.

#### Scenario: Portada sin overrides
- **WHEN** un visitante abre `/` y el documento `config/site` no tiene `content.hero`
- **THEN** ve el título y la bajada por defecto, con "tu negocio" destacado visualmente

#### Scenario: Sin etiqueta superior por defecto
- **WHEN** un visitante abre `/` sin overrides del hero, o el admin guarda la etiqueta superior vacía
- **THEN** no hay etiqueta sobre el título y la portada no menciona "pymes" en el hero

#### Scenario: Vocabulario prohibido
- **WHEN** se revisan el título y la bajada por defecto
- **THEN** no aparece ninguna de las palabras "horas", "IA", "nube", "automatización", "automatizaciones", "WhatsApp", "Excel", "Sheets", "n8n", "Make" ni "contador"

### Requirement: Etiquetas del hero editables
El hero SHALL mostrar hasta 3 etiquetas cortas bajo los botones, cada una con un ícono de verificación. Sus textos SHALL ser editables desde `/admin/config` y guardarse en `config/site` como `content.hero.tags`. Si el CMS no trae etiquetas, o trae una lista vacía, se SHALL usar los defaults "30 minutos, gratis y sin compromiso", "A la medida de tu negocio" y "Respuesta en menos de 24 horas". Las etiquetas vacías o con solo espacios MUST NOT mostrarse y nunca se muestran más de 3.

#### Scenario: Sin etiquetas en el CMS
- **WHEN** `content.hero.tags` no existe o es una lista vacía
- **THEN** se muestran las 3 etiquetas por defecto

#### Scenario: Etiquetas editadas
- **WHEN** el admin guarda las etiquetas "Primera sesión sin costo", "  " y "Te respondemos hoy"
- **THEN** la portada muestra solo "Primera sesión sin costo" y "Te respondemos hoy", sin despliegue

#### Scenario: Más de tres etiquetas
- **WHEN** el documento guardado trae 5 etiquetas
- **THEN** la portada muestra solo las 3 primeras

### Requirement: Panel ilustrativo "Tu negocio hoy"
Junto al mensaje, el hero SHALL mostrar un panel titulado "Tu negocio hoy" con una lista de 5 tareas completadas (4 en pantallas de menos de 640 px de ancho), cada una con ícono, texto, detalle y marca de completada, y la etiqueta "Todo al día". El panel es ilustrativo: MUST NOT mostrar cifras de resultados, porcentajes, montos ni nombres de clientes reales, y sus tareas de ejemplo MUST NOT nombrar WhatsApp, planillas ni al contador: muestran ventas, cobranzas, bodega, obra y reportes para decidir (por ejemplo "Reporte del día listo · Decisiones · margen al cierre"). Para que ninguna tarea quede cortada, el título de cada tarea MUST tener como máximo 29 caracteres y el detalle como máximo 29; en pantallas de menos de 640 px el detalle SHALL poder ocupar hasta dos líneas con el alto reservado (como el título), y desde 640 px título y detalle van en una línea. Mientras sea visible en pantalla, SHALL incorporar periódicamente una tarea nueva arriba y retirar la última, manteniendo 5. Con la preferencia "reducir movimiento" del sistema SHALL mostrarse estático, sin animaciones, también si la preferencia se activa con la página abierta. El panel MUST NOT cambiar de alto al rotar tareas (para no desplazar el contenido); ninguna tarea visible MUST quedar cortada a ningún ancho entre 320 y 1440 px con la letra por defecto del navegador, ni a 1093, 1280 y 375 px con la letra base en 20 px (en la combinación más estrecha, 1024 px con letra de 20 px, el texto que no cabe termina en puntos suspensivos y nunca se desborda); y los lectores de pantalla MUST NOT anunciar cada rotación.

#### Scenario: Rotación de tareas
- **WHEN** el panel está visible durante más de 4 segundos con movimiento permitido
- **THEN** aparece una tarea nueva arriba, la lista sigue teniendo 5 tareas y el contenido de la página no se desplaza

#### Scenario: Reducir movimiento
- **WHEN** el visitante tiene activado "reducir movimiento"
- **THEN** el panel muestra las 5 tareas iniciales sin rotar ni animar

#### Scenario: Panel fuera de pantalla
- **WHEN** el visitante baja y el panel deja de verse
- **THEN** la rotación se detiene hasta que el panel vuelva a estar visible

#### Scenario: Reducir movimiento con la página abierta
- **WHEN** el panel está rotando y el visitante activa "reducir movimiento" en su sistema
- **THEN** la rotación se detiene

#### Scenario: Anchos intermedios y letra grande
- **WHEN** se abre la portada a 1093 px de ancho, o a 1280 y 375 px con el tamaño de letra base del navegador en 20 px
- **THEN** las tareas visibles se ven completas (texto, detalle y borde) y el alto del panel no cambia al rotar

#### Scenario: Tareas de ejemplo con el enfoque nuevo
- **WHEN** se revisan las tareas iniciales y las que rotan
- **THEN** ninguna menciona "WhatsApp", "planilla" ni "contador", al menos una habla de un reporte o de decidir con datos, y ningún título ni detalle pasa de 29 caracteres

#### Scenario: Tareas que rotan sin cortes
- **WHEN** a 1093, 1280 y 375 px se deja rotar el panel hasta que pasan las 7 tareas adicionales, con letra base de 16 y de 20 px
- **THEN** ningún título ni detalle visible queda cortado (sin puntos suspensivos ni texto fuera de su caja) y el alto del panel no cambia

### Requirement: Metadatos para compartir
La descripción de la página y la descripción de Open Graph SHALL comunicar la promesa nueva (soluciones a la medida del negocio y datos para decidir) sin mencionar horas ahorradas, WhatsApp, planillas ni al contador. El título del documento SHALL mantener la marca "Nubolabs — AI & Automation Agency".

#### Scenario: Vista previa al compartir
- **WHEN** se inspeccionan las etiquetas `<meta name="description">` y `<meta property="og:description">` de `/`
- **THEN** ninguna contiene "horas", "WhatsApp" ni "contador", y ambas hablan de soluciones a medida y de decidir con datos
