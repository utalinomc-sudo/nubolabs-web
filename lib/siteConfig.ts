// Configuración pura del sitio: tipos, secciones, defaults y mezcla con lo guardado en Firestore (config/site).
// Sin "server-only" para poder usarla en tests y en el admin (cliente). La lectura de Firestore vive en lib/site.ts.
import { INDUSTRIES, type IndustryKey } from "@/lib/leadOptions";

// ── Tipos ────────────────────────────────────────────────────────────
export interface ServiceItem {
  title: string;
  body: string;
  result: string; // se muestra como "lo que ganas"
}
// Rubro de un caso (cambio casos-por-rubro, design.md decisión 1): los del formulario de contacto sin "otro", o "todos".
export type CaseRubroKey = Exclude<IndustryKey, "otro">;
export type CaseRubro = CaseRubroKey | "todos";
export const CASE_RUBROS = INDUSTRIES.filter(
  (i): i is { key: CaseRubroKey; label: string } => i.key !== "otro",
) as readonly { key: CaseRubroKey; label: string }[];
export interface CaseItem {
  title: string; // texto principal (la frase del caso)
  body: string; // detalle opcional
  rubro: CaseRubro;
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
// Cifra de resultados (cambio cifras-con-respaldo): solo se publica con valor, texto y fuente.
export interface Cifra {
  valor: string;
  texto: string;
  fuente: string;
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
    notaTecnica: string; // cierra Servicios explicando cómo trabajamos, sin nombrar herramientas; admite **resalte**
  };
  casos: { eyebrow: string; title: string; subtitle: string; items: CaseItem[] };
  // Oculta por defecto; sin cifras válidas muestra la frase (cambio cifras-con-respaldo).
  cifras: { items: Cifra[]; frase: string };
  proceso: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: ProcessStep[]; // siempre 4
    exito: { title: string; items: string[] /* 1 a 6 */ };
  };
  // Bloque que invita al autodiagnóstico (cambio diagnostico-mapa-oportunidades, design.md decisión 8).
  autodiagnostico: { eyebrow: string; title: string; body: string; cta: string };
  // Cierre de la portada (cambio cierre-landing-faq-cta, design.md decisión 1).
  faq: { eyebrow: string; title: string; items: FaqItem[] /* 1 a 10 */ };
  cierre: { eyebrow: string; title: string; body: string; cta: string };
  contact: ContactConfig;
  nosotros: { eyebrow: string; title: string; mision: string; vision: string; objetivos: string[] };
  equipo: { eyebrow: string; title: string; historia: string };
  // Página /privacidad (cambio formulario-minimo-consentimiento, design.md decisión 6). Párrafos separados por línea en blanco.
  privacidad: { titulo: string; texto: string };
  // Franja de bienvenida de /oa (cambio landing-referidos-oa, design.md decisión 6). No es una sección de SECTIONS:
  // solo se muestra en las visitas referidas.
  referidos: { oa: { titulo: string; texto: string } };
}
export interface SiteConfig {
  visible: Record<string, boolean>;
  content: SiteContent;
}

