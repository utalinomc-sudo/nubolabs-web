# HDU-08 · Propuesta de valor más allá del ahorro de horas: brochure de servicios y rediseño de la web

> Enriquecida con **SpecBoot** (`/enrich-us`, plantilla `nubolabs-specboot` v0.1.1) el 2026-10-21.
> Fuentes: `mejoras página para brochure.pdf` (sept. 2026), `Nubolabs_Campana_Captacion_OA.pdf` (20-oct-2026), `docs/backlog/prospectos-oa.md` (HDU-01 a 07), `docs/Mejoras-Nubolabs.pdf`, `Propuesta_Landing_Nubolabs.docx`, lámina de identidad de marca y el código actual (`lib/content.ts`, `lib/site.ts`, `components/landing/*`, `components/diagnostico/*`).
> Skills de diseño usadas: `frontend-design`, `ui-ux-pro-max` (bases de estilos, landing, tipografía y reglas UX), `design-system` (tokens en 3 capas), `brand` (voz y mensajes), `design` (brochure y pieza para correo).
> Entregables de diseño (fuera del repo, en el Escritorio de Mauro: `Nubolabs - Brochure y Propuesta Web (2026-10-21)/`): brochure PDF de 4 páginas, imagen para el correo de O&A y capturas. **Referencia visual para implementar, dentro del repo:** `docs/design/propuesta-web-hdu-08.html` (HTML/CSS/JS sin dependencias, mismos tokens de §7).
> **Estado:** aprobada por Mauro el 2026-10-21. Se implementa repartida en los cambios OpenSpec de §9 (ver también `docs/backlog/prospectos-oa.md`).

---

## Original

> "En base a estos documentos, ocupando todas las skills de diseño que tenemos disponibles, genera:
> - un brochure de los servicios que ofrecemos en Nubolabs
> - un nuevo diseño a la página acorde a las recomendaciones de los documentos (Propuesta HTML)
> - el diseño debe ser moderno, simple y llamando a la acción.
>
> Creo que no deberíamos acotar el resultado a ahorro de HH, suena feo, modifica el formulario y el proceso en el diseño.
> Ocupa el SpecBoot para enriquecer esto también antes de hacerlo."

---

## Enhanced

### 1. Problema

Los dos documentos de septiembre y octubre acertaron en lo central: el prospecto que llega por O&A es dueño de pyme, no sabe de tecnología y viene por confianza. Pero tradujeron el valor de Nubolabs **solo a horas ahorradas**:

- Titular propuesto: "Te devolvemos las horas que tu equipo pierde en tareas repetitivas."
- Pregunta del formulario: "¿Qué tarea te gustaría dejar de hacer a mano?"
- Proceso: "Medición → horas ahorradas y errores reducidos"; diagnóstico con "estimador de ahorro" en CLP/horas.
- Texto del correo de Mauricio O.: "Si tu equipo pierde horas en tareas repetitivas…".

**Por qué es un problema:**
1. **Achica la propuesta.** Un dueño de pyme no compra horas, compra **ventas, control, tranquilidad y crecimiento**. "Ahorro de HH" suena a recorte de personal y a planilla de costos.
2. **Pone a la defensiva al equipo del cliente.** "Te devolvemos las horas que tu equipo pierde" se puede leer como "tu equipo es ineficiente" o "vas a necesitar menos gente".
3. **Compite en precio.** Si el valor son horas, el cliente compara contra el sueldo de un administrativo. Si el valor es vender más o no perder clientes, la conversación es otra.
4. **Contradice la marca.** La lámina de identidad ya trae taglines más amplios: *"Tu operación, en piloto automático"*, *"Sistemas que trabajan por ti"*, *"Automatizamos hoy. Impulsamos tu mañana."*

### 2. Nueva propuesta de valor (fuente única de textos)

**Promesa (titular):** **Que tu negocio trabaje para ti, no al revés.**
- Alternativa A: *Tu negocio ordenado, y lo repetitivo funcionando solo.*
- Alternativa B: *Vende más, ten el control y crece sin desordenarte.*

**Bajada:** Ordenamos cómo funciona tu empresa y dejamos andando solas las tareas que hoy te frenan: cotizaciones, cobranzas, pedidos, reportes y respuestas a clientes. Tú nos dices qué quieres lograr; nosotros lo dejamos funcionando.

**Cuatro resultados (reemplazan a "horas ahorradas" como eje):**

