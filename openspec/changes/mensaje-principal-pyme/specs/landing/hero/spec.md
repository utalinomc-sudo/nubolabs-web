## Purpose

Define el mensaje principal de la portada de nubolabs.cl para dueños de negocios de cualquier tamaño: qué promete, a dónde llevan sus llamados a la acción, qué se puede editar desde el CMS y cómo se comporta el panel ilustrativo "Tu negocio hoy".

## ADDED Requirements

### Requirement: Mensaje orientado a resultados de negocio
Sin overrides en el CMS, el hero SHALL mostrar el título "Que tu negocio trabaje para ti, no al revés." con "trabaje para ti" resaltado, y la bajada "Ordenamos cómo funciona tu empresa y dejamos andando solas las tareas que hoy te frenan: cotizaciones, cobranzas, pedidos, reportes y respuestas a clientes. Tú nos dices qué quieres lograr; nosotros lo dejamos funcionando." El título y la bajada por defecto MUST NOT contener las palabras "horas", "IA", "nube", "automatización" ni "automatizaciones". Por defecto el hero MUST NOT mostrar etiqueta superior (eyebrow), y ningún texto por defecto MUST limitar el público a pymes (decisión de Mauro del 2026-10-22: no excluir a empresas grandes). Si el admin escribe una etiqueta superior en el CMS, el hero SHALL mostrarla sobre el título; si la deja vacía, no se muestra.

#### Scenario: Portada sin overrides
- **WHEN** un visitante abre `/` y el documento `config/site` no tiene `content.hero`
- **THEN** ve el título y la bajada por defecto, con "trabaje para ti" destacado visualmente

#### Scenario: Sin etiqueta superior por defecto
- **WHEN** un visitante abre `/` sin overrides del hero, o el admin guarda la etiqueta superior vacía
- **THEN** no hay etiqueta sobre el título y la portada no menciona "pymes" en el hero

#### Scenario: Vocabulario prohibido
- **WHEN** se revisan el título y la bajada por defecto
- **THEN** no aparece ninguna de las palabras "horas", "IA", "nube", "automatización" o "automatizaciones"

### Requirement: Llamados a la acción hacia el formulario
El hero SHALL ofrecer un botón principal (por defecto "Quiero mi diagnóstico gratis") que lleva al formulario de contacto de la misma página (`#contacto`) y uno secundario (por defecto "Ver cómo trabajamos") que lleva a la sección del proceso (`#modelo`). El botón de la navegación, en escritorio y en el menú móvil, SHALL decir "Diagnóstico gratis" y llevar a `/#contacto`. Si la sección de contacto está oculta en el CMS, el botón principal del hero y el del menú SHALL llevar a `/diagnostico` (mismo respaldo que define `landing/cierre` para la CTA final); si la sección del proceso está oculta, el botón secundario MUST NOT mostrarse.

#### Scenario: CTA principal
- **WHEN** el visitante hace clic en el botón principal del hero
- **THEN** la página se desplaza al formulario de contacto sin cambiar de ruta

#### Scenario: CTA del menú desde otra página
- **WHEN** el visitante está en `/equipo` y hace clic en "Diagnóstico gratis" del menú
- **THEN** llega a la portada, en el formulario de contacto

#### Scenario: Contacto oculto
- **WHEN** la sección de contacto está oculta y el visitante hace clic en el botón principal del hero o en "Diagnóstico gratis" del menú
- **THEN** llega a `/diagnostico`

#### Scenario: Proceso oculto
- **WHEN** la sección del proceso está oculta
- **THEN** el hero muestra solo el botón principal

### Requirement: Etiquetas del hero editables
El hero SHALL mostrar hasta 3 etiquetas cortas bajo los botones, cada una con un ícono de verificación. Sus textos SHALL ser editables desde `/admin/config` y guardarse en `config/site` como `content.hero.tags`. Si el CMS no trae etiquetas, o trae una lista vacía, se SHALL usar los defaults "30 minutos, gratis y sin compromiso", "Sin cambiar tus sistemas" y "Respuesta en menos de 24 horas". Las etiquetas vacías o con solo espacios MUST NOT mostrarse y nunca se muestran más de 3.

