// Modelo del cierre de la portada: preguntas frecuentes, CTA final y WhatsApp de contacto
// (cambio cierre-landing-faq-cta, design.md decisiones 1 y 8).
import { describe, expect, it } from "vitest";
import { SECTIONS, defaultSiteConfig, formatWhatsapp, mergeConfig, normalizeContact, whatsappLink } from "@/lib/siteConfig";

const base = defaultSiteConfig();

describe("defaults del cierre", () => {
  it("preguntas frecuentes: 7 preguntas (cambio enfoque-soluciones-a-medida) y la de datos enlaza a /privacidad", () => {
    const { faq } = base.content;
    expect(faq.eyebrow).toBe("Preguntas frecuentes");
    expect(faq.title).toBe("Lo que nos preguntan antes de partir");
    expect(faq.items.map((i) => i.pregunta)).toEqual([
      "¿Necesito saber de tecnología?",
      "¿Es una solución estándar o hecha para mi negocio?",
      "¿Tengo que cambiar mis sistemas?",
      "¿Cuánto cuesta?",
      "¿Qué pasa en la sesión gratuita?",
      "¿Cuándo voy a ver resultados?",
      "¿Qué hacen con mis datos?",
    ]);
    expect(faq.items[6].respuesta).toMatch(/\[[^\]]+\]\(\/privacidad\)/);
    // Sin herramientas ni canales en ninguna respuesta (spec landing/cierre, "Preguntas frecuentes").
    expect(faq.items.map((i) => i.respuesta).join(" ")).not.toMatch(/WhatsApp|Excel|Sheets|Google|n8n|Make|planilla/);
  });

  it("CTA final con los textos de la spec", () => {
    expect(base.content.cierre).toEqual({
      eyebrow: "Soluciones a tu medida, decisiones con datos",
      title: "Tu negocio tiene su propio problema. Empecemos por entenderlo.",
      body: "Cuéntanos qué te frena y te mostramos por dónde partir.",
      cta: "Agendar mi diagnóstico gratis",
    });
  });

  it("WhatsApp: número de Germán y ambos interruptores apagados", () => {
    expect(base.content.contact).toEqual({ whatsappNumber: "56932590783", showWhatsapp: false, showWhatsappQr: false });
  });

  it("SECTIONS suma faq y cierre después de contacto, visibles por defecto", () => {
    const keys = SECTIONS.map((s) => s.key);
    expect(keys.slice(keys.indexOf("contacto"), keys.indexOf("contacto") + 3)).toEqual(["contacto", "faq", "cierre"]);
    const c = mergeConfig(base, { visible: { hero: true, contacto: true } });
    expect(c.visible.faq).toBe(true);
    expect(c.visible.cierre).toBe(true);
  });
});

describe("mergeConfig del cierre", () => {
  it("faq.items que no es lista, vacía o sin pregunta y respuesta → defaults", () => {
    for (const items of ["x", [], [{ pregunta: "¿Algo?", respuesta: "" }, { pregunta: "", respuesta: "Sí" }, 3]]) {
      expect(mergeConfig(base, { content: { faq: { items } } }).content.faq.items).toEqual(base.content.faq.items);
    }
  });

  it("deja solo las preguntas completas, recortadas, y como máximo 10", () => {
    const c = mergeConfig(base, {
      content: { faq: { items: [{ pregunta: " ¿Uno? ", respuesta: " Sí. " }, { pregunta: "¿Dos?", respuesta: "" }] } },
    });
    expect(c.content.faq.items).toEqual([{ pregunta: "¿Uno?", respuesta: "Sí." }]);
    const doce = Array.from({ length: 12 }, (_, i) => ({ pregunta: `¿${i}?`, respuesta: "r" }));
    expect(mergeConfig(base, { content: { faq: { items: doce } } }).content.faq.items).toHaveLength(10);
  });

  it("cierre: override parcial y textos vacíos caen al default", () => {
    const c = mergeConfig(base, { content: { cierre: { title: "Hablemos", cta: "  ", body: null } } }).content.cierre;
    expect(c).toEqual({ ...base.content.cierre, title: "Hablemos" });
  });

  it("no falla con faq, cierre o contact con forma inesperada", () => {
    const c = mergeConfig(base, { content: { faq: "x", cierre: [], contact: 5 } });
    expect(c.content.faq).toEqual(base.content.faq);
    expect(c.content.cierre).toEqual(base.content.cierre);
    expect(c.content.contact).toEqual(base.content.contact);
  });
});

describe("WhatsApp de contacto", () => {
  it("normalizeContact deja solo dígitos y los interruptores solo con true exacto", () => {
    expect(normalizeContact(undefined)).toEqual(base.content.contact);
    expect(normalizeContact({ whatsappNumber: "+56 9 3259-0783", showWhatsapp: true, showWhatsappQr: "true" })).toEqual({
      whatsappNumber: "56932590783",
      showWhatsapp: true,
      showWhatsappQr: false,
    });
    expect(normalizeContact({ showWhatsapp: 1, showWhatsappQr: "true" })).toEqual(base.content.contact);
    // Revisión adversarial: un número guardado que queda sin dígitos no vuelve al default (no se publica nada).
    expect(normalizeContact({ whatsappNumber: "   " }).whatsappNumber).toBe("");
    expect(normalizeContact({ whatsappNumber: 5 }).whatsappNumber).toBe("56932590783");
    expect(mergeConfig(base, { content: { contact: { showWhatsappQr: true } } }).content.contact.showWhatsappQr).toBe(true);
  });

  it("formatWhatsapp: formato chileno o + y los dígitos", () => {
    expect(formatWhatsapp("56932590783")).toBe("+56 9 3259 0783");
    expect(formatWhatsapp("14155550100")).toBe("+14155550100");
  });

  it("whatsappLink: null con el interruptor apagado o un número inválido; enlace wa.me si está activo", () => {
    const on = { whatsappNumber: "56932590783", showWhatsapp: true, showWhatsappQr: false };
    expect(whatsappLink(base.content.contact)).toBeNull();
    expect(whatsappLink(on)).toEqual({ label: "+56 9 3259 0783", url: "https://wa.me/56932590783" });
    expect(whatsappLink(on, "qr")).toBeNull();
    expect(whatsappLink({ ...on, showWhatsappQr: true }, "qr")).toEqual({ label: "+56 9 3259 0783", url: "https://wa.me/56932590783" });
    expect(whatsappLink({ ...on, whatsappNumber: "123" })).toBeNull();
    expect(whatsappLink({ ...on, whatsappNumber: "1234567890123456" })).toBeNull();
    for (const whatsappNumber of ["", "abc", "   "]) {
      const c = mergeConfig(base, { content: { contact: { whatsappNumber, showWhatsapp: true, showWhatsappQr: true } } }).content.contact;
      expect(whatsappLink(c)).toBeNull();
      expect(whatsappLink(c, "qr")).toBeNull();
    }
  });
});