| Resultado | Texto | Antes se decía |
|---|---|---|
| **Vendes más** | Respondes al instante, cotizas el mismo día y ningún cliente se queda sin seguimiento. | — (no existía) |
| **Tienes el control** | Ventas, gastos, cobranzas y pendientes al día, en tu celular, sin pedirle un informe a nadie. | "Reportes en minutos" |
| **Nada se olvida** | Cobros, plazos, pedidos y papeles que avanzan solos y a tiempo. Menos errores, menos sustos. | "−90% de error" |
| **Creces sin desordenarte** | Atiendes más clientes sin que tu equipo colapse ni tengas que contratar al mismo ritmo. | "Escala" |

Línea de cierre (el tiempo aparece, pero como consecuencia, no como promesa): *"Y tu equipo deja la pega repetitiva para dedicarse a lo que de verdad hace crecer tu negocio."*

**Diferenciador (se mantiene, documento §04):** *Primero ordenamos, después automatizamos.* Automatizar el desorden solo lo hace más rápido.

**"¿Te suena?" (dolores en idioma de dueño):**
1. Respondes WhatsApp a las 11 de la noche.
2. Una cotización tarda días y el cliente se va con otro.
3. Fin de mes es perseguir pagos y juntar papeles para el contador.
4. No sabes cuánto ganaste hasta que alguien arma la planilla.
5. Todo depende de que alguien se acuerde.
6. Si alguien falta, nadie sabe en qué estaba.

Cierre: *"No es falta de ganas: tu negocio creció y la forma de trabajar no."*

### 3. Servicios (para brochure y web)

| # | Servicio (nombre pyme) | Qué hacemos | Lo que ganas | Equivale hoy a |
|---|---|---|---|---|
| 1 | **Diagnóstico y plan de mejora**, *empieza aquí, la primera sesión es gratis* | 30 min para entender tu negocio y mostrarte dónde está tu mayor oportunidad: qué ordenar, qué dejar funcionando solo y por dónde partir. Incluye un resumen con tus prioridades y un plan por etapas con costos claros. | Sabes qué hacer primero y por qué. | Diagnóstico y rediseño de procesos |
| 2 | **Tareas que avanzan solas** | Cotizaciones, cobranzas, pedidos a proveedores, recordatorios y traspaso de datos entre planillas: lo que hoy depende de alguien, pasa solo. | Nada se olvida, menos errores, equipo en lo importante. | Automatización operativa en la nube |
| 3 | **Clientes atendidos al instante** | Asistentes que responden WhatsApp y correo, agendan, toman pedidos y hacen seguimiento con el tono de tu negocio. Cuando hace falta una persona, te avisan. | Más ventas y clientes que vuelven. | Agentes IA |
| 4 | **Tus números claros, siempre** | Ventas, gastos, márgenes y cobranzas en un panel simple o en un reporte que te llega solo. La información del mes le llega lista a tu contador. | Decides con datos, no a ciegas. | Reportería y entregables automáticos |
| 5 | **Herramientas a tu medida** | Cuando lo que existe no calza, construimos una herramienta simple para tu forma de trabajar: portal de solicitudes, control de obras, agenda de taller. | Creces sin desordenarte. | Sistemas a medida |
| + | **Acompañamiento mensual** | Soporte, ajustes y nuevas mejoras cada mes. No te dejamos solo con la tecnología. | Mejora continua sin preocuparte. | Retainer |

**Nota técnica (única, chica, al final de Servicios):** *"Cómo lo hacemos: con herramientas probadas de automatización e inteligencia artificial (como n8n y Make), conectadas a lo que ya usas: WhatsApp, correo, Excel o Google Sheets y tu sistema de facturación. Sin cambiar tus sistemas."*

### 4. Ejemplos por rubro (HDU-05, textos actualizados al nuevo eje)

| Rubro | Ejemplos |
|---|---|
| **Para todos** | La información del mes le llega sola a tu contador · Cobranza con recordatorios amables y automáticos · Cotizaciones listas el mismo día |
| **Gastronomía** | Reservas y consultas por WhatsApp respondidas al instante, incluso de noche · Pedidos a proveedores según lo que de verdad queda en bodega · Ventas del día y costo de insumos en tu celular al cierre |
| **Automotriz** | Presupuestos de repuestos y mano de obra que se arman solos · Aviso al cliente cuando su auto está listo y recordatorio de su próxima mantención |
| **Construcción** | Estados de pago y documentos de obra ordenados y enviados a tiempo · Gastos por obra al día, sin copiar facturas a mano |
| **Servicios profesionales** | Plazos y vencimientos que nadie olvida, con aviso al responsable · Informes a clientes que se preparan solos desde tus datos |
| **Comercio** | Stock y ventas al día, con aviso antes de quedarte sin producto · Clientes que vuelven con mensajes según lo que compraron |

