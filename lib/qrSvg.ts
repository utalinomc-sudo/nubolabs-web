// Código QR dibujado en el servidor (cambio cierre-landing-faq-cta, design.md decisión 8): sin scripts de terceros
// ni CDN en el navegador. El componente usa `qrPath` para pintar el SVG en JSX (sin dangerouslySetInnerHTML).
import qrcode from "qrcode-generator";

const QUIET = 2; // margen blanco alrededor, en módulos

// Trazado del QR (corrección de errores M): un cuadrado de 1×1 por módulo oscuro, en un solo path.
export function qrPath(text: string): { size: number; viewBox: string; d: string } {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    }
  }
  const size = n + QUIET * 2;
  return { size, viewBox: `${-QUIET} ${-QUIET} ${size} ${size}`, d };
}

// El mismo QR como texto SVG (para pruebas o usos fuera de React). El color sale de `currentColor`.
export function qrSvg(text: string): string {
  const { viewBox, d } = qrPath(text);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" shape-rendering="crispEdges"><path fill="currentColor" d="${d}"/></svg>`;
}
