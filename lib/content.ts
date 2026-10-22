// Contenido de la landing centralizado — un solo lugar para editar textos.

// Menú principal (cambio lenguaje-sin-jerga, design.md decisión 4). Sin "Inicio": el logo lleva a /#inicio.
// `section` = clave de SECTIONS: si esa sección está oculta, el ítem no se muestra.
export const nav = [
  { label: "Lo que ganas", href: "/#resultados", section: "resultados" },
  { label: "Servicios", href: "/#servicios", section: "servicios" },
  { label: "Ejemplos", href: "/#casos", section: "casos" },
  { label: "Cómo trabajamos", href: "/#modelo", section: "proceso" },
  { label: "Preguntas", href: "/#preguntas", section: "faq" }, // cambio cierre-landing-faq-cta
];

// Bloque de confianza (cambio confianza-recomendacion): textos fijos (no van al CMS).
export const trustLabels = {
  section: "Nos recomiendan", // nombre de la región para lectores de pantalla
  promisesTitle: "Nuestro compromiso contigo",
};

// ── Cierre del sitio (cambio cierre-landing-faq-cta, design.md decisión 5) ──
// La web no va al CMS (cambia rara vez); el WhatsApp sí (content.contact). Sin correo público hasta resolver
// hola@nubolabs.cl (HDU-08 §14, pregunta 4).
export const contact = { webUrl: "https://www.nubolabs.cl", webLabel: "www.nubolabs.cl" };

// Nota bajo los botones para agendar (CTA final).
export const ctaNote = "30 minutos · por videollamada · sin compromiso";

// Pie de página. `section` = clave de SECTIONS: si esa sección o página está oculta, el enlace no se muestra.
export const footerLinks = {
  tagline: "Ordenamos tu negocio y dejamos funcionando solo lo repetitivo. Tu operación, en piloto automático.",
  servicios: {
    title: "Servicios",
    section: "servicios",
    links: [
      { label: "Diagnóstico y plan", href: "/#servicios" },
      { label: "Tareas que avanzan solas", href: "/#servicios" },
      { label: "Clientes atendidos al instante", href: "/#servicios" },
      { label: "Tus números claros", href: "/#servicios" },
    ],
  },
  nubolabs: {
    title: "Nubolabs",
    links: [
      { label: "Misión y visión", href: "/mision-vision", section: "nosotros" },
      { label: "Equipo", href: "/equipo", section: "equipo" },
      { label: "Cómo trabajamos", href: "/#modelo", section: "proceso" },
      { label: "Preguntas frecuentes", href: "/#preguntas", section: "faq" },
    ],
  },
  contacto: { title: "Contacto", agendar: "Agendar diagnóstico" },
  privacidad: "Privacidad",
  hechoEn: "Hecho en Chile",
  whatsappSr: "WhatsApp: ", // prefijo solo para lectores de pantalla
};

// Avisos para lectores de pantalla en enlaces que abren otra pestaña.
export const newTabNote = " (abre en otra pestaña)";

// Tarjeta "¿Prefieres escribirnos?" junto al formulario (WhatsappCard.tsx).
export const whatsappCard = {
  title: "¿Prefieres escribirnos?",
  desktop: "Escanea el código con tu celular y te respondemos por WhatsApp.",
  mobile: "Toca aquí y te respondemos por WhatsApp.",
  qrLabel: "Código QR para escribirnos por WhatsApp",
};

// Panel "Tu negocio hoy" del hero (cambio mensaje-principal-pyme, design.md decisión 4).
// Ejemplos ilustrativos de producto: sin cifras de resultados, montos ni clientes reales. No van al CMS.
export type HeroFeedIcon = "file" | "wallet" | "chat" | "package" | "chart" | "calendar" | "bell";
export type HeroFeedTone = "brand" | "accent" | "cyan" | "success";
export interface HeroFeedItem {
  icon: HeroFeedIcon;
  tone: HeroFeedTone;
  title: string;
  detail: string;
}

