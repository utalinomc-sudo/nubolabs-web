## Purpose

Define el resultado del diagnóstico interactivo como un mapa de oportunidades de negocio: cómo se calcula a partir de las respuestas del cuestionario, cómo se muestra al visitante, cómo se guarda en el lead y cómo se entrega en el informe PDF y el correo al cliente, sin hablar de ahorro de horas ni de dinero.

## ADDED Requirements

### Requirement: Dimensiones del mapa
El mapa SHALL tener 4 dimensiones de negocio, siempre en este orden, que agrupan las 6 áreas del cuestionario sin cambiar sus preguntas ni su escala:

| Id | Dimensión | Áreas del cuestionario |
|---|---|---|
| `ventas` | Ventas y clientes | Clientes y reportes |
| `control` | Control y números | Información y documentos |
| `orden` | Orden y seguimiento | Seguimiento y plazos; Procesos y escalabilidad |
| `equipo` | Equipo y crecimiento | Carga de trabajo y capacidad; Conocimiento y dependencias |

#### Scenario: Agrupación completa
- **WHEN** se calcula el mapa de un diagnóstico con las 18 preguntas respondidas
- **THEN** el mapa tiene exactamente las 4 dimensiones en el orden de la tabla y cada una de las 6 áreas aporta a una sola dimensión

### Requirement: Puntaje y nivel de oportunidad
El puntaje de cada área SHALL ser `round(((promedio de sus respuestas − 1) / 4) × 100)`, entre 0 y 100. El puntaje de una dimensión SHALL ser el promedio redondeado de los puntajes de sus áreas que tengan al menos una respuesta; si ninguna tiene respuestas, la dimensión queda "sin datos" y MUST NOT tener puntaje. El nivel SHALL ser "Oportunidad alta" con puntaje ≥ 60, "Oportunidad media" con puntaje ≥ 35 y "Oportunidad baja" bajo 35.

#### Scenario: Dimensión con dos áreas
- **WHEN** "Seguimiento y plazos" tiene puntaje 75 y "Procesos y escalabilidad" tiene 50
- **THEN** "Orden y seguimiento" tiene puntaje 63 (62,5 redondeado) y nivel "Oportunidad alta"

#### Scenario: Umbrales
- **WHEN** las dimensiones tienen puntajes 60, 59, 35 y 34
- **THEN** sus niveles son alta, media, media y baja

#### Scenario: Sin respuestas en una dimensión
- **WHEN** ninguna pregunta de "Clientes y reportes" tiene respuesta
- **THEN** "Ventas y clientes" se muestra "sin datos" y no entra en las oportunidades principales

### Requirement: Oportunidades principales y próximo paso
Las oportunidades principales SHALL ser hasta 3 dimensiones con nivel alta o media, ordenadas por puntaje de mayor a menor; los empates se resuelven por el orden de la tabla de dimensiones. Si ninguna dimensión tiene nivel alta o media, la única oportunidad principal SHALL ser la dimensión con mayor puntaje. El próximo paso sugerido SHALL ser el texto de "próximo paso" de la primera oportunidad principal. Cada dimensión SHALL tener estos textos:

| Dimensión | Lo que puedes lograr | Próximo paso sugerido |
|---|---|---|
| Ventas y clientes | Vendes más: respondes antes y ningún cliente queda sin seguimiento. | Responder consultas y cotizaciones el mismo día, con seguimiento automático. |
| Control y números | Tienes el control: decides con datos, sin pedir informes. | Tener ventas, gastos y cobranzas al día en un panel simple. |
| Orden y seguimiento | Nada se olvida: cobros, plazos y tareas avanzan a tiempo. | Que cobros, plazos y tareas recurrentes avancen solos, con avisos a tiempo. |
| Equipo y crecimiento | Creces sin desordenarte: más clientes sin que el equipo colapse. | Liberar al equipo de la pega repetitiva y dejar escrito cómo se hacen las cosas. |

