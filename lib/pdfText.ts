// Adapta texto a la codificación de las fuentes estándar de pdf-lib (Helvetica = WinAnsi / CP1252).
// pdf-lib lanza "WinAnsi cannot encode …" con emojis, flechas o caracteres invisibles; un solo carácter así
// tumbaba la ficha del lead o el informe. Pura y testeable (revisión adversarial de formulario-minimo-consentimiento).

// Caracteres de CP1252 fuera de Latin-1 (0x80–0x9F) que Helvetica sí puede dibujar.
const CP1252_EXTRA = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");

const REPLACEMENTS: [RegExp, string][] = [
  [/→|⟶|➔|➜/g, "->"],
  [/←|⟵/g, "<-"],
  [/⇒/g, "=>"],
  [/≥/g, ">="],
  [/≤/g, "<="],
  [/≠/g, "!="],
  [/[   ]/g, " "], // espacios duros → espacio normal
];

function isWinAnsi(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  if (ch === "\n" || ch === "\t") return true;
  if (code >= 0x20 && code <= 0x7e) return true;
  if (code >= 0xa1 && code <= 0xff) return true;
  return CP1252_EXTRA.has(ch);
}

export function toWinAnsi(text: string): string {
  let out = text.normalize("NFC");
  for (const [re, rep] of REPLACEMENTS) out = out.replace(re, rep);
  out = Array.from(out)
    .filter(isWinAnsi)
    .join("");
  // Quitar un emoji deja espacios dobles o al final de línea: se ordenan sin tocar los saltos de línea.
  return out
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trim())
    .join("\n");
}

// Aplica toWinAnsi a todos los textos de un valor (objetos y arreglos anidados). Números, booleanos y nulos quedan igual.
export function winAnsiDeep<T>(value: T): T {
  if (typeof value === "string") return toWinAnsi(value) as T;
  if (Array.isArray(value)) return value.map((v) => winAnsiDeep(v)) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, winAnsiDeep(v)])) as T;
  }
  return value;
}
