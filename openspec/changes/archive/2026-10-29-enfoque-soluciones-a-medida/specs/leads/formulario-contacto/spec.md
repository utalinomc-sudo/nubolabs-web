## MODIFIED Requirements

### Requirement: Objetivos y rubro
El paso 1 SHALL ofrecer como opciones de selección múltiple los objetivos "Vender más", "Responder más rápido a mis clientes", "Tener mis números claros", "Cobrar a tiempo", "Ordenar el trabajo del equipo", "Resolver un problema puntual de mi operación", "Crecer sin desordenarme" y "Otra cosa", y como opciones de selección única los rubros "Gastronomía", "Automotriz", "Construcción", "Servicios profesionales", "Comercio" y "Otro". La opción "Resolver un problema puntual de mi operación" conserva la clave persistida `drop_spreadsheets` (antes "Dejar atrás las planillas"): los leads guardados con esa clave SHALL mostrarse al equipo con la etiqueta vigente. Cada opción SHALL comunicar su estado seleccionado a tecnologías de asistencia. Elegir un rubro distinto SHALL reemplazar el anterior y volver a pulsar el elegido SHALL deseleccionarlo. El formulario MUST NOT preguntar "¿Qué tarea te gustaría dejar de hacer a mano?" ni nombrar herramientas concretas en sus opciones.

#### Scenario: Varios objetivos, un rubro
- **WHEN** el visitante pulsa "Vender más", "Cobrar a tiempo", "Automotriz" y luego "Construcción"
- **THEN** quedan seleccionados los dos objetivos y solo el rubro "Construcción"

#### Scenario: Objetivo de un problema puntual
- **WHEN** el visitante elige "Resolver un problema puntual de mi operación" y envía
- **THEN** el lead se guarda con `goals` que incluye `drop_spreadsheets`, el equipo lo ve como "Resolver un problema puntual de mi operación" y la pantalla de éxito dice "Conversamos 30 minutos sobre cómo resolver un problema puntual de tu operación."
