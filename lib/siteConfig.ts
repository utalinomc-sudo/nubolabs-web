// Configuración pura del sitio: tipos, secciones, defaults y mezcla con lo guardado en Firestore (config/site).
// Sin "server-only" para poder usarla en tests y en el admin (cliente). La lectura de Firestore vive en lib/site.ts.

// ── Tipos ────────────────────────────────────────────────────────────
export interface ServiceItem {
  title: string;
  body: string;
  result: string; // se muestra como "lo que ganas"
}
export interface CaseItem {
  title: string;
  body: string;
}
export interface TextItem {
  title: string;
  body: string;
}
export interface ProcessStep {
  title: string;
  body: string;
  recibes: string;
}
// Bloque de confianza (cambio confianza-recomendacion, design.md decisión 1). Solo testimonios con autorización escrita.
export interface Testimonio {
  nombre: string;
  cargo: string;
  empresa: string;
  texto: string;
  destacado: boolean;
}
export interface Compromiso {
  titulo: string;
  texto: string;
}
export interface FaqItem {
  pregunta: string;
  respuesta: string; // admite enlaces internos [texto](/ruta) (lib/inlineLinks.ts)
}
// WhatsApp de contacto de Nubolabs (cambio cierre-landing-faq-cta, design.md decisión 8). Apagado por defecto.
export interface ContactConfig {
  whatsappNumber: string; // solo dígitos, con código de país
  showWhatsapp: boolean; // número en el pie de página
  showWhatsappQr: boolean; // tarjeta con QR junto al formulario
}
export interface SiteContent {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    tags: string[]; // 1 a 3 etiquetas bajo los botones (ver normalizeTags)
  };
  // Bajo el hero: texto puente o testimonios autorizados y compromisos (cambio confianza-recomendacion).
  confianza: { eyebrow: string; textoPuente: string; testimonios: Testimonio[]; compromisos: Compromiso[] /* siempre 3 */ };
  // Secciones de la portada del cambio lenguaje-sin-jerga (design.md decisión 1).
  problema: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { title: string }[]; // 1 a 8 dolores
    cierre: string; // admite **resalte**
    cierreCta: string; // texto del enlace a #resultados
  };
  resultados: { eyebrow: string; title: string; subtitle: string; items: TextItem[] /* siempre 4 */; cierre: string };
  enfoque: { eyebrow: string; title: string; body: string; items: TextItem[] /* siempre 3 */ };
  servicios: {
    eyebrow: string;
    title: string;
    subtitle: string;
    destacado: { etiqueta: string; title: string; body: string; result: string; incluye: string[] /* 1 a 4 */ };
    items: ServiceItem[]; // 1 a 6
    acompanamiento: TextItem;
    notaTecnica: string; // único lugar de la portada donde se nombran herramientas; admite **resalte**
  };
  casos: { eyebrow: string; title: string; subtitle: string; items: CaseItem[] };
  proceso: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: ProcessStep[]; // siempre 4
    exito: { title: string; items: string[] /* 1 a 6 */ };
  };
  // Cierre de la portada (cambio cierre-landing-faq-cta, design.md decisión 1).
  faq: { eyebrow: string; title: string; items: FaqItem[] /* 1 a 10 */ };
  cierre: { eyebrow: string; title: string; body: string; cta: string };
  contact: ContactConfig;
  nosotros: { eyebrow: string; title: string; mision: string; vision: string; objetivos: string[] };
  equipo: { eyebrow: string; title: string; historia: string };
  // Página /privacidad (cambio formulario-minimo-consentimiento, design.md decisión 6). Párrafos separados por línea en blanco.
  privacidad: { titulo: string; texto: string };
}
export interface SiteConfig {
  visible: Record<string, boolean>;
  content: SiteContent;
}

