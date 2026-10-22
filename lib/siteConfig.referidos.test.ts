// Franja de referidos de O&A en el CMS (cambio landing-referidos-oa, design.md decisión 6).
import { describe, expect, it } from "vitest";
import { SECTIONS, defaultSiteConfig, mergeConfig } from "@/lib/siteConfig";

const base = defaultSiteConfig();
const oa = (referidos: unknown) => mergeConfig(base, { content: { referidos } }).content.referidos.oa;

describe("content.referidos", () => {
  it("por defecto trae los textos de la spec y no es una sección de la portada", () => {
    expect(base.content.referidos.oa).toEqual({
      titulo: "Bienvenido, cliente de Osorio & Asociados.",
      texto: "Tu contador nos recomendó porque ayudamos a empresas como la tuya a ordenarse y crecer.",
    });
    expect(SECTIONS.map((s) => s.key)).not.toContain("referidos");
    expect(base.visible).not.toHaveProperty("referidos");
  });

  it("sin content.referidos usa los defaults; un override parcial conserva el otro texto", () => {
    expect(mergeConfig(base, {}).content.referidos.oa).toEqual(base.content.referidos.oa);
    expect(oa({ oa: { titulo: "Hola, cliente de O&A." } })).toEqual({ titulo: "Hola, cliente de O&A.", texto: base.content.referidos.oa.texto });
  });

  // Revisión adversarial: el borrador de /privacidad informa que se guarda el referido.
  it("el borrador de privacidad dice que se guarda si la persona llegó recomendada", () => {
    expect(base.content.privacidad.texto).toMatch(/Qué datos guardamos\.[^\n]*recomendad/);
  });

  it("un texto vacío, que no es texto o con forma rara toma el default", () => {
    expect(oa({ oa: { titulo: "  ", texto: 5 } })).toEqual(base.content.referidos.oa);
    expect(oa("texto")).toEqual(base.content.referidos.oa);
    expect(oa({ oa: ["x"] })).toEqual(base.content.referidos.oa);
  });
});
