// Mapa de oportunidades del diagnóstico (cambio diagnostico-mapa-oportunidades, design.md decisiones 1 a 3).
import { describe, expect, it } from "vitest";
import { AREAS } from "@/components/diagnostico/cuestionario";
import {
  DIMENSIONS,
  OPPORTUNITY_LABELS,
  areaScore,
  areaScoresFromMeta,
  buildOpportunityMap,
  opportunityLevel,
  diagnosticSummary,
  normalizeDiagnosticMeta,
  type DimensionId,
} from "@/components/diagnostico/oportunidades";

// Puntajes por dimensión → puntajes por área que los producen (una sola área por dimensión basta).
const byDim = (v: Partial<Record<DimensionId, number>>) => ({
  ...(v.ventas !== undefined ? { clientes: v.ventas } : {}),
  ...(v.control !== undefined ? { info: v.control } : {}),
  ...(v.orden !== undefined ? { plazos: v.orden, procesos: v.orden } : {}),
  ...(v.equipo !== undefined ? { carga: v.equipo, conocimiento: v.equipo } : {}),
});

describe("dimensiones", () => {
  it("4 dimensiones en orden, que cubren las 6 áreas una sola vez", () => {
    expect(DIMENSIONS.map((d) => [d.id, d.nombre])).toEqual([
      ["ventas", "Ventas y clientes"],
      ["control", "Control y números"],
      ["orden", "Orden y seguimiento"],
      ["equipo", "Equipo y crecimiento"],
    ]);
    const areas = DIMENSIONS.flatMap((d) => d.areas);
    expect([...areas].sort()).toEqual(AREAS.map((a) => a.id).sort());
    expect(new Set(areas).size).toBe(6);
    expect(DIMENSIONS.find((d) => d.id === "orden")?.areas).toEqual(["plazos", "procesos"]);
    expect(DIMENSIONS.find((d) => d.id === "equipo")?.areas).toEqual(["carga", "conocimiento"]);
  });

  it("textos de la spec, sin horas ni montos", () => {
    expect(DIMENSIONS[0].logro).toBe("Vendes más: respondes antes y ningún cliente queda sin seguimiento.");
    expect(DIMENSIONS[0].proximoPaso).toBe("Responder consultas y cotizaciones el mismo día, con seguimiento automático.");
    expect(DIMENSIONS[3].proximoPaso).toBe("Liberar al equipo de la pega repetitiva y dejar escrito cómo se hacen las cosas.");
    expect(OPPORTUNITY_LABELS).toEqual({ alta: "Oportunidad alta", media: "Oportunidad media", baja: "Oportunidad baja" });
    const all = DIMENSIONS.flatMap((d) => [d.nombre, d.logro, d.proximoPaso]).join(" ");
    expect(all).not.toMatch(/\d|\$|horas|ahorro|fricci/i);
  });
});

describe("puntajes y niveles", () => {
  it("areaScore: 1 → 0, 5 → 100, ignora nulos y sin respuestas → null", () => {
    expect(areaScore([1, 1, 1])).toBe(0);
    expect(areaScore([5, 5, 5])).toBe(100);
    expect(areaScore([4, null, 4])).toBe(75);
    expect(areaScore([3, 4])).toBe(63); // 3,5 → 62,5 → 63
    expect(areaScore([null, null])).toBeNull();
    expect(areaScore([])).toBeNull();
  });

  it("umbrales: 60 alta, 59 media, 35 media, 34 baja", () => {
    expect([60, 59, 35, 34].map(opportunityLevel)).toEqual(["alta", "media", "media", "baja"]);
  });
});