#### Scenario: Tres principales
- **WHEN** los puntajes son Ventas 70, Control 40, Orden 70 y Equipo 20
- **THEN** las oportunidades principales son Ventas, Orden y Control (en ese orden) y el próximo paso es el de Ventas y clientes

#### Scenario: Todo bajo
- **WHEN** los puntajes son Ventas 10, Control 30, Orden 20 y Equipo 5
- **THEN** la única oportunidad principal es Control y números y el próximo paso es el suyo

### Requirement: Resultado visible en el diagnóstico
`/diagnostico` SHALL mostrar el panel "Tu mapa de oportunidades" con las 4 dimensiones, una barra proporcional al puntaje y el nivel en texto, actualizado a medida que el visitante responde, y la cantidad de preguntas respondidas. La página MUST NOT mostrar índice de fricción, montos en pesos ni horas ahorradas. El nivel MUST indicarse con texto, no solo con color.

#### Scenario: Avance parcial
- **WHEN** el visitante respondió solo las preguntas de "Clientes y reportes"
- **THEN** "Ventas y clientes" muestra su nivel y las otras 3 dimensiones aparecen "sin datos"

#### Scenario: Sin montos
- **WHEN** el visitante responde todas las preguntas
- **THEN** en la página no aparece "índice de fricción", "ahorro", ningún monto con "$" ni horas ahorradas (el plazo de respuesta "en menos de 24 horas" no cuenta)

### Requirement: Pregunta abierta sobre lo que quiere mejorar
La primera pregunta abierta del diagnóstico SHALL ser "¿Qué es lo que más te gustaría mejorar en tu negocio este año?". La segunda SHALL seguir siendo "Si pudieras resolver un solo problema del día a día con una solución mágica, ¿cuál sería?". Ambas siguen siendo opcionales.

#### Scenario: Preguntas abiertas
- **WHEN** el visitante llega a "En tus palabras"
- **THEN** ve esas dos preguntas, en ese orden, y puede enviar el diagnóstico sin responderlas

### Requirement: Mapa guardado en el lead
Al recibir un diagnóstico, `POST /api/leads` SHALL calcular el mapa en el servidor a partir de las respuestas por área de `meta.areas` y guardarlo en `meta.oportunidades` (dimensiones con id, nombre, puntaje y nivel; ids de las oportunidades principales; próximo paso), reemplazando cualquier `meta.oportunidades` enviado por el cliente. Antes de guardar, el servidor SHALL rearmar el `meta` del diagnóstico:

- **Áreas:** las 6 áreas del cuestionario, cada una con su `id`, nombre, nombre corto y respuestas por pregunta. Solo cuentan los valores enteros de 1 a 5.
- **Puntaje de cada área:** se calcula desde sus respuestas. Solo si un área no trae respuestas válidas, se usa el puntaje recibido, siempre que esté entre 0 y 100.
- **Áreas no aceptadas:** las desconocidas y las repetidas se descartan.
- **Índice de fricción:** se recalcula desde las respuestas.
- **Preguntas abiertas:** solo las conocidas, con una respuesta de hasta 1.000 caracteres.
- **Resto del `meta`:** solo se guardan los campos conocidos.
- **Resumen interno del lead (`message`):** lo arma el servidor desde el mapa.

El lead SHALL seguir guardando `indiceFriccion`, `nivelFriccion` y `areas` para el uso interno. Los leads nuevos MUST NOT guardar `meta.ahorro`.

#### Scenario: El servidor manda
- **WHEN** un diagnóstico llega con `meta.oportunidades` manipulado (por ejemplo, todas las dimensiones en "alta")
- **THEN** el lead guardado tiene el mapa recalculado desde `meta.areas`

#### Scenario: Sin ahorro en leads nuevos
- **WHEN** un visitante envía el diagnóstico después de este cambio
- **THEN** el lead no tiene `meta.ahorro`

