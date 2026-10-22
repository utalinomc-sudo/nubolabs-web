## Purpose

Define el bloque de la portada que invita a hacer el autodiagnóstico de 5 minutos como complemento de la sesión gratuita, con un ejemplo ilustrativo del mapa de oportunidades.

## ADDED Requirements

### Requirement: Sección de autodiagnóstico en la portada
La portada SHALL mostrar el bloque "Autodiagnóstico" entre la sección del proceso ("Cómo trabajamos contigo") y el formulario de contacto, solo si la sección `autodiagnostico` está visible en el CMS. Por defecto la sección SHALL estar visible. Al ocultarla MUST NOT quedar espacio vacío.

#### Scenario: Visible por defecto
- **WHEN** `config/site` no define `visible.autodiagnostico`
- **THEN** la portada muestra el bloque después del proceso y antes del formulario

#### Scenario: Oculta
- **WHEN** el admin desactiva la sección "Autodiagnóstico" y guarda
- **THEN** la portada deja de mostrar el bloque en la siguiente carga, sin hueco

### Requirement: Textos editables del bloque
El eyebrow, el título, el texto y el botón del bloque SHALL ser editables desde `/admin/config` (`content.autodiagnostico { eyebrow, title, body, cta }`). Sin overrides SHALL usar: eyebrow "Autodiagnóstico · 5 minutos"; título "¿No sabes por dónde partir? Descubre dónde está tu mayor oportunidad."; texto "Responde unas preguntas simples sobre tu día a día y recibe tu mapa de oportunidades en PDF, al instante. Ideal para llegar con todo a la sesión gratuita."; botón "Hacer el autodiagnóstico". El botón SHALL llevar a `/diagnostico`.

#### Scenario: Textos por defecto
- **WHEN** `config/site` no tiene `content.autodiagnostico`
- **THEN** el bloque muestra los textos por defecto y el botón lleva a `/diagnostico`

#### Scenario: Override parcial
- **WHEN** el admin cambia solo el título
- **THEN** el bloque muestra el título nuevo y los demás textos por defecto

### Requirement: Ejemplo ilustrativo del mapa
El bloque SHALL mostrar una tarjeta "Tu mapa de oportunidades" marcada visiblemente como "Ejemplo", con las 4 dimensiones del mapa, una barra y un nivel en texto para cada una, y un próximo paso de ejemplo. El ejemplo MUST NOT mostrar puntajes numéricos, porcentajes, montos ni horas.

#### Scenario: Ejemplo sin cifras
- **WHEN** se revisa la tarjeta de ejemplo
- **THEN** aparece la palabra "Ejemplo", las 4 dimensiones con su nivel en texto, y ningún número, "%" ni "$"

### Requirement: Bloque usable en móvil
A 375 px de ancho el bloque MUST NOT producir scroll horizontal y su botón SHALL medir al menos 44 px de alto.

#### Scenario: Móvil
- **WHEN** se abre la portada a 375 × 812 px
- **THEN** el bloque se apila en una columna sin scroll horizontal y el botón mide 44 px o más de alto
