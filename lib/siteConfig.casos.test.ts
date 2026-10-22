// Casos por rubro: modelo, normalización y defaults (cambio casos-por-rubro, design.md decisiones 1 y 2).
import { describe, expect, it } from "vitest";
import { INDUSTRIES } from "@/lib/leadOptions";
import { CASE_RUBROS, defaultSiteConfig, mergeConfig, normalizeCaseRubro, type CaseItem } from "@/lib/siteConfig";

const base = defaultSiteConfig();
const casos = (items: unknown) => mergeConfig(base, { content: { casos: { items } } }).content.casos.items;

describe("rubros de los casos", () => {
  it("CASE_RUBROS son los rubros del formulario sin 'otro', en el mismo orden y con sus etiquetas", () => {
    expect(CASE_RUBROS).toEqual(INDUSTRIES.filter((i) => i.key !== "otro"));
    expect(CASE_RUBROS.map((r) => r.key)).toEqual(["gastronomia", "automotriz", "construccion", "servicios", "comercio"]);
  });

  it("normalizeCaseRubro: un rubro válido se respeta; ausente, desconocido, 'otro' o no texto → 'todos'", () => {
    expect(normalizeCaseRubro("gastronomia")).toBe("gastronomia");
    expect(normalizeCaseRubro("todos")).toBe("todos");
    expect(normalizeCaseRubro(undefined)).toBe("todos");
    expect(normalizeCaseRubro("mineria")).toBe("todos");
    expect(normalizeCaseRubro("otro")).toBe("todos");
    expect(normalizeCaseRubro(" comercio ")).toBe("todos");
    expect(normalizeCaseRubro(3)).toBe("todos");
  });
});

describe("casos por defecto", () => {
  const c = base.content.casos;

  it("encabezado por rubro, sin bajada", () => {
    expect(c.eyebrow).toBe("Ejemplos por rubro");
    expect(c.title).toBe("Esto es lo que dejamos funcionando en negocios como el tuyo");
    expect(c.subtitle).toBe("");
  });

  it("14 casos: 3 para todos, 3 de gastronomía y 2 de cada otro rubro, en ese orden y sin detalle", () => {
    expect(c.items).toHaveLength(14);
    expect(c.items.map((i) => i.rubro)).toEqual([
      "todos", "todos", "todos",
      "gastronomia", "gastronomia", "gastronomia",
      "automotriz", "automotriz",
      "construccion", "construccion",
      "servicios", "servicios",
      "comercio", "comercio",
    ]);
    expect(c.items.every((i) => i.body === "")).toBe(true);
    expect(c.items[0].title).toBe("La información del mes le llega sola a tu contador.");
    expect(c.items[3].title).toBe("Reservas y consultas por WhatsApp respondidas al instante, incluso de noche.");
    expect(c.items[13].title).toBe("Clientes que vuelven con mensajes según lo que compraron.");
  });

  it("sin jerga ni 'horas'", () => {
    const text = [c.eyebrow, c.title, ...c.items.map((i) => i.title)].join(" ");
    expect(text).not.toMatch(/\bn8n\b|\bAPIs?\b|\bCRM\b|\bERP\b|horas/i);
    expect(text).not.toMatch(/\bMake\b|\bIA\b/);
  });
});

describe("mezcla de casos guardados", () => {
  it("sin casos guardados se usan los 14 por defecto", () => {
    expect(mergeConfig(base, {}).content.casos.items).toEqual(base.content.casos.items);
    expect(mergeConfig(base, { content: { casos: { title: "Otro título" } } }).content.casos.items).toHaveLength(14);
  });

  it("si no es lista, viene vacía o ningún caso tiene texto principal, se usan los defaults", () => {
    expect(casos("texto")).toEqual(base.content.casos.items);
    expect(casos([])).toEqual(base.content.casos.items);
    expect(casos([{ title: "  ", body: "algo", rubro: "comercio" }, null, "texto"])).toEqual(base.content.casos.items);
  });

  it("los casos viejos sin rubro quedan 'para todos' y conservan su descripción", () => {
    expect(casos([{ title: "Cobranzas y seguimiento", body: "Recordatorios de pago." }])).toEqual<CaseItem[]>([
      { title: "Cobranzas y seguimiento", body: "Recordatorios de pago.", rubro: "todos" },
    ]);
  });

  it("recorta, descarta los sin texto principal y normaliza el rubro", () => {
    expect(
      casos([
        { title: "  Stock al día  ", body: "  ", rubro: "comercio" },
        { title: "", body: "sin título", rubro: "comercio" },
        { title: "Pedidos", rubro: "mineria" },
        { title: "Avisos", body: 5, rubro: "otro" },
      ]),
    ).toEqual<CaseItem[]>([
      { title: "Stock al día", body: "", rubro: "comercio" },
      { title: "Pedidos", body: "", rubro: "todos" },
      { title: "Avisos", body: "", rubro: "todos" },
    ]);
  });

  it("muestra como máximo 18 casos", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ title: `Caso ${i + 1}`, rubro: "servicios" }));
    const out = casos(many);
    expect(out).toHaveLength(18);
    expect(out[17].title).toBe("Caso 18");
  });

  // Revisión adversarial: un título que solo tiene invisibles o signos no es un caso (como en cifras, con hasContent).
  it("un texto principal invisible o de solo signos no se publica", () => {
    expect(casos([{ title: "​", rubro: "comercio" }])).toEqual(base.content.casos.items);
    expect(
      casos([
        { title: "​ ⁠", rubro: "comercio" },
        { title: "...", rubro: "servicios" },
        { title: "Pedidos al día", rubro: "gastronomia" },
      ]),
    ).toEqual<CaseItem[]>([{ title: "Pedidos al día", body: "", rubro: "gastronomia" }]);
  });

  it("una bajada vacía guardada no se muestra (el default también es vacío)", () => {
    expect(mergeConfig(base, { content: { casos: { subtitle: "" } } }).content.casos.subtitle).toBe("");
    expect(mergeConfig(base, { content: { casos: { subtitle: "Bajada propia" } } }).content.casos.subtitle).toBe("Bajada propia");
  });
});
