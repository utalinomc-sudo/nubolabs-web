// Cifras de resultados: solo con respaldo, ocultas por defecto (cambio cifras-con-respaldo, design.md decisiones 1 y 2).
import { describe, expect, it } from "vitest";
import { SECTIONS, defaultSiteConfig, hasContent, mergeConfig, normalizeCifras, visibleCifras, type Cifra } from "@/lib/siteConfig";

const base = defaultSiteConfig();
const c = (valor: string, texto = "en responder cotizaciones", fuente = "Piloto con cliente de O&A, 2026"): Cifra => ({ valor, texto, fuente });

describe("defaults de cifras", () => {
  it("sección oculta por defecto, sin cifras y con una frase que no habla de horas", () => {
    expect(base.visible.cifras).toBe(false);
    expect(base.content.cifras.items).toEqual([]);
    expect(base.content.cifras.frase).toBe(
      "Medimos cada proyecto con los indicadores que tú elijas, y en el diagnóstico te mostramos los números de tu caso.",
    );
    expect(base.content.cifras.frase).not.toMatch(/horas/i);
  });

  it("es la única sección oculta por defecto y va justo después de casos", () => {
    expect(Object.entries(base.visible).filter(([, v]) => !v).map(([k]) => k)).toEqual(["cifras"]);
    const keys = SECTIONS.map((s) => s.key);
    expect(keys[keys.indexOf("casos") + 1]).toBe("cifras");
  });

  it("un documento sin la clave cifras la deja oculta; solo un true guardado la muestra", () => {
    expect(mergeConfig(base, { visible: { hero: true } }).visible.cifras).toBe(false);
    expect(mergeConfig(base, { visible: { cifras: "true" } }).visible.cifras).toBe(false);
    expect(mergeConfig(base, { visible: { cifras: true } }).visible.cifras).toBe(true);
  });
});

describe("normalizeCifras", () => {
  it("no arreglo → []; recorta y conserva incompletos (para terminarlos en el admin)", () => {
    expect(normalizeCifras(undefined)).toEqual([]);
    expect(normalizeCifras("x")).toEqual([]);
    expect(normalizeCifras([{ valor: " Mismo día ", texto: " en responder ", fuente: "" }, null, { valor: 3 }])).toEqual([
      { valor: "Mismo día", texto: "en responder", fuente: "" },
      { valor: "", texto: "", fuente: "" },
    ]);
  });
});

describe("visibleCifras", () => {
  it("descarta las que no tienen valor, texto o fuente y respeta el orden", () => {
    const items = [c("A"), c("B", "texto", ""), c("", "x"), c("C", " "), c("D")];
    expect(visibleCifras(items).map((x) => x.valor)).toEqual(["A", "D"]);
  });

  // Revisión adversarial: caracteres invisibles (pegados desde Word o WhatsApp) o signos sueltos no son una fuente.
  it("exige al menos una letra o dígito en valor, texto y fuente", () => {
    for (const vacio of ["\u200B", "\u200C\u200D", "\u2060", "\u00AD", "\u180E", ".", "-", " – "]) {
      expect(visibleCifras([c("+300%", "texto", vacio)])).toEqual([]);
      expect(visibleCifras([c(vacio, "texto")])).toEqual([]);
      expect(visibleCifras([c("A", vacio)])).toEqual([]);
    }
    expect(hasContent("2026")).toBe(true);
    expect(hasContent("Ñ")).toBe(true);
    expect(hasContent("\u200B.")).toBe(false);
  });

  it("como máximo las 4 primeras válidas", () => {
    expect(visibleCifras(["1", "2", "3", "4", "5", "6"].map((v) => c(v))).map((x) => x.valor)).toEqual(["1", "2", "3", "4"]);
  });
});

describe("mergeConfig de cifras", () => {
  it("sin content.cifras: sin cifras y frase por defecto", () => {
    expect(mergeConfig(base, {}).content.cifras).toEqual(base.content.cifras);
  });

  it("una frase guardada vacía se respeta (apaga la frase); una que no es texto usa la de por defecto", () => {
    expect(mergeConfig(base, { content: { cifras: { frase: "  " } } }).content.cifras.frase).toBe("");
    expect(mergeConfig(base, { content: { cifras: { frase: 5 } } }).content.cifras.frase).toBe(base.content.cifras.frase);
    expect(mergeConfig(base, { content: { cifras: { frase: " Otra " } } }).content.cifras.frase).toBe("Otra");
  });

  it("normaliza las cifras guardadas y no falla con formas raras", () => {
    expect(mergeConfig(base, { content: { cifras: { items: [c(" Mismo día ")] } } }).content.cifras.items).toEqual([c("Mismo día")]);
    expect(mergeConfig(base, { content: { cifras: "x" } }).content.cifras).toEqual(base.content.cifras);
  });
});
