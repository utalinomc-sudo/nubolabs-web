// Contenido de la landing centralizado — un solo lugar para editar textos.

export const nav = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Cómo trabajamos", href: "/#modelo" },
  { label: "Casos de uso", href: "/#casos" },
];

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

export const problems = [
  {
    title: "Correos manuales",
    body: "Clasificar, responder y reenviar correos uno por uno.",
  },
  {
    title: "Datos dispersos",
    body: "Información copiada a mano entre planillas y sistemas.",
  },
  {
    title: "Reportes lentos",
    body: "Informes que toman días en armarse y llegan tarde.",
  },
  {
    title: "Seguimiento frágil",
    body: "Cobranzas y tareas que dependen de recordatorios.",
  },
];

export const approach = [
  {
    n: 1,
    title: "Entender y simplificar",
    body: "Mapeamos el flujo real y eliminamos pasos innecesarios.",
  },
  {
    n: 2,
    title: "Automatizar lo que vale",
    body: "Flujos, reportes y agentes IA donde hay retorno claro.",
  },
  {
    n: 3,
    title: "Medir y escalar",
    body: "Horas ahorradas, menos errores, trazabilidad total.",
    accent: true,
  },
];

export const services = [
  {
    title: "Diagnóstico y rediseño de procesos",
    body: "Mapa de oportunidades, simplificación y priorización por retorno. Un entregable tangible desde la primera sesión.",
    result: "Evita automatizar procesos mal diseñados",
  },
  {
    title: "Automatización operativa en la nube",
    body: "Flujos automáticos para correos, ingreso de datos, cobranzas, cotizaciones y notificaciones internas.",
    result: "Ahorro rápido de horas al mes, menos errores",
  },
  {
    title: "Reportería y entregables automáticos",
    body: "Reportes, minutas, documentos y presentaciones generados directo desde tus datos.",
    result: "De días u horas, a minutos",
  },
  {
    title: "Sistemas y agentes IA a medida",
    body: "Portales internos, aplicaciones y agentes conectados a CRM, ERP, WhatsApp y bases de datos.",
    result: "Soluciones que escalan con tu operación",
  },
];

export const steps = [
  { n: 1, title: "Diagnóstico", body: "Procesos, dolores y ROI estimado.", color: "#1565FF" },
  { n: 2, title: "Rediseño", body: "Simplificar antes de automatizar.", color: "#1565FF" },
  { n: 3, title: "Implementación", body: "Automatizaciones, reportes y agentes.", color: "#00A9E0" },
  { n: 4, title: "Medición", body: "Horas ahorradas y errores reducidos.", color: "#00C2FF" },
  { n: 5, title: "Mejora continua", body: "Soporte, optimización y escala.", color: "#FF6B5E" },
];

export const useCases = [
  { title: "Correos con IA", body: "Clasificación automática y respuestas asistidas." },
  { title: "Cotizaciones e informes", body: "Generación automática de documentos y minutas." },
  { title: "Cobranzas y seguimiento", body: "Tareas comerciales y operaciones recurrentes sin planillas." },
  { title: "Reportes ejecutivos", body: "Dashboards e informes creados desde tus datos." },
  { title: "Agentes IA conectados", body: "WhatsApp, CRM, ERP y bases internas." },
  { title: "Portales internos", body: "Solicitudes, aprobaciones y trazabilidad operacional." },
];

export const metrics = [
  { value: "+120 h", label: "ahorradas al mes por cliente" },
  { value: "minutos", label: "donde antes había días de reportería" },
  { value: "−90%", label: "de error en tareas repetitivas" },
];

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
