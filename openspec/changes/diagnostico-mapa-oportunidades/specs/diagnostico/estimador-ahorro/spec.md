## MODIFIED Requirements

### Requirement: Formato de moneda
Los montos en CLP mostrados en el estimador interno del panel (`/admin/estimador`), en el detalle de un lead y en su ficha PDF interna SHALL formatearse en pesos chilenos con separador de miles y sin decimales, según la convención `es-CL`. Los montos MUST NOT mostrarse al visitante, en el informe PDF al cliente ni en el correo al cliente.

#### Scenario: Monto de seis cifras
- **WHEN** se formatea 155.187
- **THEN** el texto contiene el símbolo `$` y `155.187`, y no contiene decimales

#### Scenario: Informe al cliente sin montos
- **WHEN** se genera el informe PDF o el correo de un diagnóstico, aunque el `meta` recibido traiga un `ahorro` antiguo
- **THEN** ninguno muestra montos en CLP ni horas ahorradas

## ADDED Requirements

### Requirement: Estimador solo en el panel interno
El estimador de ahorro SHALL estar disponible únicamente para admins con sesión, en `/admin/estimador`, como herramienta para preparar propuestas. Sin sesión, la ruta SHALL redirigir a `/admin/login`. El flujo público `/diagnostico` MUST NOT ofrecer el estimador. Las estimaciones hechas en el panel MUST NOT guardarse en Firestore. Los leads que ya tienen `meta.ahorro` SHALL seguir mostrando esa estimación en su detalle y en su ficha PDF interna.

#### Scenario: Admin usa el estimador
- **WHEN** un admin con sesión abre `/admin/estimador` y agrega un proceso con los valores por defecto
- **THEN** ve un ahorro mensual de aproximadamente 155.187 CLP para ese proceso y nada se escribe en Firestore

#### Scenario: Sin sesión
- **WHEN** alguien sin sesión abre `/admin/estimador`
- **THEN** es redirigido a `/admin/login`

#### Scenario: Diagnóstico público sin estimador
- **WHEN** un visitante recorre `/diagnostico`
- **THEN** no encuentra el paso "Estimar mi ahorro"
