# HDU — Preparar la web para los prospectos de O&A

> Historias de usuario enriquecidas el 2026-10-16 a partir del documento interno "Preparar la web para los prospectos de O&A" (septiembre 2026). Estado: **listas para `/opsx:ff`**, una por una, en el orden de la sección 2.
> Fuente única de textos y decisiones de producto: este archivo. Copia de lectura en el Escritorio de Mauro.
>
> **Actualización 2026-10-21 — HDU-08 aprobada** (`docs/backlog/propuesta-valor-hdu-08.md`): la propuesta de valor deja de centrarse en el ahorro de horas y pasa a cuatro resultados de negocio (vendes más, tienes el control, nada se olvida, creces sin desordenarte); cambian el formulario (HDU-03) y el proceso. **Cuando un texto de este archivo choque con la HDU-08, manda la HDU-08.** Referencia visual: `docs/design/propuesta-web-hdu-08.html`. Se suman dos historias nuevas: **HDU-09** `diagnostico-mapa-oportunidades` y **HDU-10** `cierre-landing-faq-cta`.
>
> **Actualización 2026-10-29 — HDU-11 `enfoque-soluciones-a-medida`** (sección al final): Mauro cambió el enfoque de todos los textos del sitio: soluciones a medida para el problema particular de cada cliente, con datos y reportes para decidir. No se menciona que automatizamos WhatsApp, no se ofrecen soluciones contables ni se nombran herramientas concretas. **Cuando un texto de este archivo o de la HDU-08 choque con la HDU-11, manda la HDU-11** (fuente de los textos: los deltas de `openspec/changes/enfoque-soluciones-a-medida/specs/` y, tras archivar, `openspec/specs/`).

## 1. Resumen ejecutivo

**Situación.** Mauricio O. (estudio contable Osorio & Asociados, "O&A") enviará un correo a más de 100 clientes recomendando a Nubolabs con el link a nubolabs.cl. Llegarán dueños de pymes (gastronomía, automotriz, construcción) que **no saben de tecnología** y vienen **por confianza**, no por búsqueda.

**Diagnóstico del documento.** La página está bien construida pero "habla de tecnología". Mismo esqueleto, hay que cambiar el idioma, aprovechar la recomendación de O&A y amarrar al prospecto con un formulario mínimo y con consentimiento.

**Qué se hace.** Siete historias en dos fases. La fase 1 es lo esencial si el correo sale esta semana; la fase 2 completa el rediseño.

| ID | Cambio OpenSpec | Qué logra | Fase | Tamaño | Depende de |
|---|---|---|---|---|---|
| HDU-01 | `mensaje-principal-pyme` | El mensaje principal habla del dolor del dueño, no de tecnología | 1 | S | — |
| HDU-02 | `lenguaje-sin-jerga` | Toda la landing en lenguaje de pyme; lo técnico abajo y en chico | 1 | M | HDU-01 |
| HDU-03 | `formulario-minimo-consentimiento` | Formulario corto, pregunta abierta, consentimiento (Ley 21.719) y botón para agendar | 1 | M | — |
| HDU-04 | `confianza-recomendacion` | Sección "Nos recomiendan" con testimonios editables; texto puente mientras no hay testimonio de O&A | 2 | M | HDU-01 |
| HDU-05 | `casos-por-rubro` | Casos de uso reconocibles por rubro, con filtro | 2 | M | HDU-02 |
| HDU-06 | `cifras-con-respaldo` | Cifras editables desde el CMS y ocultas hasta tener datos reales | 2 | S | — |
| HDU-07 | `landing-referidos-oa` | Entrada `/oa` que confirma la recomendación y mide cuántos leads trae el correo | 2 (opcional, recomendada) | M | HDU-04 |
| HDU-09 | `diagnostico-mapa-oportunidades` | El diagnóstico entrega un "mapa de oportunidades" en vez de ahorro en horas/CLP; el estimador pasa al admin | 2 | M | HDU-02 |
| HDU-10 | `cierre-landing-faq-cta` | Preguntas frecuentes editables, CTA final, CTA fija en móvil y footer nuevo | 2 | S | HDU-02, HDU-03 |

**Orden aprobado el 2026-10-21 (HDU-08 §15):** HDU-01 → HDU-03 → HDU-02 → HDU-10 → HDU-04 → HDU-06 → HDU-05 → HDU-07 → HDU-09. Desde la HDU-08, cada cambio implementa sus secciones con el diseño de `docs/design/propuesta-web-hdu-08.html`; los tokens de diseño nuevos entran en HDU-01.

**Tamaños:** S = una sesión corta, M = una sesión completa con pruebas en preview. Todas pasan por el flujo `/opsx:ff` → `/opsx:apply` → `/opsx:verify` → `/adversarial-review` → `/opsx:archive` → `/commit`, con preview de Vercel revisado por Mauro antes de mezclar.

## 2. Orden sugerido y timing

- **Si el correo de O&A sale esta semana (fase 1, 2 a 3 sesiones):** HDU-01 → HDU-03 → HDU-02. El mensaje y el formulario son lo que más convierte; el barrido de vocabulario cierra la fase.
- **Si hay más tiempo (fase 2, 3 a 4 sesiones):** HDU-04 → HDU-06 → HDU-05 → HDU-07.
- HDU-07 se puede adelantar a la fase 1 si se quiere **medir** cuántos leads trae el correo: es la única forma de saber si la campaña funcionó.

Cada HDU se arranca con: `/opsx:ff <cambio> partiendo de docs/backlog/prospectos-oa.md, sección HDU-0N`.

## 3. Restricciones globales (lo que no se toca y cómo se trabaja)

- **Se mantiene** (sección 04 del documento): el diferenciador "Rediseñamos antes de automatizar", el diagnóstico gratuito de 30 minutos sin compromiso, la estructura problema → enfoque → servicios → casos → agendar, y el diagnóstico interactivo de `/diagnostico` (solo se simplifica su lenguaje, no su lógica).
- **Mismo esqueleto:** no se agregan ni reordenan secciones salvo las que estas HDU indican (confianza, cifras). ~~No cambian colores, tipografías ni componentes de marca.~~ *Reemplazado por la HDU-08 (2026-10-21):* se mantienen paleta, tipografías y logo, se suman los tokens de la HDU-08 §7 y las secciones nuevas "Lo que ganas", preguntas frecuentes y CTA final.
- **CMS primero:** todo texto nuevo que el dueño pueda querer ajustar queda editable desde `/admin/config` (`lib/site.ts`, `components/admin/ConfigEditor.tsx`). Los valores por defecto en código (`lib/content.ts`, `defaultSiteConfig()`) también cambian, para que producción muestre lo nuevo aunque Firestore no tenga overrides.
- **Idioma:** español de Chile, tuteo, frases cortas, sin siglas. Los textos finales los propone Claude en cada cambio y los aprueba Mauro en el preview antes de mezclar.
- **Datos personales:** nada nuevo se guarda sin decirlo en `docs/data-model.md` y `docs/api-spec.yml`; el consentimiento se registra con fecha y texto mostrado (HDU-03).
- **Medición:** cada lead sigue guardando `source`; HDU-07 agrega el origen "oa". No se instala analítica externa en estas HDU (sigue en el roadmap).

