// Opciones compartidas del formulario de leads: objetivos, rubros y textos de consentimiento.
// Sin "server-only": las usan el formulario (cliente), el API, el correo, el PDF y el admin.
// Cambio formulario-minimo-consentimiento, design.md decisión 1. HDU-05 y HDU-07 reutilizan INDUSTRIES.

export type GoalKey =
  | "sell_more"
  | "respond_faster"
  | "clear_numbers"
  | "collect_on_time"
  | "organize_team"
  | "drop_spreadsheets"
  | "grow_orderly"
  | "other";

export type IndustryKey = "gastronomia" | "automotriz" | "construccion" | "servicios" | "comercio" | "otro";

// `topic`: la misma meta en segunda persona, para "Conversamos 30 minutos sobre cómo …". "Otra cosa" no tiene.
export const GOALS: readonly { key: GoalKey; label: string; topic: string | null }[] = [
  { key: "sell_more", label: "Vender más", topic: "vender más" },
  { key: "respond_faster", label: "Responder más rápido a mis clientes", topic: "responder más rápido a tus clientes" },
  { key: "clear_numbers", label: "Tener mis números claros", topic: "tener tus números claros" },
  { key: "collect_on_time", label: "Cobrar a tiempo", topic: "cobrar a tiempo" },
  { key: "organize_team", label: "Ordenar el trabajo del equipo", topic: "ordenar el trabajo del equipo" },
  { key: "drop_spreadsheets", label: "Dejar atrás las planillas", topic: "dejar atrás las planillas" },
  { key: "grow_orderly", label: "Crecer sin desordenarme", topic: "crecer sin desordenarte" },
  { key: "other", label: "Otra cosa", topic: null },
];

export const INDUSTRIES: readonly { key: IndustryKey; label: string }[] = [
  { key: "gastronomia", label: "Gastronomía" },
  { key: "automotriz", label: "Automotriz" },
  { key: "construccion", label: "Construcción" },
  { key: "servicios", label: "Servicios profesionales" },
  { key: "comercio", label: "Comercio" },
  { key: "otro", label: "Otro" },
];

export function isGoalKey(value: unknown): value is GoalKey {
  return typeof value === "string" && GOALS.some((g) => g.key === value);
}

export function isIndustryKey(value: unknown): value is IndustryKey {
  return typeof value === "string" && INDUSTRIES.some((i) => i.key === value);
}

// Referidores (cambio landing-referidos-oa, design.md decisión 1): lista cerrada en código. Un lead referido guarda
// `referral` aparte de `source`, que sigue siendo el formulario. Para sumar otro, agregarlo aquí y su etiqueta.
export const REFERRALS = ["oa"] as const;
export type Referral = (typeof REFERRALS)[number];
export const REFERRAL_LABELS: Record<Referral, string> = { oa: "O&A" };

export function isReferral(value: unknown): value is Referral {
  return typeof value === "string" && (REFERRALS as readonly string[]).includes(value);
}

export function goalLabel(key: unknown): string | null {
  return GOALS.find((g) => g.key === key)?.label ?? null;
}

export function industryLabel(key: unknown): string | null {
  return INDUSTRIES.find((i) => i.key === key)?.label ?? null;
}

// ["sell_more", "collect_on_time"] → "vender más y cobrar a tiempo". Sin temas (vacío o solo "Otra cosa") → null.
export function describeGoals(keys: readonly unknown[]): string | null {
  const topics = keys
    .map((k) => GOALS.find((g) => g.key === k)?.topic)
    .filter((t): t is string => typeof t === "string");
  if (topics.length === 0) return null;
  if (topics.length === 1) return topics[0];
  return `${topics.slice(0, -1).join(", ")} y ${topics[topics.length - 1]}`;
}

// Textos exactos de las casillas (Ley 21.719). El servidor guarda estos, nunca los que mande el cliente.
// Si cambian, subir CONSENT_VERSION para saber qué texto aceptó cada lead.
export const CONSENT_TEXTS = {
  contact: "Acepto que Nubolabs use mis datos para contactarme sobre mi diagnóstico.",
  marketing: "Quiero recibir ideas y novedades de Nubolabs. Puedes darte de baja cuando quieras.",
} as const;

export const CONSENT_VERSION = "2026-10-21";
