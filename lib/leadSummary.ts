// Resumen de un lead para el equipo: lo comparten el aviso por correo, la ficha PDF y el admin.
// Pura (sin server-only). Acepta leads antiguos: todo campo nuevo se lee con chequeo de tipo.
// Cambio formulario-minimo-consentimiento, design.md decisión 7.
import { REFERRAL_LABELS, goalLabel, industryLabel, isReferral } from "@/lib/leadOptions";

type LeadLike = {
  industry?: unknown;
  industryOther?: unknown;
  goals?: unknown;
  goalOther?: unknown;
  marketingConsent?: unknown;
  consentAt?: unknown;
  meta?: unknown;
  source?: unknown;
  referral?: unknown;
};

// Referido del lead (cambio landing-referidos-oa): etiqueta si el valor guardado está en REFERRALS; si no, null.
export function leadReferralLabel(lead: LeadLike): string | null {
  return isReferral(lead.referral) ? REFERRAL_LABELS[lead.referral] : null;
}

// Origen para el equipo: el formulario y, si hay, el referido ("landing · referido O&A").
export function leadOriginText(lead: LeadLike): string {
  const source = typeof lead.source === "string" && lead.source.trim() ? lead.source.trim() : "landing";
  const referral = leadReferralLabel(lead);
  return referral ? `${source} · referido ${referral}` : source;
}

// Rubro con su texto en español; en leads antiguos del diagnóstico, el rubro libre de meta.rubro.
export function leadIndustryText(lead: LeadLike): string | null {
  const fromList = industryLabel(lead.industry);
  const other = typeof lead.industryOther === "string" ? lead.industryOther.trim() : "";
  if (fromList && lead.industry === "otro" && other) return `${fromList}: ${other}`;
  if (fromList) return fromList;
  const meta = lead.meta && typeof lead.meta === "object" ? (lead.meta as Record<string, unknown>) : null;
  const free = typeof meta?.rubro === "string" ? meta.rubro.trim() : "";
  return free || null;
}

export function leadGoalsText(lead: LeadLike): string | null {
  if (!Array.isArray(lead.goals)) return null;
  const other = typeof lead.goalOther === "string" ? lead.goalOther.trim() : "";
  const labels = lead.goals
    .map((g) => {
      const label = goalLabel(g);
      return label && g === "other" && other ? `${label}: ${other}` : label;
    })
    .filter((l): l is string => !!l);
  return labels.length ? labels.join(" · ") : null;
}

export function leadMarketingText(lead: LeadLike): string | null {
  if (lead.marketingConsent === true) return "Acepta novedades";
  if (lead.marketingConsent === false) return "Sin novedades";
  return null;
}

// "2026-10-22T15:30:00Z" → "22-10-2026 12:30" en hora de Chile.
export function formatConsentDate(iso: unknown): string | null {
  if (typeof iso !== "string") return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("es-CL", {
      timeZone: "America/Santiago",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.day}-${parts.month}-${parts.year} ${parts.hour}:${parts.minute}`;
}

// Filas [etiqueta, valor] con los datos nuevos del lead que tengan valor.
export function leadSummaryRows(lead: LeadLike): [string, string][] {
  const rows: [string, string][] = [];
  const industry = leadIndustryText(lead);
  if (industry) rows.push(["Rubro", industry]);
  const goals = leadGoalsText(lead);
  if (goals) rows.push(["Quiere lograr", goals]);
  const marketing = leadMarketingText(lead);
  if (marketing) {
    const date = formatConsentDate(lead.consentAt);
    rows.push(["Novedades", date ? `${marketing} (${date})` : marketing]);
  }
  return rows;
}