// Secciones/páginas gobernadas por el toggle de visibilidad (orden = orden en la landing; design.md decisión 4).
export const SECTIONS: { key: string; label: string; hint: string }[] = [
  { key: "hero", label: "Inicio (Hero)", hint: "Encabezado principal del home" },
  { key: "confianza", label: "Confianza (Nos recomiendan)", hint: "Texto puente, testimonios y compromisos bajo el hero" },
  { key: "problema", label: "¿Te suena?", hint: "Los dolores del día a día" },
  { key: "resultados", label: "Lo que ganas", hint: "Los 4 resultados para tu negocio" },
  { key: "enfoque", label: "Enfoque", hint: "Primero ordenamos, después automatizamos" },
  { key: "servicios", label: "Servicios", hint: "Qué hacemos por tu negocio" },
  { key: "casos", label: "Ejemplos", hint: "Ejemplos concretos" },
  { key: "proceso", label: "Cómo trabajamos", hint: "Los 4 pasos y lo que recibes" },
  { key: "contacto", label: "Contacto", hint: "Formulario de contacto del home" },
  { key: "faq", label: "Preguntas frecuentes", hint: "Dudas típicas antes de agendar" },
  { key: "cierre", label: "CTA final", hint: "Banda final con el botón para agendar" },
  { key: "nosotros", label: "Nosotros — Misión y visión (página)", hint: "Página /mision-vision y su link en el menú" },
  { key: "equipo", label: "Nuestro equipo (página)", hint: "Página /equipo y su link en el menú" },
];

// Borrador de la política de privacidad (Ley 21.719). Lo valida O&A o un abogado antes del 1-dic-2026;
// mientras tanto se edita desde /admin/config → Privacidad.
const PRIVACY_DRAFT = [
  "Esta página explica cómo Nubolabs cuida los datos que nos entregas en nubolabs.cl. Es un borrador en revisión legal.",
  "Responsable. Nubolabs es responsable del tratamiento de tus datos. Para cualquier consulta sobre privacidad, escríbenos a mauricio.nubolabs@gmail.com.",
  "Qué datos guardamos. Tu nombre, correo, WhatsApp, empresa, rubro, lo que quieres lograr y el mensaje que nos dejes. Si haces el diagnóstico, también tus respuestas.",
  "Para qué los usamos. Para responder tu solicitud y coordinar tu diagnóstico. Solo te enviaremos ideas y novedades si marcas esa casilla.",
  "Quién más los trata. El sitio está alojado en Vercel, guardamos los datos en Google Firebase y enviamos los correos con Resend. Los tres tienen servidores fuera de Chile, así que tus datos se transfieren al extranjero para prestar el servicio.",
  "Cuánto tiempo los guardamos. Hasta 24 meses desde nuestro último contacto, o antes si nos pides borrarlos.",
  "Tus derechos. Puedes pedir acceso a tus datos, rectificarlos, suprimirlos, oponerte a su uso, pedir su portabilidad o su bloqueo. Escríbenos a mauricio.nubolabs@gmail.com y te respondemos en un plazo máximo de 30 días corridos. Si no quedas conforme con la respuesta, puedes reclamar ante la Agencia de Protección de Datos Personales.",
  "Novedades. Si aceptaste recibir novedades, puedes retirar ese consentimiento cuando quieras escribiéndonos al mismo correo.",
].join("\n\n");

