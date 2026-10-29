# leads/origen-referidos Specification

## Purpose
Permite reconocer a los visitantes que llegan recomendados por un referidor (hoy, Osorio & Asociados), conservar ese origen durante la visita, registrarlo en cada lead que generen y medir en el panel cuántos leads trae cada campaña.

## Requirements

### Requirement: Entrada para referidos de O&A
El sitio SHALL servir `/oa` con el mismo contenido y las mismas secciones visibles que `/`, más una franja de bienvenida al inicio de la página. `/?ref=oa` SHALL comportarse igual que `/oa`. Sin referido (`/` sin `ref`, o con un `ref` desconocido) la franja MUST NOT mostrarse. `/oa` y `/?ref=oa` MUST declarar que no deben indexarse (`noindex`) y MUST NOT declarar una URL canónica (señales contradictorias para los buscadores); `/` sin referido SHALL seguir indexable. Desde `/oa`, los enlaces del menú y del pie llevan a `/` (sin la franja); la visita sigue marcada como referida en esa pestaña.

#### Scenario: Entrada por /oa
- **WHEN** un visitante abre `/oa`
- **THEN** ve la franja de bienvenida y debajo la misma portada que en `/`

#### Scenario: Alias con parámetro
- **WHEN** un visitante abre `/?ref=oa`
- **THEN** ve la misma franja que en `/oa` y la página declara `noindex`; `/` sin `ref` sigue indexable

#### Scenario: Referido desconocido
- **WHEN** un visitante abre `/?ref=otro`
- **THEN** no ve ninguna franja y la visita no queda marcada como referida

#### Scenario: No indexable
- **WHEN** se inspecciona el HTML de `/oa`
- **THEN** contiene una meta de robots con `noindex` y no declara URL canónica

#### Scenario: Del menú a la portada
- **WHEN** desde `/oa` el visitante pulsa "Diagnóstico gratis" en el menú y envía el formulario en `/`
- **THEN** el lead queda con `referral: "oa"`

### Requirement: Franja de bienvenida editable y cerrable
La franja SHALL mostrar un título y un texto editables desde `/admin/config` (`content.referidos.oa.titulo` y `content.referidos.oa.texto`). Sin overrides SHALL usar el título "Bienvenido, cliente de Osorio & Asociados." y el texto "Osorio & Asociados nos recomendó porque resolvemos problemas concretos de empresas como la tuya, con soluciones a su medida y datos claros para decidir." El texto por defecto MUST NOT mencionar al contador ni servicios contables. La franja SHALL tener un botón accesible "Cerrar aviso" (objetivo táctil de al menos 44 × 44 px); al cerrarla MUST NOT volver a mostrarse en la misma pestaña una vez cargada la página (al recargar puede verse un instante mientras carga, porque el servidor no conoce lo guardado en la pestaña), y cerrarla MUST NOT borrar la marca de referido de la visita. Al cerrarla, el foco SHALL pasar al menú.

#### Scenario: Textos por defecto
- **WHEN** `config/site` no tiene `content.referidos`
- **THEN** la franja muestra el título y el texto por defecto

#### Scenario: Cerrar la franja
- **WHEN** el visitante cierra la franja y luego recarga `/oa`
- **THEN** la franja no aparece, pero un lead enviado después sigue quedando marcado como referido

### Requirement: Referido conservado durante la visita
Al entrar por `/oa` o `/?ref=oa`, el sitio SHALL recordar el referido durante la sesión de la pestaña (hasta cerrarla), de modo que los envíos posteriores desde el formulario de la portada o desde `/diagnostico` en esa misma pestaña lo incluyan. Un valor guardado que no esté en la lista de referidos permitidos MUST ignorarse. Si el navegador no permite almacenamiento de sesión, el sitio MUST seguir funcionando y el lead se envía sin referido.

#### Scenario: De la portada al diagnóstico
- **WHEN** el visitante entra por `/oa`, navega a `/diagnostico` y envía el diagnóstico
- **THEN** la solicitud a `POST /api/leads` incluye `referral: "oa"`

#### Scenario: Pestaña nueva
- **WHEN** el mismo visitante abre `/diagnostico` en una pestaña nueva sin pasar por `/oa`
- **THEN** su envío no incluye `referral`

#### Scenario: Almacenamiento bloqueado
- **WHEN** el navegador bloquea el almacenamiento de sesión y el visitante entra por `/oa` y envía el formulario de la portada
- **THEN** el formulario se envía con normalidad (con o sin referido) y no aparece ningún error

### Requirement: Registro del referido en el lead
`POST /api/leads` SHALL aceptar el campo opcional `referral`. Si su valor, recortado, pertenece a la lista permitida (hoy solo `"oa"`), el lead SHALL guardarse con ese `referral`; si falta, está vacío, no es texto o no pertenece a la lista, el lead SHALL guardarse sin `referral` y la respuesta MUST NOT ser un error por ese motivo. El campo `source` SHALL seguir indicando el formulario de origen (`"landing"` o `"diagnostico"`) y el envío del informe PDF de los diagnósticos MUST NOT depender del referido.

#### Scenario: Referido válido
- **WHEN** se envía `POST /api/leads` con datos válidos, `source: "landing"` y `referral: "oa"`
- **THEN** la respuesta es 200 y el lead queda con `source: "landing"` y `referral: "oa"`

#### Scenario: Referido no permitido
- **WHEN** se envía `POST /api/leads` con datos válidos y `referral: "xyz"`
- **THEN** la respuesta es 200 y el lead queda sin `referral`

#### Scenario: Diagnóstico referido recibe su informe
- **WHEN** se envía un diagnóstico completo con `source: "diagnostico"` y `referral: "oa"` y Resend está configurado
- **THEN** el cliente recibe su informe PDF por correo igual que sin referido

### Requirement: Referido visible para el equipo
El aviso interno por correo de cada lead SHALL indicar el referido cuando exista (por ejemplo "Origen: landing · referido O&A"). En el panel, la lista de leads SHALL mostrar una etiqueta "O&A" en los leads referidos y SHALL permitir filtrar por "Todos", "Formulario", "Diagnóstico" y "O&A"; el filtro SHALL reflejarse en la URL para poder compartirlo. El detalle del lead y su ficha PDF SHALL mostrar el referido.

#### Scenario: Filtrar por O&A
- **WHEN** el admin abre `/admin/leads?origen=oa`
- **THEN** la lista muestra solo leads con `referral: "oa"`, de cualquier formulario

#### Scenario: Lead sin referido
- **WHEN** el admin abre el detalle de un lead creado antes de este cambio
- **THEN** la página se muestra sin errores y sin etiqueta de referido

### Requirement: Leads por origen en el dashboard
El dashboard del admin SHALL mostrar "Leads por origen (últimos 30 días)" con la cantidad de leads de los últimos 30 días contados desde el momento de la consulta: por formulario (`source: "landing"`), por diagnóstico (`source: "diagnostico"`) y cuántos de ellos tienen `referral: "oa"`. Leads con `createdAt` ausente o inválido MUST NOT contarse. Sin Firestore configurado, el bloque SHALL mostrar "—" en lugar de cifras.

#### Scenario: Conteo de 30 días
- **WHEN** hay 3 leads de formulario (1 referido por O&A) y 2 diagnósticos (2 referidos) creados en los últimos 30 días, y 4 leads más antiguos
- **THEN** el bloque muestra Formulario 3, Diagnóstico 2 y O&A 3

#### Scenario: Sin Firestore
- **WHEN** el sitio corre sin credenciales de Firebase
- **THEN** el bloque se muestra con "—" y el dashboard no falla
