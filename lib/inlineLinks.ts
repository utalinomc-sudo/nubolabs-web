// Enlaces internos en textos del CMS con la forma [texto](destino) (cambio cierre-landing-faq-cta, design.md decisión 2).
// Solo se enlaza una ruta interna ("/algo", no "//") o un ancla ("#algo"). Cualquier otro destino queda como texto.
// Devuelve partes de texto: el componente las pinta como nodos de texto y enlaces, sin HTML.
export type InlinePart = { text: string; href?: string };

// El destino admite un nivel de paréntesis, para que "[clic](javascript:alert(1))" se lea completo y se descarte.
const LINK = /\[([^\]\n]+)\]\(((?:[^()\n]|\([^()\n]*\))*)\)/g;
// Una sola "/" inicial (no "//") o "#", sin espacios ni "\" en ninguna parte: los navegadores leen "\" como "/" en
// http(s), así que "/\evil.com" saldría del sitio (revisión adversarial de cierre-landing-faq-cta).
const INTERNAL = /^(?:\/(?![/\\])|#)[^\s\\]*$/;
const PROBE_ORIGIN = "https://nubolabs.invalid";

// Además del patrón, el destino debe resolver al mismo origen (defensa en profundidad ante rarezas del parser de URL).
function isInternal(href: string): boolean {
  if (!INTERNAL.test(href)) return false;
  try {
    return new URL(href, `${PROBE_ORIGIN}/`).origin === PROBE_ORIGIN;
  } catch {
    return false;
  }
}

export function parseInlineLinks(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pushText = (t: string) => {
    if (!t) return;
    const last = parts[parts.length - 1];
    if (last && last.href === undefined) last.text += t;
    else parts.push({ text: t });
  };
  let lastIndex = 0;
  for (const m of text.matchAll(LINK)) {
    const index = m.index ?? 0;
    pushText(text.slice(lastIndex, index));
    const [, label, href] = m;
    if (isInternal(href)) parts.push({ text: label, href });
    else pushText(label);
    lastIndex = index + m[0].length;
  }
  pushText(text.slice(lastIndex));
  return parts.length > 0 ? parts : [{ text: "" }];
}