### 5. Cambio al PROCESO

#### 5.1 "Cómo trabajamos contigo" (sección de la web y página 4 del brochure)

| Paso | Hoy | Propuesta | Qué recibe el cliente |
|---|---|---|---|
| 1 | Diagnóstico: "procesos, dolores y ROI estimado" | **Conversamos.** 30 min, gratis. Nos cuentas cómo funciona tu negocio y qué te gustaría lograr. | Un resumen con tus prioridades. |
| 2 | Rediseño | **Ordenamos y proponemos.** Vemos cómo se hacen hoy las cosas, sacamos lo que sobra y te proponemos un plan por etapas. | Plan y presupuesto claros, sin letra chica. |
| 3 | Implementación: "automatizaciones, reportes y agentes" | **Lo dejamos funcionando.** Con lo que ya usas, partiendo por lo que más impacto tiene, y enseñándole a tu equipo. | La mejora andando y tu equipo usándola. |
| 4–5 | Medición: "**horas ahorradas** y errores reducidos" + Mejora continua | **Medimos lo que a ti te importa y seguimos mejorando.** Tú defines qué es éxito: más ventas, cobros al día, respuestas más rápidas, menos errores, más control. | Un reporte simple de resultados y nuevas mejoras. |

**Regla nueva:** cada proyecto define con el cliente, en el paso 2, **su propia métrica de éxito** (1 a 3 indicadores). Las horas pueden ser una de ellas, pero nunca la única ni la principal por defecto.

#### 5.2 Recorrido del prospecto de O&A (captación)

| # | Hoy (plan de campaña 20-oct) | Propuesta |
|---|---|---|
| 1 | Correo de Mauricio O. → botón a `nubolabs.cl/diagnostico` | Mismo correo, **texto revisado** (§8), botón a `nubolabs.cl/oa` (o `/?ref=oa` mientras no exista la ruta) para **medir** la campaña (HDU-07). |
| 2 | `/diagnostico` = cuestionario de 18 preguntas (largo: el prospecto se enfría, el propio plan lo advierte) | Llega a la landing con la franja *"Te recomendó tu contador"* y el **formulario corto de 2 pasos** visible (§6). |
| 3 | Llena formulario de 5 campos | Paso 1: toca qué quiere lograr y su rubro. Paso 2: nombre, correo, WhatsApp y consentimientos. |
| 4 | Agenda en Calendly | **Pantalla de éxito = agenda inmediata** (botón a `NEXT_PUBLIC_SCHEDULE_URL`). Si no hay URL: "Te escribimos en menos de 24 horas". |
| 5 | — | **Opcional, después de agendar:** "¿Quieres adelantar? Haz el autodiagnóstico de 5 minutos" → `/diagnostico`, que pasa a ser **complemento**, no la puerta de entrada. |
| 6 | Videollamada | Videollamada de 30 min con el objetivo que eligió el prospecto como tema → resumen de prioridades → propuesta. |

#### 5.3 Diagnóstico interactivo (`/diagnostico`)

- El resultado deja de llamarse "índice de fricción" + "ahorro estimado" y pasa a **"Tu mapa de oportunidades"**, con 4 dimensiones que agrupan las 6 áreas actuales sin cambiar las preguntas ni la escala:

| Dimensión (cliente) | Áreas actuales (`cuestionario.ts`) |
|---|---|
| Ventas y clientes | `clientes` |
| Control y números | `info` |
| Orden y seguimiento | `plazos`, `procesos` |
| Equipo y crecimiento | `carga`, `conocimiento` |

- Cada dimensión muestra **Oportunidad alta / media / baja** (umbrales actuales 60/35) y una frase de qué se podría lograr.
- El **estimador de ahorro** (CLP/horas) sale del flujo público y queda como herramienta interna del admin para preparar propuestas (el cálculo de `ahorro.ts` y sus 11 tests no se tocan).
- El informe PDF (`lib/report.ts`) cambia de "ahorro estimado" a "tus 3 oportunidades principales + próximo paso".
- Las preguntas abiertas cambian de foco: "¿Cuál es el problema que más tiempo le quita al equipo?" → **"¿Qué es lo que más te gustaría mejorar en tu negocio este año?"**.

