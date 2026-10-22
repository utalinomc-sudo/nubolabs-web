## Why

El formulario de la portada es donde el prospecto que llega por O&A pasa de mirón a lead, y hoy pide un "email corporativo" y "¿Qué proceso te gustaría rediseñar o automatizar?" (lenguaje técnico), no ofrece agendar al terminar y no pide consentimiento. La Ley 21.719 es exigible desde el 1-dic-2026: sin consentimiento con prueba no se puede seguir escribiendo a esos correos. La HDU-08 §6 (aprobada el 2026-10-21) reemplazó el alcance de la HDU-03: formulario de 2 pasos que parte por lo que el dueño quiere lograr (no por "qué tarea dejar de hacer a mano"), WhatsApp obligatorio, dos consentimientos y agenda inmediata. Va segundo en el orden (fase 1, antes del correo de O&A).

## What Changes

- **Formulario de 2 pasos en `#contacto`** (reemplaza a `components/landing/ContactForm.tsx`, diseño de `docs/design/propuesta-web-hdu-08.html`):
  - Paso 1 "¿Qué te gustaría lograr?": chips de objetivos (selección múltiple) y de rubro (selección única); se puede saltar.
  - Paso 2 "¿Dónde te contactamos?": nombre, correo y WhatsApp obligatorios; empresa y "¿Algo que quieras contarnos antes de la llamada?" opcionales; consentimiento **obligatorio** de contacto y **opcional** de novedades (desmarcado).
  - Barra de progreso, botón "Volver", validación al salir de cada campo con errores junto al campo.
  - **Se elimina** la pregunta "¿Qué tarea te gustaría dejar de hacer a mano?" y el texto "Email corporativo".
- **Pantalla de éxito orientada a agendar:** "¡Listo, {nombre}! Ahora elige el día y la hora." con botón "Elegir horario" a `NEXT_PUBLIC_SCHEDULE_URL`; si falta, el título pasa a "¡Listo, {nombre}! Te escribimos en menos de 24 horas." y no hay botón (ajuste del 2026-10-22) y "Qué pasa ahora" con los objetivos elegidos.
- **Opciones compartidas** en `lib/leadOptions.ts` (sin `server-only`): `GOALS`, `INDUSTRIES`, `GoalKey`, `IndustryKey`, textos canónicos de consentimiento (`CONSENT_TEXTS`, `CONSENT_VERSION`). Las reutilizan HDU-05 (casos por rubro) y HDU-07 (referidos).
- **Validación en el servidor** con la función pura `normalizeLead()` en `lib/leads.ts` (+ tests): exige nombre, correo válido, WhatsApp (8 a 15 dígitos) y `contactConsent: true`; descarta objetivos y rubros fuera de la lista; limita largos; acepta `source` solo de `LEAD_SOURCES` (`landing`, `diagnostico`; HDU-07 suma `oa`).
- **Prueba del consentimiento** en cada lead: `contactConsent`, `marketingConsent`, `consentAt` (hora del servidor), `consentText` (texto exacto mostrado, tomado de las constantes del servidor) y `consentVersion`.
- **Anti-spam básico:** campo trampa oculto (honeypot); si viene lleno, se responde OK sin guardar ni avisar.
- **`/diagnostico`:** el paso de contacto suma WhatsApp obligatorio, rubro como selector (misma lista) y los dos consentimientos. Sin cambios en preguntas ni cálculos.
- **Página `/privacidad`** con texto editable desde el CMS (`content.privacidad { titulo, texto }`), borrador por defecto pendiente de validación legal, enlazada desde el formulario y desde los footers de la portada y de `/diagnostico`.
- **Admin, aviso por correo y ficha PDF** muestran objetivos, rubro, mensaje y consentimientos.

## Capabilities

### New Capabilities
- `leads/formulario-contacto`: captura de leads desde la portada y el diagnóstico: formulario de 2 pasos, validación en navegador y servidor, consentimientos con prueba, anti-spam básico, agenda tras el envío y cómo se ven esos datos en el aviso, la ficha y el admin.
- `sitio/privacidad`: página pública de privacidad editable desde el CMS y sus enlaces.

### Modified Capabilities
<!-- Ninguna: `diagnostico/estimador-ahorro` no cambia (el cálculo y su presentación siguen igual). -->

## Non-goals

