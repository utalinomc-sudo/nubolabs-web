// Filtro de "Ejemplos por rubro" como funciones puras (cambio casos-por-rubro, design.md decisión 3). Lo usa
// UseCasesFilter (cliente); vive aparte para testearlo sin DOM.
import { casesLabels } from "@/lib/content";
import { CASE_RUBROS, type CaseItem, type CaseRubro, type CaseRubroKey } from "@/lib/siteConfig";

// "all" = chip "Todos". "todos" no es un filtro: los casos "para todos" aparecen con cualquier rubro.
export type CaseFilter = "all" | CaseRubroKey;

// Rubros con al menos un caso, en el orden de CASE_RUBROS (el del formulario), sin "todos".
export function availableRubros(items: CaseItem[]): CaseRubroKey[] {
  return CASE_RUBROS.filter((r) => items.some((c) => c.rubro === r.key)).map((r) => r.key);
}

// Casos del rubro elegido más los "para todos", en el orden original.
export function filterCases(items: CaseItem[], filter: CaseFilter): CaseItem[] {
  if (filter === "all") return items;
  return items.filter((c) => c.rubro === filter || c.rubro === "todos");
}

export function rubroLabel(rubro: CaseRubro): string {
  if (rubro === "todos") return casesLabels.forAll;
  return CASE_RUBROS.find((r) => r.key === rubro)?.label ?? casesLabels.forAll;
}

// Texto de la región viva: "Mostrando 6 ejemplos de Gastronomía" / "Mostrando 14 ejemplos".
export function resultsLabel(count: number, filter: CaseFilter): string {
  const noun = count === 1 ? casesLabels.one : casesLabels.many;
  const base = `${casesLabels.showing} ${count} ${noun}`;
  return filter === "all" ? base : `${base} ${casesLabels.of} ${rubroLabel(filter)}`;
}
