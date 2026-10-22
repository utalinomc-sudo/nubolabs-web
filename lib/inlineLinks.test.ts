// Enlaces internos en textos del CMS (cambio cierre-landing-faq-cta, design.md decisión 2).
import { describe, expect, it } from "vitest";
import { parseInlineLinks } from "@/lib/inlineLinks";

describe("parseInlineLinks", () => {
  it("un texto sin enlaces es una sola parte", () => {
    expect(parseInlineLinks("Hola, sin enlaces.")).toEqual([{ text: "Hola, sin enlaces." }]);
  });

  it("convierte rutas internas y anclas en enlaces", () => {
    expect(parseInlineLinks("Lee la [política](/privacidad) completa.")).toEqual([
      { text: "Lee la " },
      { text: "política", href: "/privacidad" },
      { text: " completa." },
    ]);
    expect(parseInlineLinks("[Ir](#contacto)")).toEqual([{ text: "Ir", href: "#contacto" }]);
  });

  it("los destinos externos o peligrosos quedan como texto, sin enlace", () => {
    for (const href of ["//evil.com", "https://ejemplo.com", "javascript:alert(1)", "mailto:a@b.cl", "/ruta con espacio"]) {
      expect(parseInlineLinks(`[clic](${href})`)).toEqual([{ text: "clic" }]);
    }
  });

  // Revisión adversarial: el navegador trata "\" como "/" en http(s), así que "/\evil.com" saldría del sitio.
  it("rechaza destinos con barra invertida o que resuelven a otro origen", () => {
    for (const href of ["/\\evil.com", "/\\/evil.com", "/\\\\evil.com", "/\\@evil.com", "/ok\\..\\x", "#a\\b"]) {
      expect(parseInlineLinks(`[clic](${href})`)).toEqual([{ text: "clic" }]);
    }
    expect(parseInlineLinks("[ok](/privacidad#derechos)")).toEqual([{ text: "ok", href: "/privacidad#derechos" }]);
  });

  it("varios enlaces en un mismo texto", () => {
    expect(parseInlineLinks("[A](/a) y [B](#b)")).toEqual([
      { text: "A", href: "/a" },
      { text: " y " },
      { text: "B", href: "#b" },
    ]);
  });

  it("corchetes sin paréntesis y HTML quedan literales", () => {
    expect(parseInlineLinks("Ver [nota] aquí")).toEqual([{ text: "Ver [nota] aquí" }]);
    expect(parseInlineLinks("<b>hola</b>")).toEqual([{ text: "<b>hola</b>" }]);
  });

  it("une el texto de un enlace bloqueado con el resto", () => {
    expect(parseInlineLinks("Antes [sitio](https://x.cl) después")).toEqual([{ text: "Antes sitio después" }]);
  });
});