#### Scenario: Datos mínimos o manipulados
- **WHEN** un diagnóstico llega con `meta.areas` = `[{ id: "clientes", friccion: 80 }]`, o con un área con `friccion: 100` y todas sus respuestas en 1
- **THEN** el lead se guarda con las 6 áreas completas, la primera con puntaje 80 y la segunda con puntaje 0, y su detalle y su ficha se abren sin errores

### Requirement: Informe PDF con el mapa
El informe PDF al cliente (descarga en `/diagnostico` y adjunto del correo) SHALL incluir: el nombre en el saludo y la empresa si existe, fecha, el mapa con las 4 dimensiones y su nivel, las oportunidades principales con su texto "lo que puedes lograr", el próximo paso sugerido, las respuestas abiertas no vacías y el llamado a agendar la sesión. MUST NOT incluir índice de fricción, montos en pesos ni horas ahorradas. `POST /api/diagnostico/report` SHALL aplicar al `meta` la misma limpieza que el lead (solo preguntas abiertas conocidas, por ejemplo). SHALL generar el informe si `meta.areas` trae al menos un área con puntaje, identificada por `id` o, en el formato antiguo, por su nombre. SHALL responder 400 con `{ error }` en caso contrario, si el cuerpo no es un objeto o si `meta` pasa de 64 KB.

#### Scenario: Descarga del informe
- **WHEN** el visitante termina el diagnóstico y pulsa "Descargar mi informe (PDF)"
- **THEN** descarga un PDF con su mapa, oportunidades principales y próximo paso

#### Scenario: Formato antiguo
- **WHEN** `POST /api/diagnostico/report` recibe un `meta` antiguo con `indiceFriccion` y `areas` identificadas solo por nombre
- **THEN** responde 200 con un PDF que muestra el mapa calculado desde esas áreas

#### Scenario: Sin respuestas
- **WHEN** `POST /api/diagnostico/report` recibe un `meta` sin áreas con puntaje
- **THEN** responde 400 con `{ "error": "Faltan datos del diagnóstico para generar el informe." }`

#### Scenario: Pregunta abierta inventada
- **WHEN** el `meta` trae una pregunta abierta que no es del cuestionario (por ejemplo, "Tu ahorro estimado es $9.999.999")
- **THEN** el PDF no la muestra

### Requirement: Correo al cliente con su mayor oportunidad
El correo que acompaña al informe SHALL nombrar la primera oportunidad principal y el próximo paso sugerido, y MUST NOT mencionar índice de fricción ni ahorro estimado. Si Resend no está configurado o falla, el lead SHALL guardarse igual (comportamiento actual, no bloqueante).

#### Scenario: Correo enviado
- **WHEN** un diagnóstico se envía con Resend configurado
- **THEN** el correo al cliente dice cuál es su mayor oportunidad, trae el PDF adjunto y el botón para agendar, y no contiene "fricción" ni "ahorro"

### Requirement: Mapa visible para el equipo
En el panel, la lista de leads SHALL mostrar la columna "Mayor oportunidad" (nombre de la primera oportunidad principal o "—") en lugar de "Ahorro/mes". El detalle del lead y su ficha PDF interna SHALL mostrar el mapa de oportunidades; para leads guardados antes de este cambio, el mapa SHALL calcularse desde sus `areas`. El detalle y la ficha SHALL seguir mostrando el índice de fricción y, si existe, la estimación de ahorro guardada, y MUST NOT fallar aunque un área guardada no traiga nombre ni respuestas. La ficha de un lead sin estimación MUST NOT mencionar el estimador.

#### Scenario: Lead nuevo en la lista
- **WHEN** el admin abre `/admin/leads` y hay un diagnóstico cuya primera oportunidad es "Ventas y clientes"
- **THEN** la fila muestra "Ventas y clientes" en "Mayor oportunidad"

#### Scenario: Lead antiguo en el detalle
- **WHEN** el admin abre un diagnóstico guardado antes de este cambio (sin `meta.oportunidades` y con `meta.ahorro`)
- **THEN** ve el mapa calculado, el índice de fricción y la estimación de ahorro, sin errores