// Secciones/páginas gobernadas por el toggle de visibilidad (orden = orden en la landing; design.md decisión 4).
// `defaultHidden`: la sección parte oculta (solo "cifras", hasta tener datos reales con fuente).
export const SECTIONS: { key: string; label: string; hint: string; defaultHidden?: boolean }[] = [
  { key: "hero", label: "Inicio (Hero)", hint: "Encabezado principal del home" },
  { key: "confianza", label: "Confianza (Nos recomiendan)", hint: "Texto puente, testimonios y compromisos bajo el hero" },
  { key: "problema", label: "¿Te suena?", hint: "Los dolores del día a día" },
  { key: "resultados", label: "Lo que ganas", hint: "Los 4 resultados para tu negocio" },
  { key: "enfoque", label: "Enfoque", hint: "Primero entendemos tu problema, después construimos la solución" },
  { key: "servicios", label: "Servicios", hint: "Qué hacemos por tu negocio" },
  { key: "casos", label: "Ejemplos", hint: "Ejemplos por rubro con filtro" },
  { key: "cifras", label: "Cifras de resultados", hint: "Oculta hasta tener datos reales con fuente", defaultHidden: true },
  { key: "proceso", label: "Cómo trabajamos", hint: "Los 4 pasos y lo que recibes" },
  { key: "autodiagnostico", label: "Autodiagnóstico", hint: "Invitación al autodiagnóstico de 5 minutos, con un ejemplo del mapa" },
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
  "Qué datos guardamos. Tu nombre, correo, WhatsApp, empresa, rubro, lo que quieres lograr y el mensaje que nos dejes. Si haces el diagnóstico, también tus respuestas. Si llegaste recomendado por un aliado (por ejemplo, un asesor de tu empresa), guardamos también de quién vino la recomendación.",
  "Para qué los usamos. Para responder tu solicitud y coordinar tu diagnóstico. Solo te enviaremos ideas y novedades si marcas esa casilla.",
  "Quién más los trata. El sitio está alojado en Vercel, guardamos los datos en Google Firebase y enviamos los correos con Resend. Los tres tienen servidores fuera de Chile, así que tus datos se transfieren al extranjero para prestar el servicio.",
  "Cuánto tiempo los guardamos. Hasta 24 meses desde nuestro último contacto, o antes si nos pides borrarlos.",
  "Tus derechos. Puedes pedir acceso a tus datos, rectificarlos, suprimirlos, oponerte a su uso, pedir su portabilidad o su bloqueo. Escríbenos a mauricio.nubolabs@gmail.com y te respondemos en un plazo máximo de 30 días corridos. Si no quedas conforme con la respuesta, puedes reclamar ante la Agencia de Protección de Datos Personales.",
  "Novedades. Si aceptaste recibir novedades, puedes retirar ese consentimiento cuando quieras escribiéndonos al mismo correo.",
].join("\n\n");

