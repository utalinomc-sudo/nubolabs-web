## Purpose

Define las secciones de contenido de la portada de nubolabs.cl (¿Te suena?, Lo que ganas, Enfoque, Servicios y Proceso) para un dueño de negocio (de cualquier tamaño): qué dicen por defecto, en qué orden aparecen, qué vocabulario no pueden usar y cómo se editan desde el CMS sin despliegue.

## ADDED Requirements

### Requirement: Vocabulario para dueños de negocio
Con los textos por defecto, el texto visible de la portada MUST NOT contener las palabras "n8n", "Make", "API", "APIs", "CRM", "ERP", "agente", "agentes", "IA", "ROI", "nube" ni la expresión "horas ahorradas", salvo dentro de la nota técnica de Servicios. Las cifras de Casos ("+120 h", "minutos", "−90%") quedan fuera de esta regla hasta HDU-06, que las reemplaza. Tampoco MUST contener "pyme" ni "pymes" en ningún lugar (decisión de Mauro del 2026-10-22: no excluir a empresas grandes). La nota técnica SHALL ser un único párrafo de texto pequeño ubicado al final de Servicios.

#### Scenario: Barrido de la portada
- **WHEN** se extrae el texto visible de `/` con los textos por defecto y se excluye la nota técnica
- **THEN** no aparece ninguna de las palabras o expresiones prohibidas

#### Scenario: Nota técnica única
- **WHEN** se busca "n8n" en el texto visible de `/`
- **THEN** aparece una sola vez, dentro de la nota técnica de Servicios

### Requirement: Sección "¿Te suena?"
La portada SHALL mostrar, si la sección `problema` está visible, el título "¿Te suena?", una bajada, una lista de dolores (por defecto 6: "Respondes WhatsApp a las 11 de la noche.", "Una cotización tarda días y el cliente se va con otro.", "Fin de mes es perseguir pagos y juntar papeles para el contador.", "No sabes cuánto ganaste hasta que alguien arma la planilla.", "Todo depende de que alguien se acuerde.", "Si alguien falta, nadie sabe en qué estaba.") y la línea de cierre "No es falta de ganas: tu negocio creció y la forma de trabajar no." con un enlace a `#resultados`. Eyebrow, título, bajada, dolores (entre 1 y 8) y cierre SHALL ser editables desde el CMS. En esta y en las demás secciones de este cambio, un texto guardado que no sea string o quede vacío SHALL reemplazarse por su default, y la portada MUST NOT fallar por datos con forma inesperada. Excepción en las listas de largo variable (dolores, servicios, ejemplos de Casos, "qué incluye" y ejemplos de éxito): un ítem sin título (o un texto vacío) no se publica; si no queda ningún ítem válido o quedan menos que el mínimo, se usa la lista por defecto; y un campo vacío de un ítem válido se muestra vacío (no toma el texto del default de su posición, que describe otro ítem).

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
La portada SHALL incluir, entre "¿Te suena?" y el Enfoque, una sección con ancla `resultados` y clave de visibilidad `resultados` (visible por defecto) que muestra exactamente 4 resultados, cada uno con título, texto y una ilustración decorativa, más una línea de cierre. Los defaults SHALL ser: "Vendes más" / "Respondes al instante, cotizas el mismo día y ningún cliente se queda sin seguimiento."; "Tienes el control" / "Ventas, gastos, cobranzas y pendientes al día, en tu celular, sin pedirle un informe a nadie."; "Nada se olvida" / "Cobros, plazos, pedidos y papeles que avanzan solos y a tiempo. Menos errores, menos sustos."; "Creces sin desordenarte" / "Atiendes más clientes sin que tu equipo colapse ni tengas que contratar al mismo ritmo."; cierre "Y tu equipo deja la pega repetitiva para dedicarse a lo que de verdad hace crecer tu negocio." Los textos SHALL ser editables desde el CMS; la cantidad de resultados MUST mantenerse en 4. Las ilustraciones MUST NOT mostrar cifras de resultados ni nombres de clientes y MUST estar ocultas para lectores de pantalla.

#### Scenario: Sección visible por defecto
- **WHEN** se abre `/` sin overrides
- **THEN** la sección `#resultados` aparece después de "¿Te suena?" con los 4 resultados por defecto y la línea de cierre

#### Scenario: Datos guardados incompletos
- **WHEN** `content.resultados.items` guardado trae solo 2 resultados válidos
- **THEN** la portada muestra esos 2 en sus posiciones y completa las 2 restantes con los defaults

#### Scenario: Sección oculta
- **WHEN** el admin desactiva la visibilidad de "Lo que ganas"
- **THEN** la sección no se muestra y no queda espacio vacío

### Requirement: Enfoque "Primero ordenamos, después automatizamos"
La sección de Enfoque SHALL mostrar por defecto el título "Primero ordenamos, después automatizamos.", el texto "Automatizar el desorden solo lo hace más rápido…" de la HDU-08, 3 pasos ("Entendemos cómo trabajas", "Sacamos lo que sobra", "Dejamos funcionando lo que vale la pena") y una ilustración "antes / después" de una cotización donde los pasos que sobran aparecen tachados. Eyebrow, título, texto y los 3 pasos SHALL ser editables desde el CMS.

#### Scenario: Enfoque por defecto
- **WHEN** `config/site` no tiene `content.enfoque`
- **THEN** se ven el título, los 3 pasos y la ilustración antes/después

