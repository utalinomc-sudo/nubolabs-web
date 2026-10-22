// Medición de leads por origen para el panel (cambio landing-referidos-oa, design.md decisión 7). Puro: lo usan el
// dashboard y la lista de leads, que leen Firestore y filtran en memoria (sin índices compuestos).
import { REFERRAL_LABELS } from "@/lib/leadOptions";

// "landing" y "diagnostico" son el formulario (`source`); "oa" es el referido (`referral`), de cualquier formulario.
export const LEAD_ORIGINS = [
  { key: "todos", label: "Todos" },
  { key: "landing", label: "Formulario" },
  { key: "diagnostico", label: "Diagnóstico" },
  { key: "oa", label: REFERRAL_LABELS.oa },
] as const;
export type LeadOrigin = (typeof LEAD_ORIGINS)[number]["key"];

interface OriginFields {
  source?: unknown;
  referral?: unknown;
  createdAt?: unknown;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// `?origen=` de la URL: valor conocido o "todos".
export function parseLeadOrigin(value: unknown): LeadOrigin {
  const first = Array.isArray(value) ? value[0] : value;
  return LEAD_ORIGINS.find((o) => o.key === first)?.key ?? "todos";
}

// Los leads antiguos sin `source` venían del formulario de la portada.
const isForm = (l: OriginFields) => (l.source ?? "landing") === "landing";
const isDiag = (l: OriginFields) => l.source === "diagnostico";
const isOa = (l: OriginFields) => l.referral === "oa";

export function filterLeadsByOrigin<T extends OriginFields>(leads: T[], origin: unknown): T[] {
  switch (parseLeadOrigin(origin)) {
    case "landing":
      return leads.filter(isForm);
    case "diagnostico":
      return leads.filter(isDiag);
    case "oa":
      return leads.filter(isOa);
    default:
      return leads;
  }
}

// Leads de los últimos 30 días contados desde `now` (incluye el borde). Sin fecha válida o con fecha futura no cuentan.
export function countLeadsByOrigin(leads: OriginFields[], now: Date): { landing: number; diagnostico: number; oa: number } {
  const from = now.getTime() - 30 * DAY_MS;
  const to = now.getTime();
  const recent = leads.filter((l) => {
    if (typeof l.createdAt !== "string") return false;
    const t = new Date(l.createdAt).getTime();
    return Number.isFinite(t) && t >= from && t <= to;
  });
  return {
    landing: recent.filter(isForm).length,
    diagnostico: recent.filter(isDiag).length,
    oa: recent.filter(isOa).length,
  };
}
