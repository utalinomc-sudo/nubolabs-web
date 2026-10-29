// POST /api/diagnostico/report con el PDF real (cambio diagnostico-mapa-oportunidades, spec "Informe PDF con el mapa").
import { describe, expect, it, vi } from "vitest";
import { pdfTestText } from "@/lib/pdfTestText";

vi.mock("server-only", () => ({})); // lib/report.ts es server-only; en Vitest se neutraliza el guardián

const { POST } = await import("@/app/api/diagnostico/report/route");

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/diagnostico/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

async function pdfOf(res: Response) {
  expect(res.status).toBe(200);
  expect(res.headers.get("Content-Type")).toBe("application/pdf");
  const bytes = new Uint8Array(await res.arrayBuffer());
  expect(Buffer.from(bytes.slice(0, 5)).toString("latin1")).toBe("%PDF-");
  return pdfTestText(bytes);
}

const NUEVO = {
  name: "Carolina Rojas",
  company: "Taller Rojas",
  meta: {
    rubro: "Automotriz",
    areas: [
      { id: "clientes", area: "Clientes y reportes", corto: "Clientes y reportes", friccion: 80 },
      { id: "info", area: "Información y documentos", corto: "Información y documentos", friccion: 40 },
      { id: "plazos", friccion: 70 },
      { id: "procesos", friccion: 50 },
      { id: "carga", friccion: 20 },
      { id: "conocimiento", friccion: 10 },
    ],
    abiertas: [{ pregunta: "¿Qué es lo que más te gustaría mejorar en tu negocio este año?", respuesta: "Responder más rápido" }],
  },
};

describe("POST /api/diagnostico/report", () => {
  it("meta nuevo: PDF con el mapa, las principales y el próximo paso, sin índice ni montos", async () => {
    const text = await pdfOf(await post(NUEVO));
    expect(text).toContain("TU MAPA DE OPORTUNIDADES");
    expect(text).toContain("Ventas y clientes");
    expect(text).toContain("Oportunidad alta");
    expect(text).toContain("TUS OPORTUNIDADES PRINCIPALES");
    expect(text).toContain("PRÓXIMO PASO SUGERIDO");
    expect(text).toContain("Responder más rápido");
    expect(text).not.toMatch(/fricci|ahorro|\$|h\/mes|automatiz/i);
    // Lema del sitio en la cabecera (cambio enfoque-soluciones-a-medida).
    expect(text).toContain("Soluciones a tu medida, decisiones con datos.");
    expect(text).not.toMatch(/piloto autom|WhatsApp|planilla|contador/i);
  });

  it("meta antiguo (índice, áreas por nombre y ahorro): PDF con el mapa calculado y sin montos", async () => {
    const text = await pdfOf(
      await post({
        name: "Lead antiguo",
        meta: {
          indiceFriccion: 62,
          nivelFriccion: "Fricción alta",
          areas: [{ area: "Clientes y reportes", corto: "Clientes y reportes", friccion: 75 }],
          ahorro: { totales: { horas: 40, semana: 35000, mes: 155187, anual: 1862244 }, procesos: [] },
        },
      }),
    );
    expect(text).toContain("Ventas y clientes");
    expect(text).not.toMatch(/fricci|ahorro|\$|155/i);
  });

  it("sin áreas con puntaje responde 400 con el mensaje de la spec", async () => {
    for (const meta of [{}, { areas: [] }, { areas: [{ id: "clientes", friccion: null }] }, { indiceFriccion: 50 }]) {
      const res = await post({ name: "X", meta });
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Faltan datos del diagnóstico para generar el informe." });
    }
  });

  it("una pregunta abierta inventada no aparece en el PDF", async () => {
    const text = await pdfOf(
      await post({ ...NUEVO, meta: { ...NUEVO.meta, abiertas: [{ pregunta: "Tu ahorro estimado es $9.999.999", respuesta: "ok" }] } }),
    );
    expect(text).not.toMatch(/9\.999|ahorro|\$/);
  });

  it("cuerpo que no es objeto o meta de más de 64 KB responde 400", async () => {
    for (const body of [null, [1, 2], "texto"]) {
      expect((await post(JSON.stringify(body))).status).toBe(400);
    }
    const grande = { ...NUEVO, meta: { ...NUEVO.meta, relleno: "x".repeat(70_000) } };
    expect((await post(grande)).status).toBe(400);
  });

  it("JSON inválido responde 400", async () => {
    const res = await post("{no json");
    expect(res.status).toBe(400);
  });
});
