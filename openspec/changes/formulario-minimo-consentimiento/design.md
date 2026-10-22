## Context

Motivación en `proposal.md`; requisitos en `specs/leads/formulario-contacto/spec.md` y `specs/sitio/privacidad/spec.md`. Este diseño asume mezclado `mensaje-principal-pyme` (HDU-01): tokens de la HDU-08 en `tailwind.config.ts` (`brand-50`, `brand-dark`, `accent-strong`, `accent-50`, `success`, `success-50`, `line-strong`, `shadow-form`, animación `feedIn`…), configuración pura en `lib/siteConfig.ts` (+ `lib/siteConfig.test.ts`) re-exportada por `lib/site.ts`, y el botón "Usar los textos recomendados" por sección en `components/admin/ConfigEditor.tsx`.

Estado actual relevante:

- `components/landing/ContactForm.tsx` (cliente, `#contacto`): 5 campos en un paso, `Object.fromEntries(new FormData(form))` → `POST /api/leads`, estados `"idle" | "loading" | "ok" | "error"`, éxito "¡Solicitud enviada!" sin agenda. Textos hardcodeados en el JSX (contra `docs/frontend-standards.md` §4).
- `app/api/leads/route.ts`: valida solo nombre y correo (`isValidEmail`), guarda `name, email, phone, company, message, source, status, createdAt, meta` tal como llegan (sin largos máximos, `source` libre). Sin Firebase hace `console.warn(... lead)` con **el lead completo** (PII en logs, contra base-standards §9). Efectos (`sendLeadNotification`, `maybeSendClientReport`) en `Promise.all` después de persistir.
- `types/lead.ts`: `LeadInput` / `Lead` sin consentimientos.
- `components/diagnostico/DiagnosticoFlow.tsx`: paso de contacto con inputs de estilo inline (nombre, email, teléfono opcional, empresa, rubro libre → `meta.rubro`); envía a `/api/leads` con `source: "diagnostico"` **sin mirar la respuesta** (la confirmación no se bloquea por fallos del backend); su footer propio dice `hola@nubolabs.ai`.
- `lib/email.ts` (`sendLeadNotification`): tabla con Nombre, Email, Teléfono, Empresa, Origen y el mensaje.
- `lib/leadReport.ts` (ficha PDF interna): campos Email, Teléfono, Empresa, Rubro (`meta.rubro`), Recibido, ID; mensaje crudo solo si no hay áreas.
- `app/admin/(panel)/leads/page.tsx` (tabla de 8 columnas con `overflow-x-auto`) y `leads/[id]/page.tsx` (contacto, áreas, "En sus palabras", ahorro, "Mensaje"). Usan hex sueltos (`bg-[#FFEFED]`, `bg-[#EBF1FF]`).
- `SCHEDULE_URL` (servidor) ya existe para el botón del informe y del correo al cliente, con default `https://www.nubolabs.cl`.
- Referencia visual: `docs/design/propuesta-web-hdu-08.html`, bloque `#agendar` (estilos `.contact`, `.form-card`, `.progress`, `.fchips`, `.field`, `.consent`, `.done`, `.next`) y su script (sección 6).
- Localmente no hay `.env.local`: los leads no se persisten y Resend no envía (útil para curl y E2E sin datos que limpiar).

## Goals / Non-Goals

**Goals:**
- Una sola fuente para opciones, textos de consentimiento y reglas de validación, compartida por navegador, servidor, admin, correo y PDF.
- Prueba de consentimiento a prueba de manipulación desde el cliente.
- Que la lógica nueva sea testeable con Vitest sin mocks de Firebase.

**Non-Goals:**
- Reescribir `DiagnosticoFlow.tsx` a Tailwind o cambiar su estructura: solo se toca el paso de contacto y su footer.
- Cambiar la forma de `meta` del diagnóstico (HDU-09).

## Decisions

