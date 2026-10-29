## ADDED Requirements

### Requirement: Enfoque del mensaje en todo el sitio público
Los textos por defecto del sitio público (portada, `/mision-vision`, `/equipo`, franja de `/oa`, pie de `/diagnostico`, informe PDF y correo al cliente) SHALL presentar a Nubolabs como quien identifica el problema particular de cada cliente, construye una solución a su medida y deja datos ordenados y reportes claros para tomar decisiones. En consecuencia MUST NOT presentar la automatización de WhatsApp como servicio, MUST NOT ofrecer servicios contables ni mencionar al contador, y MUST NOT nombrar herramientas ni canales concretos ("WhatsApp", "Excel", "Google Sheets", "n8n", "Make", "planillas"). El lema del sitio SHALL ser "Soluciones a tu medida, decisiones con datos." y SHALL aparecer en la etiqueta de la CTA final por defecto, en el pie de `/diagnostico`, en el informe PDF y en el correo al cliente; el lema "Tu operación, en piloto automático" MUST NOT usarse. Excepción: el canal de contacto de Nubolabs (número y QR de WhatsApp, apagados por defecto, de `landing/cierre`) y los textos de los formularios sobre cómo te contactamos (etiqueta y placeholder del campo WhatsApp, su mensaje de error y la pantalla de éxito, `leads/formulario-contacto`) son datos de contacto y no cuentan como mención de herramientas; el borrador de `/privacidad` puede nombrar a los proveedores que tratan los datos.

#### Scenario: Misión y visión con el enfoque nuevo
- **WHEN** se abre `/mision-vision` sin `content.nosotros` en el CMS
- **THEN** la misión habla de resolver los problemas concretos de cada empresa con soluciones a su medida y de dejar datos y reportes para decidir, y ni la misión, ni la visión, ni los objetivos dicen "piloto automático", "automatizaciones" ni "horas"

#### Scenario: Equipo
- **WHEN** se abre `/equipo` sin `content.equipo` en el CMS
- **THEN** la historia habla de análisis de procesos, ingeniería y datos, sin "inteligencia artificial" ni "piloto automático"

#### Scenario: Lema del sitio
- **WHEN** se revisan la CTA final por defecto, el pie de `/diagnostico`, el informe PDF y el correo al cliente
- **THEN** los cuatro dicen "Soluciones a tu medida, decisiones con datos." y ninguno dice "piloto automático"

### Requirement: Enfoque "Primero entendemos tu problema, después construimos la solución"
La sección de Enfoque SHALL mostrar por defecto la etiqueta "Nuestro sello", el título "Primero entendemos tu problema, después construimos la solución.", el texto "Una solución genérica resuelve un problema genérico. Por eso partimos por entender cómo trabaja tu negocio y qué te frena de verdad, diseñamos lo que calza con esa realidad y lo dejamos entregando datos claros para que decidas mejor.", 3 pasos ("Entendemos tu problema" / "Tu negocio, tu equipo y lo que hoy te frena."; "Diseñamos a tu medida" / "La solución justa para tu forma de trabajar, sin piezas de más."; "Te dejamos datos para decidir" / "Reportes claros y al día, con tu equipo usándolos.") y una ilustración "antes / después" del informe del mes ("Hoy: el informe del mes" con 6 pasos, de los cuales los 4 que sobran aparecen tachados: copiar todo a un informe a mano, buscar los costos en otro archivo, cuadrar las cifras que no coinciden y reenviar por correo y esperar comentarios; "Después" con 4 pasos: los datos se juntan solos desde donde ya están, un reporte claro con ventas, costos y margen al día, un aviso cuando algo se sale de lo esperado, y revisar y decidir hoy con la información de hoy). La ilustración MUST NOT nombrar herramientas ni canales. Eyebrow, título, texto y los 3 pasos SHALL ser editables desde el CMS.

#### Scenario: Enfoque por defecto
- **WHEN** `config/site` no tiene `content.enfoque`
- **THEN** se ven el título, los 3 pasos y la ilustración antes/después del informe del mes, con 4 pasos tachados

#### Scenario: Ilustración sin herramientas
- **WHEN** se revisan los textos de la ilustración antes/después
- **THEN** no aparecen "WhatsApp", "planilla", "Excel" ni "correo electrónico" como herramienta (el paso "reenviar por correo" describe el trabajo que sobra, no una herramienta ofrecida)

