// Tests de la validación y normalización de leads (cambio formulario-minimo-consentimiento, design.md decisión 2).
import { describe, expect, it } from "vitest";
import { CONSENT_TEXTS, CONSENT_VERSION } from "@/lib/leadOptions";
import { LEAD_SOURCES, isHoneypotFilled, isValidEmail, isValidPhone, normalizeLead, safeScheduleUrl } from "@/lib/leads";

const NOW = new Date("2026-10-22T15:30:00.000Z");
const VALID = { name: "Carolina Rojas", email: "carolina@tallerrojas.cl", phone: "+56 9 5555 1234", contactConsent: true };

function ok(body: unknown) {
  const r = normalizeLead(body, NOW);
  if (!r.ok) throw new Error(`se esperaba ok y vino error: ${r.error}`);
  return r.lead;
}
function err(body: unknown) {
  const r = normalizeLead(body, NOW);
  if (r.ok) throw new Error("se esperaba error y vino ok");
  return r.error;
}

describe("validadores", () => {
  it("isValidPhone acepta de 8 a 15 dígitos ignorando el formato", () => {
    expect(isValidPhone("+56 9 1234 5678")).toBe(true);
    expect(isValidPhone("12345678")).toBe(true);
    expect(isValidPhone("1234")).toBe(false);
    expect(isValidPhone("1234567890123456")).toBe(false);
    expect(isValidPhone(56912345678)).toBe(false);
  });

  it("isValidEmail exige algo@dominio.ext", () => {
    expect(isValidEmail("tu@empresa.cl")).toBe(true);
    expect(isValidEmail("carolina@tallerrojas")).toBe(false);
  });

  it("isHoneypotFilled detecta el campo trampa con contenido", () => {
    expect(isHoneypotFilled({ website: "spam" })).toBe(true);
    expect(isHoneypotFilled({ website: "  " })).toBe(false);
    expect(isHoneypotFilled({ website: "" })).toBe(false);
    expect(isHoneypotFilled({})).toBe(false);
    expect(isHoneypotFilled("texto")).toBe(false);
  });

  it("safeScheduleUrl acepta solo URLs http(s)", () => {
    expect(safeScheduleUrl(" https://calendly.com/nubolabs/30min ")).toBe("https://calendly.com/nubolabs/30min");
    expect(safeScheduleUrl("http://example.com/agenda")).toBe("http://example.com/agenda");
    expect(safeScheduleUrl(undefined)).toBeNull();
    expect(safeScheduleUrl("")).toBeNull();
    expect(safeScheduleUrl("javascript:alert(1)")).toBeNull();
    expect(safeScheduleUrl("calendly.com/x")).toBeNull();
  });

  it("los orígenes permitidos son landing y diagnostico", () => {
    expect([...LEAD_SOURCES]).toEqual(["landing", "diagnostico"]);
  });
});

describe("normalizeLead: errores", () => {
  it("rechaza cuerpos que no son objeto", () => {
    expect(err(null)).toBeTruthy();
    expect(err("hola")).toBeTruthy();
    expect(err([VALID])).toBeTruthy();
  });

  it("exige nombre y correo válidos", () => {
    expect(err({ ...VALID, name: "  " })).toBe("Nombre y email son obligatorios.");
    expect(err({ ...VALID, email: undefined })).toBe("Nombre y email son obligatorios.");
    expect(err({ ...VALID, email: "carolina@tallerrojas" })).toBe("El email no es válido.");
  });

  it("exige WhatsApp de 8 a 15 dígitos", () => {
    expect(err({ ...VALID, phone: "1234" })).toBe("Revisa el WhatsApp: debe tener entre 8 y 15 dígitos.");
    expect(err({ ...VALID, phone: undefined })).toBe("Revisa el WhatsApp: debe tener entre 8 y 15 dígitos.");
  });

  it("exige contactConsent exactamente true", () => {
    expect(err({ ...VALID, contactConsent: undefined })).toBe("Necesitamos tu permiso para contactarte.");
    expect(err({ ...VALID, contactConsent: "true" })).toBe("Necesitamos tu permiso para contactarte.");
    expect(err({ ...VALID, contactConsent: false })).toBe("Necesitamos tu permiso para contactarte.");
  });
});

