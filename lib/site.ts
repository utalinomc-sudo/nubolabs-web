import "server-only";
import { getDb } from "@/lib/firebaseAdmin";
import { defaultSiteConfig, mergeConfig, type SiteConfig } from "@/lib/siteConfig";

// Lo puro (tipos, SECTIONS, defaults, mezcla y resaltado) vive en lib/siteConfig.ts para poder testearlo y usarlo
// desde el admin. Se re-exporta aquí para no cambiar los imports existentes. Este archivo solo lee Firestore.
export {
  SECTIONS,
  defaultSiteConfig,
  mergeConfig,
  normalizeTags,
  renderHighlight,
  type CaseItem,
  type ServiceItem,
  type SiteConfig,
  type SiteContent,
} from "@/lib/siteConfig";

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
  linkedin: string;
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
        linkedin: x.linkedin ?? "",
        orden: typeof x.orden === "number" ? x.orden : 0,
      };
    });
  } catch {
    return [];
  }
}