## MODIFIED Requirements

### Requirement: Vocabulario para dueños de negocio
Con los textos por defecto, el texto visible de la portada MUST NOT contener las palabras "n8n", "Make", "API", "APIs", "CRM", "ERP", "agente", "agentes", "IA", "ROI", "nube" ni la expresión "horas ahorradas", en ningún lugar, incluida la nota técnica de Servicios. Tampoco MUST contener "pyme" ni "pymes" (decisión de Mauro del 2026-10-22: no excluir a empresas grandes), ni herramientas o canales concretos ("WhatsApp", "Excel", "Sheets", "Google", "planilla", "planillas"), ni "contador", "contable", "contables" o "contabilidad" (decisión de Mauro del 2026-10-29: el foco son las soluciones a medida con datos para decidir, no automatizar WhatsApp ni dar soluciones contables). La nota técnica SHALL ser un único párrafo de texto pequeño ubicado al final de Servicios que explica cómo trabajamos sin nombrar herramientas. El canal de contacto de Nubolabs (número y QR de WhatsApp, apagados por defecto) y los textos de los formularios sobre cómo te contactamos (etiqueta y placeholder del campo WhatsApp, su mensaje de error y la pantalla de éxito) no cuentan como mención de herramientas.

#### Scenario: Barrido de la portada
- **WHEN** se extrae el texto visible de `/` con los textos por defecto, incluida la nota técnica
- **THEN** no aparece ninguna de las palabras o expresiones prohibidas

#### Scenario: Nota técnica única
- **WHEN** se revisa la nota técnica de Servicios por defecto
- **THEN** hay una sola, empieza con "Cómo lo hacemos:" y no contiene "n8n", "Make", "WhatsApp", "Excel" ni "Sheets"

### Requirement: Sección "¿Te suena?"
La portada SHALL mostrar, si la sección `problema` está visible, el título "¿Te suena?", la bajada "Cada negocio tiene los suyos, pero estos se repiten. Ninguno se arregla trabajando más: se arreglan con una solución pensada para tu caso y con datos claros.", una lista de dolores (por defecto 6: "Decides a ojo porque los números llegan tarde o no cuadran.", "Una cotización tarda días y el cliente se va con otro.", "Fin de mes es perseguir pagos y armar informes a mano.", "La información está repartida en varios lugares y nadie tiene la foto completa.", "Todo depende de que alguien se acuerde.", "Te ofrecen la misma solución que a todos, y tu negocio no funciona como todos.") y la línea de cierre "No es falta de ganas: tu negocio creció y la forma de trabajar no." con un enlace a `#resultados`. Eyebrow, título, bajada, dolores (entre 1 y 8) y cierre SHALL ser editables desde el CMS. En esta y en las demás secciones de este cambio, un texto guardado que no sea string o quede vacío SHALL reemplazarse por su default, y la portada MUST NOT fallar por datos con forma inesperada. Excepción en las listas de largo variable (dolores, servicios, ejemplos de Casos, "qué incluye" y ejemplos de éxito): un ítem sin título (o un texto vacío) no se publica; si no queda ningún ítem válido o quedan menos que el mínimo, se usa la lista por defecto; y un campo vacío de un ítem válido se muestra vacío (no toma el texto del default de su posición, que describe otro ítem).

#### Scenario: Dolores por defecto
- **WHEN** `config/site` no tiene `content.problema`
- **THEN** se ven los 6 dolores por defecto y la línea de cierre

#### Scenario: Dolores editados
- **WHEN** el admin deja 4 dolores y guarda
- **THEN** la portada muestra esos 4, sin despliegue

#### Scenario: Lista variable con ítems vacíos
- **WHEN** `content.servicios.items` guardado trae un servicio con título y descripción vacía, y otro sin título
- **THEN** la portada muestra solo el primero, con la descripción vacía, y no falla

