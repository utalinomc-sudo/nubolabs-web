// Validación y normalización de leads, pura y testeable (cambio formulario-minimo-consentimiento, design.md decisión 2).
// La usa POST /api/leads: todo lo que manda el cliente llega como `unknown` y se reconstruye aquí.
import { CONSENT_TEXTS, CONSENT_VERSION, isGoalKey, isIndustryKey, type GoalKey } from "@/lib/leadOptions";
import type { LeadRecord } from "@/types/lead";

// Orígenes permitidos. Los referidos de O&A (HDU-07) se marcan con un campo aparte, no con otro `source`.
export const LEAD_SOURCES = ["landing", "diagnostico"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

// Largos máximos. Los formularios usan los mismos en `maxLength`. Correo y WhatsApp no se recortan: si se pasan,
// se rechazan (un número o correo recortado sería un dato equivocado). Ver revisión adversarial del cambio.
export const LEAD_MAX = { name: 120, email: 254, company: 120, phone: 30, message: 1000, goalOther: 70, industryOther: 70 } as const;
const MAX = LEAD_MAX;
// Tamaño máximo de `meta` (detalle del diagnóstico) serializado en JSON.
export const META_MAX_BYTES = 64 * 1024;

export const LEAD_ERRORS = {
  invalidBody: "Solicitud inválida.",
  required: "Nombre y email son obligatorios.",
  email: "El email no es válido.",
  phone: "Revisa el WhatsApp: debe tener entre 8 y 15 dígitos.",
  consent: "Necesitamos tu permiso para contactarte.",
} as const;

export function isValidEmail(value: unknown): boolean {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// 8 a 15 dígitos (E.164) sin importar espacios, "+", guiones o paréntesis.
export function isValidPhone(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const digits = value.replace(/\D/g, "").length;
  return digits >= 8 && digits <= 15;
}

// El campo trampa `website` es invisible para personas: si trae texto, lo llenó un bot.
export function isHoneypotFilled(body: unknown): boolean {
  if (!isPlainObject(body)) return false;
  return typeof body.website === "string" && body.website.trim().length > 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Texto recortado de espacios pero sin truncar (para campos que se validan completos).
function whole(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isLeadSource(value: unknown): value is LeadSource {
  return typeof value === "string" && (LEAD_SOURCES as readonly string[]).includes(value);
}

export type NormalizeResult = { ok: true; lead: LeadRecord } | { ok: false; error: string };

// Valida (en el orden de la spec) y arma el documento a guardar. Los campos de consentimiento los pone el
// servidor: lo que mande el cliente en consentText/consentAt/consentVersion se ignora.
export function normalizeLead(body: unknown, now: Date = new Date()): NormalizeResult {
  if (!isPlainObject(body)) return { ok: false, error: LEAD_ERRORS.invalidBody };

  const name = text(body.name, MAX.name);
  const email = whole(body.email);
  if (!name || !email) return { ok: false, error: LEAD_ERRORS.required };
  if (email.length > MAX.email || !isValidEmail(email)) return { ok: false, error: LEAD_ERRORS.email };

  const phone = whole(body.phone);
  if (phone.length > MAX.phone || !isValidPhone(phone)) return { ok: false, error: LEAD_ERRORS.phone };

  if (body.contactConsent !== true) return { ok: false, error: LEAD_ERRORS.consent };
  const marketingConsent = body.marketingConsent === true;
  const at = now.toISOString();

  const lead: LeadRecord = {
    name,
    email,
    phone,
    company: text(body.company, MAX.company),
    message: text(body.message, MAX.message),
    source: isLeadSource(body.source) ? body.source : "landing",
    status: "new",
    createdAt: at,
    contactConsent: true,
    marketingConsent,
    consentAt: at,
    consentVersion: CONSENT_VERSION,
    consentText: marketingConsent
      ? { contact: CONSENT_TEXTS.contact, marketing: CONSENT_TEXTS.marketing }
      : { contact: CONSENT_TEXTS.contact },
  };

  if (Array.isArray(body.goals)) {
    const goals = [...new Set(body.goals.filter(isGoalKey))] as GoalKey[];
    if (goals.length > 0) lead.goals = goals;
  }
  if (isIndustryKey(body.industry)) lead.industry = body.industry;
  // Detalle escrito de "Otra cosa" y "Otro": solo si esa opción está elegida (pedido de Mauro, 2026-10-22).
  if (lead.goals?.includes("other")) {
    const goalOther = text(body.goalOther, MAX.goalOther);
    if (goalOther) lead.goalOther = goalOther;
  }
  if (lead.industry === "otro") {
    const industryOther = text(body.industryOther, MAX.industryOther);
    if (industryOther) lead.industryOther = industryOther;
  }
  // `meta` (detalle del diagnóstico) solo en leads del diagnóstico y con tamaño acotado.
  if (lead.source === "diagnostico" && isPlainObject(body.meta)) {
    if (JSON.stringify(body.meta).length > META_MAX_BYTES) return { ok: false, error: LEAD_ERRORS.invalidBody };
    lead.meta = body.meta;
  }

  return { ok: true, lead };
}

// URL de agenda para la pantalla de éxito (NEXT_PUBLIC_SCHEDULE_URL). Solo http(s); si falta o es otra cosa, null
// (el formulario dice "Te escribimos en menos de 24 horas" en vez de mostrar un botón roto).
export function safeScheduleUrl(value: string | undefined | null): string | null {
  const url = value?.trim() ?? "";
  return /^https?:\/\/\S+$/i.test(url) ? url : null;
}
