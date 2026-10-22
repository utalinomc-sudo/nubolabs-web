// Tests de las opciones compartidas del formulario (cambio formulario-minimo-consentimiento, design.md decisión 1).
import { describe, expect, it } from "vitest";
import {
  CONSENT_TEXTS,
  CONSENT_VERSION,
  GOALS,
  INDUSTRIES,
  describeGoals,
  goalLabel,
  industryLabel,
  isGoalKey,
  isIndustryKey,
} from "@/lib/leadOptions";

describe("GOALS e INDUSTRIES", () => {
  it("tienen las claves y etiquetas del contrato, en orden", () => {
    expect(GOALS.map((g) => [g.key, g.label])).toEqual([
      ["sell_more", "Vender más"],
      ["respond_faster", "Responder más rápido a mis clientes"],
      ["clear_numbers", "Tener mis números claros"],
      ["collect_on_time", "Cobrar a tiempo"],
      ["organize_team", "Ordenar el trabajo del equipo"],
      ["drop_spreadsheets", "Dejar atrás las planillas"],
      ["grow_orderly", "Crecer sin desordenarme"],
      ["other", "Otra cosa"],
    ]);
    expect(INDUSTRIES.map((i) => [i.key, i.label])).toEqual([
      ["gastronomia", "Gastronomía"],
      ["automotriz", "Automotriz"],
      ["construccion", "Construcción"],
      ["servicios", "Servicios profesionales"],
      ["comercio", "Comercio"],
      ["otro", "Otro"],
    ]);
  });

  it("los helpers devuelven la etiqueta o null y validan claves", () => {
    expect(goalLabel("collect_on_time")).toBe("Cobrar a tiempo");
    expect(goalLabel("hackear")).toBeNull();
    expect(industryLabel("servicios")).toBe("Servicios profesionales");
    expect(industryLabel("mineria")).toBeNull();
    expect(isGoalKey("sell_more")).toBe(true);
    expect(isGoalKey(42)).toBe(false);
    expect(isIndustryKey("otro")).toBe(true);
    expect(isIndustryKey("Otro")).toBe(false);
  });
});

describe("describeGoals", () => {
  it("sin objetivos útiles devuelve null", () => {
    expect(describeGoals([])).toBeNull();
    expect(describeGoals(["other"])).toBeNull();
  });

  it("une los temas en minúscula con comas e 'y'", () => {
    expect(describeGoals(["sell_more"])).toBe("vender más");
    expect(describeGoals(["sell_more", "collect_on_time"])).toBe("vender más y cobrar a tiempo");
    expect(describeGoals(["sell_more", "respond_faster", "collect_on_time"])).toBe(
      "vender más, responder más rápido a tus clientes y cobrar a tiempo",
    );
    expect(describeGoals(["other", "grow_orderly"])).toBe("crecer sin desordenarte");
  });
});

describe("consentimientos", () => {
  it("tienen los textos exactos de las casillas y una versión", () => {
    expect(CONSENT_TEXTS.contact).toBe("Acepto que Nubolabs use mis datos para contactarme sobre mi diagnóstico.");
    expect(CONSENT_TEXTS.marketing).toBe(
      "Quiero recibir ideas y novedades de Nubolabs. Puedes darte de baja cuando quieras.",
    );
    expect(CONSENT_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// Cambio landing-referidos-oa: lista cerrada de referidos (hoy solo O&A).
describe("referidos", () => {
  it("REFERRALS solo trae 'oa', con su etiqueta, e isReferral valida exacto", async () => {
    const { REFERRALS, REFERRAL_LABELS, isReferral } = await import("@/lib/leadOptions");
    expect(REFERRALS).toEqual(["oa"]);
    expect(REFERRAL_LABELS.oa).toBe("O&A");
    expect(isReferral("oa")).toBe(true);
    expect(isReferral(" oa")).toBe(false);
    expect(isReferral("xyz")).toBe(false);
    expect(isReferral(undefined)).toBe(false);
  });
});