> Este punto se implementa en una HDU aparte, **HDU-09 `diagnostico-mapa-oportunidades`**, después de la fase 1. La propuesta HTML solo muestra cómo se vería el resultado.

### 6. Cambio al FORMULARIO (reemplaza el alcance de HDU-03)

**Principios** (reglas UX de `ui-ux-pro-max`: `progressive-disclosure`, `multi-step-progress`, `input-labels`, `inline-validation`, `error-clarity`, `submit-feedback`, `touch-friendly-input`): pocos campos, etiquetas visibles, el primer paso se responde con toques, sin preguntas de horas.

**Paso 1 de 2: "¿Qué te gustaría lograr?"** (se puede saltar, nada obligatorio)
- Chips de selección múltiple (`goals[]`): Vender más · Responder más rápido a mis clientes · Tener mis números claros · Cobrar a tiempo · Ordenar el trabajo del equipo · Dejar atrás las planillas · Crecer sin desordenarme · Otra cosa.
- Chips de selección única (`industry`): Gastronomía · Automotriz · Construcción · Servicios profesionales · Comercio · Otro.
- Botón "Siguiente →" siempre activo; link "Saltar este paso".

**Paso 2 de 2: "¿Dónde te contactamos?"**
| Campo | Obligatorio | Nota |
|---|---|---|
| Nombre | Sí | `autocomplete="given-name"` |
| Correo | Sí | `type="email"`, es el dato que se ancla |
| WhatsApp | Sí | `type="tel"`, placeholder `+56 9 …` (canal de las pymes, según plan de campaña) |
| Empresa | No | |
| "¿Algo que quieras contarnos antes de la llamada?" | No | 2 líneas. Ejemplo en el placeholder: *"Las cotizaciones se nos acumulan y perdemos clientes"*. **Reemplaza** a "¿Qué tarea te gustaría dejar de hacer a mano?" |
| ☐ Acepto que Nubolabs use mis datos para contactarme sobre mi diagnóstico. *(Cómo cuidamos tus datos)* | Sí | `contactConsent` |
| ☐ Quiero recibir ideas y novedades de Nubolabs. Puedes darte de baja cuando quieras. | No, desmarcado | `marketingConsent` (Ley 21.719, exigible desde el 1-dic-2026) |

Botón: **"Agendar mi diagnóstico gratis →"** · bajo el botón: *"30 minutos · por videollamada · sin compromiso"*.

**Éxito:** "¡Listo, {nombre}! Ahora elige el día y la hora." + botón grande **"Elegir horario →"** + "Qué pasa ahora: 1) Eliges horario · 2) Te llega la confirmación · 3) Conversamos 30 min sobre {objetivo elegido}". Debajo: "¿Prefieres que te escribamos? Lo hacemos en menos de 24 horas." y el link opcional al autodiagnóstico.

**Datos del lead** (convención en inglés de `leads`; documentar en `docs/data-model.md` y `docs/api-spec.yml`):
```ts
// types/lead.ts — campos nuevos u opcionales de LeadInput
goals?: GoalKey[];            // 'sell_more' | 'respond_faster' | 'clear_numbers' | 'collect_on_time' | 'organize_team' | 'drop_spreadsheets' | 'grow_orderly' | 'other'
industry?: IndustryKey;       // 'gastronomia' | 'automotriz' | 'construccion' | 'servicios' | 'comercio' | 'otro' (misma lista que HDU-05)
message?: string;             // "¿Algo que quieras contarnos…?" (se reutiliza)
contactConsent: true;         // obligatorio: sin él, 400
marketingConsent: boolean;
consentAt: string;            // ISO, fecha del servidor
consentText: { contact: string; marketing?: string }; // texto exacto mostrado, respaldo legal
source: 'landing' | 'diagnostico';
referral?: 'oa';             // HDU-07: referido de O&A (ver landing-referidos-oa, decisión 1)
```
- `POST /api/leads`: valida con una función pura `normalizeLead()` en `lib/leads.ts` (+ `lib/leads.test.ts`): ignora `goals`/`industry` fuera de la lista, exige `contactConsent === true`, recorta textos (máx. 1.000 caracteres), JSON inválido → 400.
- Aviso interno por correo (`lib/email.ts`) y detalle del admin: agregar **Objetivos**, **Rubro**, **Mensaje** y **Consentimientos**.
- `/privacidad` (texto editable en el CMS): responsable, finalidades (responder la solicitud; novedades solo con casilla marcada), proveedores que tratan los datos (Firebase/Google y Resend, con transferencia fuera de Chile), plazo de conservación, derechos (acceso, rectificación, supresión, oposición, portabilidad) y canal: `mauricio.nubolabs@gmail.com`, con respuesta en 30 días corridos. **Lo valida O&A o un abogado antes del 1-dic-2026.**