---

## HDU-01 · Mensaje principal orientado al dolor del dueño de pyme

**Cambio OpenSpec:** `mensaje-principal-pyme` · Fase 1 · Tamaño S

**Estado (2026-10-22):** ✅ en producción; archivado en `openspec/changes/archive/2026-10-22-mensaje-principal-pyme/`.

### Original
"El mensaje principal — traducirlo a dolor concreto. HOY: 'Rediseñamos procesos y los convertimos en automatizaciones con IA que trabajan en la nube.' MEJOR: 'Te devolvemos las horas que tu equipo pierde en tareas repetitivas.' / 'Menos pega manual, menos errores, más tiempo para tu negocio.'"

### Enhanced

**Contexto.** El hero es editable desde el CMS (`content.hero`: `eyebrow`, `title`, `subtitle`, `ctaPrimary`, `ctaSecondary`), con defaults en `defaultSiteConfig()` de `lib/site.ts` y render en `components/landing/Hero.tsx` (el título admite `**resalte**`). Hoy: eyebrow "◈ AI & AUTOMATION AGENCY", título "Rediseñamos procesos y los convertimos en **automatizaciones con IA** que trabajan en la nube.", subtítulo técnico, CTA "Solicitar diagnóstico →" / "Ver servicios". Los tres `heroTags` ("Rediseño antes de automatizar", "Soluciones a medida", "Impacto medible") viven en `lib/content.ts` y no son editables.

**Objetivo.** Que en los primeros 5 segundos un dueño de pyme entienda qué gana, en su idioma.

> **Ajuste HDU-08 (aprobado 2026-10-21):** título **"Que tu negocio **trabaje para ti**, no al revés."**; bajada de HDU-08 §2; CTA "Quiero mi diagnóstico gratis" (lleva al formulario de la portada, ancla `#contacto`, no a `/diagnostico`; si la sección de contacto está oculta, a `/diagnostico`) y "Ver cómo trabajamos"; tags (como en la referencia visual aprobada) "30 minutos, gratis y sin compromiso" · "Sin cambiar tus sistemas" · "Respuesta en menos de 24 horas". Se descarta "Te devolvemos las horas…". El criterio "promesa en términos de horas, errores o tiempo" pasa a **"promesa de resultado de negocio"**. El alcance suma los tokens de diseño (HDU-08 §7) y el panel "Tu negocio hoy" que reemplaza a `HeroGraphic.tsx`.

**Alcance.**
- Nuevos textos por defecto del hero (propuesta; Mauro elige o ajusta en el preview):
  - Eyebrow: ~~`PARA DUEÑOS DE PYMES`~~ → **sin eyebrow** (decisión del 2026-10-22: no excluir a empresas grandes; HDU-08 §14 fila 9). Reemplaza el inglés "AI & AUTOMATION AGENCY".
  - Título: `Te devolvemos las **horas** que tu equipo pierde en tareas repetitivas.` Alternativa: `Menos pega manual, **menos errores** y más tiempo para tu negocio.`
  - Subtítulo: `Primero entendemos cómo trabaja tu empresa y simplificamos lo que sobra. Después hacemos que las tareas repetitivas se hagan solas: correos, cotizaciones, cobranzas, reportes.`
  - CTA primario: `Quiero mi diagnóstico gratis` (sigue llevando a `/diagnostico`). CTA secundario: `Ver cómo trabajamos` (ancla `#modelo`).
- `heroTags` pasan al CMS como `content.hero.tags` (3 ítems de texto; color se mantiene en código) con defaults: "Rediseñamos antes de automatizar", "Sin cambiar tus sistemas", "Resultados que se miden en horas".
- Aplicar los textos nuevos también en el documento `config/site` de Firestore de producción (desde `/admin/config`), para que el cambio se vea de inmediato.
- Actualizar `docs/data-model.md` (campo `hero.tags`) y `docs/api-spec.yml` (`SiteContentPartial.hero.tags`).

**No incluye:** cambios en el resto de secciones (HDU-02), la ilustración del hero (`HeroGraphic.tsx`), ni analítica.

**Criterios de aceptación.**
- **Cuando** un visitante abre nubolabs.cl, **entonces** el título del hero no contiene las palabras "automatizaciones", "IA" ni "nube", y sí una promesa en términos de horas, errores o tiempo.
- **Cuando** el admin edita título, subtítulo, CTAs o tags en `/admin/config` y guarda, **entonces** la landing los muestra en la siguiente carga sin despliegue.
- **Cuando** Firestore no tiene `config/site`, **entonces** la landing muestra los nuevos defaults.
- Lint, typecheck, `npm test`, build en verde; E2E con Playwright MCP de la portada a 1280 y 375 px; preview aprobado por Mauro.

**Archivos previstos.** `lib/site.ts` (tipo `SiteContent.hero.tags`, defaults, `mergeConfig`), `lib/content.ts` (retirar `heroTags` o dejarlo como default), `components/landing/Hero.tsx`, `components/admin/ConfigEditor.tsx` (3 campos de tags), `docs/data-model.md`, `docs/api-spec.yml`, `docs/ESTADO-PROYECTO.md`.

**Riesgos.** Cambiar el eyebrow en inglés puede chocar con la identidad "AI & Automation Agency" del logo y del `<title>` en `app/layout.tsx`: se mantiene en el logo y el `<title>`; solo el eyebrow del hero cambia (decisión a confirmar con Mauro).

---

## HDU-02 · Toda la landing en lenguaje de pyme (sin jerga)

**Cambio OpenSpec:** `lenguaje-sin-jerga` · Fase 1 · Tamaño M · Depende de HDU-01