#### Scenario: Sin etiquetas en el CMS
- **WHEN** `content.hero.tags` no existe o es una lista vacía
- **THEN** se muestran las 3 etiquetas por defecto

#### Scenario: Etiquetas editadas
- **WHEN** el admin guarda las etiquetas "Primera sesión sin costo", "  " y "Te respondemos hoy"
- **THEN** la portada muestra solo "Primera sesión sin costo" y "Te respondemos hoy", sin despliegue

#### Scenario: Más de tres etiquetas
- **WHEN** el documento guardado trae 5 etiquetas
- **THEN** la portada muestra solo las 3 primeras

### Requirement: Textos del hero editables sin despliegue
Eyebrow, título (con `**resalte**`), bajada y textos de los dos botones SHALL seguir editables desde `/admin/config`. Cada campo presente en `config/site.content.hero` SHALL reemplazar al default correspondiente; los campos ausentes SHALL usar el default. Un campo guardado que no sea texto, o que quede vacío tras quitar espacios, SHALL ignorarse y usar el default, y la portada MUST NOT fallar por datos con forma inesperada. Si el texto de un botón ya termina en "→", el botón MUST NOT agregar otra flecha.

#### Scenario: Override parcial
- **WHEN** el CMS guarda solo un título nuevo
- **THEN** la portada muestra ese título y los defaults para eyebrow, bajada, botones y etiquetas

#### Scenario: Datos inválidos en el CMS
- **WHEN** `content.hero` guarda `title: null`, `subtitle` como objeto o `ctaPrimary: "  "`, o `content.hero` es un texto en vez de un objeto
- **THEN** la portada responde 200 y muestra los defaults en esos campos

### Requirement: Panel ilustrativo "Tu negocio hoy"
Junto al mensaje, el hero SHALL mostrar un panel titulado "Tu negocio hoy" con una lista de 5 tareas completadas (4 en pantallas de menos de 640 px de ancho), cada una con ícono, texto, detalle y marca de completada, y la etiqueta "Piloto automático". El panel es ilustrativo: MUST NOT mostrar cifras de resultados, porcentajes, montos ni nombres de clientes reales. Mientras sea visible en pantalla, SHALL incorporar periódicamente una tarea nueva arriba y retirar la última, manteniendo 5. Con la preferencia "reducir movimiento" del sistema SHALL mostrarse estático, sin animaciones, también si la preferencia se activa con la página abierta. El panel MUST NOT cambiar de alto al rotar tareas (para no desplazar el contenido), ninguna tarea visible MUST quedar cortada a ningún ancho entre 320 y 1440 px ni con el tamaño de letra del navegador aumentado, y los lectores de pantalla MUST NOT anunciar cada rotación.

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

### Requirement: Metadatos para compartir
La descripción de la página y la descripción de Open Graph SHALL comunicar la nueva promesa sin mencionar horas ahorradas. El título del documento SHALL mantener la marca "Nubolabs — AI & Automation Agency".

#### Scenario: Vista previa al compartir
- **WHEN** se inspeccionan las etiquetas `<meta name="description">` y `<meta property="og:description">` de `/`
- **THEN** ninguna contiene "horas" y ambas hablan del resultado para el negocio

### Requirement: Hero usable en móvil y accesible
A 375 px de ancho la portada MUST NOT tener scroll horizontal. Los botones del hero y del menú, incluido el que abre el menú en móvil, SHALL medir al menos 44 px de alto. Todo texto del hero, incluidos el resaltado del título y los textos del panel, SHALL cumplir contraste WCAG AA (3:1 para texto grande, 4,5:1 para texto normal) sobre su fondo.

#### Scenario: Móvil
- **WHEN** se abre `/` a 375 × 812 px
- **THEN** el ancho del documento no supera el de la pantalla y ambos botones del hero miden 44 px o más de alto

#### Scenario: Contraste del resaltado
- **WHEN** se mide el contraste del color más claro del resaltado del título contra el fondo blanco
- **THEN** es de al menos 3:1
