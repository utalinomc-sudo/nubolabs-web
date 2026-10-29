// Bloque de confianza: testimonios autorizados, compromisos y texto puente (cambio confianza-recomendacion,
// design.md decisiones 1 y 2).
import { describe, expect, it } from "vitest";
import {
  SECTIONS,
  defaultSiteConfig,
  contactQuote,
  initials,
  mergeConfig,
  normalizeTestimonios,
  pickTestimonios,
  type Testimonio,
} from "@/lib/siteConfig";

const base = defaultSiteConfig();
const t = (nombre: string, destacado = false): Testimonio => ({ nombre, cargo: "Socio", empresa: "Estudio", texto: `Texto de ${nombre}`, destacado });

describe("defaults de confianza", () => {
  it("texto puente, sin testimonios y con los 3 compromisos de la referencia", () => {
    const c = base.content.confianza;
    expect(c.eyebrow).toBe("Nos recomiendan");
    expect(c.textoPuente).toBe("Trabajamos con empresas y asesores que nos recomiendan a sus clientes.");
    expect(c.testimonios).toEqual([]);
    expect(c.compromisos).toEqual([
      { titulo: "Primera sesión gratis", texto: "30 minutos por videollamada, sin compromiso." },
      { titulo: "Hecho para tu negocio", texto: "Partimos de tu problema y trabajamos con lo que ya usas, sin cambiar tus sistemas." },
      { titulo: "Sin letra chica", texto: "Plan por etapas y costos claros antes de partir." },
    ]);
  });

  it("SECTIONS tiene confianza justo después de hero, visible por defecto", () => {
    expect(SECTIONS.map((s) => s.key).slice(0, 3)).toEqual(["hero", "confianza", "problema"]);
    expect(mergeConfig(base, { visible: { hero: true } }).visible.confianza).toBe(true);
  });
});

describe("normalizeTestimonios", () => {
  it("no arreglo → lista vacía", () => {
    expect(normalizeTestimonios(undefined)).toEqual([]);
    expect(normalizeTestimonios("x")).toEqual([]);
    expect(normalizeTestimonios({ 0: t("A") })).toEqual([]);
  });

  it("recorta, descarta sin nombre o sin texto y deja destacado solo con true estricto", () => {
    const out = normalizeTestimonios([
      { nombre: " Ana Pérez ", cargo: " Socia ", empresa: " Pérez Ltda. ", texto: " Muy bien. ", destacado: "true" },
      { nombre: "", texto: "Sin nombre" },
      { nombre: "Sin texto", texto: "   " },
      null,
      { nombre: "Luis", texto: "Excelente", destacado: true, cargo: 3 },
    ]);
    expect(out).toEqual([
      { nombre: "Ana Pérez", cargo: "Socia", empresa: "Pérez Ltda.", texto: "Muy bien.", destacado: false },
      { nombre: "Luis", cargo: "", empresa: "", texto: "Excelente", destacado: true },
    ]);
  });

  // Revisión adversarial: un documento editado a mano puede traer 2 destacados; solo vale el primero.
  it("deja como destacado solo el primero que lo tenga", () => {
    const out = normalizeTestimonios([t("A"), t("B", true), t("C", true)]);
    expect(out.map((x) => x.destacado)).toEqual([false, true, false]);
  });
});

// Revisión adversarial: los compromisos son siempre 3 por posición (el ícono depende de ella), como resultados y proceso.
describe("compromisos por posición", () => {
  const def = base.content.confianza.compromisos;
  const merge = (compromisos: unknown) => mergeConfig(base, { content: { confianza: { compromisos } } }).content.confianza.compromisos;

  it("no arreglo o vacío → los 3 por defecto", () => {
    expect(merge(undefined)).toEqual(def);
    expect(merge([])).toEqual(def);
  });

  it("un título o texto vacío toma el de esa posición; sobran → se cortan en 3", () => {
    const out = merge([{ titulo: " Uno ", texto: " a " }, { titulo: "", texto: "b" }, { titulo: "Tres", texto: "" }, { titulo: "Cuatro", texto: "d" }]);
    expect(out).toEqual([
      { titulo: "Uno", texto: "a" },
      { titulo: def[1].titulo, texto: "b" },
      { titulo: "Tres", texto: def[2].texto },
    ]);
  });
});