**Estado (2026-10-22):** ✅ en producción; archivado en `openspec/changes/archive/2026-10-22-lenguaje-sin-jerga/` (spec `openspec/specs/landing/contenido-pyme/spec.md`). Pendiente del dueño: "Usar los textos recomendados" en Servicios y Ejemplos en `/admin/config` y guardar (ver `docs/ESTADO-PROYECTO.md`). En `/diagnostico` solo cambia el encabezado; el panel de resultados ("Índice de fricción", estimador, "ahorrar automatizándolos") pasa a HDU-09.

### Original
"Sacar o bajar el vocabulario técnico. 'n8n, Make, APIs, CRM, ERP, agentes IA conectados' es ruido para este prospecto. No borrarlo del todo (da seriedad), pero que no sea lo primero: primero el resultado en su idioma, el 'cómo' técnico abajo y en chico."

### Enhanced

**Contexto.** El vocabulario técnico está repartido: `lib/content.ts` (`approach`: "Flujos, reportes y agentes IA"; `services`: "Sistemas y agentes IA a medida", "CRM, ERP, WhatsApp y bases de datos"; `steps`: "Automatizaciones, reportes y agentes"; `useCases`: "Agentes IA conectados", "Correos con IA"), `lib/site.ts` (hero subtitle; `casos.subtitle`: "Ejemplos que implementamos con n8n, Make, APIs e IA"), `components/landing/HeroGraphic.tsx` (nodo "CRM"), `components/landing/ContactForm.tsx` (texto lateral) y `/diagnostico` (textos de `DiagnosticoFlow.tsx`). Problemas, Enfoque y Proceso solo son visibles/ocultables; sus textos viven en código (pendiente 2 de `ESTADO-PROYECTO.md`).

**Objetivo.** Que ninguna sección obligue al visitante a conocer una herramienta o sigla para entender qué gana; el "cómo lo hacemos" queda en una línea pequeña, al final de Servicios.

> **Ajuste HDU-08 (aprobado 2026-10-21):** textos de servicios, proceso y "¿Te suena?" de HDU-08 §2, §3 y §5.1; nueva sección **"Lo que ganas"** (4 resultados) entre Problemas y Enfoque; "horas ahorradas" y "ROI estimado" también salen del vocabulario; el paso 4 del proceso es "Medimos y mejoramos — tú defines qué es éxito". Cada sección tocada se rediseña según `docs/design/propuesta-web-hdu-08.html`.

**Alcance.**
- Barrido de textos con esta tabla de reemplazos (propuesta base; se completa en el cambio):

| Hoy | Propuesta |
|---|---|
| "automatizaciones con IA que trabajan en la nube" | "tareas que se hacen solas, sin que tu equipo las haga a mano" |
| "Flujos, reportes y agentes IA donde hay retorno claro" | "Avisos, reportes y respuestas automáticas solo donde te ahorran tiempo de verdad" |
| "Sistemas y agentes IA a medida … conectados a CRM, ERP, WhatsApp y bases de datos" | "Asistentes que responden y ordenan por ti, conectados a lo que ya usas: WhatsApp, correo, planillas y tu sistema de facturación" |
| "Agentes IA conectados — WhatsApp, CRM, ERP y bases internas" | "Respuestas automáticas por WhatsApp y correo" |
| "Correos con IA — Clasificación automática y respuestas asistidas" | "Correos ordenados solos — Se clasifican y responden sin que nadie los revise uno por uno" |
| "Portales internos — Solicitudes, aprobaciones y trazabilidad operacional" | "Solicitudes y aprobaciones sin cadenas de correos" |
| "Ejemplos que implementamos con n8n, Make, APIs e IA" | "Ejemplos reales de lo que dejamos funcionando en empresas como la tuya" |
| Pasos: "Automatizaciones, reportes y agentes" | "Dejamos las tareas funcionando solas" |

- Línea técnica única, pequeña y al final de Servicios (editable desde el CMS, `content.servicios.notaTecnica`): "Lo construimos con herramientas probadas (n8n, Make, inteligencia artificial) y se conecta a los sistemas que ya tienes." Da seriedad sin ser lo primero.
- Hacer editables desde el CMS los textos de **Problemas, Enfoque y Proceso** (`content.problema.items`, `content.enfoque.items`, `content.proceso.items`), cerrando el pendiente 2. Si el timing aprieta, este punto se deja para un cambio aparte y el barrido se hace solo en código.
- Revisar los textos de `/diagnostico` (títulos, botones, pantalla final) con el mismo criterio, sin tocar preguntas ni cálculo.
- Mantener en `HeroGraphic.tsx` las etiquetas de nodos en palabras simples ("Correos", "Planillas", "WhatsApp", "Facturación") en vez de "CRM".

**No incluye:** nuevas secciones, cambios de estructura, casos por rubro (HDU-05), cifras (HDU-06).

**Criterios de aceptación.**
- **Cuando** se busca en la landing renderizada (`/`) y en `/diagnostico` las palabras `n8n`, `Make`, `API`, `CRM`, `ERP`, `agente`, `IA`, **entonces** solo aparecen en la línea técnica de Servicios (y, si se decide, en el footer).
- **Cuando** el admin edita un ítem de Problemas, Enfoque o Proceso y guarda, **entonces** la landing lo muestra (si el punto se incluye).
- Lint, typecheck, `npm test`, build en verde; E2E de portada y `/diagnostico` completo con Playwright MCP a 1280 y 375 px; preview aprobado por Mauro leyendo cada sección "como si fuera un dueño de restaurante".

**Archivos previstos.** `lib/content.ts`, `lib/site.ts` (tipos, defaults, merge), `components/landing/{Approach,Problem,Process,Services,UseCases,ContactForm,HeroGraphic}.tsx`, `components/diagnostico/DiagnosticoFlow.tsx` (solo textos), `components/admin/ConfigEditor.tsx`, `docs/data-model.md`, `docs/api-spec.yml`, `docs/ESTADO-PROYECTO.md`.

**Riesgos.** Perder precisión para visitantes técnicos: se mitiga con la línea técnica y con la página `/equipo` (donde sí pueden ir las habilidades técnicas).

---

## HDU-03 · Formulario mínimo con pregunta abierta, consentimiento y botón para agendar

**Cambio OpenSpec:** `formulario-minimo-consentimiento` · Fase 1 · Tamaño M

**Estado (2026-10-22):** ✅ en producción; archivado en `openspec/changes/archive/2026-10-22-formulario-minimo-consentimiento/`.

