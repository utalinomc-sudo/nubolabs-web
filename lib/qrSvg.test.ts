// QR como SVG generado en el servidor (cambio cierre-landing-faq-cta, design.md decisión 8).
import qrcode from "qrcode-generator";
import { describe, expect, it } from "vitest";
import { qrSvg } from "@/lib/qrSvg";

describe("qrSvg", () => {
  const url = "https://wa.me/56932590783";

  it("devuelve un SVG con viewBox cuadrado y un solo path", () => {
    const svg = qrSvg(url);
    expect(svg.startsWith("<svg")).toBe(true);
    const vb = svg.match(/viewBox="(-?\d+) (-?\d+) (\d+) (\d+)"/);
    expect(vb).not.toBeNull();
    expect(vb![3]).toBe(vb![4]);
    expect(svg.match(/<path /g)).toHaveLength(1);
  });

  it("es determinista y dibuja exactamente los módulos oscuros del código", () => {
    expect(qrSvg(url)).toBe(qrSvg(url));
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    let dark = 0;
    for (let r = 0; r < qr.getModuleCount(); r++) for (let c = 0; c < qr.getModuleCount(); c++) if (qr.isDark(r, c)) dark++;
    expect(qrSvg(url).match(/h1v1h-1z/g)).toHaveLength(dark);
  });

  it("solo contiene marcado de SVG, sin el texto de entrada", () => {
    const svg = qrSvg('https://wa.me/1"><script>');
    expect(svg).not.toContain("<script");
    expect(svg).not.toContain("wa.me");
  });
});