### 7. Sistema de diseño (skills `design-system` + `ui-ux-pro-max`)

**Dirección:** *"Piloto automático"*: minimalismo suizo B2B (recomendación de `ui-ux-pro-max` para servicios B2B: confianza, prueba social y mensajes de resultado; evitar degradados morados de "IA", diseño juguetón y credenciales escondidas). Mucho blanco, navy profundo para contraste, el degradado azul→cian del logo **solo** en acentos. Elemento memorable: el panel **"Tu negocio hoy"**, con tareas que se completan solas en el hero.

**Tipografía:** Plus Jakarta Sans 400–800 (marca; coincide con el par "Friendly SaaS / B2B" de la base) + IBM Plex Mono para etiquetas. Escala: 12 · 14 · 16 · 18 · 22 · 28 · 36 · 48 · 60. Cuerpo mínimo 16 px en móvil, interlineado 1.6.

**Tokens (3 capas):**
```css
/* Primitivos */
--navy-950:#071327; --navy-900:#0B1D3A; --navy-800:#12294F;
--blue-600:#1565FF; --blue-700:#0F52D6; --blue-50:#EBF1FF;
--cyan-400:#00C2FF; --cyan-50:#E6F9FF;
--coral-500:#FF6B5E; --coral-600:#D63C2F; --coral-50:#FFEFED;
--gray-25:#F6F9FE; --gray-50:#F2F4F7; --line:#E7EDF7;
--ink-900:#0B1D3A; --ink-600:#3D4E6B; --ink-500:#5A6B85; --green-600:#138A4D;
/* Semánticos */
--color-bg:#fff; --color-surface-alt:var(--gray-25); --color-inverse:var(--navy-900);
--color-text:var(--ink-900); --color-text-muted:var(--ink-500);
--color-primary:var(--blue-600); --color-primary-hover:var(--blue-700);
--color-highlight:var(--cyan-400);   /* solo sobre navy o decorativo */
--color-accent:var(--coral-500);     /* decorativo; texto chico → --coral-600 */
/* Componentes */
--btn-radius:14px; --card-radius:20px; --chip-radius:999px;
--shadow-card:0 1px 3px rgba(11,29,58,.06),0 8px 24px rgba(11,29,58,.06);
--shadow-cta:0 10px 24px rgba(21,101,255,.30);
```

**Contraste verificado (WCAG AA):** blanco sobre `#1565FF` = 4.8:1 ✓ · `#5A6B85` sobre blanco = 5.4:1 ✓ · cian sobre navy = 8.1:1 ✓ · coral sobre navy = 6.0:1 ✓ · **coral sobre blanco = 2.8:1 ✗** (solo decorativo o texto ≥ 24 px; para texto chico se usa `#D63C2F`, 4.6:1) · **cian sobre blanco = 2.1:1 ✗** (solo decorativo).

**Reglas:** iconos SVG de trazo uniforme (estilo Lucide, sin emojis) · un solo botón primario por vista · objetivos táctiles ≥ 44 px · animaciones con `transform`/`opacity` y respeto de `prefers-reduced-motion` · sin scroll horizontal a 375 px · **sin cifras inventadas** (HDU-06: las cifras se muestran solo con fuente real).

### 8. Voz de marca y textos de campaña (skill `brand`)

- Español de Chile, tuteo, frases cortas, verbos concretos. Hablar de **lo que el dueño gana**, no de lo que la tecnología hace.
- Palabras que sí: ordenar, vender, cobrar, responder, control, tranquilo, al día, a tiempo, crecer.
- Palabras que no en titulares: horas-hombre, HH, ahorro de horas, eficiencia operacional, automatizaciones con IA, n8n, API, CRM, ERP, agentes.

