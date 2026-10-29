## MODIFIED Requirements

### Requirement: Casos por defecto
Sin casos en el CMS, la sección SHALL mostrar los 14 casos por defecto: para todos "Un reporte mensual con ventas, costos y márgenes que se arma solo.", "Cobranza con recordatorios amables y automáticos." y "Cotizaciones listas el mismo día."; gastronomía "Reservas y pedidos en un solo lugar, con la ocupación del día a la vista.", "Pedidos a proveedores según lo que de verdad queda en bodega." y "Ventas del día y costo de insumos en tu celular al cierre."; automotriz "Presupuestos de repuestos y mano de obra que se arman solos." y "Aviso al cliente cuando su auto está listo y recordatorio de su próxima mantención."; construcción "Estados de pago y documentos de obra ordenados y enviados a tiempo." y "Gastos por obra al día, sin copiar facturas a mano."; servicios profesionales "Plazos y vencimientos que nadie olvida, con aviso al responsable." e "Informes a clientes que se preparan solos desde tus datos."; comercio "Stock y ventas al día, con aviso antes de quedarte sin producto." y "Sabes qué productos dejan margen y cuáles no, antes de reponer." El encabezado por defecto SHALL ser la etiqueta "Ejemplos por rubro" (se muestra en mayúsculas, como las demás etiquetas de sección) y el título "Problemas concretos que resolvemos en negocios como el tuyo", sin bajada. Los textos por defecto MUST NOT contener "n8n", "Make", "API", "CRM", "ERP", "IA", "horas", "WhatsApp", "Excel", "Sheets", "planilla", "contador" ni "contable".

#### Scenario: Portada sin casos en el CMS
- **WHEN** `config/site` no trae `content.casos.items`
- **THEN** la sección muestra los 14 casos por defecto con su rubro

#### Scenario: Vocabulario
- **WHEN** se revisan los textos por defecto de la sección
- **THEN** no aparece ninguna de las palabras prohibidas
