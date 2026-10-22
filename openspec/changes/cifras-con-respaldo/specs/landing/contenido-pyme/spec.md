## MODIFIED Requirements

### Requirement: Vocabulario para dueños de negocio
Con los textos por defecto, el texto visible de la portada MUST NOT contener las palabras "n8n", "Make", "API", "APIs", "CRM", "ERP", "agente", "agentes", "IA", "ROI", "nube" ni la expresión "horas ahorradas", salvo dentro de la nota técnica de Servicios. Tampoco MUST contener "pyme" ni "pymes" en ningún lugar (decisión de Mauro del 2026-10-22: no excluir a empresas grandes). La nota técnica SHALL ser un único párrafo de texto pequeño ubicado al final de Servicios.

#### Scenario: Barrido de la portada
- **WHEN** se extrae el texto visible de `/` con los textos por defecto y se excluye la nota técnica
- **THEN** no aparece ninguna de las palabras o expresiones prohibidas

#### Scenario: Nota técnica única
- **WHEN** se busca "n8n" en el texto visible de `/`
- **THEN** aparece una sola vez, dentro de la nota técnica de Servicios