**Texto revisado del correo de Mauricio O.** *(pendiente de su visto bueno, igual que el testimonio)*:
> Estimados:
> Quiero presentarles a **Nubolabs**, una empresa con la que llevo meses trabajando y que nos ha ayudado a ordenar y automatizar varios procesos del estudio. Hoy trabajamos más ordenados, con la información al día y con el equipo enfocado en lo importante; por eso quise compartirlos con ustedes.
> Ayudan a empresas como las suyas a atender y vender mejor, tener sus números claros y crecer sin desordenarse, con soluciones simples y sin necesidad de saber de tecnología.
> Ofrecen un diagnóstico gratuito de 30 minutos, sin compromiso. Los recomiendo de verdad.
> Saludos,
> Mauricio Osorio, Osorio & Asociados

**Testimonio revisado** *(pendiente del "sí, dale" de Mauricio O. antes de publicarlo)*:
> "Llevo meses trabajando con Nubolabs y el cambio se nota: el estudio funciona más ordenado, tenemos la información al día y el equipo dedica su tiempo a lo que importa. Los recomiendo sin dudar."
> Mauricio Osorio · Osorio & Asociados

### 9. Impacto en el backlog existente (`docs/backlog/prospectos-oa.md`)

| HDU | Cambio que introduce esta HDU-08 |
|---|---|
| HDU-01 `mensaje-principal-pyme` | Título por defecto: **"Que tu negocio trabaje para ti, no al revés."** (se descarta "Te devolvemos las horas…"). Sin eyebrow (el "PARA DUEÑOS DE PYMES" aprobado el 2026-10-21 se retiró el 2026-10-22, ver §14 fila 9). Tags (como en la referencia visual): "30 minutos, gratis y sin compromiso" · "Sin cambiar tus sistemas" · "Respuesta en menos de 24 horas". El criterio "una promesa en términos de horas" pasa a ser **"una promesa de resultado de negocio (ventas, control, orden o crecimiento)"**. |
| HDU-02 `lenguaje-sin-jerga` | Se agrega a la tabla de reemplazos: "horas ahorradas" → resultado concreto según la sección; "ROI estimado" → "tus prioridades". Nueva sección "Lo que ganas" (4 resultados) entre Problemas y Enfoque. |
| HDU-03 `formulario-minimo-consentimiento` | Se reemplaza el alcance por §6: formulario de 2 pasos con objetivos y rubro, 2 consentimientos, WhatsApp obligatorio, sin "¿qué tarea te gustaría dejar de hacer a mano?". |
| HDU-04 `confianza-recomendacion` | Usar el testimonio revisado (§8) cuando Mauricio O. lo apruebe; mientras, el texto puente. |
| HDU-05 `casos-por-rubro` | Textos de §4. |
| HDU-06 `cifras-con-respaldo` | Sin cambios: se ocultan "+120 h" y "−90%". Cuando haya datos del piloto, preferir cifras de resultado (p. ej. "cotizaciones el mismo día") sobre horas. |
| HDU-07 `landing-referidos-oa` | Sin cambios; el botón del correo apunta a `/oa`. |
| **HDU-09 (nueva)** `diagnostico-mapa-oportunidades` | §5.3. Fase 2. |

### 10. Archivos previstos para la implementación en el repo

`lib/site.ts` (tipos, defaults, `mergeConfig`: `hero`, `resultados`, `proceso`, `casos[].rubro`, `privacidad`, `contact` → `{ whatsappNumber, showWhatsapp, showWhatsappQr }`, con ambos toggles en `false` por defecto) · `lib/content.ts` (retirar `metrics`, nuevos `problems`, `approach`, `steps`) · `components/landing/{Hero,HeroGraphic,Problem,Approach,Services,Process,UseCases,ContactForm,Footer}.tsx` · **nuevos** `components/landing/{Results,Trust,Faq,ReferralBanner}.tsx` · `app/page.tsx` (orden de secciones) · `app/privacidad/page.tsx` · `app/api/leads/route.ts` + `lib/leads.ts` + `lib/leads.test.ts` · `types/lead.ts` · `lib/email.ts` · `app/admin/(panel)/leads/**` · `components/admin/ConfigEditor.tsx` · `tailwind.config.ts` (tokens nuevos: `blue-700`, `coral-600`, `green-600`) · `.env.local.example` (`NEXT_PUBLIC_SCHEDULE_URL`) · `docs/data-model.md` · `docs/api-spec.yml` · `docs/ESTADO-PROYECTO.md` · `docs/backlog/prospectos-oa.md` (ajustes de §9).

