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
