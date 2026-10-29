# leads/formulario-contacto Specification

## Purpose
Define cómo nubolabs.cl captura leads desde el formulario de la portada y desde el diagnóstico: qué pide, cómo valida en el navegador y en el servidor, cómo registra el consentimiento exigido por la Ley 21.719, cómo lleva al prospecto a agendar y cómo ve el equipo esos datos.

## Requirements

### Requirement: Formulario de contacto en dos pasos
La sección `#contacto` de la portada SHALL mostrar un formulario de 2 pasos con un indicador de progreso ("Paso 1 de 2", "Paso 2 de 2"). El paso 1 ("¿Qué te gustaría lograr?") SHALL poder avanzarse con "Siguiente" o con "Saltar este paso" sin elegir nada. El paso 2 ("¿Dónde te contactamos?") SHALL tener un botón "Volver" que regresa al paso 1 conservando lo elegido y lo escrito.

#### Scenario: Saltar el paso 1
- **WHEN** el visitante pulsa "Saltar este paso" sin elegir opciones
- **THEN** ve el paso 2 y el indicador dice "Paso 2 de 2"

#### Scenario: Volver conserva lo elegido
- **WHEN** el visitante elige "Vender más", pasa al paso 2, escribe su nombre y pulsa "Volver"
- **THEN** "Vender más" sigue marcado y, al avanzar de nuevo, su nombre sigue escrito

### Requirement: Objetivos y rubro
El paso 1 SHALL ofrecer como opciones de selección múltiple los objetivos "Vender más", "Responder más rápido a mis clientes", "Tener mis números claros", "Cobrar a tiempo", "Ordenar el trabajo del equipo", "Resolver un problema puntual de mi operación", "Crecer sin desordenarme" y "Otra cosa", y como opciones de selección única los rubros "Gastronomía", "Automotriz", "Construcción", "Servicios profesionales", "Comercio" y "Otro". La opción "Resolver un problema puntual de mi operación" conserva la clave persistida `drop_spreadsheets` (antes "Dejar atrás las planillas"): los leads guardados con esa clave SHALL mostrarse al equipo con la etiqueta vigente. Cada opción SHALL comunicar su estado seleccionado a tecnologías de asistencia. Elegir un rubro distinto SHALL reemplazar el anterior y volver a pulsar el elegido SHALL deseleccionarlo. El formulario MUST NOT preguntar "¿Qué tarea te gustaría dejar de hacer a mano?" ni nombrar herramientas concretas en sus opciones.

#### Scenario: Varios objetivos, un rubro
- **WHEN** el visitante pulsa "Vender más", "Cobrar a tiempo", "Automotriz" y luego "Construcción"
- **THEN** quedan seleccionados los dos objetivos y solo el rubro "Construcción"

#### Scenario: Objetivo de un problema puntual
- **WHEN** el visitante elige "Resolver un problema puntual de mi operación" y envía
- **THEN** el lead se guarda con `goals` que incluye `drop_spreadsheets`, el equipo lo ve como "Resolver un problema puntual de mi operación" y la pantalla de éxito dice "Conversamos 30 minutos sobre cómo resolver un problema puntual de tu operación."

### Requirement: Detalle de "Otra cosa" y "Otro"
Cuando el objetivo "Otra cosa" está seleccionado, el paso 1 SHALL mostrar un campo de una línea, opcional y con etiqueta visible, para escribir qué otra cosa quiere lograr; cuando el rubro "Otro" está seleccionado, SHALL mostrar un campo de una línea, opcional y con etiqueta visible, para escribir su rubro. Ambos campos MUST aceptar como máximo 70 caracteres. Si la opción se deselecciona, el campo SHALL ocultarse y su texto MUST NOT enviarse. El servidor SHALL guardar esos textos (recortados de espacios y limitados a 70 caracteres) como `goalOther` solo si `goals` incluye `other`, y como `industryOther` solo si `industry` es `otro`; en otro caso MUST descartarlos. El paso de contacto de `/diagnostico` SHALL ofrecer el mismo campo cuando el rubro elegido es "Otro".

