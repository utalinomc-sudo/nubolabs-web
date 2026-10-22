// Tests del resumen de un lead para el equipo (correo, ficha PDF y admin).
// Cambio formulario-minimo-consentimiento, spec "Datos del lead visibles para el equipo".
import { describe, expect, it } from "vitest";
import { formatConsentDate, leadGoalsText, leadIndustryText, leadMarketingText, leadSummaryRows } from "@/lib/leadSummary";

describe("leadSummary", () => {
  it("rubro: etiqueta de la lista, o el rubro libre de leads antiguos del diagnóstico", () => {
    expect(leadIndustryText({ industry: "automotriz" })).toBe("Automotriz");
    expect(leadIndustryText({ meta: { rubro: "Minería" } })).toBe("Minería");
    expect(leadIndustryText({ industry: "inventado", meta: { rubro: "  " } })).toBeNull();
    expect(leadIndustryText({})).toBeNull();
  });

  it("objetivos: etiquetas en español unidas por ' · '", () => {
    expect(leadGoalsText({ goals: ["sell_more", "collect_on_time"] })).toBe("Vender más · Cobrar a tiempo");
    expect(leadGoalsText({ goals: ["hackear"] })).toBeNull();
    expect(leadGoalsText({ goals: "sell_more" })).toBeNull();
    expect(leadGoalsText({})).toBeNull();
  });

  it("novedades: solo si el lead trae la marca (los antiguos no muestran nada)", () => {
    expect(leadMarketingText({ marketingConsent: true })).toBe("Acepta novedades");
    expect(leadMarketingText({ marketingConsent: false })).toBe("Sin novedades");
    expect(leadMarketingText({})).toBeNull();
  });

  it("muestra el detalle escrito en 'Otra cosa' y 'Otro'", () => {
    expect(leadGoalsText({ goals: ["sell_more", "other"], goalOther: "Abrir una sucursal" })).toBe("Vender más · Otra cosa: Abrir una sucursal");
    expect(leadGoalsText({ goals: ["other"] })).toBe("Otra cosa");
    expect(leadIndustryText({ industry: "otro", industryOther: "Transporte de carga" })).toBe("Otro: Transporte de carga");
    expect(leadIndustryText({ industry: "otro" })).toBe("Otro");
  });

  it("fecha del consentimiento en hora de Chile", () => {
    expect(formatConsentDate("2026-10-22T15:30:00.000Z")).toBe("22-10-2026 12:30");
    expect(formatConsentDate("no es fecha")).toBeNull();
    expect(formatConsentDate(undefined)).toBeNull();
  });

  it("filas para el equipo: solo las que tienen dato", () => {
    expect(
      leadSummaryRows({ industry: "gastronomia", goals: ["sell_more"], marketingConsent: true, consentAt: "2026-10-22T15:30:00.000Z" }),
    ).toEqual([
      ["Rubro", "Gastronomía"],
      ["Quiere lograr", "Vender más"],
      ["Novedades", "Acepta novedades (22-10-2026 12:30)"],
    ]);
    expect(leadSummaryRows({})).toEqual([]);
  });
});

// Cambio landing-referidos-oa (design.md decisión 7): origen con el referido para el correo, el detalle y la ficha.
describe("origen y referido", () => {
  it("leadOriginText: el formulario, más el referido si es válido", async () => {
    const { leadOriginText, leadReferralLabel } = await import("@/lib/leadSummary");
    expect(leadOriginText({ source: "landing" })).toBe("landing");
    expect(leadOriginText({ source: "diagnostico", referral: "oa" })).toBe("diagnostico · referido O&A");
    expect(leadOriginText({ source: "landing", referral: "xyz" })).toBe("landing");
    expect(leadOriginText({})).toBe("landing");
    expect(leadReferralLabel({ referral: "oa" })).toBe("O&A");
    expect(leadReferralLabel({ referral: " oa" })).toBeNull();
    expect(leadReferralLabel({})).toBeNull();
  });
});
