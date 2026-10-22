// Medición de la campaña en el panel (cambio landing-referidos-oa, design.md decisión 7).
import { describe, expect, it } from "vitest";
import { LEAD_ORIGINS, countLeadsByOrigin, filterLeadsByOrigin, parseLeadOrigin } from "@/lib/leadStats";

const NOW = new Date("2026-10-22T15:00:00.000Z");
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
const lead = (source: string | undefined, createdAt: unknown, referral?: string) => ({ source, createdAt, referral });

describe("countLeadsByOrigin", () => {
  it("escenario de la spec: 3 formulario (1 O&A) y 2 diagnósticos (2 O&A) recientes, 4 antiguos → 3/2/3", () => {
    const leads = [
      lead("landing", daysAgo(1), "oa"),
      lead("landing", daysAgo(5)),
      lead("landing", daysAgo(29)),
      lead("diagnostico", daysAgo(2), "oa"),
      lead("diagnostico", daysAgo(10), "oa"),
      lead("landing", daysAgo(31), "oa"),
      lead("landing", daysAgo(60)),
      lead("diagnostico", daysAgo(45), "oa"),
      lead("diagnostico", daysAgo(400)),
    ];
    expect(countLeadsByOrigin(leads, NOW)).toEqual({ landing: 3, diagnostico: 2, oa: 3 });
  });

  it("no cuenta leads con fecha ausente, inválida, que no es texto o futura", () => {
    const leads = [lead("landing", undefined), lead("landing", "no es fecha"), lead("landing", 12345), lead("diagnostico", daysAgo(-1), "oa")];
    expect(countLeadsByOrigin(leads, NOW)).toEqual({ landing: 0, diagnostico: 0, oa: 0 });
  });

  it("el borde exacto de 30 días cuenta; un minuto antes ya no", () => {
    const borde = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000);
    expect(countLeadsByOrigin([lead("landing", borde.toISOString())], NOW).landing).toBe(1);
    expect(countLeadsByOrigin([lead("landing", new Date(borde.getTime() - 60_000).toISOString())], NOW).landing).toBe(0);
  });

  it("un lead antiguo sin source cuenta como formulario; un referral desconocido no suma a O&A", () => {
    expect(countLeadsByOrigin([lead(undefined, daysAgo(1), "xyz")], NOW)).toEqual({ landing: 1, diagnostico: 0, oa: 0 });
  });
});

describe("filtro de la lista por origen", () => {
  const leads = [
    { id: "a", source: "landing" },
    { id: "b", source: "diagnostico", referral: "oa" },
    { id: "c", source: "landing", referral: "oa" },
    { id: "d", source: "diagnostico" },
    { id: "e" },
  ];
  const ids = (origen: unknown) => filterLeadsByOrigin(leads, origen).map((l) => l.id);

  it("todos, formulario, diagnóstico y O&A (de cualquier formulario)", () => {
    expect(ids("todos")).toEqual(["a", "b", "c", "d", "e"]);
    expect(ids("landing")).toEqual(["a", "c", "e"]);
    expect(ids("diagnostico")).toEqual(["b", "d"]);
    expect(ids("oa")).toEqual(["b", "c"]);
  });

  it("un origen desconocido o ausente se trata como 'todos'", () => {
    expect(ids("xyz")).toEqual(["a", "b", "c", "d", "e"]);
    expect(ids(undefined)).toEqual(["a", "b", "c", "d", "e"]);
    expect(parseLeadOrigin(["oa", "landing"])).toBe("oa");
    expect(parseLeadOrigin(" oa ")).toBe("todos");
  });

  it("los filtros del panel son Todos, Formulario, Diagnóstico y O&A, en ese orden", () => {
    expect(LEAD_ORIGINS.map((o) => [o.key, o.label])).toEqual([
      ["todos", "Todos"],
      ["landing", "Formulario"],
      ["diagnostico", "Diagnóstico"],
      ["oa", "O&A"],
    ]);
  });
});