### 1. Opciones compartidas en `lib/leadOptions.ts` (sin `server-only`)
Exporta:
- `GOALS: readonly { key: GoalKey; label: string; topic: string | null }[]` con las claves y etiquetas del contrato (`sell_more` "Vender más", `respond_faster` "Responder más rápido a mis clientes", `clear_numbers` "Tener mis números claros", `collect_on_time` "Cobrar a tiempo", `organize_team` "Ordenar el trabajo del equipo", `drop_spreadsheets` "Dejar atrás las planillas", `grow_orderly` "Crecer sin desordenarme", `other` "Otra cosa"). `topic` es la frase en segunda persona para la pantalla de éxito ("vender más", "responder más rápido a tus clientes", "tener tus números claros", "cobrar a tiempo", "ordenar el trabajo del equipo", "dejar atrás las planillas", "crecer sin desordenarte"; `other` → `null`).
- `INDUSTRIES: readonly { key: IndustryKey; label: string }[]` (`gastronomia`, `automotriz`, `construccion`, `servicios` "Servicios profesionales", `comercio`, `otro`).
- Tipos `GoalKey`, `IndustryKey`; helpers `goalLabel(key)`, `industryLabel(key)`, `isGoalKey(v)`, `isIndustryKey(v)` y `describeGoals(keys)` → `"vender más y cobrar a tiempo"` / `null`.
- `CONSENT_TEXTS = { contact: "Acepto que Nubolabs use mis datos para contactarme sobre mi diagnóstico.", marketing: "Quiero recibir ideas y novedades de Nubolabs. Puedes darte de baja cuando quieras." }` y `CONSENT_VERSION = "2026-10-21"`.

HDU-05 (casos por rubro) e HDU-07 (referidos) importan `INDUSTRIES`/`IndustryKey`. *Alternativa descartada:* listas dentro de `lib/siteConfig.ts`: mezcla datos de leads con el CMS y obligaría a importar todo el CMS en el formulario.

### 2. Normalización pura en `lib/leads.ts`
- `LEAD_SOURCES = ["landing", "diagnostico"] as const` y `type LeadSource`. HDU-07 no amplía esta lista: marca a los referidos con el campo aparte `referral` (ver `openspec/changes/landing-referidos-oa/design.md`, decisión 1).
- `isValidEmail(v)` (regex actual), `isValidPhone(v)` (8 a 15 dígitos tras quitar todo lo que no sea dígito), `isHoneypotFilled(body)`.
- `normalizeLead(body: unknown, now = new Date()): { ok: true; lead: LeadRecord } | { ok: false; error: string }`: valida y construye el documento a guardar en este orden: objeto → nombre/correo ("Nombre y email son obligatorios.", "El email no es válido.") → teléfono ("Revisa el WhatsApp: debe tener entre 8 y 15 dígitos.") → `contactConsent === true` ("Necesitamos tu permiso para contactarte."). Recorta y trunca (`name`/`company` 120, `message` 1.000); *ajustado tras la revisión adversarial:* `email` (> 254) y `phone` (> 30) se validan sobre el texto completo y se rechazan si exceden, para que nunca se guarde un número o correo recortado ni se rechace algo que el navegador aceptó; `goals` únicos y válidos (omite el campo si queda vacío); `industry` solo si es válido; `source` de `LEAD_SOURCES` o `"landing"`; `meta` solo si es objeto plano, `source === "diagnostico"` y su JSON mide hasta 64 KB (si no, 400 "Solicitud inválida."; evita guardar ~1 MB arbitrario por lead); agrega `status: "new"`, `createdAt` y `consentAt` = `now.toISOString()`, `marketingConsent: body.marketingConsent === true`, `consentVersion` y `consentText` armado desde `CONSENT_TEXTS` (ignora lo que mande el cliente).
- `LeadRecord` vive en `types/lead.ts` junto a `LeadInput` (actualizado con los campos nuevos).
- *Por qué una función pura y no validación en el handler:* es testeable con Vitest (patrón de `lib/privateKey.ts`) y la reutiliza HDU-07. *Alternativa descartada:* una librería de esquemas (zod): dependencia nueva para 10 reglas.

### 3. Handler delgado y sin PII en logs
`app/api/leads/route.ts`: `req.json()` en `try/catch` (400 "JSON inválido.") → si `isHoneypotFilled(body)`, `console.warn("[leads] honeypot")` y `200 { ok: true, persisted: false }` sin efectos → `normalizeLead` (400 con su `error`) → persistencia igual que hoy (`getDb()` nulo → `persisted: false`) → efectos en `Promise.all`. El aviso sin Firebase pasa a registrar solo `source`, número de objetivos e `industry`, nunca nombre, correo ni teléfono.