// Las 5 tareas iniciales (render del servidor y versión estática con "reducir movimiento").
export const heroFeed: HeroFeedItem[] = [
  { icon: "file", tone: "brand", title: "Cotización enviada al cliente", detail: "Ventas · el mismo día que la pidió" },
  { icon: "wallet", tone: "accent", title: "Recordatorio de pago enviado", detail: "Cobranza · factura por vencer" },
  { icon: "chat", tone: "cyan", title: "Consulta de WhatsApp respondida", detail: "Clientes · 23:14, sin despertar a nadie" },
  { icon: "package", tone: "success", title: "Pedido a proveedor generado", detail: "Bodega · según el stock real" },
  { icon: "chart", tone: "brand", title: "Resumen del mes listo para tu contador", detail: "Números · enviado automáticamente" },
];

// Las que van entrando arriba mientras el panel está a la vista (en este orden, en ciclo).
export const heroFeedMore: HeroFeedItem[] = [
  { icon: "chat", tone: "cyan", title: "Reserva confirmada por WhatsApp", detail: "Clientes · con recordatorio para mañana" },
  { icon: "file", tone: "brand", title: "Presupuesto de taller listo", detail: "Ventas · repuestos y mano de obra" },
  { icon: "wallet", tone: "accent", title: "Pago recibido y registrado", detail: "Cobranza · conciliado con la factura" },
  { icon: "calendar", tone: "success", title: "Estado de pago enviado", detail: "Obra · documentos adjuntos" },
  { icon: "chart", tone: "brand", title: "Ventas del día en tu celular", detail: "Números · cierre de caja" },
  { icon: "bell", tone: "cyan", title: "Aviso: el auto del cliente está listo", detail: "Clientes · mensaje enviado" },
  { icon: "package", tone: "success", title: "Stock bajo: pedido sugerido", detail: "Bodega · esperando tu visto bueno" },
];

// Ilustraciones decorativas de "Lo que ganas" (una por posición; Results.tsx). Ejemplos genéricos: sin cifras de
// resultados ni nombres de clientes (spec landing/contenido-pyme). No van al CMS.
export const resultsVisuals = {
  chat: {
    incoming: { text: "Hola, ¿me pueden cotizar para el jueves?", time: "21:47" },
    outgoing: { text: "¡Claro! Aquí tienes tu cotización. ¿Te reservo el jueves a las 10:00?", time: "21:47 · respuesta automática" },
  },
  bars: [
    { day: "Lun", height: 42 },
    { day: "Mar", height: 58 },
    { day: "Mié", height: 50 },
    { day: "Jue", height: 72 },
    { day: "Hoy", height: 88 },
  ],
  checks: [
    { text: "Factura 1043 cobrada", done: true },
    { text: "Estado de pago enviado", done: true },
    { text: "Declaración mensual · avisa el día 10", done: false },
  ],
  grow: { team: "Tu equipo", tasks: "Tareas que avanzan solas", result: "Más clientes, mismo orden" },
};

// Ejemplo "antes / después" del Enfoque (Approach.tsx): los pasos que sobran van tachados. No va al CMS.
export const approachExample = {
  label: "Ejemplo: una cotización antes y después",
  antesTitle: "Hoy: una cotización",
  antes: [
    { text: "Llega la consulta por WhatsApp", cut: false },
    { text: "Copiar los datos a una planilla", cut: true },
    { text: "Buscar precios en otro archivo", cut: true },
    { text: "Armar el documento a mano", cut: false },
    { text: "Reenviar por correo para revisión", cut: true },
    { text: "Preguntar \"¿en qué va?\"", cut: true },
  ],
  despuesTitle: "Después",
  despues: [
    "Llega la consulta",
    "La cotización se arma sola y la revisas con un clic",
    "El cliente la recibe el mismo día",
    "Seguimiento automático si no responde",
  ],
};

// Rótulos fijos de las secciones de contenido (no van al CMS).
export const sectionLabels = {
  recibes: "Recibes", // caja de cada paso del Proceso
  ganas: "Lo que ganas: ", // prefijo solo para lectores de pantalla en Servicios
  pasoSobra: " (paso que sobra)", // solo para lectores de pantalla en el ejemplo antes/después
};

// Cifras con respaldo (cambio cifras-con-respaldo): textos fijos de la sección.
export const metricsLabels = {
  section: "Resultados medibles", // nombre de la región para lectores de pantalla
  source: "Fuente: ",
};