describe("normalizeLead: paridad con el navegador (revisión adversarial)", () => {
  // Todo WhatsApp que el navegador da por válido (máx. 30 caracteres, 8 a 15 dígitos) se acepta y se guarda tal cual.
  const phones = [
    "+56 9 5555 1234",
    "56955551234",
    "(+56) 9 5555-1234",
    "Mi WhatsApp: +56 9 1234 5678",
    "+1 (415) 555-0100",
    "12345678",
    "+56 9 1234 5678 ext 12",
  ];
  for (const phone of phones) {
    it(`acepta y guarda sin recortar: "${phone}"`, () => {
      expect(phone.length).toBeLessThanOrEqual(30);
      expect(isValidPhone(phone)).toBe(true);
      expect(ok({ ...VALID, phone }).phone).toBe(phone);
    });
  }

  it("rechaza (no recorta) un WhatsApp de más de 30 caracteres", () => {
    const phone = "WhatsApp (celular personal): +56 9 1234 5678";
    expect(phone.length).toBeGreaterThan(30);
    expect(err({ ...VALID, phone })).toBe("Revisa el WhatsApp: debe tener entre 8 y 15 dígitos.");
  });

  it("no guarda un número recortado: si pasa de 30 caracteres se rechaza aunque recortado parezca válido", () => {
    const phone = "Mi WhatsApp es el +56 9 1234 5678"; // 33 caracteres; recortado a 30 quedaría "…+56 9 1234 5" (9 dígitos)
    expect(err({ ...VALID, phone })).toBe("Revisa el WhatsApp: debe tener entre 8 y 15 dígitos.");
  });

  it("rechaza (no recorta) un correo de más de 254 caracteres", () => {
    const email = `${"a".repeat(250)}@empresa.cl`;
    expect(err({ ...VALID, email })).toBe("El email no es válido.");
  });
});