// ── Defaults (fallback si Firestore no tiene overrides) ──────────────
// Textos de la HDU-08 (§2, §3, §5.1) y de docs/design/propuesta-web-hdu-08.html. Sin jerga técnica ni "pyme":
// lo prueba lib/siteConfig.sections.test.ts (design.md decisión 7).
export function defaultSiteConfig(): SiteConfig {
  return {
    visible: Object.fromEntries(SECTIONS.map((s) => [s.key, true])),
    content: {
      // Mensaje orientado a resultados de negocio (HDU-08 §2, spec landing/hero). Sin "horas", "IA", "nube" ni
      // "automatización". Sin etiqueta superior por defecto: no se limita el público a pymes (design.md decisión 5b).
      hero: {
        eyebrow: "",
        title: "Que tu negocio **trabaje para ti**, no al revés.",
        subtitle:
          "Ordenamos cómo funciona tu empresa y dejamos andando solas las tareas que hoy te frenan: cotizaciones, cobranzas, pedidos, reportes y respuestas a clientes. Tú nos dices qué quieres lograr; nosotros lo dejamos funcionando.",
        ctaPrimary: "Quiero mi diagnóstico gratis",
        ctaSecondary: "Ver cómo trabajamos",
        tags: ["30 minutos, gratis y sin compromiso", "Sin cambiar tus sistemas", "Respuesta en menos de 24 horas"],
      },
      // Sin testimonios por defecto: solo se publican con autorización escrita, cargados desde el admin.
      confianza: {
        eyebrow: "Nos recomiendan",
        textoPuente: "Trabajamos con estudios contables y empresas que nos recomiendan a sus clientes.",
        testimonios: [],
        compromisos: [
          { titulo: "Primera sesión gratis", texto: "30 minutos por videollamada, sin compromiso." },
          { titulo: "Con lo que ya usas", texto: "WhatsApp, correo, planillas y tu sistema de facturación." },
          { titulo: "Sin letra chica", texto: "Plan por etapas y costos claros antes de partir." },
        ],
      },
      problema: {
        eyebrow: "El día a día",
        title: "¿Te suena?",
        subtitle:
          "Son las cosas que frenan a casi todos los negocios que conocemos. Ninguna se arregla trabajando más; se arreglan ordenando cómo se hacen.",
        items: [
          { title: "Respondes WhatsApp a las 11 de la noche." },
          { title: "Una cotización tarda días y el cliente se va con otro." },
          { title: "Fin de mes es perseguir pagos y juntar papeles para el contador." },
          { title: "No sabes cuánto ganaste hasta que alguien arma la planilla." },
          { title: "Todo depende de que alguien se acuerde." },
          { title: "Si alguien falta, nadie sabe en qué estaba." },
        ],
        cierre: "No es falta de ganas: **tu negocio creció y la forma de trabajar no.**",
        cierreCta: "Mira lo que cambia",
      },
      resultados: {
        eyebrow: "Lo que ganas",
        title: "Resultados que se notan en tu negocio, no solo en una planilla.",
        subtitle: "No vendemos herramientas. Partimos por lo que tú quieres lograr y lo dejamos funcionando.",
        items: [
          {
            title: "Vendes más",
            body: "Respondes al instante, cotizas el mismo día y ningún cliente se queda sin seguimiento.",
          },
          {
            title: "Tienes el control",
            body: "Ventas, gastos, cobranzas y pendientes al día, en tu celular, sin pedirle un informe a nadie.",
          },
          {
            title: "Nada se olvida",
            body: "Cobros, plazos, pedidos y papeles que avanzan solos y a tiempo. Menos errores, menos sustos.",
          },
          {
            title: "Creces sin desordenarte",
            body: "Atiendes más clientes sin que tu equipo colapse ni tengas que contratar al mismo ritmo.",
          },
        ],
        cierre: "Y tu equipo deja la pega repetitiva para dedicarse a lo que de verdad hace crecer tu negocio.",
      },
      enfoque: {
        eyebrow: "Nuestro sello",
        title: "Primero ordenamos, después automatizamos.",
        body: "Automatizar el desorden solo lo hace más rápido. Por eso partimos entendiendo cómo trabajas, sacamos los pasos que sobran y recién ahí dejamos funcionando solo lo que vale la pena.",
        items: [
          { title: "Entendemos cómo trabajas", body: "Tu negocio, tus clientes, tus herramientas." },
          { title: "Sacamos lo que sobra", body: "Menos pasos, menos idas y vueltas." },
          { title: "Dejamos funcionando lo que vale la pena", body: "Solo donde tu negocio gana de verdad." },
        ],
      },
      servicios: {
        eyebrow: "Servicios",
        title: "Lo que hacemos por tu negocio",
        subtitle: "Cada servicio parte de lo que quieres lograr. La tecnología es solo el medio.",
        destacado: {
          etiqueta: "Empieza aquí · primera sesión gratis",
          title: "Diagnóstico y plan de mejora",
          body: "Conversamos 30 minutos sobre tu negocio y te mostramos dónde está tu mayor oportunidad: qué ordenar, qué dejar funcionando solo y por dónde partir.",
          result: "Sabes qué hacer primero y por qué.",
          incluye: ["Sesión de 30 min, sin costo", "Resumen con tus prioridades", "Plan por etapas con costos claros"],
        },
        items: [
          {
            title: "Tareas que avanzan solas",
            body: "Cotizaciones, cobranzas, pedidos a proveedores, recordatorios y traspaso de datos entre planillas: lo que hoy depende de alguien, pasa solo.",
            result: "Nada se olvida y hay menos errores.",
          },
          {
            title: "Clientes atendidos al instante",
            body: "Asistentes que responden WhatsApp y correo, agendan, toman pedidos y hacen seguimiento con el tono de tu negocio. Si hace falta una persona, te avisan.",
            result: "Más ventas y clientes que vuelven.",
          },
          {
            title: "Tus números claros, siempre",
            body: "Ventas, gastos, márgenes y cobranzas en un panel simple o en un reporte que te llega solo. Tu contador recibe la información del mes lista.",
            result: "Decides con datos, no a ciegas.",
          },
          {
            title: "Herramientas a tu medida",
            body: "Cuando lo que existe no calza, construimos algo simple para tu forma de trabajar: portal de solicitudes, control de obras, agenda de taller.",
            result: "Creces sin desordenarte.",
          },
        ],
        acompanamiento: {
          title: "Acompañamiento mensual",
          body: "Soporte, ajustes y nuevas mejoras cada mes. No te dejamos solo con la tecnología.",
        },
        notaTecnica:
          "**Cómo lo hacemos:** con herramientas probadas de automatización e inteligencia artificial (como n8n y Make), conectadas a lo que ya usas: WhatsApp, correo, Excel o Google Sheets y tu sistema de facturación. Sin cambiar tus sistemas.",
      },
      // Casos sin jerga (design.md decisión 6, tabla de HDU-02). El rediseño por rubro es HDU-05.
      casos: {
        eyebrow: "Ejemplos",
        title: "Ejemplos concretos",
        subtitle: "Ejemplos reales de lo que dejamos funcionando en empresas como la tuya.",
        items: [
          { title: "Correos ordenados solos", body: "Se clasifican y responden sin que nadie los revise uno por uno." },
          { title: "Cotizaciones e informes listos", body: "Documentos y minutas que se arman solos desde tus datos." },
          { title: "Cobranzas al día", body: "Recordatorios de pago y seguimiento a clientes que salen a tiempo, sin planillas." },
          { title: "Tus números en un reporte", body: "Ventas, gastos y pendientes en un reporte que te llega solo." },
          { title: "Respuestas automáticas por WhatsApp y correo", body: "Consultas, reservas y pedidos respondidos al instante, incluso de noche." },
          { title: "Solicitudes y aprobaciones sin cadenas de correos", body: "Cada solicitud llega a quien la aprueba y sabes en qué va." },
        ],
      },
      proceso: {
        eyebrow: "Cómo trabajamos contigo",
        title: "Cuatro pasos, sin letra chica",
        subtitle: "Avanzas a tu ritmo y en cada paso sabes qué recibes.",
        items: [
          {
            title: "Conversamos",
            body: "30 minutos, gratis. Nos cuentas cómo funciona tu negocio y qué te gustaría lograr.",
            recibes: "Un resumen con tus prioridades.",
          },
          {
            title: "Ordenamos y proponemos",
            body: "Vemos cómo se hacen hoy las cosas, sacamos lo que sobra y te proponemos un plan por etapas.",
            recibes: "Plan y presupuesto claros, sin letra chica.",
          },
          {
            title: "Lo dejamos funcionando",
            body: "Con lo que ya usas, partiendo por lo que más impacto tiene, y enseñándole a tu equipo.",
            recibes: "La mejora andando y tu equipo usándola.",
          },
          {
            title: "Medimos y mejoramos",
            body: "Seguimos los resultados que tú elegiste y vamos sumando mejoras.",
            recibes: "Un reporte simple de resultados y nuevas ideas.",
          },
        ],
        exito: {
          title: "Tú defines qué es éxito:",
          items: ["Más ventas", "Cobros al día", "Respuestas más rápidas", "Menos errores", "Más control"],
        },
      },
      // Textos de la referencia HDU-08. La respuesta sobre datos la valida O&A o un abogado junto con /privacidad.
      faq: {
        eyebrow: "Preguntas frecuentes",
        title: "Lo que nos preguntan antes de partir",
        items: [
          {
            pregunta: "¿Necesito saber de tecnología?",
            respuesta:
              "No. Tú nos cuentas cómo funciona tu negocio; nosotros nos encargamos de lo técnico y le enseñamos a tu equipo lo justo para usarlo.",
          },
          {
            pregunta: "¿Tengo que cambiar mis sistemas?",
            respuesta:
              "No. Trabajamos con lo que ya usas: WhatsApp, correo, Excel o Google Sheets y tu sistema de facturación. Solo proponemos algo nuevo si de verdad te conviene.",
          },
          {
            pregunta: "¿Cuánto cuesta?",
            respuesta:
              "Depende de lo que quieras lograr. La primera sesión es gratis y sales con un plan por etapas y costos claros, para que decidas sin presión.",
          },
          {
            pregunta: "¿Qué pasa en la sesión gratuita?",
            respuesta:
              "Conversamos 30 minutos por videollamada sobre tu negocio y lo que quieres mejorar. Te llevas tus prioridades y una recomendación de por dónde partir.",
          },
          {
            pregunta: "¿Cuándo voy a ver resultados?",
            respuesta:
              "Partimos por la mejora que más impacto tiene para que la notes pronto. En la sesión te damos plazos concretos para tu caso, sin promesas en el aire.",
          },
          {
            pregunta: "¿Qué hacen con mis datos?",
            respuesta:
              "Los usamos solo para responder tu solicitud y, si nos das permiso, para enviarte novedades. No los vendemos ni los compartimos con fines comerciales. Puedes pedir verlos, corregirlos o borrarlos cuando quieras. [Política de privacidad completa](/privacidad)",
          },
        ],
      },
      cierre: {
        eyebrow: "Tu operación, en piloto automático",
        title: "Tu negocio puede trabajar para ti. Empecemos por una conversación.",
        body: "Cuéntanos qué quieres lograr y te mostramos por dónde partir.",
        cta: "Agendar mi diagnóstico gratis",
      },
      contact: { whatsappNumber: "56932590783", showWhatsapp: false, showWhatsappQr: false },
      nosotros: {
        eyebrow: "NOSOTROS",
        title: "Misión, visión y objetivos",
        mision:
          "Ayudar a las empresas a operar en piloto automático: rediseñamos sus procesos y los convertimos en automatizaciones con inteligencia artificial que ahorran horas, reducen errores y liberan al equipo para lo que realmente importa.",
        vision:
          "Ser el socio de automatización de referencia en Chile y Latinoamérica: que operar con procesos automatizados e IA deje de ser un lujo y se vuelva el estándar de cualquier organización que quiere crecer.",
        objetivos: [
          "Entregar un diagnóstico claro y accionable desde la primera sesión.",
          "Automatizar solo lo que genera retorno real, tras simplificar el proceso.",
          "Reducir tareas manuales y errores con soluciones a la medida.",
          "Medir el impacto en horas ahorradas y trazabilidad.",
          "Acompañar a cada cliente en la mejora continua y la escala.",
        ],
      },
      equipo: {
        eyebrow: "NUESTRO EQUIPO",
        title: "Las personas detrás de Nubolabs",
        historia:
          "Somos un equipo que combina rediseño de procesos, ingeniería e inteligencia artificial. Nos obsesiona que la tecnología resuelva problemas reales de operación: menos tareas manuales, menos errores y más tiempo para lo que importa.",
      },
      privacidad: {
        titulo: "Cómo cuidamos tus datos",
        texto: PRIVACY_DRAFT,
      },
    },
  };
}