### 4. Formulario de 2 pasos (`components/landing/ContactForm.tsx`, cliente)
- Props: `{ source?: LeadSource; scheduleUrl?: string | null }` (default `"landing"`; HDU-07 no usa esta prop para O&A: agrega `referral` al payload al enviar). `app/page.tsx` (servidor) pasa `scheduleUrl` = `process.env.NEXT_PUBLIC_SCHEDULE_URL` solo si empieza con `http://` o `https://`, si no `null`. Pasarla por prop deja el componente testeable sin manipular `process.env`.
- Estado: `step: 1 | 2`, `goals: GoalKey[]`, `industry: IndustryKey | null`, `values` (name, phone, email, company, message), `touched`/`errors`, `contactConsent`, `marketingConsent`, `status: "idle" | "loading" | "ok" | "error"`, `serverError`. Un solo envío al final (sin endpoint para completar datos después: evita exponer leads por id).
- UI según la referencia: columna izquierda (eyebrow "AGENDA TU DIAGNÓSTICO", "Conversemos 30 minutos sobre tu negocio", bajada y 3 "qué te llevas") y tarjeta derecha (`shadow-form`). Chips como `<button type="button" aria-pressed>` dentro de `role="group"` con etiqueta; inputs con `<label>` visible, `aria-invalid`, `aria-describedby` al error (`role="alert"`), `inputMode`/`type`/`autoComplete` (`given-name`, `tel`, `email`, `organization`). Al cambiar de paso, el foco va al `legend` del paso; al fallar el envío, al primer campo inválido o a la casilla.
- Honeypot: `<input name="website" tabIndex={-1} autoComplete="off">` dentro de un contenedor fuera de pantalla (`absolute -left-[9999px]`, `aria-hidden`), no `display:none`.
- Éxito: título con el primer nombre; con `scheduleUrl`, "Ahora elige el día y la hora." y botón "Elegir horario" (`target="_blank" rel="noopener"`); sin `scheduleUrl`, "Te escribimos en menos de 24 horas." y los dos primeros pasos de "Qué pasa ahora" hablan de que escribimos nosotros (no de elegir horario; ajuste del 2026-10-22 en apply); "Qué pasa ahora" con `describeGoals(goals)`; enlace al autodiagnóstico `/diagnostico`. Sin la nota "Prototipo…" de la referencia.
- Textos fijos en `lib/content.ts` como `contactSection` (no CMS en este cambio). El `id="contacto"` se mantiene.
- *Alternativa descartada:* librería de formularios (react-hook-form): el formulario es pequeño y el repo usa `useState` (frontend-standards §4).

### 4b. Detalle de "Otra cosa" y "Otro" (pedido de Mauro, 2026-10-22)
- Al marcar el objetivo "Otra cosa" aparece bajo los objetivos el campo "¿Qué otra cosa te gustaría lograr?"; al marcar el rubro "Otro" aparece bajo los rubros "¿Cuál es tu rubro?". Una línea, opcionales, `maxLength` 70 con contador visible. Al desmarcar la opción el campo se oculta y su texto no va en el envío (se conserva en memoria por si la persona vuelve a marcarla).
- Payload: `goalOther` y `industryOther`. `normalizeLead` los recorta, los limita a 70 (`LEAD_MAX.goalOther`/`industryOther`) y los guarda solo si `goals` incluye `other` o `industry === "otro"`; si no, se descartan.
- Lectura para el equipo (`lib/leadSummary.ts`): objetivos "Otra cosa: {goalOther}"; rubro "Otro: {industryOther}". El diagnóstico escribe además `meta.rubro` con el texto (para el informe).
- `describeGoals` no cambia: "Otra cosa" sigue sin tema en la frase de la pantalla de éxito.

### 5. Diagnóstico: solo el paso de contacto
En `DiagnosticoFlow.tsx`: el input libre "Rubro" pasa a `<select>` con `INDUSTRIES`; "Teléfono (opcional)" pasa a "WhatsApp" obligatorio; se agregan las dos casillas (mismos textos y enlace) con el mismo estilo inline del archivo. `enviar()` suma las validaciones `isValidPhone` y consentimiento antes del envío (mismos mensajes que la portada) y agrega `industry`, `contactConsent`, `marketingConsent` al cuerpo. `meta.rubro` se sigue llenando con `industryLabel(industry)` para que `lib/report.ts` y los PDFs no cambien. Se mantiene la regla de no bloquear la confirmación por fallos del backend (5xx o red). *Ajustado tras la revisión adversarial:* un 400 no es un fallo del backend sino datos rechazados, así que `enviar()` lee la respuesta y, si es 400, muestra `json.error` y no confirma (antes el lead se perdía en silencio). Los inputs llevan `maxLength` iguales al servidor y `aria-required`. El footer propio suma el enlace "Privacidad".

### 6. Privacidad en el CMS (`content.privacidad`)
`lib/siteConfig.ts`: `SiteContent.privacidad: { titulo: string; texto: string }`, default con el borrador de la spec `sitio/privacidad` (contenido detallado al final de esta decisión), y en `mergeConfig()` cada campo vacío o con solo espacios cae al default. No entra a `SECTIONS` (página legal siempre disponible). `app/privacidad/page.tsx` (servidor, `force-dynamic`) con `Nav` y `Footer`, `metadata.title` "Privacidad — Nubolabs", texto partido en párrafos por líneas en blanco y renderizado como texto (React escapa el contenido; sin `dangerouslySetInnerHTML`). `ConfigEditor.tsx` suma el bloque "Privacidad" (título y texto) con "Usar los textos recomendados"; `app/admin/(panel)/config/page.tsx` pasa `privacidad` en `initialContent`.

