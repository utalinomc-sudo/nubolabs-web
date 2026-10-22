// Filtro de casos por rubro: funciones puras (cambio casos-por-rubro, design.md decisión 3).
import { describe, expect, it } from "vitest";
import { availableRubros, filterCases, resultsLabel, rubroLabel } from "@/components/landing/casesFilter";
import { CASE_RUBROS, defaultSiteConfig, type CaseItem, type CaseRubro } from "@/lib/siteConfig";

const defaults = defaultSiteConfig().content.casos.items;
const caso = (title: string, rubro: CaseRubro): CaseItem => ({ title, body: "", rubro });

describe("availableRubros", () => {
  it("con los defaults, los 5 rubros en el orden de CASE_RUBROS (sin 'todos')", () => {
    expect(availableRubros(defaults)).toEqual(CASE_RUBROS.map((r) => r.key));
  });

  it("excluye los rubros sin casos y respeta el orden de la lista, no el de los casos", () => {
    expect(availableRubros([caso("a", "comercio"), caso("b", "todos"), caso("c", "gastronomia")])).toEqual(["gastronomia", "comercio"]);
  });

  it("solo casos para todos → ningún rubro", () => {
    expect(availableRubros([caso("a", "todos"), caso("b", "todos")])).toEqual([]);
  });
});

describe("filterCases", () => {
  it("'all' devuelve todos los casos", () => {
    expect(filterCases(defaults, "all")).toEqual(defaults);
  });

  it("un rubro devuelve sus casos y los 'para todos', en el orden original", () => {
    const out = filterCases(defaults, "automotriz");
    expect(out).toHaveLength(5);
    expect(out.map((c) => c.rubro)).toEqual(["todos", "todos", "todos", "automotriz", "automotriz"]);
    expect(filterCases(defaults, "gastronomia")).toHaveLength(6);
    const mixed = [caso("1", "comercio"), caso("2", "todos"), caso("3", "servicios"), caso("4", "comercio")];
    expect(filterCases(mixed, "comercio").map((c) => c.title)).toEqual(["1", "2", "4"]);
  });
});

describe("resultsLabel y rubroLabel", () => {
  it("anuncia la cantidad y el rubro elegido", () => {
    expect(resultsLabel(6, "gastronomia")).toBe("Mostrando 6 ejemplos de Gastronomía");
    expect(resultsLabel(14, "all")).toBe("Mostrando 14 ejemplos");
    expect(resultsLabel(1, "comercio")).toBe("Mostrando 1 ejemplo de Comercio");
  });

  it("etiqueta de cada rubro, con 'Para todos'", () => {
    expect(rubroLabel("todos")).toBe("Para todos");
    expect(rubroLabel("servicios")).toBe("Servicios profesionales");
  });
});
