import "server-only";
import { getDb } from "@/lib/firebaseAdmin";
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
  hero: { eyebrow: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  servicios: { eyebrow: string; title: string; items: ServiceItem[] };
  casos: { eyebrow: string; title: string; subtitle: string; items: CaseItem[] };
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
  { key: "equipo", label: "Nuestro equipo (página)", hint: "Página /equipo y su link en el menú" },
  { key: "contacto", label: "Contacto", hint: "Formulario de contacto del home" },
];

// ── Defaults (fallback si Firestore no tiene overrides) ──────────────
export function defaultSiteConfig(): SiteConfig {
  return {
    visible: Object.fromEntries(SECTIONS.map((s) => [s.key, true])),
    content: {
      hero: {
        eyebrow: "◈ AI & AUTOMATION AGENCY",
        title: "Rediseñamos procesos y los convertimos en **automatizaciones con IA** que trabajan en la nube.",
        subtitle:
          "No automatizamos procesos obsoletos: primero los entendemos y simplificamos, luego construimos flujos, reportes y agentes que ahorran horas y reducen errores.",
        ctaPrimary: "Solicitar diagnóstico →",
        ctaSecondary: "Ver servicios",
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
      equipo: {
        eyebrow: "NUESTRO EQUIPO",
        title: "Las personas detrás de Nubolabs",
        historia:
          "Somos un equipo que combina rediseño de procesos, ingeniería e inteligencia artificial. Nos obsesiona que la tecnología resuelva problemas reales de operación: menos tareas manuales, menos errores y más tiempo para lo que importa.",
      },
    },
  };
}

function mergeConfig(base: SiteConfig, data: Record<string, unknown>): SiteConfig {
  const c = (data.content ?? {}) as Partial<SiteContent>;
  return {
    visible: { ...base.visible, ...((data.visible as Record<string, boolean>) ?? {}) },
    content: {
      hero: { ...base.content.hero, ...(c.hero ?? {}) },
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
      equipo: { ...base.content.equipo, ...(c.equipo ?? {}) },
    },
  };
}

// Lee la config del sitio (Firestore config/site) mezclada sobre los defaults.
export async function getSiteConfig(): Promise<SiteConfig> {
  const base = defaultSiteConfig();
  const db = getDb();
  if (!db) return base;
  try {
    const doc = await db.collection("config").doc("site").get();
    if (!doc.exists) return base;
    return mergeConfig(base, doc.data() ?? {});
  } catch {
    return base;
  }
}

// ── Equipo ───────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  nombre: string;
  cargo: string;
  habilidades: string[];
  fotoUrl: string;
  orden: number;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const snap = await db.collection("team").orderBy("orden", "asc").get();
    return snap.docs.map((d) => {
      const x = d.data();
      return {
        id: d.id,
        nombre: x.nombre ?? "",
        cargo: x.cargo ?? "",
        habilidades: Array.isArray(x.habilidades) ? x.habilidades : [],
        fotoUrl: x.fotoUrl ?? "",
        orden: typeof x.orden === "number" ? x.orden : 0,
      };
    });
  } catch {
    return [];
  }
}

// Renderiza texto con **resaltado** → <span class="text-brand">. Devuelve nodos.
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