**Referencia visual para implementar:** `04_Propuesta_Web_Nubolabs.html` (HTML/CSS/JS sin dependencias, con los mismos tokens). Se traduce a componentes Tailwind sección por sección.

### 11. Criterios de aceptación

- **Cuando** un visitante abre la portada, **entonces** ni el titular ni la bajada mencionan horas, HH, IA, nube ni automatización, y sí un resultado de negocio.
- **Cuando** recorre la página completa, **entonces** "horas" aparece como máximo una vez, y como consecuencia (línea de cierre de "Lo que ganas"), nunca como promesa principal.
- **Cuando** llena el paso 2 con nombre, correo y WhatsApp válidos y marca el consentimiento obligatorio, **entonces** el lead se guarda con `goals`, `industry`, `contactConsent`, `marketingConsent`, `consentAt` y `consentText`, y la pantalla de éxito ofrece agendar.
- **Cuando** no marca el consentimiento obligatorio, **entonces** ve el error junto a la casilla ("Necesitamos tu permiso para contactarte sobre el diagnóstico") y no se envía nada.
- **Cuando** salta el paso 1, **entonces** puede enviar igual y el lead queda sin `goals`.
- **Cuando** entra por `/oa`, **entonces** ve la franja de recomendación y el lead queda marcado con `referral: "oa"` (su `source` sigue siendo el formulario: `landing` o `diagnostico`).
- **Cuando** abre la página a 375 px, **entonces** no hay scroll horizontal, los chips caben en varias líneas y todos los objetivos táctiles miden ≥ 44 px.
- **Cuando** el sistema tiene "reducir movimiento" activado, **entonces** el panel "Tu negocio hoy" se muestra estático.
- **Cuando** `contact.showWhatsapp` y `contact.showWhatsappQr` están apagados (valor por defecto), **entonces** la página no muestra ningún número ni QR de WhatsApp y no carga el generador de QR.
- **Cuando** el admin activa `contact.showWhatsapp` desde `/admin/config`, **entonces** el pie de página muestra el número (`+56 9 XXXX XXXX`) con enlace a `https://wa.me/<número>`.
- **Cuando** el admin activa `contact.showWhatsappQr`, **entonces** junto al formulario aparece "¿Prefieres escribirnos?" con un QR a `https://wa.me/<número>` en escritorio, y en celular (≤ 820 px) un enlace directo en vez del QR. Los dos toggles son independientes y ninguno se muestra si el número está vacío.
- Ninguna cifra sin fuente visible en la página ni en el brochure.
- Brochure: 4 páginas A4 en PDF, sin jerga en titulares, con QR al formulario, sin WhatsApp y testimonio solo si Mauricio O. lo aprobó.
- Verificación del repo: `npm run lint` · `npx tsc --noEmit` · `npm test` (incluye `lib/leads.test.ts`) · `npm run build` · `curl` a `POST /api/leads` (válido, sin consentimiento → 400, rubro inválido ignorado, JSON inválido → 400) · E2E con Playwright MCP a 1280 y 375 px · preview de Vercel aprobado por Mauro.

### 12. Requisitos no funcionales

- **Seguridad y datos:** sin PII en logs (`[leads]` con id, no correo); consentimiento con prueba (fecha + texto); revocable por un medio igual de simple (link de baja en cada correo de novedades); honeypot en el formulario (el rate limiting completo sigue en el roadmap 4).
- **Rendimiento:** LCP < 2,5 s en 4G; sin imágenes pesadas en el hero (el panel es HTML/CSS); fuentes con `display=swap`; CLS < 0,1 (el panel reserva su alto).
- **Accesibilidad:** contraste AA (§7), foco visible, chips con `aria-pressed`, errores con `aria-describedby` + `role="alert"`, pasos con indicador de progreso y botón "Volver".
- **Medición:** cada lead guarda `source`, `goals` e `industry` → el dashboard del admin podrá mostrar "qué quieren lograr los prospectos" (insumo comercial y de contenido).

### 13. Definición de terminado

