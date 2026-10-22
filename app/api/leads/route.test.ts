// Tests del handler POST /api/leads con Firestore, correo e informe simulados
// (cambio formulario-minimo-consentimiento, revisión adversarial: faltaba probar el handler, no solo normalizeLead).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  db: null as null | { collection: (name: string) => { add: (doc: unknown) => Promise<{ id: string }> } },
  configured: true,
  notify: vi.fn(),
  clientReport: vi.fn(),
  reportData: vi.fn(),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  getDb: () => mocks.db,
  get isAdminConfigured() {
    return mocks.configured;
  },
}));
vi.mock("@/lib/email", () => ({
  sendLeadNotification: (...args: unknown[]) => mocks.notify(...args),
  sendClientReport: (...args: unknown[]) => mocks.clientReport(...args),
}));
vi.mock("@/lib/report", () => ({
  reportDataFromLead: (...args: unknown[]) => mocks.reportData(...args), // por defecto sin informe (null)
  buildReportPdf: async () => new Uint8Array([37, 80, 68, 70]),
}));

const { POST } = await import("@/app/api/leads/route");

const VALID = {
  name: "Carolina Rojas",
  email: "carolina@tallerrojas.cl",
  phone: "+56 9 5555 1234",
  contactConsent: true,
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  mocks.add.mockReset().mockResolvedValue({ id: "lead123" });
  mocks.notify.mockReset().mockResolvedValue({ skipped: true });
  mocks.clientReport.mockReset().mockResolvedValue({ ok: true });
  mocks.reportData.mockReset().mockReturnValue(null);
  mocks.db = { collection: () => ({ add: mocks.add }) };
  mocks.configured = true;
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("POST /api/leads", () => {
  it("con el honeypot lleno responde 200 sin guardar ni avisar", async () => {
    const res = await post({ ...VALID, website: "spam" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, persisted: false });
    expect(mocks.add).not.toHaveBeenCalled();
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it("con datos inválidos responde 400 sin guardar ni avisar", async () => {
    for (const body of [{ ...VALID, contactConsent: "true" }, { ...VALID, phone: "1234" }, "{no json"]) {
      const res = await post(body);
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBeTruthy();
    }
    expect(mocks.add).not.toHaveBeenCalled();
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it("con un lead válido guarda el documento normalizado y avisa al equipo", async () => {
    const res = await post({ ...VALID, consentText: { contact: "otra cosa" }, goals: ["sell_more", "x"] });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, persisted: true, id: "lead123" });
    expect(mocks.add).toHaveBeenCalledTimes(1);
    const saved = mocks.add.mock.calls[0][0];
    expect(saved).toMatchObject({ name: "Carolina Rojas", contactConsent: true, goals: ["sell_more"], status: "new" });
    expect(saved.consentText.contact).not.toBe("otra cosa");
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ id: "lead123", email: VALID.email }));
  });

  it("sin Firebase responde persisted: false, avisa y no registra datos personales", async () => {
    mocks.db = null;
    mocks.configured = false;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await post(VALID);
    expect(await res.json()).toEqual({ ok: true, persisted: false });
    expect(mocks.notify).toHaveBeenCalledTimes(1);
    const logged = warn.mock.calls.flat().join(" ");
    expect(logged).not.toMatch(/Carolina|tallerrojas|5555/);
  });

  // Cambio landing-referidos-oa (spec "Diagnóstico referido recibe su informe").
  it("un diagnóstico referido se guarda con referral y source, recibe su informe y el aviso lleva el referido", async () => {
    mocks.reportData.mockReturnValue({ name: "Carolina Rojas", company: "", indice: 62, nivel: "Alta", ahorro: null, areas: [] });
    const res = await post({ ...VALID, source: "diagnostico", referral: "oa", meta: { indiceFriccion: 62 } });
    expect(res.status).toBe(200);
    const saved = mocks.add.mock.calls[0][0];
    expect(saved).toMatchObject({ source: "diagnostico", referral: "oa", meta: { indiceFriccion: 62 } });
    expect(mocks.clientReport).toHaveBeenCalledTimes(1);
    expect(mocks.clientReport.mock.calls[0][0]).toMatchObject({ email: VALID.email, indice: 62 });
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ source: "diagnostico", referral: "oa" }));
  });

  it("un referido no permitido se guarda sin referral y sin error", async () => {
    const res = await post({ ...VALID, referral: "xyz" });
    expect(res.status).toBe(200);
    expect(mocks.add.mock.calls[0][0]).not.toHaveProperty("referral");
  });

  it("si Firestore falla responde 500 con un mensaje para el usuario", async () => {
    mocks.add.mockRejectedValueOnce(new Error("firestore caído"));
    const res = await post(VALID);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("No se pudo guardar la solicitud. Intenta de nuevo.");
    expect(mocks.notify).not.toHaveBeenCalled();
  });
});