### Original
"Pocos campos, consentimiento claro. Nombre, correo (el que queremos anclar), teléfono/WhatsApp, empresa y rubro para calificar, pregunta abierta corta '¿Qué tarea te gustaría dejar de hacer a mano?'. Checkbox 'Quiero recibir información y novedades de Nubolabs' (Ley 21.719, vigencia diciembre 2026). Decisión de diseño: primer paso mínimo —correo + agendar— y el resto se pide en la videollamada. El objetivo nº1 es que agenden."

### Enhanced

**Contexto.** `components/landing/ContactForm.tsx` pide nombre, email corporativo, teléfono, empresa y un mensaje libre; envía `POST /api/leads` (`app/api/leads/route.ts`), que guarda `name, email, phone, company, message, source, status, createdAt, meta` en `leads` (tipo `LeadInput` en `types/lead.ts`). No existe consentimiento ni rubro para leads de la landing (el diagnóstico sí guarda `meta.rubro`). Tras enviar se muestra "¡Solicitud enviada!" sin opción de agendar; `SCHEDULE_URL` (variable ya existente, usada en el informe PDF y el correo) apunta a la agenda. El aviso por correo (`lib/email.ts`) lista nombre, email, teléfono, empresa y origen; el detalle del admin (`app/admin/(panel)/leads/[id]/page.tsx`) muestra esos campos y `meta.rubro`.

**Objetivo.** Que dejar el correo y agendar cueste lo mínimo, que el prospecto empiece a pensar en su dolor, y que Nubolabs tenga permiso explícito para seguir escribiéndole.

> **⚠ Alcance reemplazado por HDU-08 §6 (aprobado 2026-10-21).** Formulario de **2 pasos**: (1) "¿Qué te gustaría lograr?" con chips de objetivos (`goals[]`) y rubro (`industry`), se puede saltar; (2) nombre, correo y **WhatsApp obligatorios**, empresa y "¿Algo que quieras contarnos antes de la llamada?" opcionales, consentimiento **obligatorio** de contacto (`contactConsent`) y opcional de novedades (`marketingConsent`). Se elimina la pregunta "¿Qué tarea te gustaría dejar de hacer a mano?". Pantalla de éxito con agenda inmediata. El resto de esta sección (privacidad, admin, correo de aviso, datos con prueba de consentimiento) sigue vigente con esos campos.

**Alcance.**
- **Paso 1 (siempre visible, 3 campos + botón):** Nombre, Correo, casilla `Quiero recibir información y novedades de Nubolabs` (desmarcada por defecto, no obligatoria, con enlace "Cómo cuidamos tus datos" a `/privacidad`) y botón `Agendar mi diagnóstico gratis →`.
- **Paso 1b (desplegable "Cuéntanos un poco más (opcional)")**: Teléfono / WhatsApp, Empresa, Rubro (selector: Gastronomía, Automotriz, Construcción, Servicios profesionales, Comercio, Otro) y la pregunta abierta `¿Qué tarea te gustaría dejar de hacer a mano?` (2 líneas). Todo opcional. Decisión: un solo envío con los campos que el prospecto quiso llenar; no se crea un segundo endpoint para completar datos (evita exponer leads por id).
- **Pantalla de éxito orientada a agendar:** "¡Listo! Elige el horario de tu diagnóstico gratuito" con botón grande a `SCHEDULE_URL` (nueva variable pública `NEXT_PUBLIC_SCHEDULE_URL` para usarla en el navegador; si falta, se muestra "Te escribimos en menos de 24 horas"). Debajo, "Si prefieres, te contactamos nosotros".
- **Datos del lead** (nombres en inglés, convención de `leads`): `rubro` → `industry` (string), pregunta abierta → `message` (se reutiliza), `marketingConsent` (boolean), `consentAt` (ISO) y `consentText` (texto exacto mostrado, para respaldo legal). `POST /api/leads` valida tipos y guarda solo si vienen.
- **Página `/privacidad`:** texto editable desde el CMS (`content.privacidad.titulo`, `content.privacidad.texto`) con un default breve y honesto: qué datos se guardan, para qué, que no se comparten, y cómo pedir baja o eliminación escribiendo a `mauricio.nubolabs@gmail.com`. Enlace también en el footer.
- **Admin:** en la lista y el detalle de leads, etiqueta "Acepta novedades" / "Sin consentimiento" y el rubro; en el detalle, la respuesta a la pregunta abierta destacada como "Tarea que quiere dejar de hacer". El aviso por correo agrega filas Rubro, Tarea y Consentimiento.
- **Diagnóstico (`/diagnostico`):** la misma casilla de consentimiento en el paso de contacto, guardada igual.
- Documentación: `docs/data-model.md` (campos nuevos de `leads`), `docs/api-spec.yml` (`LeadInput`), `.env.local.example` (`NEXT_PUBLIC_SCHEDULE_URL`), `docs/ESTADO-PROYECTO.md`.

**No incluye:** integración con una herramienta de email marketing, doble opt-in por correo, envío automático de campañas, ni anti-spam/rate limiting (roadmap 4).

**Criterios de aceptación.**
- **Cuando** un visitante llena solo nombre y correo y envía, **entonces** el lead se guarda, llega el aviso por correo y la pantalla de éxito muestra el botón para agendar.
- **Cuando** marca la casilla de novedades, **entonces** el lead queda con `marketingConsent: true`, `consentAt` y `consentText`; si no la marca, `marketingConsent: false` y el admin lo muestra como "Sin consentimiento".
- **Cuando** completa rubro y la pregunta abierta, **entonces** aparecen en el aviso por correo y en el detalle del admin.
- **Cuando** `NEXT_PUBLIC_SCHEDULE_URL` no está definida, **entonces** la pantalla de éxito no muestra un botón roto.
- **Cuando** abre `/privacidad`, **entonces** ve el texto editable y un correo de contacto.
- `curl` a `POST /api/leads` con y sin consentimiento, con rubro inválido (se ignora) y con JSON inválido (400); E2E del formulario completo y mínimo a 1280 y 375 px; lint, typecheck, `npm test` (tests unitarios de la validación/normalización del payload) y build en verde.

**Archivos previstos.** `components/landing/ContactForm.tsx`, `components/diagnostico/DiagnosticoFlow.tsx` (casilla), `types/lead.ts`, `app/api/leads/route.ts` (+ `lib/leads.ts` con la normalización testeable y `lib/leads.test.ts`), `lib/email.ts`, `app/admin/(panel)/leads/page.tsx` y `leads/[id]/page.tsx`, `lib/leadReport.ts` (consentimiento en la ficha PDF), `app/privacidad/page.tsx`, `lib/site.ts` + `components/admin/ConfigEditor.tsx` (privacidad), `components/landing/Footer.tsx`, `.env.local.example`, `docs/data-model.md`, `docs/api-spec.yml`, `docs/ESTADO-PROYECTO.md`.

