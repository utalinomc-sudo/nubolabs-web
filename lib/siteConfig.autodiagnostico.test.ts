// Bloque "Autodiagnóstico" de la portada en el CMS (cambio diagnostico-mapa-oportunidades, design.md decisión 8).
import { describe, expect, it } from "vitest";
import { SECTIONS, defaultSiteConfig, mergeConfig } from "@/lib/siteConfig";

const base = defaultSiteConfig();

describe("sección autodiagnostico", () => {
  it("va entre proceso y contacto y está visible por defecto (también sin la clave guardada)", () => {
    const keys = SECTIONS.map((s) => s.key);
    expect(keys[keys.indexOf("proceso") + 1]).toBe("autodiagnostico");
    expect(keys[keys.indexOf("autodiagnostico") + 1]).toBe("contacto");
    expect(base.visible.autodiagnostico).toBe(true);
    expect(mergeConfig(base, { visible: { hero: true } }).visible.autodiagnostico).toBe(true);
    expect(mergeConfig(base, { visible: { autodiagnostico: false } }).visible.autodiagnostico).toBe(false);
  });

  it("textos por defecto de la spec", () => {
    expect(base.content.autodiagnostico).toEqual({
      eyebrow: "Autodiagnóstico · 5 minutos",
      title: "¿No sabes por dónde partir? Descubre dónde está tu mayor oportunidad.",
      body: "Responde unas preguntas simples sobre tu día a día y recibe tu mapa de oportunidades en PDF, al instante. Ideal para llegar con todo a la sesión gratuita.",
      cta: "Hacer el autodiagnóstico",
    });
  });

  it("override parcial del título; vacíos o no texto toman el default", () => {
    const c = mergeConfig(base, { content: { autodiagnostico: { title: "Otro título", body: "  ", cta: 5 } } }).content.autodiagnostico;
    expect(c).toEqual({ ...base.content.autodiagnostico, title: "Otro título" });
    expect(mergeConfig(base, { content: { autodiagnostico: "x" } }).content.autodiagnostico).toEqual(base.content.autodiagnostico);
  });
});
