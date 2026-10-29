## MODIFIED Requirements

### Requirement: Franja de bienvenida editable y cerrable
La franja SHALL mostrar un título y un texto editables desde `/admin/config` (`content.referidos.oa.titulo` y `content.referidos.oa.texto`). Sin overrides SHALL usar el título "Bienvenido, cliente de Osorio & Asociados." y el texto "Osorio & Asociados nos recomendó porque resolvemos problemas concretos de empresas como la tuya, con soluciones a su medida y datos claros para decidir." El texto por defecto MUST NOT mencionar al contador ni servicios contables. La franja SHALL tener un botón accesible "Cerrar aviso" (objetivo táctil de al menos 44 × 44 px); al cerrarla MUST NOT volver a mostrarse en la misma pestaña una vez cargada la página (al recargar puede verse un instante mientras carga, porque el servidor no conoce lo guardado en la pestaña), y cerrarla MUST NOT borrar la marca de referido de la visita. Al cerrarla, el foco SHALL pasar al menú.

#### Scenario: Textos por defecto
- **WHEN** `config/site` no tiene `content.referidos`
- **THEN** la franja muestra el título y el texto por defecto

#### Scenario: Cerrar la franja
- **WHEN** el visitante cierra la franja y luego recarga `/oa`
- **THEN** la franja no aparece, pero un lead enviado después sigue quedando marcado como referido