**Riesgos.** El texto de la política de privacidad no es asesoría legal: queda como borrador para que Mauro lo valide con O&A o un abogado antes de diciembre de 2026 (pregunta abierta 4). Guardar `consentText` evita discusiones sobre qué aceptó el prospecto.

---

## HDU-04 · Sección de confianza: "Nos recomiendan" y testimonios editables

**Cambio OpenSpec:** `confianza-recomendacion` · Fase 2 · Tamaño M · Depende de HDU-01

**Estado (2026-10-22):** ✅ en producción; archivado en `openspec/changes/archive/2026-10-22-confianza-recomendacion/` (spec `openspec/specs/landing/confianza/spec.md`). Sin testimonios por defecto: el de Mauricio O. se carga desde el admin cuando lo apruebe por escrito.

### Original
"Usar la recomendación de O&A — nuestro activo más fuerte. Hoy no está, y es clave. La página debería confirmar esa confianza en los primeros 5 segundos: una zona de testimonios o 'empresas que confían en nosotros'. Mientras no tengamos el testimonio de O&A: al menos 'trabajamos con estudios contables y empresas que nos recomiendan a sus clientes'."

### Enhanced

**Contexto.** No existe ninguna sección de prueba social. Las secciones se gobiernan por `SECTIONS` en `lib/site.ts` (visibilidad) y `SiteContent` (textos), y se componen en `app/page.tsx` en el orden de `SECTIONS`.

**Objetivo.** Que inmediatamente después del hero el visitante vea que empresas y estudios contables serios confían en Nubolabs, y que Mauro pueda cargar testimonios reales a medida que lleguen.

> **Ajuste HDU-08 (aprobado 2026-10-21):** el bloque sigue el diseño de la referencia (testimonio a la izquierda + "Nuestro compromiso contigo" a la derecha). Testimonio de Mauricio O. revisado en HDU-08 §8, **solo se carga cuando él lo apruebe**; mientras, el texto puente.

**Alcance.**
- Nueva sección `confianza` en `SECTIONS` (entre `hero` y `problema`), visible por defecto, con `content.confianza`:
  - `eyebrow` ("NOS RECOMIENDAN"), `titulo`, `textoPuente` (default: "Trabajamos con estudios contables y empresas que nos recomiendan a sus clientes.") y `testimonios[]` (`nombre`, `cargo`, `empresa`, `texto`, `destacado: boolean`).
  - Sin testimonios cargados, la sección muestra solo una franja compacta con el texto puente. Con testimonios, tarjetas (máximo 3 visibles, el destacado primero).
- Editor en `/admin/config`: texto puente y lista de testimonios (agregar, editar, ordenar, eliminar), mismo patrón que Servicios y Casos.
- El testimonio de O&A, cuando exista, entra por el CMS sin despliegue.
- Documentación: `docs/data-model.md` (`config/site.content.confianza`), `docs/api-spec.yml`.

**No incluye:** logos de clientes con subida de imágenes (se puede sumar después reutilizando `/api/admin/upload`), casos de éxito largos (roadmap 5).

**Criterios de aceptación.**
- **Cuando** no hay testimonios, **entonces** debajo del hero se ve la franja con el texto puente, en ambos tamaños de pantalla, sin huecos.
- **Cuando** el admin agrega un testimonio y lo guarda, **entonces** aparece en la landing en la siguiente carga; si lo marca destacado, va primero.
- **Cuando** el admin oculta la sección, **entonces** desaparece sin dejar espacio.
- Lint, typecheck, `npm test`, build; E2E (landing y editor del admin) a 1280 y 375 px; preview aprobado.

**Archivos previstos.** `lib/site.ts`, `components/landing/Confianza.tsx` (nuevo), `app/page.tsx`, `components/admin/ConfigEditor.tsx`, `docs/data-model.md`, `docs/api-spec.yml`, `docs/ESTADO-PROYECTO.md`.

**Riesgos.** Testimonios inventados o sin permiso dañan la confianza: solo se cargan con autorización escrita del cliente (nota en el editor).

---

## HDU-05 · Casos de uso reconocibles por rubro

**Estado (2026-10-22):** ✅ en producción; archivado en `openspec/changes/archive/2026-10-22-casos-por-rubro/` (spec `openspec/specs/landing/casos-por-rubro/spec.md`). Falta cargar los textos recomendados de Ejemplos en el admin para ver los 14 casos y el filtro.

**Cambio OpenSpec:** `casos-por-rubro` · Fase 2 · Tamaño M · Depende de HDU-02

### Original
"Ejemplos de SU rubro. La sección 'casos de uso' es genérica. Si llega un gastronómico y ve 'clasificación automática de correos', no se reconoce. Si ve 'envío automático de la información mensual a tu contador' o 'control de inventario sin planillas a mano', piensa 'esto es lo mío'. Poner ejemplos reconocibles para pymes de los rubros que vienen."

### Enhanced

**Contexto.** `content.casos.items` (`title`, `body`) es editable desde el CMS y se renderiza en `components/landing/UseCases.tsx` en una grilla única. No hay noción de rubro.

**Objetivo.** Que un dueño de restaurante, taller o constructora encuentre en segundos un ejemplo que suene a su negocio.

> **Ajuste HDU-08 (aprobado 2026-10-21):** los casos por defecto son los de HDU-08 §4 (incluye "Comercio" con ejemplos propios). La lista de rubros es la misma constante que usa el formulario (HDU-03).

**Alcance.**
- `CaseItem` gana `rubro` (valores: `todos`, `gastronomia`, `automotriz`, `construccion`, `servicios`, `comercio`), editable en el CMS con un selector por ítem.
- `UseCases.tsx` muestra chips de filtro ("Todos", "Gastronomía", "Automotriz", "Construcción", "Servicios profesionales", "Comercio"); al elegir uno, se ven los casos de ese rubro más los marcados `todos`. Componente cliente pequeño; sin filtro activo se ven todos.
- Nuevos casos por defecto (propuesta; Mauro ajusta en el CMS):
  - Todos: "Tu información mensual llega sola a tu contador" · "Cobranza con recordatorios automáticos, sin perseguir a nadie" · "Cotizaciones listas en minutos en vez de horas".
  - Gastronomía: "Pedidos a proveedores y control de inventario sin planillas a mano" · "Reservas y consultas de WhatsApp respondidas al instante".
  - Automotriz: "Presupuestos de repuestos y servicios que se arman solos" · "Recordatorios de mantención y seguimiento de cada cliente".
  - Construcción: "Estados de pago y documentos de obra ordenados y enviados a tiempo" · "Control de gastos por obra sin copiar planillas".
  - Servicios profesionales: "Documentos y minutas generados desde tus datos" · "Solicitudes y aprobaciones sin cadenas de correos".
