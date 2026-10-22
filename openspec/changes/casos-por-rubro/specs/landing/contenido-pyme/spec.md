## MODIFIED Requirements

### Requirement: Textos de los Casos sin jerga
Los textos por defecto de Casos SHALL no usar jerga: el encabezado por defecto SHALL ser el que fija la spec `landing/casos-por-rubro` (etiqueta "Ejemplos por rubro" y título "Esto es lo que dejamos funcionando en negocios como el tuyo", sin bajada), y la etiqueta, el título y los textos de los casos por defecto MUST NOT contener las palabras prohibidas de la regla de vocabulario.

#### Scenario: Casos por defecto
- **WHEN** `config/site` no tiene `content.casos`
- **THEN** el encabezado y los casos de la sección no contienen palabras prohibidas y no se muestra bajada
