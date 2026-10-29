# landing/casos-por-rubro Specification

## Purpose
Define cómo la portada de nubolabs.cl muestra ejemplos concretos de lo que Nubolabs deja funcionando, clasificados por rubro y filtrables, para que un dueño de negocio encuentre en segundos uno que suene a su negocio.

## Requirements

### Requirement: Casos con rubro
Cada caso SHALL tener un texto principal, un texto secundario opcional y un rubro. El rubro SHALL ser "todos" o uno de los rubros de la lista compartida con el formulario de contacto, excepto "otro": gastronomía, automotriz, construcción, servicios profesionales o comercio. Un caso guardado sin rubro, con un rubro desconocido o con "otro" SHALL tratarse como "todos". Los casos sin texto principal MUST NOT mostrarse. Como en las demás listas de largo variable de la portada (`landing/contenido-pyme`), si lo guardado no es una lista o no queda ningún caso con texto principal, SHALL mostrarse la lista por defecto; se muestran como máximo 18 casos.

#### Scenario: Caso antiguo sin rubro
- **WHEN** `config/site.content.casos.items` trae `{ title: "Cobranzas y seguimiento", body: "…" }` sin `rubro`
- **THEN** se muestra con la etiqueta "Para todos" y aparece con cualquier filtro

#### Scenario: Rubro desconocido
- **WHEN** un caso trae `rubro: "mineria"`
- **THEN** se trata como "todos"

#### Scenario: Sin casos válidos
- **WHEN** el CMS trae una lista de casos vacía o solo con casos sin texto
- **THEN** la sección muestra los casos por defecto; para ocultarla se usa su casilla de visibilidad en el admin

#### Scenario: Texto principal invisible
- **WHEN** un caso trae como texto principal solo espacios o caracteres invisibles (por ejemplo, un espacio de ancho cero)
- **THEN** ese caso no se muestra ni cuenta para los chips

### Requirement: Casos por defecto
Sin casos en el CMS, la sección SHALL mostrar los 14 casos por defecto: para todos "Un reporte mensual con ventas, costos y márgenes que se arma solo.", "Cobranza con recordatorios amables y automáticos." y "Cotizaciones listas el mismo día."; gastronomía "Reservas y pedidos en un solo lugar, con la ocupación del día a la vista.", "Pedidos a proveedores según lo que de verdad queda en bodega." y "Ventas del día y costo de insumos en tu celular al cierre."; automotriz "Presupuestos de repuestos y mano de obra que se arman solos." y "Aviso al cliente cuando su auto está listo y recordatorio de su próxima mantención."; construcción "Estados de pago y documentos de obra ordenados y enviados a tiempo." y "Gastos por obra al día, sin copiar facturas a mano."; servicios profesionales "Plazos y vencimientos que nadie olvida, con aviso al responsable." e "Informes a clientes que se preparan solos desde tus datos."; comercio "Stock y ventas al día, con aviso antes de quedarte sin producto." y "Sabes qué productos dejan margen y cuáles no, antes de reponer." El encabezado por defecto SHALL ser la etiqueta "Ejemplos por rubro" (se muestra en mayúsculas, como las demás etiquetas de sección) y el título "Problemas concretos que resolvemos en negocios como el tuyo", sin bajada. Los textos por defecto MUST NOT contener "n8n", "Make", "API", "CRM", "ERP", "IA", "horas", "WhatsApp", "Excel", "Sheets", "planilla", "contador" ni "contable".

#### Scenario: Portada sin casos en el CMS
- **WHEN** `config/site` no trae `content.casos.items`
- **THEN** la sección muestra los 14 casos por defecto con su rubro

#### Scenario: Vocabulario
- **WHEN** se revisan los textos por defecto de la sección
- **THEN** no aparece ninguna de las palabras prohibidas

### Requirement: Filtro por rubro
La sección SHALL mostrar un chip "Todos", seleccionado al cargar, y un chip por cada rubro con al menos un caso, en el orden de la lista de rubros. Si hay menos de dos rubros con casos (por ejemplo, todos son "para todos" o son de un solo rubro), los chips MUST NOT mostrarse, porque elegir un rubro no cambiaría lo que se ve. Pulsar de nuevo el chip de un rubro ya elegido SHALL volver a "Todos". Al elegir un rubro SHALL mostrar solo los casos de ese rubro y los "todos", manteniendo su orden; al elegir "Todos" SHALL mostrar todos los casos. El chip elegido SHALL indicar su estado presionado a tecnologías de asistencia, y el cambio de resultados SHALL anunciarse con un texto como "Mostrando 6 ejemplos de Gastronomía". El filtro MUST NOT cambiar la URL ni recargar la página.

#### Scenario: Elegir un rubro
- **WHEN** con los casos por defecto el visitante elige "Automotriz"
- **THEN** ve 5 casos (2 de automotriz y 3 para todos) y solo el chip "Automotriz" queda presionado

#### Scenario: Volver a todos
- **WHEN** después elige "Todos"
- **THEN** vuelven a verse los 14 casos

#### Scenario: Chips de rubros sin casos
- **WHEN** el CMS solo trae casos de gastronomía, de comercio y para todos
- **THEN** solo aparecen los chips "Todos", "Gastronomía" y "Comercio"

#### Scenario: Solo casos para todos
- **WHEN** el CMS trae casos sin rubro (por ejemplo, los guardados antes de este cambio)
- **THEN** se muestran todos con la etiqueta "Para todos" y sin chips de filtro

#### Scenario: Un solo rubro
- **WHEN** el CMS solo trae casos de gastronomía y para todos
- **THEN** se muestran todos, cada uno con su etiqueta, y sin chips de filtro

#### Scenario: Soltar el chip elegido
- **WHEN** con "Gastronomía" elegido el visitante vuelve a pulsar "Gastronomía"
- **THEN** queda presionado "Todos" y se ven todos los casos

### Requirement: Edición desde el admin
En `/admin/config`, el editor de Casos SHALL permitir, por caso, editar texto principal, texto secundario y rubro (selector con "Para todos" y los 5 rubros), además de agregar y quitar casos (entre 1 y 18; uno nuevo parte como "Para todos"). El botón "Usar los textos recomendados" SHALL cargar en el formulario el encabezado y los 14 casos por defecto, reemplazando los del formulario sin guardar. Los cambios guardados SHALL verse en la portada en la siguiente carga, sin despliegue.

#### Scenario: Selector de rubro
- **WHEN** el admin cambia el rubro de un caso a "Comercio" y guarda
- **THEN** el caso aparece al filtrar por Comercio

#### Scenario: Textos recomendados
- **WHEN** el admin pulsa "Usar los textos recomendados"
- **THEN** el formulario muestra los 14 casos por defecto con su rubro y nada se guarda hasta pulsar "Guardar"

### Requirement: Sección usable en móvil y accesible
A 375 px los chips SHALL pasar a varias líneas (sin recortar etiquetas), cada chip SHALL medir al menos 44 px de alto y la página MUST NOT tener scroll horizontal. Sin JavaScript, la sección SHALL mostrar todos los casos.

#### Scenario: Chips en móvil
- **WHEN** se abre la sección a 375 × 812 px
- **THEN** todos los chips son visibles completos, miden 44 px o más y `scrollWidth` no supera el ancho de la pantalla

#### Scenario: Sin JavaScript
- **WHEN** la página se carga sin JavaScript
- **THEN** los 14 casos por defecto están en el HTML