#### Scenario: Escribir otro objetivo
- **WHEN** el visitante marca "Otra cosa" y escribe "Abrir una segunda sucursal"
- **THEN** el lead se guarda con `goals` que incluye `other` y `goalOther: "Abrir una segunda sucursal"`

#### Scenario: Escribir el rubro
- **WHEN** el visitante marca el rubro "Otro" y escribe "Transporte de carga"
- **THEN** el lead se guarda con `industry: "otro"` e `industryOther: "Transporte de carga"`, y el equipo ve el rubro como "Otro: Transporte de carga"

#### Scenario: Máximo 70 caracteres
- **WHEN** el visitante intenta escribir más de 70 caracteres en cualquiera de los dos campos
- **THEN** el campo no acepta más de 70

#### Scenario: Opción deseleccionada
- **WHEN** el visitante escribe un texto en "Otra cosa" y luego desmarca "Otra cosa"
- **THEN** el campo desaparece y el texto no se envía

### Requirement: Datos de contacto y validación en el navegador
El paso 2 SHALL pedir con etiqueta visible: Nombre (obligatorio), WhatsApp (obligatorio), Correo (obligatorio), Empresa (opcional) y "¿Algo que quieras contarnos antes de la llamada?" (opcional, máximo 1.000 caracteres). Los obligatorios SHALL marcarse como tales. Cada campo obligatorio con texto SHALL validarse al salir de él: nombre no vacío; correo con formato `algo@dominio.ext`; WhatsApp con 8 a 15 dígitos. Un campo obligatorio vacío SHALL marcarse al intentar enviar (no al salir de él, para no mostrar errores antes de que la persona escriba). Los campos SHALL limitar su largo igual que el servidor (nombre y empresa 120, correo 254, WhatsApp 30, mensaje 1.000) y todo valor que el navegador acepte MUST ser aceptado también por el servidor. Un campo inválido SHALL mostrar un mensaje específico junto al campo, asociado al campo para lectores de pantalla. Al enviar con errores, el foco SHALL ir al primer campo inválido y no se SHALL enviar nada.

#### Scenario: Correo mal escrito
- **WHEN** el visitante escribe "carolina@tallerrojas" y sale del campo
- **THEN** ve "Revisa el correo: falta la @ o el dominio (ej.: tu@empresa.cl)." bajo el campo

#### Scenario: Envío con campos vacíos
- **WHEN** pulsa "Agendar mi diagnóstico gratis" sin llenar nada
- **THEN** ve los errores de nombre, WhatsApp y correo, el foco queda en el nombre y no hay llamada a la API

### Requirement: Consentimientos
El paso 2 SHALL mostrar dos casillas desmarcadas por defecto: (1) obligatoria, "Acepto que Nubolabs use mis datos para contactarme sobre mi diagnóstico." con un enlace "Cómo cuidamos tus datos" a `/privacidad`; (2) opcional, "Quiero recibir ideas y novedades de Nubolabs. Puedes darte de baja cuando quieras." Sin la casilla obligatoria el formulario MUST NOT enviarse y SHALL mostrar "Necesitamos tu permiso para contactarte sobre el diagnóstico." junto a ella.

#### Scenario: Falta el consentimiento de contacto
- **WHEN** los campos son válidos pero la casilla obligatoria está desmarcada y el visitante envía
- **THEN** ve el mensaje junto a la casilla, el foco va a la casilla y no hay llamada a la API

#### Scenario: Novedades no marcadas
- **WHEN** envía con solo la casilla obligatoria marcada
- **THEN** el lead queda con `marketingConsent: false`

### Requirement: Envío y estados del formulario
Al enviar, el botón SHALL deshabilitarse y mostrar "Enviando…". Si la API responde error con `{ error }`, el formulario SHALL mostrar ese mensaje; ante cualquier otro fallo (sin respuesta legible o sin red) SHALL mostrar "No pudimos enviar tu solicitud. Intenta de nuevo." y MUST NOT mostrar mensajes técnicos del navegador. En ambos casos SHALL conservar lo escrito. Si responde OK, SHALL reemplazarse por la pantalla de éxito.