describe("buildOpportunityMap", () => {
  it("dimensión con dos áreas: 75 y 50 → 63, alta", () => {
    const map = buildOpportunityMap({ plazos: 75, procesos: 50 });
    expect(map.dimensiones.find((d) => d.id === "orden")).toEqual({ id: "orden", nombre: "Orden y seguimiento", puntaje: 63, nivel: "alta" });
  });

  it("siempre las 4 dimensiones en orden; sin datos → sin puntaje ni nivel y fuera de las principales", () => {
    const map = buildOpportunityMap({ plazos: 80 });
    expect(map.dimensiones.map((d) => d.id)).toEqual(["ventas", "control", "orden", "equipo"]);
    expect(map.dimensiones[0]).toEqual({ id: "ventas", nombre: "Ventas y clientes", puntaje: null, nivel: null });
    expect(map.principales).toEqual(["orden"]);
  });

  it("tres principales: Ventas 70, Control 40, Orden 70, Equipo 20 → Ventas, Orden, Control; próximo paso de Ventas", () => {
    const map = buildOpportunityMap(byDim({ ventas: 70, control: 40, orden: 70, equipo: 20 }));
    expect(map.principales).toEqual(["ventas", "orden", "control"]);
    expect(map.proximoPaso).toBe(DIMENSIONS[0].proximoPaso);
  });

  it("máximo 3 principales aunque las 4 sean altas o medias", () => {
    const map = buildOpportunityMap(byDim({ ventas: 40, control: 90, orden: 60, equipo: 80 }));
    expect(map.principales).toEqual(["control", "equipo", "orden"]);
  });

  it("todo bajo: Ventas 10, Control 30, Orden 20, Equipo 5 → solo Control", () => {
    const map = buildOpportunityMap(byDim({ ventas: 10, control: 30, orden: 20, equipo: 5 }));
    expect(map.principales).toEqual(["control"]);
    expect(map.proximoPaso).toBe(DIMENSIONS[1].proximoPaso);
  });

  it("sin ninguna respuesta: sin principales ni próximo paso", () => {
    const map = buildOpportunityMap({});
    expect(map.principales).toEqual([]);
    expect(map.proximoPaso).toBe("");
    expect(map.dimensiones.every((d) => d.puntaje === null && d.nivel === null)).toBe(true);
  });
});

describe("areaScoresFromMeta", () => {
  it("formato nuevo (id) y antiguo (nombre o corto)", () => {
    expect(areaScoresFromMeta({ areas: [{ id: "clientes", friccion: 70 }, { id: "plazos", friccion: 40 }] })).toEqual({ clientes: 70, plazos: 40 });
    expect(
      areaScoresFromMeta({
        indiceFriccion: 55,
        areas: [
          { area: "Clientes y reportes", corto: "Clientes y reportes", friccion: 80 },
          { area: "Otra cosa", corto: "Procesos y escala", friccion: 30 },
        ],
      }),
    ).toEqual({ clientes: 80, procesos: 30 });
  });

  it("ignora entradas inválidas y metas que no son objeto", () => {
    expect(
      areaScoresFromMeta({
        areas: [
          { id: "clientes", friccion: "70" },
          { id: "mineria", friccion: 50 },
          { area: "Clientes", friccion: 50 },
          { id: "info", friccion: null },
          { id: "carga", friccion: 140 },
          { id: "conocimiento", friccion: Number.NaN },
          null,
          "x",
          { id: "plazos", friccion: 20 },
        ],
      }),
    ).toEqual({ plazos: 20 });
    expect(areaScoresFromMeta(null)).toEqual({});
    expect(areaScoresFromMeta("meta")).toEqual({});
    expect(areaScoresFromMeta({ areas: "no" })).toEqual({});
  });
});

