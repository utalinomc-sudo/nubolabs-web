// @vitest-environment jsdom
// Detalle de un lead de diagnóstico con Firestore simulado (cambio diagnostico-mapa-oportunidades, revisión adversarial:
// un área guardada sin nombre ni respuestas rompía la página, y el botón de borrar solo existe aquí).
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ lead: null as null | Record<string, unknown> }));

vi.mock("@/lib/firebaseAdmin", () => ({
  getDb: () => ({
    collection: () => ({
      doc: (id: string) => ({ get: async () => ({ exists: !!mocks.lead, id, data: () => mocks.lead }) }),
    }),
  }),
}));
// Botones cliente que usan el router de Next: aquí basta con que se dibujen.
vi.mock("@/components/admin/DeleteLeadButton", () => ({ DeleteLeadButton: () => <button type="button">Borrar lead</button> }));
vi.mock("@/components/admin/LeadPdfButton", () => ({ LeadPdfButton: () => <button type="button">Ficha PDF</button> }));

const { default: LeadDetail } = await import("@/app/admin/(panel)/leads/[id]/page");

async function renderDetail(lead: Record<string, unknown>) {
  mocks.lead = lead;
  const root = document.createElement("div");
  root.innerHTML = renderToStaticMarkup(await LeadDetail({ params: Promise.resolve({ id: "lead123" }) }));
  return root.textContent ?? "";
}

const base = { name: "Lead de prueba", email: "x@y.cl", source: "diagnostico", createdAt: "2026-10-22T15:30:00.000Z" };

describe("detalle del lead", () => {
  it("un diagnóstico con un área mínima se muestra con su mapa y el botón de borrar", async () => {
    const text = await renderDetail({ ...base, meta: { indiceFriccion: 75, areas: [{ id: "clientes", friccion: 80 }] } });
    expect(text).toContain("Mapa de oportunidades");
    expect(text).toContain("Ventas y clientes");
    expect(text).toContain("Clientes y reportes");
    expect(text).toContain("Borrar lead");
    expect(text).not.toMatch(/paso opcional/);
  });

  it("un diagnóstico antiguo muestra mapa, índice y estimación de ahorro", async () => {
    const text = await renderDetail({
      ...base,
      meta: {
        indiceFriccion: 62,
        nivelFriccion: "Fricción alta",
        areas: [{ area: "Clientes y reportes", corto: "Clientes y reportes", friccion: 75, respuestas: [{ pregunta: "P", valor: 4 }] }],
        ahorro: { totales: { horas: 40, semana: 35840, mes: 155187, anual: 1862244 }, procesos: [] },
      },
    });
    expect(text).toContain("Mapa de oportunidades");
    expect(text).toContain("Oportunidad alta");
    expect(text).toContain("Fricción alta");
    expect(text).toContain("155.187");
  });
});