### Requirement: Sección "Lo que ganas"
La portada SHALL incluir, entre "¿Te suena?" y el Enfoque, una sección con ancla `resultados` y clave de visibilidad `resultados` (visible por defecto) que muestra exactamente 4 resultados, cada uno con título, texto y una ilustración decorativa, más una línea de cierre. Por defecto SHALL mostrar el título "Resultados que se notan en tu negocio y se ven en tus números.", la bajada "No vendemos herramientas ni soluciones de catálogo. Partimos por tu problema y lo resolvemos con la información a la vista." y los resultados: "Vendes más" / "Respondes antes, cotizas el mismo día y ningún cliente se queda sin seguimiento."; "Decides con datos" / "Ventas, costos, márgenes y pendientes al día en reportes claros, sin pedirle un informe a nadie."; "Nada se olvida" / "Cobros, plazos, pedidos y documentos avanzan a tiempo, con aviso al responsable. Menos errores, menos sustos."; "Creces sin desordenarte" / "Atiendes más clientes y más volumen sin que tu equipo colapse ni tengas que contratar al mismo ritmo."; cierre "Y tu equipo deja la pega repetitiva para dedicarse a lo que de verdad hace crecer tu negocio." Las ilustraciones por posición SHALL ser: el seguimiento de una venta (consulta recibida, cotización enviada el mismo día y seguimiento programado), un gráfico de barras por día, una lista de avisos y la ecuación "tu equipo + soluciones hechas para ti = más clientes, mismo orden"; MUST NOT ser una conversación de chat ni mostrar cifras de resultados ni nombres de clientes, y MUST estar ocultas para lectores de pantalla. Los textos SHALL ser editables desde el CMS; la cantidad de resultados MUST mantenerse en 4.

#### Scenario: Sección visible por defecto
- **WHEN** se abre `/` sin overrides
- **THEN** la sección `#resultados` aparece después de "¿Te suena?" con los 4 resultados por defecto y la línea de cierre

#### Scenario: Datos guardados incompletos
- **WHEN** `content.resultados.items` guardado trae solo 2 resultados válidos
- **THEN** la portada muestra esos 2 en sus posiciones y completa las 2 restantes con los defaults

#### Scenario: Sección oculta
- **WHEN** el admin desactiva la visibilidad de "Lo que ganas"
- **THEN** la sección no se muestra y no queda espacio vacío

#### Scenario: Ilustración del primer resultado
- **WHEN** se revisa la ilustración de "Vendes más"
- **THEN** muestra el seguimiento de una venta sin burbujas de chat ni "respuesta automática"

### Requirement: Servicios orientados a resultados
La sección Servicios (ancla `servicios`) SHALL mostrar: la bajada "Cada servicio parte de un problema concreto tuyo. La tecnología es solo el medio."; un servicio destacado "Diagnóstico y plan de mejora" con la etiqueta "Empieza aquí · primera sesión gratis", la descripción "Conversamos 30 minutos sobre tu negocio y te mostramos dónde está tu mayor oportunidad: qué problema atacar primero, qué solución calza y por dónde partir.", su resultado "Sabes qué hacer primero y por qué." y 3 ítems que incluye; una lista de servicios (por defecto "Soluciones a tu medida" / "Resuelves lo que de verdad te frena.", "Tareas que avanzan solas" / "Nada se olvida y hay menos errores.", "Datos y reportes para decidir" / "Decides con datos, no a ciegas." e "Información ordenada y conectada" / "Todos trabajan con el mismo dato."), cada uno con descripción y una línea "lo que ganas"; el bloque "Acompañamiento mensual"; y al final la nota técnica "Cómo lo hacemos: partimos de tu problema, no de una herramienta. Diseñamos la solución para tu forma de trabajar, la conectamos con los sistemas que ya usas y la dejamos entregando datos ordenados y reportes claros. Sin cambiar tus sistemas." Todos esos textos SHALL ser editables desde el CMS; la lista admite entre 1 y 6 servicios.

#### Scenario: Servicios por defecto
- **WHEN** `config/site` no tiene `content.servicios`
- **THEN** se ven el destacado, los 4 servicios con su "lo que ganas", el acompañamiento mensual y la nota técnica sin herramientas

#### Scenario: Servicio editado
- **WHEN** el admin cambia la línea "lo que ganas" del segundo servicio y guarda
- **THEN** la portada la muestra en la siguiente carga

