## MODIFIED Requirements

### Requirement: Texto puente sin testimonios
Si no hay testimonios válidos, el panel principal del bloque SHALL mostrar el eyebrow (por defecto "Nos recomiendan", en mayúsculas en pantalla) y el texto puente (por defecto "Trabajamos con empresas y asesores que nos recomiendan a sus clientes."). En ese estado el bloque MUST NOT mostrar comillas de cita, nombres de personas ni iniciales. El sistema MUST NOT incluir testimonios en sus valores por defecto. El texto puente por defecto MUST NOT mencionar estudios contables ni al contador.

#### Scenario: Sin testimonios en el CMS
- **WHEN** `content.confianza.testimonios` no existe o es una lista vacía
- **THEN** el panel muestra el eyebrow y el texto puente, sin comillas ni nombres

#### Scenario: Defaults sin testimonios
- **WHEN** se inspeccionan los valores por defecto de la configuración del sitio
- **THEN** la lista de testimonios por defecto está vacía

### Requirement: Compromisos
Junto al panel principal, el bloque SHALL mostrar el título "Nuestro compromiso contigo" y siempre 3 compromisos, cada uno con ícono (según su posición), título y texto. Por defecto SHALL mostrar "Primera sesión gratis" (30 minutos por videollamada, sin compromiso.), "Hecho para tu negocio" (Partimos de tu problema y trabajamos con lo que ya usas, sin cambiar tus sistemas.) y "Sin letra chica" (Plan por etapas y costos claros antes de partir.). Los compromisos por defecto MUST NOT nombrar herramientas ni canales concretos. Un título o texto guardado vacío SHALL reemplazarse por el recomendado de esa posición, para que nunca falte un compromiso ni se desordenen los íconos.

#### Scenario: Compromisos por defecto
- **WHEN** el CMS no trae `content.confianza.compromisos`
- **THEN** se muestran los 3 compromisos por defecto con su ícono

#### Scenario: Compromiso con título vacío
- **WHEN** el admin deja vacío el título del segundo compromiso y guarda
- **THEN** la portada sigue mostrando 3 compromisos y el segundo usa el título recomendado "Hecho para tu negocio" con su ícono

#### Scenario: Compromiso editado
- **WHEN** el admin cambia el texto del segundo compromiso y guarda
- **THEN** la portada muestra el texto nuevo en la siguiente carga, sin despliegue