- Integración con una herramienta de email marketing, doble opt-in o envío de campañas.
- Rate limiting por IP o captcha (roadmap 4); aquí solo honeypot.
- Agenda embebida (iframe de Calendly) o creación de la cuenta de agenda: solo se enlaza la URL.
- Editar desde el CMS los textos del formulario (quedan en `lib/content.ts`).
- Testimonio o mini-cita junto al formulario (HDU-04) y franja/origen de referidos `oa` (HDU-07).
- Cambiar el cuestionario, el cálculo o el informe del diagnóstico (HDU-09).
- Texto legal definitivo de `/privacidad`: queda un borrador para que lo valide O&A o un abogado.

## Criterios de aceptación

#### Scenario: Lead mínimo y agenda
- **WHEN** un visitante salta el paso 1, completa nombre, correo y WhatsApp válidos, marca el consentimiento de contacto y envía
- **THEN** el lead se guarda con `contactConsent: true`, `marketingConsent: false`, `consentAt` y `consentText`, llega el aviso por correo y la pantalla de éxito ofrece "Elegir horario" (si la agenda está configurada)

#### Scenario: Sin consentimiento
- **WHEN** el visitante intenta enviar sin marcar el consentimiento de contacto
- **THEN** ve "Necesitamos tu permiso para contactarte sobre el diagnóstico." junto a la casilla y no se envía nada; si alguien llama a la API sin `contactConsent: true`, recibe 400

#### Scenario: Objetivos y rubro llegan al equipo
- **WHEN** el visitante elige "Vender más" y "Cobrar a tiempo" y el rubro "Automotriz"
- **THEN** el aviso por correo, el detalle del admin y la ficha PDF muestran esos objetivos y el rubro, y la pantalla de éxito dice "Conversamos 30 minutos sobre cómo vender más y cobrar a tiempo."

#### Scenario: Sin URL de agenda
- **WHEN** `NEXT_PUBLIC_SCHEDULE_URL` no está definida
- **THEN** la pantalla de éxito dice "Te escribimos en menos de 24 horas" y no muestra un botón de agenda

#### Scenario: Diagnóstico con consentimiento
- **WHEN** un visitante termina `/diagnostico` y marca el consentimiento de contacto
- **THEN** el lead se guarda con los mismos campos de consentimiento y el informe PDF se genera como hoy

#### Scenario: Privacidad
- **WHEN** el visitante abre `/privacidad`
- **THEN** ve el texto editable con el correo de contacto y el plazo de respuesta

## Impact

- **Código nuevo:** `lib/leadOptions.ts`, `lib/leads.ts` (+ `lib/leads.test.ts`), `components/landing/ContactForm.tsx` (reescrito, cliente; + `ContactForm.test.tsx`), `app/privacidad/page.tsx`.
- **Código modificado:** `app/api/leads/route.ts`, `types/lead.ts`, `lib/email.ts`, `lib/leadReport.ts`, `lib/content.ts` (textos del formulario), `lib/siteConfig.ts` (+ tests: `privacidad`), `components/admin/ConfigEditor.tsx` (bloque Privacidad), `app/admin/(panel)/config/page.tsx`, `app/admin/(panel)/leads/page.tsx`, `app/admin/(panel)/leads/[id]/page.tsx`, `components/diagnostico/DiagnosticoFlow.tsx` (solo paso de contacto y footer), `components/landing/Footer.tsx`, `components/icons.tsx` si faltan íconos.
- **API:** `POST /api/leads` cambia su contrato: `phone` y `contactConsent` pasan a obligatorios (**BREAKING** para clientes que no los envíen; los dos formularios del sitio se actualizan en el mismo cambio). Campos nuevos opcionales `goals`, `industry`, `marketingConsent` y `website` (honeypot).
- **Datos:** `leads` gana `goals`, `industry`, `contactConsent`, `marketingConsent`, `consentAt`, `consentText`, `consentVersion`. `config/site.content` gana `privacidad`.
- **Variables de entorno:** nueva `NEXT_PUBLIC_SCHEDULE_URL` (pública; se fija en build) en `.env.local.example`, Vercel y perfil §4.
- **Documentos a actualizar** (`docs/documentation-standards.md` §3): `docs/api-spec.yml` (`LeadInput`, respuestas 400, honeypot), `docs/data-model.md` (campos de `leads` y `content.privacidad`), `.env.local.example`, `docs/integration-standards.md` y `docs/project-profile.md` §4 (agenda), `docs/ESTADO-PROYECTO.md`, `docs/backlog/prospectos-oa.md` (estado HDU-03).
- **Producción:** definir `NEXT_PUBLIC_SCHEDULE_URL` en Vercel (pregunta abierta de la HDU-08 §14); validar el texto de `/privacidad` antes del 1-dic-2026.