// ── Defaults (fallback si Firestore no tiene overrides) ──────────────
// Textos del cambio enfoque-soluciones-a-medida (2026-10-29): soluciones a la medida del problema de cada cliente y
// datos para decidir. Sin jerga técnica, sin "pyme", sin herramientas ni canales concretos (WhatsApp, Excel, Google
// Sheets, n8n, Make, planillas) y sin servicios contables: lo prueba lib/siteConfig.sections.test.ts. Los textos
// exactos están en la spec de cada sección (openspec/specs/landing/*).
export function defaultSiteConfig(): SiteConfig {
  return {
    visible: Object.fromEntries(SECTIONS.map((s) => [s.key, !s.defaultHidden])),
    content: {
      // Mensaje del enfoque (spec landing/hero). Sin "horas", "IA", "nube" ni "automatización". Sin etiqueta superior
      // por defecto: no se limita el público a pymes (mensaje-principal-pyme, design.md decisión 5b).
      hero: {
        eyebrow: "",
        title: "Soluciones hechas para **tu negocio**, con datos para decidir mejor.",
        subtitle:
          "Cada empresa tiene problemas propios. Los identificamos contigo, construimos la solución que calza con tu forma de trabajar y te dejamos datos ordenados y reportes claros para decidir. Tú nos cuentas qué te frena; nosotros lo resolvemos.",
        ctaPrimary: "Quiero mi diagnóstico gratis",
        ctaSecondary: "Ver cómo trabajamos",
        tags: ["30 minutos, gratis y sin compromiso", "A la medida de tu negocio", "Respuesta en menos de 24 horas"],
      },
      // Sin testimonios por defecto: solo se publican con autorización escrita, cargados desde el admin.
      confianza: {
        eyebrow: "Nos recomiendan",
        textoPuente: "Trabajamos con empresas y asesores que nos recomiendan a sus clientes.",
        testimonios: [],
        compromisos: [
          { titulo: "Primera sesión gratis", texto: "30 minutos por videollamada, sin compromiso." },
          { titulo: "Hecho para tu negocio", texto: "Partimos de tu problema y trabajamos con lo que ya usas, sin cambiar tus sistemas." },
          { titulo: "Sin letra chica", texto: "Plan por etapas y costos claros antes de partir." },
        ],
      },
      problema: {
        eyebrow: "El día a día",
        title: "¿Te suena?",
        subtitle:
          "Cada negocio tiene los suyos, pero estos se repiten. Ninguno se arregla trabajando más: se arreglan con una solución pensada para tu caso y con datos claros.",
        items: [
          { title: "Decides a ojo porque los números llegan tarde o no cuadran." },
          { title: "Una cotización tarda días y el cliente se va con otro." },
          { title: "Fin de mes es perseguir pagos y armar informes a mano." },
          { title: "La información está repartida en varios lugares y nadie tiene la foto completa." },
          { title: "Todo depende de que alguien se acuerde." },
          { title: "Te ofrecen la misma solución que a todos, y tu negocio no funciona como todos." },
        ],
        cierre: "No es falta de ganas: **tu negocio creció y la forma de trabajar no.**",
        cierreCta: "Mira lo que cambia",
      },
      resultados: {
        eyebrow: "Lo que ganas",
        title: "Resultados que se notan en tu negocio y se ven en tus números.",
        subtitle:
          "No vendemos herramientas ni soluciones de catálogo. Partimos por tu problema y lo resolvemos con la información a la vista.",
        items: [
          {
            title: "Vendes más",
            body: "Respondes antes, cotizas el mismo día y ningún cliente se queda sin seguimiento.",
          },
          {
            title: "Decides con datos",
            body: "Ventas, costos, márgenes y pendientes al día en reportes claros, sin pedirle un informe a nadie.",
          },
          {
            title: "Nada se olvida",
            body: "Cobros, plazos, pedidos y documentos avanzan a tiempo, con aviso al responsable. Menos errores, menos sustos.",
          },
          {
            title: "Creces sin desordenarte",
            body: "Atiendes más clientes y más volumen sin que tu equipo colapse ni tengas que contratar al mismo ritmo.",
          },
        ],
        cierre: "Y tu equipo deja la pega repetitiva para dedicarse a lo que de verdad hace crecer tu negocio.",
      },
      enfoque: {
        eyebrow: "Nuestro sello",
        title: "Primero entendemos tu problema, después construimos la solución.",
        body: "Una solución genérica resuelve un problema genérico. Por eso partimos por entender cómo trabaja tu negocio y qué te frena de verdad, diseñamos lo que calza con esa realidad y lo dejamos entregando datos claros para que decidas mejor.",
        items: [
          { title: "Entendemos tu problema", body: "Tu negocio, tu equipo y lo que hoy te frena." },
          { title: "Diseñamos a tu medida", body: "La solución justa para tu forma de trabajar, sin piezas de más." },
          { title: "Te dejamos datos para decidir", body: "Reportes claros y al día, con tu equipo usándolos." },
        ],
      },
      servicios: {
        eyebrow: "Servicios",
        title: "Lo que hacemos por tu negocio",
        subtitle: "Cada servicio parte de un problema concreto tuyo. La tecnología es solo el medio.",
        destacado: {
          etiqueta: "Empieza aquí · primera sesión gratis",
          title: "Diagnóstico y plan de mejora",
          body: "Conversamos 30 minutos sobre tu negocio y te mostramos dónde está tu mayor oportunidad: qué problema atacar primero, qué solución calza y por dónde partir.",
          result: "Sabes qué hacer primero y por qué.",
          incluye: ["Sesión de 30 min, sin costo", "Resumen con tus prioridades", "Plan por etapas con costos claros"],
        },
        items: [
          {
            title: "Soluciones a tu medida",
            body: "Cuando lo que existe no calza con tu forma de trabajar, construimos lo justo: control de obras, agenda de taller, portal de solicitudes, seguimiento de pedidos. Pensado para tu problema, no para el promedio.",
            result: "Resuelves lo que de verdad te frena.",
          },
          {
            title: "Tareas que avanzan solas",
            body: "Cotizaciones, cobranzas, pedidos a proveedores, recordatorios y traspasos de información: lo que hoy depende de que alguien se acuerde, pasa solo y queda registrado.",
            result: "Nada se olvida y hay menos errores.",
          },
          {
            title: "Datos y reportes para decidir",
            body: "Ventas, costos, márgenes, cobranzas y pendientes en un panel simple o en un reporte que te llega solo, con la información de tu negocio al día.",
            result: "Decides con datos, no a ciegas.",
          },
          {
            title: "Información ordenada y conectada",
            body: "Juntamos lo que hoy está repartido en distintos sistemas y archivos en una sola fuente confiable, para que todo tu equipo trabaje con el mismo dato.",
            result: "Todos trabajan con el mismo dato.",
          },
        ],
        acompanamiento: {
          title: "Acompañamiento mensual",
          body: "Soporte, ajustes y nuevas mejoras cada mes. No te dejamos solo con la tecnología.",
        },
        // Cierra Servicios explicando cómo trabajamos, sin nombrar herramientas (spec landing/contenido-pyme).
        notaTecnica:
          "**Cómo lo hacemos:** partimos de tu problema, no de una herramienta. Diseñamos la solución para tu forma de trabajar, la conectamos con los sistemas que ya usas y la dejamos entregando datos ordenados y reportes claros. Sin cambiar tus sistemas.",
      },
      // Casos por rubro (cambio casos-por-rubro): una frase por caso, sin detalle y sin bajada.
      casos: {
        eyebrow: "Ejemplos por rubro",
        title: "Problemas concretos que resolvemos en negocios como el tuyo",
        subtitle: "",
        items: [
          { title: "Un reporte mensual con ventas, costos y márgenes que se arma solo.", body: "", rubro: "todos" },
          { title: "Cobranza con recordatorios amables y automáticos.", body: "", rubro: "todos" },
          { title: "Cotizaciones listas el mismo día.", body: "", rubro: "todos" },
          { title: "Reservas y pedidos en un solo lugar, con la ocupación del día a la vista.", body: "", rubro: "gastronomia" },
          { title: "Pedidos a proveedores según lo que de verdad queda en bodega.", body: "", rubro: "gastronomia" },
          { title: "Ventas del día y costo de insumos en tu celular al cierre.", body: "", rubro: "gastronomia" },
          { title: "Presupuestos de repuestos y mano de obra que se arman solos.", body: "", rubro: "automotriz" },
          { title: "Aviso al cliente cuando su auto está listo y recordatorio de su próxima mantención.", body: "", rubro: "automotriz" },
          { title: "Estados de pago y documentos de obra ordenados y enviados a tiempo.", body: "", rubro: "construccion" },
          { title: "Gastos por obra al día, sin copiar facturas a mano.", body: "", rubro: "construccion" },
          { title: "Plazos y vencimientos que nadie olvida, con aviso al responsable.", body: "", rubro: "servicios" },
          { title: "Informes a clientes que se preparan solos desde tus datos.", body: "", rubro: "servicios" },
          { title: "Stock y ventas al día, con aviso antes de quedarte sin producto.", body: "", rubro: "comercio" },
          { title: "Sabes qué productos dejan margen y cuáles no, antes de reponer.", body: "", rubro: "comercio" },
        ],
      },
      // Sin cifras de ejemplo: solo datos reales con su fuente, cargados desde el admin.
      cifras: {
        items: [],
        frase: "Medimos cada proyecto con los indicadores que tú elijas, y en el diagnóstico te mostramos los números de tu caso.",
      },
      proceso: {
        eyebrow: "Cómo trabajamos contigo",
        title: "Cuatro pasos, sin letra chica",
        subtitle: "Avanzas a tu ritmo y en cada paso sabes qué recibes.",
        items: [
          {
            title: "Conversamos",
            body: "30 minutos, gratis. Nos cuentas cómo funciona tu negocio y qué problema te gustaría resolver.",
            recibes: "Un resumen con tus prioridades.",
          },
          {
            title: "Entendemos y proponemos",
            body: "Vemos cómo se hacen hoy las cosas, dónde está el problema de fondo y te proponemos una solución por etapas.",
            recibes: "Plan y presupuesto claros, sin letra chica.",
          },
          {
            title: "Lo construimos y lo dejamos funcionando",
            body: "Pensado para cómo trabajas, conectado con lo que ya usas y enseñándole a tu equipo.",
            recibes: "La solución andando y tu equipo usándola.",
          },
          {
            title: "Medimos y mejoramos",
            body: "Seguimos los indicadores que tú elegiste, con reportes claros, y vamos sumando mejoras.",
            recibes: "Un reporte simple de resultados y nuevas ideas.",
          },
        ],
        exito: {
          title: "Tú defines qué es éxito:",
          items: ["Más ventas", "Cobros al día", "Decisiones con datos", "Menos errores", "Más control"],
        },
      },
      autodiagnostico: {
        eyebrow: "Autodiagnóstico · 5 minutos",
        title: "¿No sabes por dónde partir? Descubre dónde está tu mayor oportunidad.",
        body: "Responde unas preguntas simples sobre tu día a día y recibe tu mapa de oportunidades en PDF, al instante. Ideal para llegar con todo a la sesión gratuita.",
        cta: "Hacer el autodiagnóstico",
      },
      // La respuesta sobre datos la valida O&A o un abogado junto con /privacidad.
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
            pregunta: "¿Es una solución estándar o hecha para mi negocio?",
            respuesta:
              "Hecha para tu negocio. Partimos de tu problema y de cómo trabaja tu equipo; usamos piezas probadas donde conviene, pero la solución se arma para tu caso, no para el promedio.",
          },
          {
            pregunta: "¿Tengo que cambiar mis sistemas?",
            respuesta: "No. Nos conectamos con lo que ya usas y solo proponemos algo nuevo si de verdad te conviene.",
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
      // El eyebrow es el lema del sitio sin el punto final (siteSlogan en lib/content.ts).
      cierre: {
        eyebrow: "Soluciones a tu medida, decisiones con datos",
        title: "Tu negocio tiene su propio problema. Empecemos por entenderlo.",
        body: "Cuéntanos qué te frena y te mostramos por dónde partir.",
        cta: "Agendar mi diagnóstico gratis",
      },
      contact: { whatsappNumber: "56932590783", showWhatsapp: false, showWhatsappQr: false },
      nosotros: {
        eyebrow: "NOSOTROS",
        title: "Misión, visión y objetivos",
        mision:
          "Resolver los problemas concretos de cada empresa con soluciones hechas a su medida: entender cómo trabaja, diseñar lo que necesita y dejarle datos claros y reportes útiles para decidir mejor.",
        vision:
          "Ser el socio al que las empresas de Chile y Latinoamérica recurren cuando tienen un problema de operación que las soluciones genéricas no resuelven. Que decidir con buenos datos deje de ser un lujo y se vuelva el estándar de cualquier organización que quiere crecer.",
        objetivos: [
          "Entregar un diagnóstico claro y accionable desde la primera sesión.",
          "Diseñar cada solución a partir del problema real del cliente, no de un catálogo.",
          "Dejar en cada proyecto datos ordenados y reportes útiles para tomar decisiones.",
          "Medir el impacto con los indicadores que el cliente elige.",
          "Acompañar a cada cliente en la mejora continua y el crecimiento.",
        ],
      },
      equipo: {
        eyebrow: "NUESTRO EQUIPO",
        title: "Las personas detrás de Nubolabs",
        historia:
          "Somos un equipo que combina análisis de procesos, ingeniería y datos. Nos obsesiona que la tecnología resuelva problemas reales de cada negocio: soluciones que calzan con cómo se trabaja, información confiable y decisiones mejor tomadas.",
      },
      privacidad: {
        titulo: "Cómo cuidamos tus datos",
        texto: PRIVACY_DRAFT,
      },
      referidos: {
        oa: {
          titulo: "Bienvenido, cliente de Osorio & Asociados.",
          texto:
            "Osorio & Asociados nos recomendó porque resolvemos problemas concretos de empresas como la tuya, con soluciones a su medida y datos claros para decidir.",
        },
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
// Rubro guardado → rubro válido; ausente, desconocido u "otro" → "todos" (cambio casos-por-rubro, decisión 2).
export function normalizeCaseRubro(value: unknown): CaseRubro {
  return CASE_RUBROS.some((r) => r.key === value) ? (value as CaseRubroKey) : "todos";
}
const mergeCase: MergeItem<CaseItem> = (raw, fb) => ({
  title: pickTrim(raw.title, fb.title),
  body: pickTrim(raw.body, fb.body),
  rubro: normalizeCaseRubro(raw.rubro),
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

// ── Cifras (cambio cifras-con-respaldo, design.md decisión 2) ──
// Al leer se conservan también las incompletas, para que el admin pueda terminarlas.
export function normalizeCifras(value: unknown): Cifra[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((raw) => ({ valor: pickTrim(raw.valor, ""), texto: pickTrim(raw.texto, ""), fuente: pickTrim(raw.fuente, "") }));
}

// Un texto "tiene contenido" si trae al menos una letra o un dígito: así un espacio invisible pegado desde Word o
// WhatsApp (U+200B y similares) o un signo suelto ("." o "-") no cuentan como fuente (revisión adversarial).
export function hasContent(text: string): boolean {
  return /[\p{L}\p{N}]/u.test(text);
}

// Lo que se publica: solo con valor, texto y fuente con contenido; las 4 primeras, en el orden del CMS.
export function visibleCifras(items: Cifra[]): Cifra[] {
  return items.filter((c) => hasContent(c.valor) && hasContent(c.texto) && hasContent(c.fuente)).slice(0, 4);
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
  const autodiagnostico = asRecord(c.autodiagnostico);
  const confianza = asRecord(c.confianza);
  const cifras = asRecord(c.cifras);
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
        // Un caso vale si su texto principal tiene letras o números (sin invisibles ni solo signos; revisión adversarial).
        items: mergeList(casos.items, b.casos.items, { min: 1, max: 18 }, mergeCase, { title: "", body: "", rubro: "todos" }, (raw) =>
          hasContent(pickTrim(raw.title, "")),
        ),
      },
      cifras: {
        items: normalizeCifras(cifras.items),
        // Una frase guardada vacía se respeta (apaga la frase); si no hay texto guardado, va la de por defecto.
        frase: typeof cifras.frase === "string" ? cifras.frase.trim() : b.cifras.frase,
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
      autodiagnostico: {
        eyebrow: pickText(autodiagnostico.eyebrow, b.autodiagnostico.eyebrow),
        title: pickText(autodiagnostico.title, b.autodiagnostico.title),
        body: pickText(autodiagnostico.body, b.autodiagnostico.body),
        cta: pickText(autodiagnostico.cta, b.autodiagnostico.cta),
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
      // Cada texto vacío o que no es texto toma su default (franja de /oa).
      referidos: {
        oa: {
          titulo: pickText(asRecord(asRecord(c.referidos).oa).titulo, b.referidos.oa.titulo),
          texto: pickText(asRecord(asRecord(c.referidos).oa).texto, b.referidos.oa.texto),
        },
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
