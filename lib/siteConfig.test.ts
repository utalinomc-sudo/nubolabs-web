// Tests de la configuración pura del sitio (cambio mensaje-principal-pyme, design.md decisiones 2 y 3).
import { describe, expect, it } from "vitest";
import { defaultSiteConfig, mergeConfig, normalizeTags } from "@/lib/siteConfig";

const DEFAULT_TAGS = [
  "30 minutos, gratis y sin compromiso",
  "A la medida de tu negocio",
  "Respuesta en menos de 24 horas",
];

// Palabras que el mensaje principal no puede usar (spec landing/hero, "Vocabulario prohibido"): jerga y, desde el
// cambio enfoque-soluciones-a-medida, herramientas, canales y el contador.
const FORBIDDEN = new Set([
  "horas",
  "ia",
  "nube",
  "automatización",
  "automatizaciones",
  "whatsapp",
  "excel",
  "sheets",
  "n8n",
  "make",
  "contador",
]);
function forbiddenWordsIn(text: string): string[] {
  return (text.match(/\p{L}+/gu) ?? []).map((w) => w.toLowerCase()).filter((w) => FORBIDDEN.has(w));
}

describe("normalizeTags", () => {
  it("devuelve null si el valor no es un arreglo", () => {
    expect(normalizeTags(undefined)).toBeNull();
    expect(normalizeTags(null)).toBeNull();
    expect(normalizeTags("Sin cambiar tus sistemas")).toBeNull();
    expect(normalizeTags({ 0: "a" })).toBeNull();
  });

  it("recorta los textos y descarta vacíos y no-strings", () => {
    expect(normalizeTags(["  Primera sesión sin costo ", "  ", 42, null, "Te respondemos hoy"])).toEqual([
      "Primera sesión sin costo",
      "Te respondemos hoy",
    ]);
  });

  it("toma como máximo 3 etiquetas", () => {
    expect(normalizeTags(["a", "b", "c", "d", "e"])).toEqual(["a", "b", "c"]);
  });

  it("devuelve null si no queda ninguna etiqueta", () => {
    expect(normalizeTags([])).toBeNull();
    expect(normalizeTags(["", "   ", 7])).toBeNull();
  });
});

describe("mergeConfig — hero", () => {
  it("sin content.hero usa todos los defaults", () => {
    const base = defaultSiteConfig();
    expect(mergeConfig(base, {}).content.hero).toEqual(base.content.hero);
    expect(mergeConfig(base, { content: {} }).content.hero).toEqual(base.content.hero);
  });

  it("un override parcial solo reemplaza el campo guardado", () => {
    const base = defaultSiteConfig();
    const hero = mergeConfig(base, { content: { hero: { title: "Otro título" } } }).content.hero;
    expect(hero.title).toBe("Otro título");
    expect({ ...hero, title: base.content.hero.title }).toEqual(base.content.hero);
  });

  it("con tags ausente o vacío usa las etiquetas por defecto", () => {
    const base = defaultSiteConfig();
    expect(mergeConfig(base, { content: { hero: { title: "x" } } }).content.hero.tags).toEqual(DEFAULT_TAGS);
    expect(mergeConfig(base, { content: { hero: { tags: [] } } }).content.hero.tags).toEqual(DEFAULT_TAGS);
  });

  it("muestra solo las etiquetas con texto y como máximo 3", () => {
    const base = defaultSiteConfig();
    const edited = mergeConfig(base, {
      content: { hero: { tags: ["Primera sesión sin costo", "  ", "Te respondemos hoy"] } },
    });
    expect(edited.content.hero.tags).toEqual(["Primera sesión sin costo", "Te respondemos hoy"]);
    const five = mergeConfig(base, { content: { hero: { tags: ["1", "2", "3", "4", "5"] } } });
    expect(five.content.hero.tags).toEqual(["1", "2", "3"]);
  });

  it("ignora campos que no son texto o quedan vacíos y usa el default (spec: datos inválidos)", () => {
    const base = defaultSiteConfig();
    const hero = mergeConfig(base, {
      content: { hero: { title: null, subtitle: { a: 1 }, ctaPrimary: "  ", eyebrow: 42, ctaSecondary: "Ver más" } },
    }).content.hero;
    expect(hero.title).toBe(base.content.hero.title);
    expect(hero.subtitle).toBe(base.content.hero.subtitle);
    expect(hero.ctaPrimary).toBe(base.content.hero.ctaPrimary);
    expect(hero.eyebrow).toBe(base.content.hero.eyebrow);
    expect(hero.ctaSecondary).toBe("Ver más");
  });

  it("con content.hero de tipo texto usa los defaults sin claves extra", () => {
    const base = defaultSiteConfig();
    const hero = mergeConfig(base, { content: { hero: "abc" } }).content.hero;
    expect(hero).toEqual(base.content.hero);
    expect(Object.keys(hero).sort()).toEqual(Object.keys(base.content.hero).sort());
  });

  it("no altera el resto de las secciones", () => {
    const base = defaultSiteConfig();
    const merged = mergeConfig(base, { content: { hero: { title: "x" } } });
    expect(merged.content.servicios).toEqual(base.content.servicios);
    expect(merged.visible).toEqual(base.visible);
  });
});