- El selector de rubro del formulario (HDU-03) usa la misma lista para que los datos cuadren.
- Documentación: `docs/data-model.md`, `docs/api-spec.yml`.

**No incluye:** páginas por rubro, SEO por rubro (roadmap 3), casos de éxito con nombre de cliente.

**Criterios de aceptación.**
- **Cuando** el visitante elige "Gastronomía", **entonces** ve solo los casos de gastronomía y los generales, sin saltos de layout.
- **Cuando** el admin agrega un caso con rubro "construccion", **entonces** aparece al filtrar por Construcción.
- **Cuando** no hay casos para un rubro, **entonces** el chip de ese rubro no se muestra.
- Lint, typecheck, `npm test` (test unitario de la función de filtrado), build; E2E del filtro a 1280 y 375 px; preview aprobado.

**Archivos previstos.** `lib/site.ts` (tipo, defaults, merge, constante de rubros compartida con HDU-03), `lib/content.ts`, `components/landing/UseCases.tsx` (+ `UseCasesFilter.tsx` cliente), `components/admin/ConfigEditor.tsx`, `docs/data-model.md`, `docs/api-spec.yml`.

**Riesgos.** Demasiados chips en móvil: máximo 6, con scroll horizontal si no caben.

**Ajustes al implementar (2026-10-22).** Los chips pasan a varias líneas (sin scroll horizontal, que la spec prohíbe) y solo aparecen con 2 o más rubros con casos. "Sin saltos de layout": el servidor entrega todos los casos con "Todos" elegido, así que la carga no se reacomoda; al filtrar, la grilla se acorta a propósito. Detalle en `openspec/changes/casos-por-rubro/design.md`.

---

## HDU-06 · Cifras con respaldo: editables y ocultas hasta tener datos reales

**Cambio OpenSpec:** `cifras-con-respaldo` · Fase 2 · Tamaño S

**Estado (2026-10-22):** ✅ en producción; archivado en `openspec/changes/archive/2026-10-22-cifras-con-respaldo/` (spec `openspec/specs/landing/cifras/spec.md`). Sección de cifras oculta hasta tener el dato real del piloto.

### Original
"Las cifras de ejemplo (+120h, −90%). A un dueño desconfiado, números redondos sin respaldo le suenan a humo. Cuando tengamos el resultado real del piloto de O&A, reemplazarlas por ese dato verdadero. Un número real vale más que tres inventados."

### Enhanced

**Contexto.** `metrics` en `lib/content.ts` ("+120 h ahorradas al mes por cliente", "minutos donde antes había días de reportería", "−90% de error en tareas repetitivas") se renderiza en `components/landing/UseCases.tsx` y no es editable ni ocultable.

**Objetivo.** No mostrar cifras sin respaldo, y poder publicar las reales del piloto de O&A desde el CMS el mismo día que existan.

**Alcance.**
- Nueva clave `cifras` en `SECTIONS` (ocultable) y `content.cifras.items[]` (`valor`, `texto`, `fuente` opcional, por ejemplo "Piloto con cliente de O&A, 2026").
- **Por defecto oculta** (`visible.cifras = false`) hasta que Mauro cargue datos reales; al activarla, se muestra en el mismo lugar que hoy, con la fuente en chico bajo cada cifra.
- Mientras esté oculta, el espacio no deja hueco; opcionalmente una frase cualitativa editable: "Medimos cada proyecto en horas ahorradas y errores evitados; te mostramos los números de tu caso en el diagnóstico."
- Documentación: `docs/data-model.md`, `docs/api-spec.yml`.

**No incluye:** calcular cifras automáticamente desde los leads o diagnósticos.

**Criterios de aceptación.**
- **Cuando** la sección está oculta (default), **entonces** la landing no muestra "+120 h" ni "−90%".
- **Cuando** el admin carga una cifra con su fuente y activa la sección, **entonces** se muestra con la fuente visible.
- Lint, typecheck, `npm test`, build; E2E a 1280 y 375 px; preview aprobado.

**Archivos previstos.** `lib/site.ts`, `lib/content.ts`, `components/landing/UseCases.tsx`, `app/page.tsx`, `components/admin/ConfigEditor.tsx`, `docs/data-model.md`, `docs/api-spec.yml`.

**Decisión a confirmar con Mauro.** Ocultar las cifras de inmediato (recomendado por el documento) o dejarlas visibles hasta tener las reales.

> **Ajuste HDU-08 (aprobado 2026-10-21):** se ocultan de inmediato. Cuando haya datos del piloto, preferir cifras de resultado (por ejemplo "cotizaciones el mismo día") antes que horas.

---

## HDU-07 · Entrada `/oa` para los referidos de O&A y medición de la campaña

**Estado (2026-10-22):** ✅ en producción; archivado en `openspec/changes/archive/2026-10-22-landing-referidos-oa/` (spec `openspec/specs/leads/origen-referidos/spec.md`). Falta confirmar con Mauricio O. el link `https://www.nubolabs.cl/oa`.

**Cambio OpenSpec:** `landing-referidos-oa` · Fase 2, opcional y recomendada · Tamaño M · Depende de HDU-04

### Original
Derivada de "Usar la recomendación de O&A" y del contexto: el correo lleva el link a nubolabs.cl; la página debería confirmar la confianza en los primeros 5 segundos.

### Enhanced

**Contexto.** Hoy todos los leads de la landing llegan con `source: "landing"`; no hay forma de saber cuántos vienen del correo de O&A. El dashboard del admin muestra KPIs totales.

**Objetivo.** Que el link del correo de O&A lleve a una entrada que reconozca al visitante ("Vienes recomendado por Osorio & Asociados") y que cada lead de esa campaña quede marcado para medir resultados.

**Alcance.**
- Ruta `/oa` (y alias `?ref=oa` en la portada) que renderiza la misma landing con una franja superior editable desde el CMS (`content.referidos.oa.titulo`, `texto`): default "Bienvenido, cliente de Osorio & Asociados. Tu contador nos recomendó porque ayudamos a empresas como la tuya a dejar de perder horas en tareas manuales."
- El formulario y el diagnóstico iniciados desde `/oa` envían `source: "oa"` (campo oculto / estado persistido en `sessionStorage` para que se mantenga al pasar a `/diagnostico`).