#### Scenario: Error del servidor
- **WHEN** `POST /api/leads` responde 500 con `{ error: "No se pudo guardar la solicitud. Intenta de nuevo." }`
- **THEN** el visitante ve ese mensaje, el botón vuelve a habilitarse y sus datos siguen escritos

### Requirement: Agenda inmediata tras el envío
Si la URL de agenda está configurada, la pantalla de éxito SHALL decir "¡Listo, {primer nombre}! Ahora elige el día y la hora." y mostrar un botón "Elegir horario" que la abre en una pestaña nueva. Si no lo está, MUST NOT mostrar ese botón ni pedir que elija un horario, y SHALL decir "¡Listo, {primer nombre}! Te escribimos en menos de 24 horas." (ajuste del 2026-10-22: sin agenda no hay horario que elegir). SHALL listar "Qué pasa ahora" en 3 pasos, donde el tercero es "Conversamos 30 minutos sobre cómo {objetivos elegidos en minúscula, unidos con comas e "y"}." o, sin objetivos (o solo "Otra cosa"), "Conversamos 30 minutos sobre lo que quieres lograr.". SHALL ofrecer además el enlace al autodiagnóstico de `/diagnostico`.

#### Scenario: Con URL de agenda y objetivos
- **WHEN** la URL de agenda está configurada y el visitante eligió "Vender más" y "Cobrar a tiempo"
- **THEN** ve el botón "Elegir horario" y el texto "Conversamos 30 minutos sobre cómo vender más y cobrar a tiempo."

#### Scenario: Sin URL de agenda
- **WHEN** la URL de agenda no está configurada
- **THEN** no hay botón de agenda y se lee "Te escribimos en menos de 24 horas"

### Requirement: Validación y normalización en el servidor
`POST /api/leads` SHALL responder 400 con `{ error }` en español cuando: el cuerpo no es JSON ("JSON inválido."); falta el nombre o el correo, o el correo es inválido; el WhatsApp (`phone`) no tiene entre 8 y 15 dígitos; o `contactConsent` no es exactamente `true` ("Necesitamos tu permiso para contactarte."). SHALL recortar espacios y limitar largos (nombre y empresa 120 caracteres, mensaje 1.000). El correo (más de 254) y el WhatsApp (más de 30 caracteres) MUST validarse sobre el texto completo y rechazarse si exceden el largo, nunca guardarse recortados. `meta` SHALL aceptarse solo en leads con `source: "diagnostico"` y hasta 64 KB serializado; si excede, la respuesta SHALL ser 400. SHALL conservar en `goals` solo claves válidas sin repetir y guardar `industry` solo si es una clave válida; los valores desconocidos MUST ser ignorados sin error. `source` SHALL aceptarse solo si pertenece a la lista de orígenes permitidos (`landing`, `diagnostico`); en otro caso SHALL guardarse `landing`.

#### Scenario: Objetivos y rubro inválidos
- **WHEN** llega un lead válido con `goals: ["sell_more", "hackear", "sell_more"]` e `industry: "mineria"`
- **THEN** se guarda con `goals: ["sell_more"]` y sin `industry`, y la respuesta es 200

#### Scenario: Sin consentimiento por API
- **WHEN** llega un lead válido sin `contactConsent`
- **THEN** la respuesta es 400 con `{ error: "Necesitamos tu permiso para contactarte." }` y no se guarda nada

#### Scenario: Teléfono corto
- **WHEN** llega un lead con `phone: "1234"`
- **THEN** la respuesta es 400 y no se guarda nada

### Requirement: Prueba del consentimiento
Cada lead guardado SHALL incluir `contactConsent: true`, `marketingConsent` (booleano), `consentAt` (fecha ISO del servidor al recibirlo), `consentVersion` y `consentText` con el texto exacto de cada casilla aceptada (`contact` siempre; `marketing` solo si se aceptó). El texto guardado SHALL ser el que el sitio muestra en esa versión, no uno enviado por el cliente.

