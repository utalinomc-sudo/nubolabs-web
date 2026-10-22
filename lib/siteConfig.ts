// Configuración pura del sitio: tipos, secciones, defaults y mezcla con lo guardado en Firestore (config/site).
// Sin "server-only" para poder usarla en tests y en el admin (cliente). La lectura de Firestore vive en lib/site.ts.
import { services as defaultServices, useCases as defaultUseCases } from "@/lib/content";

// ── Tipos ────────────────────────────────────────────────────────────
export interface ServiceItem {
  title: string;
  body: string;
  result: string;
}
export interface CaseItem {
  title: string;
  body: string;
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
  servicios: { eyebrow: string; title: string; items: ServiceItem[] };
  casos: { eyebrow: string; title: string; subtitle: string; items: CaseItem[] };
  nosotros: { eyebrow: string; title: string; mision: string; vision: string; objetivos: string[] };
  equipo: { eyebrow: string; title: string; historia: string };
}
export interface SiteConfig {
  visible: Record<string, boolean>;
  content: SiteContent;
}

// Secciones/páginas gobernadas por el toggle de visibilidad (orden = orden en la landing).
export const SECTIONS: { key: string; label: string; hint: string }[] = [
  { key: "hero", label: "Inicio (Hero)", hint: "Encabezado principal del home" },
  { key: "problema", label: "Problemas", hint: "Tarjetas de dolores operativos" },
  { key: "enfoque", label: "Enfoque", hint: "Cómo abordamos el trabajo" },
  { key: "servicios", label: "Servicios", hint: "Qué ofrecemos" },
  { key: "proceso", label: "Proceso", hint: "Pasos de trabajo" },
  { key: "casos", label: "Casos de uso", hint: "Ejemplos concretos" },
  { key: "nosotros", label: "Nosotros — Misión y visión (página)", hint: "Página /mision-vision y su link en el menú" },
  { key: "equipo", label: "Nuestro equipo (página)", hint: "Página /equipo y su link en el menú" },
  { key: "contacto", label: "Contacto", hint: "Formulario de contacto del home" },
];

// ── Defaults (fallback si Firestore no tiene overrides) ──────────────
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
      servicios: {
        eyebrow: "SERVICIOS",
        title: "Vendemos resultados, no herramientas",
        items: defaultServices.map((s) => ({ title: s.title, body: s.body, result: s.result })),
      },
      casos: {
        eyebrow: "CASOS DE USO",
        title: "Casos de uso concretos",
        subtitle: "Ejemplos que implementamos con n8n, Make, APIs e IA.",
        items: defaultUseCases.map((c) => ({ title: c.title, body: c.body })),
      },
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

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

// Mezcla lo guardado en config/site sobre los defaults. Cada campo guardado válido gana sobre su default.
export function mergeConfig(base: SiteConfig, data: Record<string, unknown>): SiteConfig {
  const c = (data.content ?? {}) as Partial<SiteContent>;
  const hero = asRecord(c.hero);
  const baseHero = base.content.hero;
  return {
    visible: { ...base.visible, ...((data.visible as Record<string, boolean>) ?? {}) },
    content: {
      hero: {
        eyebrow: pickText(hero.eyebrow, baseHero.eyebrow),
        title: pickText(hero.title, baseHero.title),
        subtitle: pickText(hero.subtitle, baseHero.subtitle),
        ctaPrimary: pickText(hero.ctaPrimary, baseHero.ctaPrimary),
        ctaSecondary: pickText(hero.ctaSecondary, baseHero.ctaSecondary),
        tags: normalizeTags(hero.tags) ?? baseHero.tags,
      },
      servicios: {
        ...base.content.servicios,
        ...(c.servicios ?? {}),
        items: c.servicios?.items ?? base.content.servicios.items,
      },
      casos: {
        ...base.content.casos,
        ...(c.casos ?? {}),
        items: c.casos?.items ?? base.content.casos.items,
      },
      nosotros: {
        ...base.content.nosotros,
        ...(c.nosotros ?? {}),
        objetivos: c.nosotros?.objetivos ?? base.content.nosotros.objetivos,
      },
      equipo: { ...base.content.equipo, ...(c.equipo ?? {}) },
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
