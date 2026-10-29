## ADDED Requirements

### Requirement: Lema del sitio en el informe y el correo
El informe PDF al cliente y el correo que lo acompaña SHALL cerrar con el lema "Soluciones a tu medida, decisiones con datos." (en la cabecera del PDF y en el pie del correo) y MUST NOT contener "piloto automático", "WhatsApp", "planilla" ni "contador".

#### Scenario: Lema en el PDF
- **WHEN** se genera el informe con `POST /api/diagnostico/report`
- **THEN** el texto del PDF contiene "Soluciones a tu medida, decisiones con datos." y no contiene "piloto automático"

#### Scenario: Lema en el correo
- **WHEN** se arma el correo al cliente con su informe
- **THEN** el HTML contiene "Soluciones a tu medida, decisiones con datos." y no contiene "piloto automático"

## MODIFIED Requirements

### Requirement: Oportunidades principales y próximo paso
Las oportunidades principales SHALL ser hasta 3 dimensiones con nivel alta o media, ordenadas por puntaje de mayor a menor; los empates se resuelven por el orden de la tabla de dimensiones. Si ninguna dimensión tiene nivel alta o media, la única oportunidad principal SHALL ser la dimensión con mayor puntaje. El próximo paso sugerido SHALL ser el texto de "próximo paso" de la primera oportunidad principal. Cada dimensión SHALL tener estos textos:

| Dimensión | Lo que puedes lograr | Próximo paso sugerido |
|---|---|---|
| Ventas y clientes | Vendes más: respondes antes y ningún cliente queda sin seguimiento. | Responder consultas y cotizaciones el mismo día, con seguimiento automático. |
| Control y números | Decides con datos: ventas, costos y pendientes al día, sin pedir informes. | Tener ventas, costos y cobranzas al día en un reporte claro. |
| Orden y seguimiento | Nada se olvida: cobros, plazos y tareas avanzan a tiempo. | Que cobros, plazos y tareas recurrentes avancen solos, con avisos a tiempo. |
| Equipo y crecimiento | Creces sin desordenarte: más clientes sin que el equipo colapse. | Liberar al equipo de la pega repetitiva y dejar escrito cómo se hacen las cosas. |

#### Scenario: Tres principales
- **WHEN** los puntajes son Ventas 70, Control 40, Orden 70 y Equipo 20
- **THEN** las oportunidades principales son Ventas, Orden y Control (en ese orden) y el próximo paso es el de Ventas y clientes

#### Scenario: Todo bajo
- **WHEN** los puntajes son Ventas 10, Control 30, Orden 20 y Equipo 5
- **THEN** la única oportunidad principal es Control y números y el próximo paso es el suyo

#### Scenario: Textos de Control y números
- **WHEN** la primera oportunidad principal es "Control y números"
- **THEN** el informe muestra "Decides con datos: ventas, costos y pendientes al día, sin pedir informes." y el próximo paso "Tener ventas, costos y cobranzas al día en un reporte claro."