#### Scenario: Texto enviado por el cliente
- **WHEN** un cliente envía `consentText: { contact: "otra cosa" }` junto a un lead válido
- **THEN** el lead se guarda con el texto oficial de la casilla de contacto, no con "otra cosa"

### Requirement: Protección anti-spam básica
El formulario SHALL incluir un campo trampa invisible para personas (fuera de pantalla, sin foco por teclado, sin autocompletar). Si `POST /api/leads` lo recibe con contenido, SHALL responder 200 `{ ok: true, persisted: false }` sin guardar el lead ni enviar avisos.

#### Scenario: Bot llena el campo trampa
- **WHEN** llega un lead válido con el campo trampa lleno
- **THEN** la respuesta es 200, no se crea documento en `leads` y no sale correo

### Requirement: Consentimiento y WhatsApp en el diagnóstico
El paso de contacto de `/diagnostico` SHALL pedir WhatsApp como obligatorio, ofrecer el rubro como selector con la misma lista de rubros y mostrar las mismas dos casillas de consentimiento con las mismas reglas. Sin el consentimiento obligatorio o con WhatsApp inválido, SHALL mostrar el error y no enviar. Si el servidor rechaza los datos (400), SHALL mostrar su mensaje y MUST NOT mostrar la confirmación; ante fallos del servidor (5xx) o de red, la confirmación sigue mostrándose como hoy. Las preguntas, el cálculo y el informe del diagnóstico MUST NOT cambiar.

#### Scenario: Diagnóstico sin consentimiento
- **WHEN** el visitante responde todo y envía sin marcar el consentimiento de contacto
- **THEN** ve el error del consentimiento y no se envía el diagnóstico

#### Scenario: Diagnóstico completo
- **WHEN** envía con WhatsApp válido, rubro "Gastronomía" y el consentimiento marcado
- **THEN** el lead se guarda con `source: "diagnostico"`, `industry: "gastronomia"`, los campos de consentimiento, y el informe PDF se puede descargar como hoy

### Requirement: Datos del lead visibles para el equipo
El aviso por correo de cada lead, el detalle del lead en el admin y la ficha PDF interna SHALL mostrar, cuando existan: objetivos (con su texto en español; "Otra cosa" junto al texto escrito en `goalOther`), rubro (con su texto en español; en leads antiguos, el rubro libre guardado en el diagnóstico), el mensaje del prospecto y el estado de los consentimientos ("Acepta novedades" / "Sin novedades", con fecha). La lista de leads del admin SHALL mostrar el rubro y una marca de "Acepta novedades". Los leads antiguos sin estos campos SHALL seguir mostrándose sin errores.

#### Scenario: Lead nuevo en el admin
- **WHEN** el admin abre el detalle de un lead con objetivos, rubro, mensaje y novedades aceptadas
- **THEN** ve la sección "Lo que quiere lograr" con los objetivos, el rubro, el mensaje destacado y "Acepta novedades" con la fecha del consentimiento

#### Scenario: Lead antiguo
- **WHEN** el admin abre un lead creado antes de este cambio
- **THEN** la página carga sin errores y los campos ausentes no se muestran

### Requirement: Formulario accesible y usable en móvil
A 375 px de ancho la sección MUST NOT producir scroll horizontal; los campos y botones SHALL medir al menos 44 px de alto; los campos SHALL usar el tipo de teclado adecuado (correo, teléfono) y autocompletado del navegador; todo el flujo SHALL poder completarse solo con teclado.

#### Scenario: Teclado móvil
- **WHEN** el visitante toca el campo WhatsApp en un teléfono
- **THEN** se abre el teclado numérico de teléfono

### Requirement: Funcionamiento sin servicios opcionales
Sin Firebase Admin configurado, `POST /api/leads` SHALL validar igual y responder 200 `{ ok: true, persisted: false }` ante un lead válido. Sin Resend, el lead SHALL guardarse igual. En ambos casos el visitante SHALL ver la pantalla de éxito.

#### Scenario: Desarrollo local sin credenciales
- **WHEN** se envía un lead válido sin Firebase ni Resend configurados
- **THEN** la respuesta es 200 con `persisted: false` y el formulario muestra la pantalla de éxito
