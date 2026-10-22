// Prueba de humo de la ficha PDF interna (cambio formulario-minimo-consentimiento, tarea 6.2).
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({})); // lib/leadReport.ts es server-only; en Vitest se neutraliza el guardián

const { buildLeadDetailPdf } = await import("@/lib/leadReport");
const { buildReportPdf, reportDataFromLead } = await import("@/lib/report");

function isPdf(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
}

describe("buildLeadDetailPdf", () => {
  it("genera la ficha de un lead nuevo con objetivos, rubro, novedades y mensaje", async () => {
    const pdf = await buildLeadDetailPdf({
      id: "abc",
      name: "Carolina Rojas",
      email: "carolina@tallerrojas.cl",
      phone: "+56 9 5555 1234",
      company: "Taller Rojas",
      source: "landing",
      message: "Las cotizaciones se nos acumulan · y perdemos clientes.",
      createdAt: "2026-10-22T15:30:00.000Z",
      goals: ["sell_more", "collect_on_time"],
      industry: "automotriz",
      marketingConsent: true,
      consentAt: "2026-10-22T15:30:00.000Z",
    });
    expect(isPdf(pdf)).toBe(true);
    expect(pdf.length).toBeGreaterThan(1000);
  });

  // Cambio landing-referidos-oa: etiqueta "DIAGNOSTICO · O&A" en la ficha.
  it("genera la ficha de un lead referido por O&A", async () => {
    const pdf = await buildLeadDetailPdf({ name: "Referido", email: "r@x.cl", source: "diagnostico", referral: "oa", createdAt: "2026-10-22T15:30:00.000Z" });
    expect(isPdf(pdf)).toBe(true);
  });

  it("genera la ficha de un lead antiguo sin los campos nuevos", async () => {
    const pdf = await buildLeadDetailPdf({
      name: "Lead antiguo",
      email: "x@y.cl",
      source: "diagnostico",
      createdAt: "2026-09-15T12:00:00.000Z",
      meta: { rubro: "Minería", indiceFriccion: 55, nivelFriccion: "Media" },
    });
    expect(isPdf(pdf)).toBe(true);
  });

  it("no falla con emojis, flechas ni caracteres invisibles (revisión adversarial)", async () => {
    const pdf = await buildLeadDetailPdf({
      name: "Ana 👋 Pérez",
      email: "ana@cafe.cl",
      phone: "+56 9 1111 2222",
      company: "Café ☕ Central",
      source: "landing",
      message: "Hola 👋 → necesitamos ordenar ✓ las ventas​ 🚀",
      createdAt: "2026-10-22T15:30:00.000Z",
      goals: ["sell_more"],
      industry: "gastronomia",
    });
    expect(isPdf(pdf)).toBe(true);
  });
});

describe("buildReportPdf (informe al cliente)", () => {
  it("no falla con un nombre o respuestas con emojis", async () => {
    const data = reportDataFromLead({
      name: "Ana 👋",
      company: "Café ☕",
      meta: {
        indiceFriccion: 62,
        nivelFriccion: "Media",
        areas: [{ area: "Clientes", corto: "Clientes → ventas", friccion: 70 }],
        abiertas: [{ pregunta: "¿Qué te frena?", respuesta: "Todo 😩 → cotizar" }],
      },
    });
    expect(data).not.toBeNull();
    const pdf = await buildReportPdf(data!);
    expect(isPdf(pdf)).toBe(true);
  });
});