1. HDU-01, 02, 03 (con este alcance), 04, 05, 06, 07 actualizadas en `docs/backlog/prospectos-oa.md` y HDU-09 creada.
2. Cada HDU pasa por `/opsx:ff` → `/opsx:apply` → `/opsx:verify` → `/adversarial-review` → `/opsx:archive` → `/commit`, con preview de Vercel revisado por Mauro.
3. `docs/ESTADO-PROYECTO.md`, `docs/data-model.md` y `docs/api-spec.yml` actualizados.
4. Testimonio y texto del correo aprobados por Mauricio O.; texto de `/privacidad` revisado por O&A o abogado.
5. Brochure final exportado con el QR apuntando a la URL definitiva (`/oa` o `/diagnostico`).

### 14. Decisiones (aprobadas por Mauro el 2026-10-21) y preguntas que siguen abiertas

| # | Tema | Estado |
|---|---|---|
| 1 | Titular "Que tu negocio trabaje para ti, no al revés." | ✅ Aprobado |
| 2 | WhatsApp obligatorio en el formulario | ✅ Aprobado |
| 3 | URL de agenda (Calendly u otra) para `NEXT_PUBLIC_SCHEDULE_URL` y el QR del brochure | ⏳ Abierta: el código degrada a "Te escribimos en menos de 24 horas" si falta |
| 4 | Correo de contacto público (`hola@nubolabs.ai` en el footer vs dominio verificado `nubolabs.cl`) | ⏳ Abierta: mientras tanto, solo la web (WhatsApp oculto, ver fila 8) |
| 5 | Sacar el estimador de ahorro del flujo público (§5.3) | ✅ Aprobado (HDU-09) |
| 6 | Testimonio y texto del correo en voz de Mauricio O. | ⏳ Pendiente de su visto bueno: el CMS arranca con el texto puente y el testimonio se carga desde `/admin/config` cuando él apruebe |
| 7 | Texto de `/privacidad` | ⏳ Lo valida O&A o un abogado antes del 1-dic-2026 |
| 8 | WhatsApp de contacto de Nubolabs (no confundir con el campo WhatsApp del formulario, fila 2) | ✅ Decidido el 2026-10-22: fuera del brochure (ni número ni QR). En la web, oculto por defecto y configurable desde el admin: número en el pie y QR junto al formulario, por separado (§10, §11). Número cargado: el de Germán, +56 9 3259 0783 |
| 9 | Público objetivo en los textos | ✅ Decidido el 2026-10-22: se retira "PARA DUEÑOS DE PYMES" de todas las piezas (web, referencia visual y brochure) para no excluir a empresas grandes. El hero queda sin etiqueta superior por defecto (el admin puede escribir una) y ningún texto público se dirige solo a pymes. El análisis del prospecto de O&A (dueño de pyme) sigue siendo válido como contexto interno |

### 15. Reparto en cambios OpenSpec (orden de implementación)

| Orden | HDU | Cambio | Qué toma de esta HDU-08 |
|---|---|---|---|
| 1 | HDU-01 | `mensaje-principal-pyme` | Titular, bajada, tags y CTA (§2); **tokens de diseño (§7)** y panel "Tu negocio hoy" del hero |
| 2 | HDU-03 | `formulario-minimo-consentimiento` | Formulario de 2 pasos, consentimientos, pantalla de éxito con agenda y `/privacidad` (§6) |
| 3 | HDU-02 | `lenguaje-sin-jerga` | Barrido de vocabulario, sección "Lo que ganas" (§2), "¿Te suena?", enfoque antes/después, servicios (§3), proceso (§5.1) y nota técnica |
| 4 | HDU-10 (nueva) | `cierre-landing-faq-cta` | Preguntas frecuentes, CTA final, CTA fija en móvil, footer nuevo y WhatsApp configurable (`contact`, §14 fila 8) |
| 5 | HDU-04 | `confianza-recomendacion` | Bloque de confianza: testimonio editable o texto puente + "Nuestro compromiso" |
| 6 | HDU-06 | `cifras-con-respaldo` | Cifras ocultas hasta tener respaldo |
| 7 | HDU-05 | `casos-por-rubro` | Ejemplos por rubro con filtro (§4) |
| 8 | HDU-07 | `landing-referidos-oa` | Franja O&A, campo `referral: "oa"` en el lead y medición |
| 9 | HDU-09 (nueva) | `diagnostico-mapa-oportunidades` | Mapa de oportunidades, estimador fuera del flujo público y bloque de autodiagnóstico (§5.3) |