> **Ajuste al crear el cambio OpenSpec (2026-10-21):** en vez de `source: "oa"`, el lead guarda un campo aparte **`referral: "oa"`** y `source` sigue indicando el formulario (`landing` o `diagnostico`). Motivo: con `source: "oa"`, un diagnóstico hecho vía O&A dejaría de recibir su informe PDF (se envía solo si `source === "diagnostico"`) y se perdería el conteo por formulario. Detalle en `openspec/changes/landing-referidos-oa/design.md`, decisión 1. Donde abajo dice `source: "oa"`, léase `referral: "oa"`.
- Admin: la lista de leads muestra el origen con una etiqueta y permite filtrar por "oa"; el dashboard agrega "Leads por origen (últimos 30 días)".
- El correo de aviso ya incluye "Origen"; se mantiene.
- Documentación: `docs/api-spec.yml` (valores de `source`), `docs/data-model.md`, `docs/ESTADO-PROYECTO.md` (cómo medir la campaña).

**No incluye:** analítica de visitas (roadmap 3), páginas personalizadas por otro referidor (se puede generalizar después a `/r/<codigo>`).

**Criterios de aceptación.**
- **Cuando** un visitante entra por `/oa`, **entonces** ve la franja de bienvenida y el resto de la landing idéntico.
- **Cuando** envía el formulario o termina el diagnóstico desde esa visita, **entonces** el lead queda con `source: "oa"` y el admin lo muestra y filtra.
- **Cuando** entra por `/` sin `ref`, **entonces** no ve la franja y el origen sigue siendo "landing".
- `curl` a `POST /api/leads` con `source: "oa"`; E2E de `/oa` → formulario y `/oa` → `/diagnostico` → envío; lint, typecheck, `npm test`, build; preview aprobado.

**Archivos previstos.** `app/oa/page.tsx` (nuevo, reutiliza `HomePage` con prop `referral`), `app/page.tsx`, `components/landing/ReferralBanner.tsx` (nuevo), `components/landing/ContactForm.tsx`, `components/diagnostico/DiagnosticoFlow.tsx`, `lib/site.ts`, `components/admin/ConfigEditor.tsx`, `app/admin/(panel)/page.tsx` y `leads/page.tsx`, `docs/api-spec.yml`, `docs/data-model.md`, `docs/ESTADO-PROYECTO.md`.

**Riesgos.** Que el correo salga con el link a `nubolabs.cl` sin `/oa`: coordinar con Mauricio O. el link exacto antes del envío (pregunta abierta 1).

---

## HDU-09 · Diagnóstico con mapa de oportunidades (sin ahorro en horas)

**Estado (2026-10-22):** ✅ en producción; archivado en `openspec/changes/archive/2026-10-22-diagnostico-mapa-oportunidades/` (specs `openspec/specs/diagnostico/mapa-oportunidades/` y `openspec/specs/landing/autodiagnostico/`).

**Cambio OpenSpec:** `diagnostico-mapa-oportunidades` · Fase 2 · Tamaño M · Depende de HDU-02 · Detalle completo en HDU-08 §5.3.

**Resumen.** El resultado de `/diagnostico` deja de ser "índice de fricción + ahorro estimado" y pasa a **"Tu mapa de oportunidades"**: 4 dimensiones (Ventas y clientes, Control y números, Orden y seguimiento, Equipo y crecimiento) que agrupan las 6 áreas actuales sin cambiar preguntas ni escala, con nivel de oportunidad alta/media/baja. El estimador de ahorro sale del flujo público y queda como herramienta interna del admin (el cálculo de `ahorro.ts` y sus tests no cambian). El informe PDF muestra las 3 oportunidades principales y el próximo paso. La landing suma el bloque "Autodiagnóstico · 5 minutos" con un ejemplo del mapa.

## HDU-10 · Cierre de la landing: preguntas frecuentes, CTA final y CTA fija en móvil

**Cambio OpenSpec:** `cierre-landing-faq-cta` · Fase 2 · Tamaño S · Depende de HDU-02 y HDU-03 · Diseño en `docs/design/propuesta-web-hdu-08.html`.

**Estado (2026-10-22):** ✅ en producción; archivado en `openspec/changes/archive/2026-10-22-cierre-landing-faq-cta/` (spec `openspec/specs/landing/cierre/spec.md`). WhatsApp apagado por defecto (se activa en `/admin/config` → "Contacto por WhatsApp").

**Resumen.** Sección de preguntas frecuentes editable desde el CMS (6 preguntas por defecto de la referencia, incluida "¿Qué hacen con mis datos?" con enlace a `/privacidad`), banda de CTA final, botón fijo "Quiero mi diagnóstico gratis" en móvil (visible tras el hero y oculto cerca del formulario) y footer nuevo con columnas de servicios, Nubolabs, contacto y privacidad.

## HDU-11 · Enfoque: soluciones a medida para cada cliente y datos para decidir

**Cambio OpenSpec:** `enfoque-soluciones-a-medida` · Tamaño M · Depende de HDU-01 a HDU-10 (reescribe sus textos).

**Estado (2026-10-29):** ✅ mezclada a `main` (300c0a1) y publicada por el deploy automático de Vercel; archivada en `openspec/changes/archive/2026-10-29-enfoque-soluciones-a-medida/` (specs vigentes actualizadas); revisión adversarial aplicada (2 Major y 6 Minor corregidos). **Pendiente del dueño: pasos post-merge P.0 a P.3** (respaldo de `config/site`; "Usar los textos recomendados" al menos en Confianza, ¿Te suena?, Servicios, Ejemplos y Misión y visión, que en producción siguen con los textos guardados; el resto ya muestra los nuevos; revisión en producción).

### Original
"Quiero que le cambies el enfoque a todos los textos del sitio web. No debe mencionarse que automatizamos WhatsApp, no es nuestro foco. Debes centrar la idea en soluciones a medida para cada cliente atendiendo sus problemáticas particulares. Saca también que damos soluciones contables, saca todo referente a herramientas particulares como Google Sheets. Identificar soluciones, solucionar problemas particulares con buena data y reportabilidad para toma de decisiones."