### Requirement: Proceso con lo que recibe el cliente
La sección del proceso (ancla `modelo`) SHALL aparecer después de Casos y mostrar exactamente 4 pasos, cada uno con título, texto y "Recibes": "Conversamos" / "30 minutos, gratis. Nos cuentas cómo funciona tu negocio y qué problema te gustaría resolver." / "Un resumen con tus prioridades."; "Entendemos y proponemos" / "Vemos cómo se hacen hoy las cosas, dónde está el problema de fondo y te proponemos una solución por etapas." / "Plan y presupuesto claros, sin letra chica."; "Lo construimos y lo dejamos funcionando" / "Pensado para cómo trabajas, conectado con lo que ya usas y enseñándole a tu equipo." / "La solución andando y tu equipo usándola."; "Medimos y mejoramos" / "Seguimos los indicadores que tú elegiste, con reportes claros, y vamos sumando mejoras." / "Un reporte simple de resultados y nuevas ideas." Debajo SHALL mostrar la franja "Tú defines qué es éxito:" con los ejemplos "Más ventas", "Cobros al día", "Decisiones con datos", "Menos errores" y "Más control". El último paso MUST NOT mencionar horas. Textos de pasos y franja SHALL ser editables desde el CMS, manteniendo 4 pasos.

#### Scenario: Proceso por defecto
- **WHEN** se abre `/` sin overrides
- **THEN** el proceso aparece después de Casos, con 4 pasos, cada uno con su "Recibes", y la franja "Tú defines qué es éxito"

#### Scenario: Paso de medición
- **WHEN** se lee el texto del paso 4 por defecto
- **THEN** no contiene la palabra "horas"

### Requirement: Textos de los Casos sin jerga
Los textos por defecto de Casos SHALL no usar jerga: el encabezado por defecto SHALL ser el que fija la spec `landing/casos-por-rubro` (etiqueta "Ejemplos por rubro" y título "Problemas concretos que resolvemos en negocios como el tuyo", sin bajada), y la etiqueta, el título y los textos de los casos por defecto MUST NOT contener las palabras prohibidas de la regla de vocabulario (incluidas herramientas, canales y contabilidad).

#### Scenario: Casos por defecto
- **WHEN** `config/site` no tiene `content.casos`
- **THEN** el encabezado y los casos de la sección no contienen palabras prohibidas y no se muestra bajada

### Requirement: Textos recomendados en el admin
En `/admin/config`, cada sección editable de este cambio (¿Te suena?, Lo que ganas, Enfoque, Servicios, Casos, Proceso y, desde el cambio enfoque-soluciones-a-medida, Misión y visión) SHALL ofrecer la acción "Usar los textos recomendados", que reemplaza en el formulario los textos de esa sección por los defaults vigentes sin guardar. Los cambios solo se publican al pulsar "Guardar cambios". Al guardar, el admin SHALL enviar la visibilidad y solo las secciones del contenido que cambiaron desde la carga o el último guardado; MUST NOT enviar `content.equipo`, que se edita en `/admin/equipo`.

#### Scenario: Restablecer una sección
- **WHEN** el admin pulsa "Usar los textos recomendados" en Proceso
- **THEN** los 4 pasos y la franja de éxito del formulario muestran los defaults, el resto de las secciones no cambia y nada se guarda hasta pulsar "Guardar cambios"

#### Scenario: Guardar solo lo modificado
- **WHEN** el admin edita un dolor de "¿Te suena?" y pulsa "Guardar cambios"
- **THEN** se envían la visibilidad y solo `content.problema`; las secciones que no tocó siguen mostrando los textos por defecto del código

#### Scenario: Restablecer Misión y visión
- **WHEN** el admin pulsa "Usar los textos recomendados" en "Misión y visión" y después "Guardar cambios"
- **THEN** misión, visión y objetivos vuelven a los defaults en el formulario sin que se guarde nada al pulsar el botón, y al guardar se envía solo `content.nosotros`

## REMOVED Requirements

### Requirement: Enfoque "Primero ordenamos, después automatizamos"
**Reason**: El enfoque del mensaje cambió el 2026-10-29: Nubolabs parte del problema particular de cada cliente y construye una solución a su medida con datos para decidir; "ordenar y automatizar" y el ejemplo de una cotización que llega por WhatsApp ya no representan la propuesta.
**Migration**: Lo reemplaza el requisito "Enfoque "Primero entendemos tu problema, después construimos la solución"" de esta misma capacidad (mismos campos del CMS `content.enfoque`, sin cambios de datos).