Borrador por defecto (lo valida O&A o un abogado antes del 1-dic-2026): responsable Nubolabs y correo `mauricio.nubolabs@gmail.com`; datos (nombre, correo, WhatsApp, empresa, rubro, lo que quieres lograr y tu mensaje; en el diagnóstico, tus respuestas); finalidades (responder tu solicitud y coordinar el diagnóstico; novedades solo si marcas la casilla); proveedores (Google Firebase para guardar los datos y Resend para enviar correos, con servidores fuera de Chile); conservación (hasta 24 meses desde el último contacto, o antes si pides borrarlos); derechos (acceso, rectificación, supresión, oposición, portabilidad y bloqueo) y cómo ejercerlos (escribir al correo; respuesta en 30 días corridos); retiro del consentimiento de novedades en cualquier momento.

### 7. Equipo: correo, ficha PDF y admin
- `lib/email.ts`: `LeadEmail` suma `goals`, `industry`, `marketingConsent`, `consentAt`; filas "Rubro", "Quiere lograr" (etiquetas unidas por " · ") y "Novedades" ("Sí, aceptó" / "No"). El asunto no cambia.
- `lib/leadReport.ts`: "Rubro" = `industryLabel(industry)` o `meta.rubro`; filas nuevas "Quiere lograr" (ancho completo, con salto de línea) y "Novedades"; el mensaje se imprime también en leads de diagnóstico si viene del campo nuevo (hoy solo si no hay áreas).
- `leads/page.tsx`: sin columnas nuevas (la tabla ya desborda en móvil): el rubro va como segunda línea bajo la empresa y una pastilla "Novedades" (`success-50`/`success`) junto al nombre cuando `marketingConsent`.
- `leads/[id]/page.tsx`: sección "Lo que quiere lograr" (chips de objetivos, rubro y "Lo que nos contó" destacado) y "Consentimientos" (contacto ✓ con fecha en `America/Santiago`, novedades sí/no, versión). Los hex sueltos de esas pastillas se cambian por tokens.
- Leads antiguos: todo campo nuevo es opcional al leer (`Array.isArray`, `typeof`).

### Degradación
Sin Firebase: validación completa y `200 { ok: true, persisted: false }` (la pantalla de éxito se muestra). Sin Resend: no hay aviso, el lead se guarda. Sin `NEXT_PUBLIC_SCHEDULE_URL`: texto "Te escribimos en menos de 24 horas" en lugar del botón. Blob no participa.

## Risks / Trade-offs

- [**BREAKING**: un visitante con la página abierta desde antes del deploy envía sin `phone`/`contactConsent` → 400] → el formulario viejo de la portada muestra `json.error`; el diagnóstico viejo no lee la respuesta y ese lead se perdería. Ventana de minutos; desplegar en horario de bajo tráfico.
- [WhatsApp y consentimiento obligatorios bajan la conversión] → decisión aprobada (HDU-08 §14); un solo checkbox obligatorio con texto claro; revisar los leads de las primeras semanas.
- [El navegador autocompleta el honeypot y descarta un lead real] → `autoComplete="off"`, fuera del orden de tabulación y sin etiqueta visible; el descarte queda en el log `[leads] honeypot` para detectarlo.
- [`NEXT_PUBLIC_SCHEDULE_URL` se fija en el build] → cambiarla exige redeploy; queda documentado en `.env.local.example`. *Alternativa descartada:* reutilizar `SCHEDULE_URL`: su default `https://www.nubolabs.cl` mostraría un botón que no agenda nada.
- [`ContactForm.tsx` crece] → la lógica pura vive en `lib/leads.ts`/`lib/leadOptions.ts`; si el componente supera ~300 líneas, separar `ContactSuccess` en su propio archivo.
- [El texto de `/privacidad` no es asesoría legal] → paso post-merge de validación antes del 1-dic-2026.

## Migration Plan

1. Antes de mezclar: definir `NEXT_PUBLIC_SCHEDULE_URL` en Vercel (si ya existe la agenda) para que el build del preview la incluya.
2. Preview de Vercel: Mauro envía un lead de prueba con su correo, revisa aviso, admin y ficha PDF, y lo borra con `DELETE /api/admin/leads/{id}` (botón "Eliminar").
3. Mezclar a `main`; en `/admin/config` → Privacidad, revisar el borrador y guardar si se ajusta.
4. Rollback: revertir el commit. Los leads nuevos tienen campos extra que el código anterior ignora.