describe("defaults del hero", () => {
  const hero = defaultSiteConfig().content.hero;

  it("tienen el mensaje del enfoque de soluciones a medida (cambio enfoque-soluciones-a-medida)", () => {
    expect(hero.eyebrow).toBe(""); // sin etiqueta superior por defecto (design.md decisión 5b)
    expect(hero.title).toBe("Soluciones hechas para **tu negocio**, con datos para decidir mejor.");
    expect(hero.subtitle).toContain("solución que calza con tu forma de trabajar");
    expect(hero.ctaPrimary).toBe("Quiero mi diagnóstico gratis");
    expect(hero.ctaSecondary).toBe("Ver cómo trabajamos");
    expect(hero.tags).toEqual(DEFAULT_TAGS);
  });

  it("ningún texto por defecto limita el público a pymes", () => {
    const texts = [hero.eyebrow, hero.title, hero.subtitle, hero.ctaPrimary, hero.ctaSecondary, ...hero.tags];
    for (const text of texts) expect(text.toLowerCase()).not.toContain("pyme");
  });

  it("título y bajada no usan horas, IA, nube, automatización, herramientas ni el contador", () => {
    expect(forbiddenWordsIn(hero.title)).toEqual([]);
    expect(forbiddenWordsIn(hero.subtitle)).toEqual([]);
  });
});

describe("privacidad (cambio formulario-minimo-consentimiento)", () => {
  it("sin content.privacidad usa el borrador con el correo de contacto y el plazo de 30 días", () => {
    const p = mergeConfig(defaultSiteConfig(), {}).content.privacidad;
    expect(p.titulo).toBeTruthy();
    expect(p.texto).toContain("mauricio.nubolabs@gmail.com");
    expect(p.texto).toContain("30 días");
    expect(p.texto).toContain("Firebase");
    expect(p.texto).toContain("Resend");
    expect(p.texto).toContain("Vercel");
    expect(p.texto).toContain("Agencia de Protección de Datos Personales");
  });

  it("título o texto vacíos o con solo espacios caen al borrador", () => {
    const base = defaultSiteConfig();
    const p = mergeConfig(base, { content: { privacidad: { titulo: "  ", texto: "" } } }).content.privacidad;
    expect(p).toEqual(base.content.privacidad);
  });

  it("un texto propio reemplaza al borrador", () => {
    const base = defaultSiteConfig();
    const p = mergeConfig(base, { content: { privacidad: { texto: "Texto validado por O&A." } } }).content.privacidad;
    expect(p.texto).toBe("Texto validado por O&A.");
    expect(p.titulo).toBe(base.content.privacidad.titulo);
  });
});