describe("normalizeLead: lead guardado", () => {
  it("un lead mínimo queda con la prueba del consentimiento de contacto", () => {
    const lead = ok(VALID);
    expect(lead).toMatchObject({
      name: "Carolina Rojas",
      email: "carolina@tallerrojas.cl",
      phone: "+56 9 5555 1234",
      company: "",
      message: "",
      source: "landing",
      status: "new",
      createdAt: NOW.toISOString(),
      contactConsent: true,
      marketingConsent: false,
      consentAt: NOW.toISOString(),
      consentVersion: CONSENT_VERSION,
      consentText: { contact: CONSENT_TEXTS.contact },
    });
    expect(lead.consentText).not.toHaveProperty("marketing");
    expect(lead).not.toHaveProperty("goals");
    expect(lead).not.toHaveProperty("industry");
    expect(lead).not.toHaveProperty("meta");
  });

  it("con novedades aceptadas guarda también ese texto", () => {
    const lead = ok({ ...VALID, marketingConsent: true });
    expect(lead.marketingConsent).toBe(true);
    expect(lead.consentText).toEqual({ contact: CONSENT_TEXTS.contact, marketing: CONSENT_TEXTS.marketing });
    expect(ok({ ...VALID, marketingConsent: "true" }).marketingConsent).toBe(false);
  });

  it("ignora el texto de consentimiento enviado por el cliente", () => {
    const lead = ok({ ...VALID, consentText: { contact: "otra cosa" }, consentVersion: "x", consentAt: "1999-01-01" });
    expect(lead.consentText.contact).toBe(CONSENT_TEXTS.contact);
    expect(lead.consentVersion).toBe(CONSENT_VERSION);
    expect(lead.consentAt).toBe(NOW.toISOString());
  });

  it("deja solo objetivos válidos y únicos, e industria válida", () => {
    const lead = ok({ ...VALID, goals: ["sell_more", "hackear", "sell_more", 3, "collect_on_time"], industry: "automotriz" });
    expect(lead.goals).toEqual(["sell_more", "collect_on_time"]);
    expect(lead.industry).toBe("automotriz");
    const bad = ok({ ...VALID, goals: ["hackear"], industry: "mineria" });
    expect(bad).not.toHaveProperty("goals");
    expect(bad).not.toHaveProperty("industry");
    expect(ok({ ...VALID, goals: "sell_more" })).not.toHaveProperty("goals");
  });

  it("guarda el detalle de 'Otra cosa' y 'Otro' solo con esas opciones, recortado y hasta 70", () => {
    const lead = ok({ ...VALID, goals: ["sell_more", "other"], goalOther: "  Abrir una segunda sucursal  ", industry: "otro", industryOther: "Transporte de carga" });
    expect(lead.goalOther).toBe("Abrir una segunda sucursal");
    expect(lead.industryOther).toBe("Transporte de carga");
    expect(ok({ ...VALID, goals: ["other"], goalOther: "x".repeat(90) }).goalOther).toHaveLength(70);
    const sinOpcion = ok({ ...VALID, goals: ["sell_more"], goalOther: "no va", industry: "automotriz", industryOther: "no va" });
    expect(sinOpcion).not.toHaveProperty("goalOther");
    expect(sinOpcion).not.toHaveProperty("industryOther");
    const vacios = ok({ ...VALID, goals: ["other"], goalOther: "   ", industry: "otro", industryOther: 42 });
    expect(vacios).not.toHaveProperty("goalOther");
    expect(vacios).not.toHaveProperty("industryOther");
  });

  it("acepta solo orígenes conocidos", () => {
    expect(ok({ ...VALID, source: "diagnostico" }).source).toBe("diagnostico");
    expect(ok({ ...VALID, source: "x" }).source).toBe("landing");
    expect(ok({ ...VALID, source: 7 }).source).toBe("landing");
  });

  it("recorta espacios y limita largos", () => {
    const lead = ok({
      ...VALID,
      name: `  ${"N".repeat(200)}  `,
      company: "E".repeat(300),
      phone: `+56 9 5555 1234${" ".repeat(40)}`,
      message: "M".repeat(1500),
    });
    expect(lead.name).toHaveLength(120);
    expect(lead.company).toHaveLength(120);
    expect(lead.phone.length).toBeLessThanOrEqual(30);
    expect(lead.message).toHaveLength(1000);
  });

  it("conserva meta solo si es un objeto plano de un diagnóstico", () => {
    const diag = { ...VALID, source: "diagnostico" };
    expect(ok({ ...diag, meta: { indiceFriccion: 62 } }).meta).toEqual({ indiceFriccion: 62 });
    expect(ok({ ...diag, meta: "x" })).not.toHaveProperty("meta");
    expect(ok({ ...diag, meta: [1, 2] })).not.toHaveProperty("meta");
    expect(ok({ ...VALID, meta: { rubro: "inventado" } })).not.toHaveProperty("meta"); // landing no guarda meta
  });

  it("rechaza un meta de diagnóstico de más de 64 KB", () => {
    expect(err({ ...VALID, source: "diagnostico", meta: { relleno: "x".repeat(70_000) } })).toBe("Solicitud inválida.");
    expect(ok({ ...VALID, source: "diagnostico", meta: { relleno: "x".repeat(60_000) } }).meta).toBeTruthy();
  });

  it("no copia campos desconocidos ni el honeypot", () => {
    const lead = ok({ ...VALID, website: "", admin: true, status: "won" });
    expect(lead).not.toHaveProperty("website");
    expect(lead).not.toHaveProperty("admin");
    expect(lead.status).toBe("new");
  });
});

// Cambio landing-referidos-oa (design.md decisiones 1 y 2): el referido es un campo aparte; `source` no cambia.
describe("normalizeLead: referido", () => {
  it("guarda referral 'oa' (también con espacios) y deja source como el formulario", () => {
    expect(ok({ ...VALID, source: "landing", referral: "oa" })).toMatchObject({ source: "landing", referral: "oa" });
    expect(ok({ ...VALID, source: "diagnostico", referral: " oa " })).toMatchObject({ source: "diagnostico", referral: "oa" });
  });

  it("omite sin error un referido desconocido, vacío, que no es texto o ausente", () => {
    for (const referral of ["xyz", "OA", "", "  ", 123, null, ["oa"], { oa: true }]) {
      const lead = ok({ ...VALID, source: "landing", referral });
      expect(lead).not.toHaveProperty("referral");
      expect(lead.source).toBe("landing");
    }
    expect(ok(VALID)).not.toHaveProperty("referral");
  });

  it("el referido no cambia el origen ni el meta del diagnóstico", () => {
    const lead = ok({ ...VALID, source: "diagnostico", referral: "oa", meta: { indiceFriccion: 42 } });
    expect(lead.source).toBe("diagnostico");
    expect(lead.meta).toEqual({ indiceFriccion: 42 });
  });
});
