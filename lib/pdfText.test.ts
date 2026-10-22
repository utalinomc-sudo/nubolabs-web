// Texto apto para Helvetica (WinAnsi) en los PDF (cambio formulario-minimo-consentimiento, revisión adversarial:
// un emoji en el mensaje dejaba la ficha del admin en error 500).
import { describe, expect, it } from "vitest";
import { toWinAnsi, winAnsiDeep } from "@/lib/pdfText";

describe("toWinAnsi", () => {
  it("conserva el español y los signos de WinAnsi", () => {
    const s = "Señor Ñandú, café · “citas” – ‘ok’ — 50 € … • ™";
    expect(toWinAnsi(s)).toBe(s);
  });

  it("cambia flechas y comparadores por equivalentes y quita emojis y caracteres invisibles", () => {
    expect(toWinAnsi("Hola 👋 → listo ✓")).toBe("Hola -> listo");
    expect(toWinAnsi("a ≥ b ← c ⇒ d")).toBe("a >= b <- c => d");
    expect(toWinAnsi("in​visible")).toBe("invisible");
    expect(toWinAnsi("🚀")).toBe("");
  });

  it("compone tildes escritas por separado y respeta los saltos de línea", () => {
    expect(toWinAnsi("café")).toBe("café");
    expect(toWinAnsi("línea 1\nlínea 2 😀")).toBe("línea 1\nlínea 2");
  });
});

describe("winAnsiDeep", () => {
  it("limpia todos los textos de un objeto sin tocar números ni nulos", () => {
    expect(winAnsiDeep({ a: "Hola 👋", b: [1, "→ x"], c: { d: null, e: 3 } })).toEqual({
      a: "Hola",
      b: [1, "-> x"],
      c: { d: null, e: 3 },
    });
  });
});
