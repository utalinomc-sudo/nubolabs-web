## Purpose

Define el bloque de confianza de la portada de nubolabs.cl: cómo confirma la recomendación de estudios contables y clientes (texto puente o testimonios autorizados), qué compromisos muestra, cómo se edita desde el CMS y cómo reaparece como cita breve en la sección de agendar.

## ADDED Requirements

### Requirement: Ubicación y visibilidad del bloque
La portada SHALL mostrar el bloque de confianza inmediatamente después del hero cuando la sección `confianza` está visible, que es su estado por defecto. Cuando el admin la oculta, el bloque MUST NOT renderizarse ni dejar espacio vacío.

#### Scenario: Visible por defecto
- **WHEN** un visitante abre `/` y `config/site.visible` no trae la clave `confianza`
- **THEN** el bloque de confianza aparece entre el hero y la sección de problemas

#### Scenario: Oculto desde el admin
- **WHEN** `visible.confianza` es `false`
- **THEN** el bloque no aparece y la sección siguiente queda inmediatamente después del hero

### Requirement: Texto puente sin testimonios
Si no hay testimonios válidos, el panel principal del bloque SHALL mostrar el eyebrow (por defecto "Nos recomiendan", en mayúsculas en pantalla) y el texto puente (por defecto "Trabajamos con estudios contables y empresas que nos recomiendan a sus clientes."). En ese estado el bloque MUST NOT mostrar comillas de cita, nombres de personas ni iniciales. El sistema MUST NOT incluir testimonios en sus valores por defecto.

#### Scenario: Sin testimonios en el CMS
- **WHEN** `content.confianza.testimonios` no existe o es una lista vacía
- **THEN** el panel muestra el eyebrow y el texto puente, sin comillas ni nombres

#### Scenario: Defaults sin testimonios
- **WHEN** se inspeccionan los valores por defecto de la configuración del sitio
- **THEN** la lista de testimonios por defecto está vacía

### Requirement: Testimonios autorizados
Un testimonio es válido solo si tiene `nombre` y `texto` no vacíos (tras recortar espacios); los inválidos MUST NOT mostrarse. Si hay más de un testimonio marcado `destacado`, solo el primero SHALL contar como destacado (también en el admin). Con testimonios válidos, el bloque SHALL mostrar como principal el primero marcado `destacado` (o, si ninguno lo está, el primero de la lista) con su texto, nombre, cargo y empresa, y las iniciales del nombre en lugar de foto. Los siguientes testimonios válidos, en el orden de la lista, SHALL mostrarse como tarjetas compactas bajo el bloque, hasta completar un máximo de 3 testimonios en total.

#### Scenario: Destacado primero
- **WHEN** el CMS trae los testimonios A, B (destacado) y C, todos válidos
- **THEN** B aparece en el panel principal y A y C como tarjetas compactas, en ese orden

#### Scenario: Más de tres
- **WHEN** el CMS trae 5 testimonios válidos sin destacado
- **THEN** se muestran solo los 3 primeros: el primero en el panel y los dos siguientes como tarjetas

#### Scenario: Testimonio incompleto
- **WHEN** un testimonio tiene `texto` vacío o solo espacios
- **THEN** no se muestra y, si era el único, el panel vuelve al texto puente

#### Scenario: Iniciales
- **WHEN** el testimonio principal es de "Mauricio Osorio"
- **THEN** el panel muestra las iniciales "MO" junto al nombre

#### Scenario: Iniciales con emojis o signos
- **WHEN** el nombre es "😀 Ana López" o "(Dr.) Juan Pérez"
- **THEN** las iniciales son "AL" y "DJ" (solo letras, sin cortar caracteres)

### Requirement: Compromisos
Junto al panel principal, el bloque SHALL mostrar el título "Nuestro compromiso contigo" y siempre 3 compromisos, cada uno con ícono (según su posición), título y texto. Por defecto SHALL mostrar "Primera sesión gratis" (30 minutos por videollamada, sin compromiso.), "Con lo que ya usas" (WhatsApp, correo, planillas y tu sistema de facturación.) y "Sin letra chica" (Plan por etapas y costos claros antes de partir.). Un título o texto guardado vacío SHALL reemplazarse por el recomendado de esa posición, para que nunca falte un compromiso ni se desordenen los íconos.

#### Scenario: Compromisos por defecto
- **WHEN** el CMS no trae `content.confianza.compromisos`
- **THEN** se muestran los 3 compromisos por defecto con su ícono

#### Scenario: Compromiso con título vacío
- **WHEN** el admin deja vacío el título del segundo compromiso y guarda
- **THEN** la portada sigue mostrando 3 compromisos y el segundo usa el título recomendado "Con lo que ya usas" con su ícono

#### Scenario: Compromiso editado
- **WHEN** el admin cambia el texto del segundo compromiso y guarda
- **THEN** la portada muestra el texto nuevo en la siguiente carga, sin despliegue

### Requirement: Cita breve en la sección de agendar
Cuando existe un testimonio principal y la sección `confianza` está visible, la sección de agendar (`#contacto`) SHALL mostrar su texto como cita, con nombre y empresa, bajo la lista de beneficios. Si no hay testimonio válido o la sección está oculta, la cita MUST NOT mostrarse.

#### Scenario: Con testimonio
- **WHEN** hay un testimonio principal válido y `visible.confianza` es verdadero
- **THEN** la columna de texto de `#contacto` muestra la cita con el nombre y la empresa

#### Scenario: Sin testimonio
- **WHEN** no hay testimonios válidos
- **THEN** la sección de agendar no muestra ninguna cita

### Requirement: Edición desde el admin
En `/admin/config`, el editor de la sección Confianza SHALL permitir editar eyebrow, texto puente y los 3 compromisos, y agregar, editar, reordenar, quitar y marcar como destacado testimonios. El editor SHALL mostrar de forma permanente el aviso "Publica solo testimonios con autorización escrita del cliente." y un botón "Usar los textos recomendados" que carga en el formulario los valores por defecto de eyebrow, texto puente y compromisos sin modificar los testimonios ni guardar. Los cambios guardados SHALL verse en la portada en la siguiente carga, sin despliegue.

#### Scenario: Textos recomendados
- **WHEN** el admin tiene 2 testimonios cargados y pulsa "Usar los textos recomendados"
- **THEN** eyebrow, texto puente y compromisos vuelven a los valores por defecto en el formulario, los 2 testimonios siguen ahí y nada se guarda hasta pulsar "Guardar"

#### Scenario: Aviso de autorización
- **WHEN** el admin abre el editor de Confianza
- **THEN** ve el aviso de autorización escrita junto a la lista de testimonios

### Requirement: Bloque usable en móvil y accesible
A 375 px el panel principal y los compromisos SHALL apilarse en una columna sin scroll horizontal, también con textos sin espacios largos (por ejemplo una URL en el testimonio o la empresa). Los saltos de línea que escriba el admin en el testimonio SHALL respetarse. El testimonio principal SHALL marcarse como cita (elemento de cita con su autor asociado) y las iniciales e íconos MUST ser decorativos para lectores de pantalla. Los textos SHALL cumplir contraste WCAG AA sobre su fondo.

#### Scenario: Móvil
- **WHEN** se abre `/` a 375 × 812 px
- **THEN** el ancho del documento no supera el de la pantalla y el panel navy queda sobre los compromisos

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla recorre el bloque con un testimonio cargado
- **THEN** anuncia la cita y su autor, y no lee las iniciales del avatar