// Etiquetas del hero guardadas en el CMS: recorta, descarta vacías y no-strings y deja máximo 3.
// Devuelve null si el valor no sirve (no es arreglo o queda vacío), para caer a los defaults.
export function normalizeTags(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const tags = value
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 3);
  return tags.length > 0 ? tags : null;
}

// Un texto guardado en el CMS solo se usa si es string con contenido; si no (null, número, objeto, vacío), va el
// default. Evita que un dato con forma inesperada tumbe la portada (revisión adversarial de mensaje-principal-pyme).
function pickText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

// Igual que pickText, pero recorta: para los textos dentro de listas.
function pickTrim(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Visibilidad: solo valores booleanos guardados ganan; cualquier otra cosa (null, texto) usa el default. Así la portada,
// el menú y el admin leen lo mismo (revisión adversarial de lenguaje-sin-jerga).
function mergeVisible(base: Record<string, boolean>, stored: unknown): Record<string, boolean> {
  const out = { ...base };
  for (const [k, v] of Object.entries(asRecord(stored))) {
    if (typeof v === "boolean") out[k] = v;
  }
  return out;
}

type MergeItem<T> = (raw: Record<string, unknown>, fallback: T) => T;

// Lista de largo fijo (las ilustraciones y el diseño dependen de la posición; design.md decisión 2): devuelve siempre
// defaults.length ítems. En cada posición mezcla el ítem guardado sobre el default de esa posición, campo a campo;
// si en esa posición no hay un objeto, va el default completo. Lo que sobra se descarta.
export function mergeFixedList<T>(stored: unknown, defaults: T[], mergeItem: MergeItem<T>): T[] {
  if (!Array.isArray(stored)) return defaults;
  return defaults.map((fallback, i) => (isRecord(stored[i]) ? mergeItem(stored[i] as Record<string, unknown>, fallback) : fallback));
}

// Lista de largo variable: un ítem es válido si es objeto con "title" no vacío (o según `isValid`). Si el valor no es arreglo o quedan
// menos de `min` válidos, se usan los defaults. Los campos vacíos de un ítem válido toman los de `blank` (no los de
// otra posición, que no corresponden a ese ítem). Se corta en `max`.
export function mergeList<T>(
  stored: unknown,
  defaults: T[],
  { min, max }: { min: number; max: number },
  mergeItem: MergeItem<T>,
  blank: T,
  isValid: (raw: Record<string, unknown>) => boolean = (raw) => pickTrim(raw.title, "") !== "",
): T[] {
  if (!Array.isArray(stored)) return defaults;
  const valid = stored.filter((raw): raw is Record<string, unknown> => isRecord(raw) && isValid(raw));
  if (valid.length < min) return defaults;
  return valid.slice(0, max).map((raw) => mergeItem(raw, blank));
}

// Lista de textos (incluye del destacado, ejemplos de éxito): recorta, descarta vacíos y no-strings.
function mergeTextList(stored: unknown, defaults: string[], { min, max }: { min: number; max: number }): string[] {
  if (!Array.isArray(stored)) return defaults;
  const texts = stored.map((t) => pickTrim(t, "")).filter((t) => t !== "");
  return texts.length < min ? defaults : texts.slice(0, max);
}

const mergeTitle: MergeItem<{ title: string }> = (raw, fb) => ({ title: pickTrim(raw.title, fb.title) });
const mergeTextItem: MergeItem<TextItem> = (raw, fb) => ({
  title: pickTrim(raw.title, fb.title),
  body: pickTrim(raw.body, fb.body),
});
const mergeService: MergeItem<ServiceItem> = (raw, fb) => ({
  title: pickTrim(raw.title, fb.title),
  body: pickTrim(raw.body, fb.body),
  result: pickTrim(raw.result, fb.result),
});
const mergeStep: MergeItem<ProcessStep> = (raw, fb) => ({
  title: pickTrim(raw.title, fb.title),
  body: pickTrim(raw.body, fb.body),
  recibes: pickTrim(raw.recibes, fb.recibes),
});

const mergeFaq: MergeItem<FaqItem> = (raw, fb) => ({
  pregunta: pickTrim(raw.pregunta, fb.pregunta),
  respuesta: pickTrim(raw.respuesta, fb.respuesta),
});
const isCompleteFaq = (raw: Record<string, unknown>) => pickTrim(raw.pregunta, "") !== "" && pickTrim(raw.respuesta, "") !== "";

// ── Confianza (cambio confianza-recomendacion, design.md decisión 2) ──
// Testimonios guardados: textos recortados, `destacado` solo con true exacto; sin nombre o sin texto no se publica.
// Una lista vacía es válida (el bloque muestra el texto puente): no cae a ningún default.
// Si hay más de un destacado (documento editado a mano), solo vale el primero: así la portada y el admin coinciden.
export function normalizeTestimonios(value: unknown): Testimonio[] {
  if (!Array.isArray(value)) return [];
  let hasDestacado = false;
  return value
    .filter(isRecord)
    .map((raw) => ({
      nombre: pickTrim(raw.nombre, ""),
      cargo: pickTrim(raw.cargo, ""),
      empresa: pickTrim(raw.empresa, ""),
      texto: pickTrim(raw.texto, ""),
      destacado: raw.destacado === true,
    }))
    .filter((t) => t.nombre !== "" && t.texto !== "")
    .map((t) => {
      const destacado = t.destacado && !hasDestacado;
      if (destacado) hasDestacado = true;
      return { ...t, destacado };
    });
}

// Compromisos: siempre 3 por posición (el ícono depende de ella), con mergeFixedList como resultados y proceso:
// un título o texto vacío toma el de esa posición (revisión adversarial de confianza-recomendacion).
const mergeCompromiso: MergeItem<Compromiso> = (raw, fb) => ({
  titulo: pickTrim(raw.titulo, fb.titulo),
  texto: pickTrim(raw.texto, fb.texto),
});

// Qué se muestra: el primer destacado (o el primero) en el panel y los siguientes, en orden, hasta 3 en total.
export function pickTestimonios(list: Testimonio[]): { principal: Testimonio | null; resto: Testimonio[] } {
  if (list.length === 0) return { principal: null, resto: [] };
  const i = Math.max(0, list.findIndex((t) => t.destacado));
  const principal = list[i];
  const resto = list.filter((_, j) => j !== i).slice(0, 2);
  return { principal, resto };
}

// Iniciales para el avatar: la primera letra de las dos primeras palabras que tengan letras, en mayúscula. Se
// compone el texto (NFC) y se buscan letras Unicode, para no cortar emojis ni tildes escritas por separado.
export function initials(nombre: string): string {
  return nombre
    .normalize("NFC")
    .split(/\s+/)
    .map((w) => w.match(/\p{L}/u)?.[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .map((l) => l.toLocaleUpperCase("es-CL"))
    .join("");
}

// Cita breve de la sección de agendar: el testimonio principal, solo si el bloque de confianza está visible.
export function contactQuote(visible: Record<string, boolean>, confianza: SiteContent["confianza"]): Testimonio | null {
  if (visible.confianza === false) return null;
  return pickTestimonios(confianza.testimonios).principal;
}

const DEFAULT_WHATSAPP = "56932590783";

// WhatsApp guardado en el CMS: un número guardado como texto queda solo con sus dígitos, aunque no quede ninguno
// (entonces whatsappLink no muestra nada); el default solo se usa si no hay un texto guardado. Cada interruptor es
// true solo si se guardó exactamente true (design.md decisión 8; revisión adversarial: borrar el número no debe
// volver a publicar el número por defecto).
export function normalizeContact(value: unknown): ContactConfig {
  const raw = asRecord(value);
  return {
    whatsappNumber: typeof raw.whatsappNumber === "string" ? raw.whatsappNumber.replace(/\D/g, "") : DEFAULT_WHATSAPP,
    showWhatsapp: raw.showWhatsapp === true,
    showWhatsappQr: raw.showWhatsappQr === true,
  };
}

// 56912345678 → "+56 9 1234 5678" (celular de Chile); otros números → "+" y los dígitos.
export function formatWhatsapp(digits: string): string {
  return /^569\d{8}$/.test(digits) ? `+56 9 ${digits.slice(3, 7)} ${digits.slice(7)}` : `+${digits}`;
}

// Enlace a WhatsApp para el pie ("footer") o la tarjeta con QR ("qr"). null si ese interruptor está apagado o el
// número no tiene entre 8 y 15 dígitos: así nada se muestra con un número inválido.
export function whatsappLink(contact: ContactConfig, where: "footer" | "qr" = "footer"): { label: string; url: string } | null {
  const on = where === "footer" ? contact.showWhatsapp : contact.showWhatsappQr;
  const digits = contact.whatsappNumber.replace(/\D/g, "");
  if (!on || digits.length < 8 || digits.length > 15) return null;
  return { label: formatWhatsapp(digits), url: `https://wa.me/${digits}` };
}

// Mezcla lo guardado en config/site sobre los defaults. Cada campo guardado válido gana sobre su default.
export function mergeConfig(base: SiteConfig, data: Record<string, unknown>): SiteConfig {
  const c = asRecord(data.content);
  const b = base.content;
  const hero = asRecord(c.hero);
  const problema = asRecord(c.problema);
  const resultados = asRecord(c.resultados);
  const enfoque = asRecord(c.enfoque);
  const servicios = asRecord(c.servicios);
  const destacado = asRecord(servicios.destacado);
  const acompanamiento = asRecord(servicios.acompanamiento);
  const casos = asRecord(c.casos);
  const proceso = asRecord(c.proceso);
  const exito = asRecord(proceso.exito);
  const faq = asRecord(c.faq);
  const confianza = asRecord(c.confianza);
  const cierre = asRecord(c.cierre);
  const nosotros = c.nosotros as Partial<SiteContent["nosotros"]> | undefined;
  const equipo = c.equipo as Partial<SiteContent["equipo"]> | undefined;
  return {
    visible: mergeVisible(base.visible, data.visible),
    content: {
      hero: {
        eyebrow: pickText(hero.eyebrow, b.hero.eyebrow),
        title: pickText(hero.title, b.hero.title),
        subtitle: pickText(hero.subtitle, b.hero.subtitle),
        ctaPrimary: pickText(hero.ctaPrimary, b.hero.ctaPrimary),
        ctaSecondary: pickText(hero.ctaSecondary, b.hero.ctaSecondary),
        tags: normalizeTags(hero.tags) ?? b.hero.tags,
      },
      confianza: {
        eyebrow: pickText(confianza.eyebrow, b.confianza.eyebrow),
        textoPuente: pickText(confianza.textoPuente, b.confianza.textoPuente),
        testimonios: normalizeTestimonios(confianza.testimonios),
        compromisos: mergeFixedList(confianza.compromisos, b.confianza.compromisos, mergeCompromiso),
      },
      problema: {
        eyebrow: pickText(problema.eyebrow, b.problema.eyebrow),
        title: pickText(problema.title, b.problema.title),
        subtitle: pickText(problema.subtitle, b.problema.subtitle),
        items: mergeList(problema.items, b.problema.items, { min: 1, max: 8 }, mergeTitle, { title: "" }),
        cierre: pickText(problema.cierre, b.problema.cierre),
        cierreCta: pickText(problema.cierreCta, b.problema.cierreCta),
      },
      resultados: {
        eyebrow: pickText(resultados.eyebrow, b.resultados.eyebrow),
        title: pickText(resultados.title, b.resultados.title),
        subtitle: pickText(resultados.subtitle, b.resultados.subtitle),
        items: mergeFixedList(resultados.items, b.resultados.items, mergeTextItem),
        cierre: pickText(resultados.cierre, b.resultados.cierre),
      },
      enfoque: {
        eyebrow: pickText(enfoque.eyebrow, b.enfoque.eyebrow),
        title: pickText(enfoque.title, b.enfoque.title),
        body: pickText(enfoque.body, b.enfoque.body),
        items: mergeFixedList(enfoque.items, b.enfoque.items, mergeTextItem),
      },
      servicios: {
        eyebrow: pickText(servicios.eyebrow, b.servicios.eyebrow),
        title: pickText(servicios.title, b.servicios.title),
        subtitle: pickText(servicios.subtitle, b.servicios.subtitle),
        destacado: {
          etiqueta: pickText(destacado.etiqueta, b.servicios.destacado.etiqueta),
          title: pickText(destacado.title, b.servicios.destacado.title),
          body: pickText(destacado.body, b.servicios.destacado.body),
          result: pickText(destacado.result, b.servicios.destacado.result),
          incluye: mergeTextList(destacado.incluye, b.servicios.destacado.incluye, { min: 1, max: 4 }),
        },
        items: mergeList(servicios.items, b.servicios.items, { min: 1, max: 6 }, mergeService, {
          title: "",
          body: "",
          result: "",
        }),
        acompanamiento: {
          title: pickText(acompanamiento.title, b.servicios.acompanamiento.title),
          body: pickText(acompanamiento.body, b.servicios.acompanamiento.body),
        },
        notaTecnica: pickText(servicios.notaTecnica, b.servicios.notaTecnica),
      },
      casos: {
        eyebrow: pickText(casos.eyebrow, b.casos.eyebrow),
        title: pickText(casos.title, b.casos.title),
        subtitle: pickText(casos.subtitle, b.casos.subtitle),
        items: mergeList(casos.items, b.casos.items, { min: 1, max: 12 }, mergeTextItem, { title: "", body: "" }),
      },
      proceso: {
        eyebrow: pickText(proceso.eyebrow, b.proceso.eyebrow),
        title: pickText(proceso.title, b.proceso.title),
        subtitle: pickText(proceso.subtitle, b.proceso.subtitle),
        items: mergeFixedList(proceso.items, b.proceso.items, mergeStep),
        exito: {
          title: pickText(exito.title, b.proceso.exito.title),
          items: mergeTextList(exito.items, b.proceso.exito.items, { min: 1, max: 6 }),
        },
      },
      faq: {
        eyebrow: pickText(faq.eyebrow, b.faq.eyebrow),
        title: pickText(faq.title, b.faq.title),
        items: mergeList(faq.items, b.faq.items, { min: 1, max: 10 }, mergeFaq, { pregunta: "", respuesta: "" }, isCompleteFaq),
      },
      cierre: {
        eyebrow: pickText(cierre.eyebrow, b.cierre.eyebrow),
        title: pickText(cierre.title, b.cierre.title),
        body: pickText(cierre.body, b.cierre.body),
        cta: pickText(cierre.cta, b.cierre.cta),
      },
      contact: normalizeContact(c.contact),
      nosotros: {
        ...b.nosotros,
        ...(nosotros ?? {}),
        objetivos: nosotros?.objetivos ?? b.nosotros.objetivos,
      },
      equipo: { ...b.equipo, ...(equipo ?? {}) },
      // Un título o texto vacío cae al borrador, para no publicar una página en blanco.
      privacidad: {
        titulo: pickText(asRecord(c.privacidad).titulo, b.privacidad.titulo),
        texto: pickText(asRecord(c.privacidad).texto, b.privacidad.texto),
      },
    },
  };
}

// Renderiza texto con **resaltado** → partes { hl } que el componente pinta destacadas. Devuelve nodos.
export function renderHighlight(text: string): (string | { hl: string })[] {
  const parts: (string | { hl: string })[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ hl: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