// ── Sección de contacto: formulario de 2 pasos (cambio formulario-minimo-consentimiento, design.md decisión 4) ──
// Textos fijos (no CMS en este cambio). Las opciones y los textos de consentimiento viven en lib/leadOptions.ts.
export const contactSection = {
  eyebrow: "AGENDA TU DIAGNÓSTICO",
  title: "Conversemos 30 minutos sobre tu negocio",
  lead: "Sin costo, por videollamada y sin compromiso. Si no te podemos ayudar, te lo decimos.",
  takeaways: [
    {
      icon: "search",
      title: "Tus oportunidades principales",
      body: "Dónde está lo que más te frena y lo que más te conviene.",
    },
    { icon: "file", title: "Por dónde partir y cuánto cuesta", body: "Una recomendación concreta, sin compromiso." },
    { icon: "users", title: "No necesitas saber de tecnología", body: "Tú hablas de tu negocio; lo técnico es tarea nuestra." },
  ],
  progress: (step: 1 | 2) => `Paso ${step} de 2`,
  step1: {
    legend: "¿Qué te gustaría lograr?",
    hint: "Elige todas las que quieras. Así preparamos la conversación para ti.",
    goalsLabel: "Objetivos",
    industryLabel: "¿En qué rubro está tu negocio?",
    // Campos de una línea que aparecen al elegir "Otra cosa" u "Otro" (máx. 70 caracteres).
    goalOther: { label: "¿Qué otra cosa te gustaría lograr?", placeholder: "Ej.: abrir una segunda sucursal" },
    industryOther: { label: "¿Cuál es tu rubro?", placeholder: "Ej.: transporte, salud, educación" },
    optional: "(opcional)",
    skip: "Saltar este paso",
    next: "Siguiente",
  },
  step2: {
    legend: "¿Dónde te contactamos?",
    hint: "Te escribimos solo para coordinar tu diagnóstico.",
    labels: {
      name: "Nombre",
      phone: "WhatsApp",
      email: "Correo",
      company: "Empresa",
      message: "¿Algo que quieras contarnos antes de la llamada?",
    },
    optional: "(opcional)",
    placeholders: {
      phone: "+56 9 1234 5678",
      email: "tu@empresa.cl",
      message: "Ej.: las cotizaciones se nos acumulan y perdemos clientes",
    },
    privacyLink: "Cómo cuidamos tus datos",
    back: "Volver",
    submit: "Agendar mi diagnóstico gratis",
    sending: "Enviando…",
    note: "30 minutos · por videollamada · sin compromiso",
  },
  errors: {
    name: "Escribe tu nombre para saber cómo llamarte.",
    phone: "Revisa el WhatsApp: debe tener entre 8 y 15 dígitos.",
    email: "Revisa el correo: falta la @ o el dominio (ej.: tu@empresa.cl).",
    consent: "Necesitamos tu permiso para contactarte sobre el diagnóstico.",
    server: "No pudimos enviar tu solicitud. Intenta de nuevo.",
  },
  success: {
    // Con agenda configurada se invita a elegir horario; sin agenda, escribimos nosotros (spec, "Agenda inmediata").
    withSchedule: {
      title: (name: string) => `¡Listo, ${name}! Ahora elige el día y la hora.`,
      body: "Tu diagnóstico gratuito ya está pedido. Elige el horario que más te acomode.",
      button: "Elegir horario",
      steps: ["Eliges el horario (toma 1 minuto).", "Te llega la confirmación por correo."],
    },
    withoutSchedule: {
      title: (name: string) => `¡Listo, ${name}! Te escribimos en menos de 24 horas.`,
      body: "Tu diagnóstico gratuito ya está pedido. Te contactamos por WhatsApp o correo para coordinar el día y la hora.",
      steps: ["Te escribimos en menos de 24 horas.", "Coordinamos el día y la hora que te acomode."],
    },
    nextTitle: "Qué pasa ahora",
    topic: (goals: string | null) =>
      goals ? `Conversamos 30 minutos sobre cómo ${goals}.` : "Conversamos 30 minutos sobre lo que quieres lograr.",
    selfDiagnosis: "Mientras tanto, haz el autodiagnóstico de 5 minutos →",
  },
} as const;
