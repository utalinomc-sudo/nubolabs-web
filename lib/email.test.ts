// Correo al cliente con su informe (cambio diagnostico-mapa-oportunidades, spec "Correo al cliente con su mayor oportunidad").
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({})); // lib/email.ts es server-only; en Vitest se neutraliza el guardián

const { buildClientReportHtml, sendClientReport } = await import("@/lib/email");

describe("buildClientReportHtml", () => {
  it("nombra la mayor oportunidad y el próximo paso, con el botón para agendar, sin fricción ni ahorro", () => {
    const html = buildClientReportHtml(
      {
        name: "Carolina Rojas",
        email: "carolina@tallerrojas.cl",
        company: "Taller Rojas",
        oportunidadPrincipal: "Ventas y clientes",
        proximoPaso: "Responder consultas y cotizaciones el mismo día, con seguimiento automático.",
      },
      "https://agenda.ejemplo.cl",
    );
    expect(html).toContain("Hola Carolina");
    expect(html).toContain("TU MAYOR OPORTUNIDAD");
    expect(html).toContain("Ventas y clientes");
    expect(html).toContain("Responder consultas y cotizaciones el mismo día");
    expect(html).toContain("mapa de oportunidades");
    expect(html).toContain('href="https://agenda.ejemplo.cl"');
    expect(html).not.toMatch(/fricci|ahorro|\$|automatizar/i);
    // Lema del sitio (cambio enfoque-soluciones-a-medida, spec diagnostico/mapa-oportunidades "Lema del sitio…").
    expect(html).toContain("Soluciones a tu medida, decisiones con datos.");
    expect(html).not.toMatch(/piloto automático|WhatsApp|planilla|contador/i);
  });

  it("sendClientReport envía a Resend el asunto del mapa con el PDF adjunto", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "{}" });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("RESEND_API_KEY", "re_prueba");
    const res = await sendClientReport({ name: "Ana", email: "ana@x.cl", oportunidadPrincipal: "Ventas y clientes" }, new Uint8Array([37, 80, 68, 70]));
    expect(res.ok).toBe(true);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.to).toEqual(["ana@x.cl"]);
    expect(body.subject).toBe("Tu mapa de oportunidades — Nubolabs");
    expect(body.attachments[0].filename).toMatch(/\.pdf$/);
    expect(body.html).toContain("Ventas y clientes");
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("escapa el HTML de los datos del cliente y funciona sin oportunidad", () => {
    const html = buildClientReportHtml({ name: "<b>Ana</b>", email: "a@b.cl", company: "<script>x</script>" }, "https://www.nubolabs.cl");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;Ana&lt;/b&gt;");
    expect(html).not.toContain("TU MAYOR OPORTUNIDAD");
  });
});