### Resumen
Todos los textos por defecto del sitio (hero y su panel, dolores, "Lo que ganas", Enfoque, Servicios, ejemplos por rubro, compromisos, proceso, 7 preguntas frecuentes, CTA final, pie, misión y visión, equipo, franja de `/oa`, un objetivo del formulario, la dimensión "Control y números" del mapa, metadatos, informe PDF y correo) pasan al eje "soluciones a tu medida + datos para decidir", con el lema **"Soluciones a tu medida, decisiones con datos."** en lugar de "Tu operación, en piloto automático". La regla de vocabulario de los tests prohíbe además herramientas, canales y contabilidad (la nota técnica deja de ser la excepción). Se mantienen el canal de contacto por WhatsApp (campo, número y QR configurables) y el título "Nubolabs — AI & Automation Agency". Post-merge: "Usar los textos recomendados" en todas las secciones del admin (Misión y visión suma el botón) y pegar la historia del equipo.

## 4. Preguntas abiertas para Mauro

> **Resueltas el 2026-10-21 con la aprobación de la HDU-08:** 5 (rubros, se agrega "Comercio"), 6 (cifras ocultas de inmediato) y 7 (eyebrow "PARA DUEÑOS DE PYMES"; **cambiado el 2026-10-22: sin eyebrow**, para no excluir a empresas grandes). Siguen abiertas 1, 2, 3 y 4 (ver HDU-08 §14).

1. **¿Cuándo sale el correo de O&A y qué link llevará?** Define la fase (1 o completa) y si conviene adelantar HDU-07 para usar `nubolabs.cl/oa`.
2. **¿Tenemos ya un testimonio o una frase autorizada de O&A?** Si sí, HDU-04 sube de prioridad; si no, se usa el texto puente.
3. **¿Cuál es la URL de la agenda** (Calendly, Google Calendar, WhatsApp) para `SCHEDULE_URL` y `NEXT_PUBLIC_SCHEDULE_URL`? Sin ella, el botón "Agendar" de HDU-03 cae a "te escribimos en 24 horas".
4. **¿Quién valida el texto de `/privacidad`** antes de diciembre de 2026? Claude deja un borrador; conviene que lo mire O&A o un abogado.
5. **Rubros exactos** de los clientes que llegarán (la lista propuesta: gastronomía, automotriz, construcción, servicios profesionales, comercio, otro). Se usa en el formulario y en los casos.
6. **Cifras:** ¿ocultarlas de inmediato (HDU-06) o esperar al piloto de O&A con las actuales visibles?
7. **Eyebrow del hero:** ¿reemplazar "AI & AUTOMATION AGENCY" por "PARA DUEÑOS DE PYMES" o mantener el inglés como marca?

## 5. Cómo ejecutar cada HDU

En una sesión nueva de Claude Code (botón **+**):

```
/opsx:ff mensaje-principal-pyme partiendo de docs/backlog/prospectos-oa.md, sección HDU-01
```

Claude crea propuesta, diseño y tareas; Mauro revisa; `/opsx:apply`; verificación y revisión adversaria; preview de Vercel; `/opsx:archive`; `/commit`; "mezcla". Al cerrar cada HDU, marcar aquí su estado (✅ y fecha) y actualizar `docs/ESTADO-PROYECTO.md`.

| HDU | Estado |
|---|---|
| HDU-01 mensaje-principal-pyme | ✅ 2026-10-22: mezclada a `main` y archivada (`openspec/changes/archive/2026-10-22-mensaje-principal-pyme/`, spec `openspec/specs/landing/hero/`). Revisión adversarial con sus 2 Major corregidos; sin "Para dueños de pymes" (decisión del mismo día). Pendiente post-merge (Mauro): `/admin/config` → Hero → "Usar los textos recomendados" → "Guardar cambios" |
| HDU-02 lenguaje-sin-jerga | ✅ 2026-10-22: mezclada a `main` y archivada (`openspec/changes/archive/2026-10-22-lenguaje-sin-jerga/`, spec `openspec/specs/landing/contenido-pyme/`) |
| HDU-03 formulario-minimo-consentimiento | ✅ 2026-10-22: mezclada a `main` y archivada (`openspec/changes/archive/2026-10-22-formulario-minimo-consentimiento/`, specs `openspec/specs/leads/formulario-contacto/` y `openspec/specs/sitio/privacidad/`). Revisión adversarial con su Major corregido; incluye el detalle escrito de "Otra cosa" y del rubro "Otro" (70 caracteres). Pendiente post-merge (Mauro): `NEXT_PUBLIC_SCHEDULE_URL` en Vercel cuando exista la agenda, lead de prueba (revisarlo y borrarlo) y validación legal de `/privacidad` antes del 1-dic-2026 |
| HDU-04 confianza-recomendacion | ✅ 2026-10-22: mezclada a `main` y archivada (`openspec/changes/archive/2026-10-22-confianza-recomendacion/`, spec `openspec/specs/landing/confianza/`) |
| HDU-05 casos-por-rubro | ✅ 2026-10-22: mezclada a `main` y archivada (`openspec/changes/archive/2026-10-22-casos-por-rubro/`, spec `openspec/specs/landing/casos-por-rubro/`) |
| HDU-06 cifras-con-respaldo | ✅ 2026-10-22: mezclada a `main` y archivada (`openspec/changes/archive/2026-10-22-cifras-con-respaldo/`, spec `openspec/specs/landing/cifras/`) |
| HDU-07 landing-referidos-oa | ✅ 2026-10-22: mezclada a `main` y archivada (`openspec/changes/archive/2026-10-22-landing-referidos-oa/`, spec `openspec/specs/leads/origen-referidos/`) |
| HDU-09 diagnostico-mapa-oportunidades | ✅ 2026-10-22: mezclada a `main` y archivada (`openspec/changes/archive/2026-10-22-diagnostico-mapa-oportunidades/`, specs `openspec/specs/diagnostico/mapa-oportunidades/` y `openspec/specs/landing/autodiagnostico/`) |
| HDU-10 cierre-landing-faq-cta | ✅ 2026-10-22: mezclada a `main` y archivada (`openspec/changes/archive/2026-10-22-cierre-landing-faq-cta/`, spec `openspec/specs/landing/cierre/`) |
| HDU-11 enfoque-soluciones-a-medida | ✅ 2026-10-29: mezclada a `main` (300c0a1) y publicada por el deploy automático de Vercel; archivada (`openspec/changes/archive/2026-10-29-enfoque-soluciones-a-medida/`, specs vigentes actualizadas); lint, tipos, 379 tests, build y E2E en verde; revisión adversarial con 2 Major y 6 Minor corregidos. Pendiente del dueño (P.0 a P.3): respaldo de `config/site`, "Usar los textos recomendados" en todas las secciones de `/admin/config` salvo Autodiagnóstico, pegar la historia del equipo en `/admin/equipo` y revisar producción |