describe("contactQuote (cita breve en #contacto)", () => {
  const conf = { ...base.content.confianza, testimonios: [t("A"), t("B", true)] };
  it("el principal si la sección está visible y hay testimonios", () => {
    expect(contactQuote({ confianza: true }, conf)?.nombre).toBe("B");
    expect(contactQuote({}, conf)?.nombre).toBe("B");
  });
  it("nada si la sección está oculta o no hay testimonios válidos", () => {
    expect(contactQuote({ confianza: false }, conf)).toBeNull();
    expect(contactQuote({ confianza: true }, base.content.confianza)).toBeNull();
  });
});

describe("pickTestimonios", () => {
  it("lista vacía → sin principal", () => {
    expect(pickTestimonios([])).toEqual({ principal: null, resto: [] });
  });

  it("el destacado va primero y los demás siguen en su orden", () => {
    const { principal, resto } = pickTestimonios([t("A"), t("B", true), t("C")]);
    expect(principal?.nombre).toBe("B");
    expect(resto.map((r) => r.nombre)).toEqual(["A", "C"]);
  });

  it("sin destacado, el primero; nunca más de 3 en total", () => {
    const { principal, resto } = pickTestimonios(["A", "B", "C", "D", "E"].map((n) => t(n)));
    expect(principal?.nombre).toBe("A");
    expect(resto.map((r) => r.nombre)).toEqual(["B", "C"]);
  });
});

describe("initials", () => {
  it("primeras letras de las dos primeras palabras", () => {
    expect(initials("Mauricio Osorio")).toBe("MO");
    expect(initials("ana")).toBe("A");
    expect(initials("  maría   josé  pérez ")).toBe("MJ");
    expect(initials("Ñandú Álvarez")).toBe("ÑÁ");
  });

  // Revisión adversarial: emojis, signos y tildes escritas por separado.
  it("toma la primera letra real de cada palabra y nunca corta un carácter", () => {
    expect(initials("Ana 🙂")).toBe("A");
    expect(initials("😀 Ana López")).toBe("AL");
    expect(initials("(Dr.) Juan Pérez")).toBe("DJ");
    expect(initials("E\u0301rica Soto")).toBe("ÉS");
    expect(initials("🙂")).toBe("");
  });
});

describe("mergeConfig de confianza", () => {
  it("sin content.confianza usa los defaults (sin testimonios)", () => {
    expect(mergeConfig(base, {}).content.confianza).toEqual(base.content.confianza);
  });

  it("normaliza testimonios guardados; compromisos vacíos vuelven a los defaults; textos vacíos al default", () => {
    const c = mergeConfig(base, {
      content: { confianza: { eyebrow: " ", textoPuente: "Nos recomiendan estudios contables.", testimonios: [{ nombre: "Ana", texto: "Bien" }, { nombre: "" }], compromisos: [] } },
    }).content.confianza;
    expect(c.eyebrow).toBe(base.content.confianza.eyebrow);
    expect(c.textoPuente).toBe("Nos recomiendan estudios contables.");
    expect(c.testimonios).toEqual([{ nombre: "Ana", cargo: "", empresa: "", texto: "Bien", destacado: false }]);
    expect(c.compromisos).toEqual(base.content.confianza.compromisos);
  });

  it("no falla con una forma inesperada", () => {
    expect(mergeConfig(base, { content: { confianza: "x" } }).content.confianza).toEqual(base.content.confianza);
    expect(mergeConfig(base, { content: { confianza: { testimonios: "x", compromisos: 3 } } }).content.confianza).toEqual(base.content.confianza);
  });
});
