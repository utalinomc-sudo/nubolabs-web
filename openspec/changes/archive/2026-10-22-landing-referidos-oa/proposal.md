## Why

Mauricio O. (Osorio & Asociados) enviará un correo a más de 100 clientes recomendando a Nubolabs. Hoy todos los leads de la portada llegan como `source: "landing"`: no hay forma de saber cuántos trae esa campaña, y la página no reconoce que el visitante viene recomendado por su contador, que es el activo más fuerte de la campaña (`docs/backlog/prospectos-oa.md` HDU-07, `docs/backlog/propuesta-valor-hdu-08.md` §5.2 y §11). Va después de HDU-04 (bloque de confianza) y antes de que salga el correo con el link definitivo.

## What Changes

- **Entrada `/oa`**: muestra la misma portada con una franja superior de bienvenida ("Bienvenido, cliente de Osorio & Asociados…"), cerrable, con textos editables desde el CMS (`content.referidos.oa { titulo, texto }`). `/?ref=oa` funciona como alias. `/oa` no se indexa (evita contenido duplicado).
- **Marca del referido en el lead**: los leads creados durante una visita que entró por `/oa` (formulario de la portada o `/diagnostico`) quedan con el campo nuevo **`referral: "oa"`**. El origen del formulario (`source: "landing" | "diagnostico"`) no cambia (ver design.md, decisión 1).
- **Persistencia durante la visita**: el referido se guarda en `sessionStorage` para que se conserve al pasar de la portada a `/diagnostico`.
- **API**: `POST /api/leads` acepta `referral` solo si está en la lista permitida (`REFERRALS = ["oa"]`); cualquier otro valor se ignora sin error.
- **Admin**: la lista de leads muestra una etiqueta "O&A" y permite filtrar por origen (Formulario, Diagnóstico, O&A); el detalle y la ficha PDF muestran el referido; el dashboard suma "Leads por origen (últimos 30 días)".
- **Aviso por correo**: la fila "Origen" del aviso interno indica también el referido.

## Capabilities

### New Capabilities
- `leads/origen-referidos`: entrada para visitantes referidos (`/oa`), conservación del referido durante la visita, registro del referido en el lead y su medición en el panel.

### Modified Capabilities
<!-- Ninguna con spec vigente. Se apoya en la captura de leads de HDU-03 (`lib/leads.ts`), cuyo comportamiento para leads sin referido no cambia. -->

## Non-goals

- Páginas o códigos para otros referidores (`/r/<codigo>`): se recomienda generalizar después, cuando haya un segundo referidor.
- Analítica de visitas o de clics (roadmap 3): se mide por leads, no por tráfico.
- Cambiar el texto del correo de Mauricio O. (lo controla él; el link a usar es `https://www.nubolabs.cl/oa`).
- Atribución entre sesiones o dispositivos (cookies de larga duración): solo vale la visita actual.

## Criterios de aceptación

#### Scenario: Visitante referido
- **WHEN** un visitante abre `https://www.nubolabs.cl/oa`
- **THEN** ve la franja de bienvenida de O&A sobre la portada y el resto de la página es igual a `/`

#### Scenario: Lead del formulario marcado
- **WHEN** ese visitante envía el formulario de la portada
- **THEN** el lead queda con `source: "landing"` y `referral: "oa"`

#### Scenario: Lead del diagnóstico marcado
- **WHEN** el visitante entra por `/oa`, pasa a `/diagnostico` en la misma pestaña y lo envía
- **THEN** el lead queda con `source: "diagnostico"` y `referral: "oa"`, y recibe su informe PDF como cualquier diagnóstico

#### Scenario: Visitante normal
- **WHEN** alguien abre `/` sin `?ref=oa` y sin haber pasado por `/oa` en esa pestaña
- **THEN** no ve la franja y su lead no tiene `referral`

#### Scenario: Medir la campaña
- **WHEN** Mauro abre el dashboard del admin
- **THEN** ve cuántos leads de los últimos 30 días llegaron por formulario, por diagnóstico y cuántos de ellos vinieron referidos por O&A

## Impact

- **Código:** `app/page.tsx` (lee `searchParams.ref`), `app/oa/page.tsx` (nuevo), `components/landing/LandingPage.tsx` (nuevo, composición compartida), `components/landing/ReferralBanner.tsx` y `ReferralTracker.tsx` (nuevos, cliente), `lib/referral.ts` + `lib/referral.test.ts` (nuevos), `lib/leadOptions.ts` (`REFERRALS`), `lib/leads.ts` + `lib/leads.test.ts` (campo `referral`), `types/lead.ts`, `components/landing/ContactForm.tsx`, `components/diagnostico/DiagnosticoFlow.tsx`, `lib/siteConfig.ts` (+ tests) y el editor del CMS, `lib/email.ts`, `lib/leadReport.ts`, `lib/leadStats.ts` + `lib/leadStats.test.ts` (nuevos), `app/admin/(panel)/page.tsx`, `app/admin/(panel)/leads/page.tsx`, `app/admin/(panel)/leads/[id]/page.tsx`.
- **API:** `POST /api/leads` acepta el campo opcional `referral`. Sin endpoints nuevos.
- **Datos:** campo nuevo `leads.referral` (string opcional, valores en `REFERRALS`); `config/site.content.referidos.oa { titulo, texto }`.
- **Variables de entorno:** ninguna.
- **Documentos a actualizar:** `docs/data-model.md` (`leads.referral`, `content.referidos`), `docs/api-spec.yml` (`LeadInput.referral`, `SiteContentPartial.referidos`, ruta `/oa` en la descripción), `docs/ESTADO-PROYECTO.md` (cómo medir la campaña y link a usar), `docs/backlog/prospectos-oa.md` (estado de HDU-07).
- **Coordinación:** confirmar con Mauricio O. que el correo use `https://www.nubolabs.cl/oa` (pregunta abierta 1 del backlog).
