// Solo para pruebas: extrae el texto dibujado en un PDF de pdf-lib (streams comprimidos con Flate y cadenas en
// hexadecimal o entre paréntesis). Sirve para comprobar qué dice un informe sin abrirlo.
import { inflateSync } from "node:zlib";

export function pdfTestText(pdf: Uint8Array): string {
  const raw = Buffer.from(pdf).toString("latin1");
  const parts: string[] = [];
  const re = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    let content = m[1];
    try {
      content = inflateSync(Buffer.from(m[1], "latin1")).toString("latin1");
    } catch {
      // stream sin comprimir: se usa tal cual
    }
    for (const t of content.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) parts.push(Buffer.from(t[1], "hex").toString("latin1"));
    for (const t of content.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)) parts.push(t[1]);
  }
  return parts.join(" ");
}