### Requirement: Servicios orientados a resultados
La sección Servicios (ancla `servicios`) SHALL mostrar: un servicio destacado "Diagnóstico y plan de mejora" con la etiqueta "Empieza aquí · primera sesión gratis", su descripción, su resultado "Sabes qué hacer primero y por qué." y 3 ítems que incluye; una lista de servicios (por defecto "Tareas que avanzan solas", "Clientes atendidos al instante", "Tus números claros, siempre" y "Herramientas a tu medida"), cada uno con descripción y una línea "lo que ganas"; el bloque "Acompañamiento mensual"; y al final la nota técnica. Todos esos textos SHALL ser editables desde el CMS; la lista admite entre 1 y 6 servicios.

#### Scenario: Servicios por defecto
- **WHEN** `config/site` no tiene `content.servicios`
- **THEN** se ven el destacado, los 4 servicios con su "lo que ganas", el acompañamiento mensual y la nota técnica

#### Scenario: Servicio editado
- **WHEN** el admin cambia la línea "lo que ganas" del segundo servicio y guarda
- **THEN** la portada la muestra en la siguiente carga

### Requirement: Proceso con lo que recibe el cliente
La sección del proceso (ancla `modelo`) SHALL aparecer después de Casos y mostrar exactamente 4 pasos, cada uno con título, texto y "Recibes": "Conversamos" / "Un resumen con tus prioridades."; "Ordenamos y proponemos" / "Plan y presupuesto claros, sin letra chica."; "Lo dejamos funcionando" / "La mejora andando y tu equipo usándola."; "Medimos y mejoramos" / "Un reporte simple de resultados y nuevas ideas." Debajo SHALL mostrar la franja "Tú defines qué es éxito:" con los ejemplos "Más ventas", "Cobros al día", "Respuestas más rápidas", "Menos errores" y "Más control". El último paso MUST NOT mencionar horas. Textos de pasos y franja SHALL ser editables desde el CMS, manteniendo 4 pasos.

#### Scenario: Proceso por defecto
- **WHEN** se abre `/` sin overrides
- **THEN** el proceso aparece después de Casos, con 4 pasos, cada uno con su "Recibes", y la franja "Tú defines qué es éxito"

#### Scenario: Paso de medición
- **WHEN** se lee el texto del paso 4 por defecto
- **THEN** no contiene la palabra "horas"

### Requirement: Orden de secciones y navegación
Con todas las secciones visibles y sin las secciones de otros cambios, la portada SHALL mostrar en este orden: hero, "¿Te suena?", "Lo que ganas", Enfoque, Servicios, Casos, Proceso y Contacto. La navegación principal SHALL ofrecer "Lo que ganas" (`/#resultados`), "Servicios" (`/#servicios`), "Ejemplos" (`/#casos`) y "Cómo trabajamos" (`/#modelo`), además del menú "Nosotros" y el botón "Diagnóstico gratis". Ningún ítem del menú SHALL aparecer marcado como activo de forma fija.

#### Scenario: Menú
- **WHEN** el visitante abre el menú en escritorio o en móvil
- **THEN** ve "Lo que ganas", "Servicios", "Ejemplos" y "Cómo trabajamos", y cada uno lleva a su sección de la portada

### Requirement: Textos de los Casos sin jerga
Los textos por defecto de Casos SHALL no usar jerga: la bajada por defecto SHALL ser "Ejemplos reales de lo que dejamos funcionando en empresas como la tuya." y los títulos y descripciones por defecto MUST NOT contener las palabras prohibidas de la regla de vocabulario.

#### Scenario: Casos por defecto
- **WHEN** `config/site` no tiene `content.casos`
- **THEN** la bajada y los casos de la sección no contienen palabras prohibidas

### Requirement: Textos recomendados en el admin
En `/admin/config`, cada sección editable de este cambio (¿Te suena?, Lo que ganas, Enfoque, Servicios, Casos y Proceso) SHALL ofrecer la acción "Usar los textos recomendados", que reemplaza en el formulario los textos de esa sección por los defaults vigentes sin guardar. Los cambios solo se publican al pulsar "Guardar cambios". Al guardar, el admin SHALL enviar la visibilidad y solo las secciones del contenido que cambiaron desde la carga o el último guardado; MUST NOT enviar `content.equipo`, que se edita en `/admin/equipo`.

#### Scenario: Restablecer una sección
- **WHEN** el admin pulsa "Usar los textos recomendados" en Proceso
- **THEN** los 4 pasos y la franja de éxito del formulario muestran los defaults, el resto de las secciones no cambia y nada se guarda hasta pulsar "Guardar cambios"

#### Scenario: Guardar solo lo modificado
- **WHEN** el admin edita un dolor de "¿Te suena?" y pulsa "Guardar cambios"
- **THEN** se envían la visibilidad y solo `content.problema`; las secciones que no tocó siguen mostrando los textos por defecto del código

### Requirement: Encabezado del autodiagnóstico sin jerga
El encabezado de `/diagnostico` (etiqueta, título y bajada) y su metadata `description` MUST NOT contener "automatización", "fricción operativa" ni "ahorrar automatizando"; las preguntas, la escala y el cálculo no cambian.

#### Scenario: Encabezado del diagnóstico
- **WHEN** se abre `/diagnostico`
- **THEN** la etiqueta, el título y la bajada hablan de descubrir oportunidades del negocio, sin las expresiones prohibidas, y las 18 preguntas siguen iguales

### Requirement: Secciones usables en móvil y accesibles
A 375 px de ancho la portada MUST NOT tener scroll horizontal; las grillas de estas secciones SHALL pasar a una columna. Los enlaces y botones de estas secciones SHALL medir al menos 44 px de alto y todo texto SHALL cumplir contraste WCAG AA sobre su fondo.

#### Scenario: Móvil
- **WHEN** se abre `/` a 375 × 812 px
- **THEN** el ancho del documento no supera el de la pantalla y cada sección se lee en una columna