// Revisión adversarial (Major): el servidor rearma el meta del diagnóstico antes de guardarlo o dibujar el PDF.
describe("normalizeDiagnosticMeta", () => {
  const ans = (v: unknown) => [{ valor: v }, { valor: v }, { valor: v }];

  it("recalcula el mapa (ignora el del cliente), quita el ahorro y no muta la entrada", () => {
    const meta = {
      rubro: "Comercio",
      areas: [{ id: "clientes", friccion: 80 }],
      oportunidades: { principales: ["equipo", "control", "orden"], proximoPaso: "inventado" },
      ahorro: { totales: { mes: 1 } },
      otraCosa: "x",
    };
    const out = normalizeDiagnosticMeta(meta);
    expect(out).not.toHaveProperty("ahorro");
    expect(out).not.toHaveProperty("otraCosa");
    expect(out.rubro).toBe("Comercio");
    expect(out.oportunidades).toEqual({ version: 1, ...buildOpportunityMap({ clientes: 80 }) });
    expect(meta).toHaveProperty("ahorro");
  });

  it("un área mínima { id, friccion } queda con las 6 áreas completas y nombre y respuestas por pregunta", () => {
    const out = normalizeDiagnosticMeta({ areas: [{ id: "clientes", friccion: 80 }] });
    const areas = out.areas as { id: string; area: string; corto: string; friccion: number | null; respuestas: { pregunta: string; valor: number | null }[] }[];
    expect(areas.map((a) => a.id)).toEqual(AREAS.map((a) => a.id));
    const clientes = areas.find((a) => a.id === "clientes")!;
    expect(clientes).toMatchObject({ area: "Clientes y reportes", corto: "Clientes y reportes", friccion: 80 });
    expect(clientes.respuestas).toHaveLength(3);
    expect(clientes.respuestas.every((r) => r.valor === null && typeof r.pregunta === "string" && r.pregunta)).toBe(true);
    expect(areas.find((a) => a.id === "carga")).toMatchObject({ friccion: null });
  });

  it("el puntaje sale de las respuestas (no del friccion enviado); fuera de 1–5 cuenta como sin respuesta", () => {
    const out = normalizeDiagnosticMeta({
      areas: [
        { id: "clientes", friccion: 100, respuestas: ans(1) },
        { id: "info", friccion: 0, respuestas: [{ valor: 5 }, { valor: 9 }, { valor: "5" }] },
        { id: "plazos", friccion: 140, respuestas: ans(null) },
      ],
      indiceFriccion: 99,
    });
    const areas = out.areas as { id: string; friccion: number | null; respuestas: { valor: number | null }[] }[];
    expect(areas.find((a) => a.id === "clientes")?.friccion).toBe(0);
    const info = areas.find((a) => a.id === "info")!;
    expect(info.friccion).toBe(100);
    expect(info.respuestas.map((r) => r.valor)).toEqual([5, null, null]);
    expect(areas.find((a) => a.id === "plazos")?.friccion).toBeNull(); // 140 fuera de rango
    expect(out.indiceFriccion).toBe(25); // promedio de 1,1,1,5 → 2 → 25
    expect(out.nivelFriccion).toBe("Fricción baja");
  });

  it("descarta áreas desconocidas y repetidas; busca por nombre antes que por nombre corto", () => {
    const out = normalizeDiagnosticMeta({
      areas: [
        { id: "mineria", friccion: 90 },
        { area: "Clientes y reportes", corto: "Carga y capacidad", friccion: 70 },
        { id: "clientes", friccion: 10 },
      ],
    });
    const areas = out.areas as { id: string; friccion: number | null }[];
    expect(areas.find((a) => a.id === "clientes")?.friccion).toBe(70);
    expect(areas.find((a) => a.id === "carga")?.friccion).toBeNull();
    expect(areaScoresFromMeta({ areas: [{ area: "Clientes y reportes", corto: "Carga y capacidad", friccion: 70 }] })).toEqual({ clientes: 70 });
  });

  it("solo guarda las preguntas abiertas conocidas, con la respuesta recortada a 1.000", () => {
    const out = normalizeDiagnosticMeta({
      areas: [{ id: "clientes", friccion: 50 }],
      abiertas: [
        { pregunta: "Tu ahorro estimado es $9.999.999", respuesta: "x" },
        { pregunta: "¿Qué es lo que más te gustaría mejorar en tu negocio este año?", respuesta: "  vender más  " },
        { pregunta: "Si pudieras resolver un solo problema del día a día con una solución mágica, ¿cuál sería?", respuesta: "a".repeat(1500) },
        { pregunta: "¿Qué es lo que más te gustaría mejorar en tu negocio este año?", respuesta: "repetida" },
        "texto",
      ],
    });
    const abiertas = out.abiertas as { pregunta: string; respuesta: string }[];
    expect(abiertas.map((a) => a.pregunta)).toEqual([
      "¿Qué es lo que más te gustaría mejorar en tu negocio este año?",
      "Si pudieras resolver un solo problema del día a día con una solución mágica, ¿cuál sería?",
    ]);
    expect(abiertas[0].respuesta).toBe("vender más");
    expect(abiertas[1].respuesta).toHaveLength(1000);
  });

  it("diagnosticSummary arma el resumen interno desde el mapa", () => {
    const out = normalizeDiagnosticMeta({ areas: [{ id: "clientes", respuestas: ans(4) }] });
    expect(diagnosticSummary(out)).toBe("Autodiagnóstico — Mayor oportunidad: Ventas y clientes. Índice de fricción 75 (fricción alta).");
    expect(diagnosticSummary(normalizeDiagnosticMeta({}))).toBe("Autodiagnóstico — Mayor oportunidad: sin datos.");
  });
});

// Panel, detalle y ficha interna: el mapa de cualquier lead (nuevo o antiguo) se calcula desde sus áreas.
describe("mapFromMeta", () => {
  it("lead nuevo, lead antiguo por nombre y lead sin áreas", async () => {
    const { mapFromMeta } = await import("@/components/diagnostico/oportunidades");
    expect(mapFromMeta({ areas: [{ id: "clientes", friccion: 80 }], oportunidades: { principales: ["equipo"] } })?.principales).toEqual(["ventas"]);
    expect(mapFromMeta({ indiceFriccion: 40, areas: [{ area: "Seguimiento y plazos", friccion: 70 }], ahorro: { totales: { mes: 1 } } })?.principales).toEqual(["orden"]);
    expect(mapFromMeta({ indiceFriccion: 40 })).toBeNull();
    expect(mapFromMeta(undefined)).toBeNull();
  });
});
