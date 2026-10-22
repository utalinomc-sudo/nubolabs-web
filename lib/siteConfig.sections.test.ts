// Tests del modelo de las secciones de contenido de la portada (cambio lenguaje-sin-jerga, design.md decisiones 1, 2, 4 y 7).
import { describe, expect, it } from "vitest";
import { approachExample, nav, resultsVisuals } from "@/lib/content";
import { SECTIONS, defaultSiteConfig, mergeConfig, mergeFixedList, mergeList } from "@/lib/siteConfig";

type Item = { title: string; body: string };
const D: Item[] = [
  { title: "A", body: "a" },
  { title: "B", body: "b" },
  { title: "C", body: "c" },
];
const mergeItem = (raw: Record<string, unknown>, fallback: Item): Item => ({
  title: typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : fallback.title,
  body: typeof raw.body === "string" && raw.body.trim() ? raw.body.trim() : fallback.body,
});

describe("mergeFixedList (largo fijo, por posición)", () => {
  it("si no es arreglo devuelve los defaults", () => {
    expect(mergeFixedList(undefined, D, mergeItem)).toEqual(D);
    expect(mergeFixedList("x", D, mergeItem)).toEqual(D);
  });
  it("usa el guardado válido de cada posición y el default donde no hay uno válido", () => {
    const out = mergeFixedList([{ title: " Uno ", body: "" }, null, { title: "" }], D, mergeItem);
    expect(out).toEqual([{ title: "Uno", body: "a" }, D[1], D[2]]);
  });
  it("completa si faltan y recorta si sobran", () => {
    expect(mergeFixedList([{ title: "X", body: "x" }], D, mergeItem)).toEqual([{ title: "X", body: "x" }, D[1], D[2]]);
    expect(mergeFixedList([...D, { title: "D", body: "d" }], D, mergeItem)).toHaveLength(3);
  });
});

describe("mergeList (largo variable)", () => {
  const blank: Item = { title: "", body: "" };
  it("si no es arreglo o hay menos válidos que el mínimo, usa los defaults", () => {
    expect(mergeList(undefined, D, { min: 1, max: 6 }, mergeItem, blank)).toEqual(D);
    expect(mergeList([{ title: "" }, 3], D, { min: 1, max: 6 }, mergeItem, blank)).toEqual(D);
    expect(mergeList([{ title: "Solo uno" }], D, { min: 2, max: 6 }, mergeItem, blank)).toEqual(D);
  });
  it("deja solo los válidos, recortados, sin rellenar con textos de otra posición, y corta en el máximo", () => {
    const out = mergeList([{ title: " Uno " }, { title: "" }, { title: "Dos", body: "dos" }], D, { min: 1, max: 6 }, mergeItem, blank);
    expect(out).toEqual([{ title: "Uno", body: "" }, { title: "Dos", body: "dos" }]);
    const many = Array.from({ length: 9 }, (_, i) => ({ title: `T${i}`, body: "" }));
    expect(mergeList(many, D, { min: 1, max: 6 }, mergeItem, blank)).toHaveLength(6);
  });
});

describe("mergeConfig: secciones nuevas", () => {
  const base = defaultSiteConfig();

  it("sin datos guardados usa todos los defaults y 'resultados' es visible", () => {
    const c = mergeConfig(base, { visible: { hero: true, problema: true } });
    expect(c.content.problema).toEqual(base.content.problema);
    expect(c.content.resultados).toEqual(base.content.resultados);
    expect(c.content.enfoque).toEqual(base.content.enfoque);
    expect(c.content.servicios).toEqual(base.content.servicios);
    expect(c.content.proceso).toEqual(base.content.proceso);
    expect(c.visible.resultados).toBe(true);
  });

  it("problema: lista de 1 a 8 dolores; textos no válidos caen al default", () => {
    const c = mergeConfig(base, {
      content: { problema: { title: null, items: [{ title: "Uno" }, { title: "Dos" }, { title: "Tres" }, { title: "Cuatro" }] } },
    });
    expect(c.content.problema.items.map((i) => i.title)).toEqual(["Uno", "Dos", "Tres", "Cuatro"]);
    expect(c.content.problema.title).toBe(base.content.problema.title);
    const nine = Array.from({ length: 9 }, (_, i) => ({ title: `D${i}` }));
    expect(mergeConfig(base, { content: { problema: { items: nine } } }).content.problema.items).toHaveLength(8);
  });

  it("resultados: siempre 4, con los guardados en su posición", () => {
    const c = mergeConfig(base, { content: { resultados: { items: [{ title: "Propio 1", body: "x" }, { title: "Propio 2", body: "y" }] } } });
    expect(c.content.resultados.items).toHaveLength(4);
    expect(c.content.resultados.items[0]).toEqual({ title: "Propio 1", body: "x" });
    expect(c.content.resultados.items[2]).toEqual(base.content.resultados.items[2]);
  });

  it("enfoque: siempre 3 pasos", () => {
    const c = mergeConfig(base, { content: { enfoque: { items: [] } } });
    expect(c.content.enfoque.items).toEqual(base.content.enfoque.items);
  });

  it("servicios: los items guardados con la forma antigua siguen sirviendo y los campos nuevos caen al default", () => {
    const old = [{ title: "Servicio viejo", body: "texto", result: "resultado" }];
    const c = mergeConfig(base, { content: { servicios: { eyebrow: "SERVICIOS", title: "Vendemos resultados", items: old } } });
    expect(c.content.servicios.items).toEqual(old);
    expect(c.content.servicios.destacado).toEqual(base.content.servicios.destacado);
    expect(c.content.servicios.acompanamiento).toEqual(base.content.servicios.acompanamiento);
    expect(c.content.servicios.notaTecnica).toBe(base.content.servicios.notaTecnica);
    const sub = mergeConfig(base, { content: { servicios: { destacado: { title: "Otro nombre", incluye: ["Solo esto"] } } } });
    expect(sub.content.servicios.destacado.title).toBe("Otro nombre");
    expect(sub.content.servicios.destacado.etiqueta).toBe(base.content.servicios.destacado.etiqueta);
    expect(sub.content.servicios.destacado.incluye).toEqual(["Solo esto"]);
  });

  it("proceso: siempre 4 pasos y la franja de éxito con 1 a 6 ejemplos", () => {
    const c = mergeConfig(base, {
      content: { proceso: { items: [{ title: "Paso", body: "b", recibes: "" }], exito: { items: ["Más ventas", "  ", 4] } } },
    });
    expect(c.content.proceso.items).toHaveLength(4);
    expect(c.content.proceso.items[0]).toEqual({ title: "Paso", body: "b", recibes: base.content.proceso.items[0].recibes });
    expect(c.content.proceso.exito.items).toEqual(["Más ventas"]);
    expect(c.content.proceso.exito.title).toBe(base.content.proceso.exito.title);
  });

  it("servicios: un ítem sin título no se publica y un campo vacío de un ítem válido queda vacío (spec, excepción de listas variables)", () => {
    const c = mergeConfig(base, {
      content: { servicios: { items: [{ title: "Con título", body: "", result: "Gano" }, { title: "", body: "Huérfano", result: "x" }] } },
    });
    expect(c.content.servicios.items).toEqual([{ title: "Con título", body: "", result: "Gano" }]);
  });

  it("visible: solo los booleanos guardados ganan; null, textos o números usan el default", () => {
    const c = mergeConfig(base, { visible: { resultados: null, problema: false, enfoque: "no", servicios: 0, nueva: true } });
    expect(c.visible.resultados).toBe(true);
    expect(c.visible.problema).toBe(false);
    expect(c.visible.enfoque).toBe(true);
    expect(c.visible.servicios).toBe(true);
    expect(c.visible.nueva).toBe(true);
    expect(mergeConfig(base, { visible: "x" }).visible).toEqual(base.visible);
  });

  it("no falla con secciones guardadas con forma inesperada", () => {
    const c = mergeConfig(base, { content: { problema: "x", resultados: null, enfoque: 3, servicios: { destacado: "x", items: "x" }, proceso: [] } });
    expect(c.content.problema).toEqual(base.content.problema);
    expect(c.content.resultados).toEqual(base.content.resultados);
    expect(c.content.servicios.destacado).toEqual(base.content.servicios.destacado);
  });
});

describe("defaults de la HDU-08", () => {
  const c = defaultSiteConfig().content;

  it("tienen los textos aprobados", () => {
    expect(c.problema.title).toBe("¿Te suena?");
    expect(c.problema.items.map((i) => i.title)).toEqual([
      "Respondes WhatsApp a las 11 de la noche.",
      "Una cotización tarda días y el cliente se va con otro.",
      "Fin de mes es perseguir pagos y juntar papeles para el contador.",
      "No sabes cuánto ganaste hasta que alguien arma la planilla.",
      "Todo depende de que alguien se acuerde.",
      "Si alguien falta, nadie sabe en qué estaba.",
    ]);
    expect(c.resultados.items.map((i) => i.title)).toEqual(["Vendes más", "Tienes el control", "Nada se olvida", "Creces sin desordenarte"]);
    expect(c.enfoque.title).toBe("Primero ordenamos, después automatizamos.");
    expect(c.servicios.destacado.title).toBe("Diagnóstico y plan de mejora");
    expect(c.servicios.items.map((i) => i.title)).toEqual([
      "Tareas que avanzan solas",
      "Clientes atendidos al instante",
      "Tus números claros, siempre",
      "Herramientas a tu medida",
    ]);
    expect(c.proceso.items.map((i) => i.title)).toEqual(["Conversamos", "Ordenamos y proponemos", "Lo dejamos funcionando", "Medimos y mejoramos"]);
    expect(c.proceso.items[3].body + c.proceso.items[3].recibes).not.toMatch(/horas/i);
    expect(c.casos.subtitle).toBe("Ejemplos reales de lo que dejamos funcionando en empresas como la tuya.");
  });

  // Decisión 7 (+ "pyme(s)", 2026-10-22). "Make" e "IA" se buscan con mayúsculas exactas.
  const FORBIDDEN_CI = /\bn8n\b|\bAPIs?\b|\bCRM\b|\bERP\b|\bagentes?\b|\bROI\b|horas ahorradas|pymes?/i;
  const FORBIDDEN_CS = /\bMake\b|\bIA\b/;
  function strings(value: unknown, path = ""): [string, string][] {
    if (typeof value === "string") return [[path, value]];
    if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
    if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
    return [];
  }

  it("ningún texto por defecto de la portada usa jerga ni 'pyme' (salvo la nota técnica)", () => {
    const { hero, confianza, problema, resultados, enfoque, servicios, casos, proceso, faq, cierre } = c;
    const { notaTecnica, ...serviciosSinNota } = servicios;
    void notaTecnica;
    const all = strings({ hero, confianza, problema, resultados, enfoque, servicios: serviciosSinNota, casos, proceso, faq, cierre, nav, resultsVisuals, approachExample });
    const bad = all.filter(([, s]) => FORBIDDEN_CI.test(s) || FORBIDDEN_CS.test(s));
    expect(bad).toEqual([]);
  });

  it("la nota técnica existe y es el lugar de n8n", () => {
    expect(c.servicios.notaTecnica).toContain("n8n");
  });
});

describe("orden y navegación", () => {
  it("SECTIONS sigue el orden de la portada con 'resultados' después de 'problema'", () => {
    expect(SECTIONS.map((s) => s.key).filter((k) => k !== "confianza").slice(0, 8)).toEqual(["hero", "problema", "resultados", "enfoque", "servicios", "casos", "proceso", "contacto"]);
  });
  it("el menú ofrece Lo que ganas, Servicios, Ejemplos, Cómo trabajamos y Preguntas (HDU-10), sin 'Inicio'", () => {
    expect(nav.map((n) => [n.label, n.href])).toEqual([
      ["Lo que ganas", "/#resultados"],
      ["Servicios", "/#servicios"],
      ["Ejemplos", "/#casos"],
      ["Cómo trabajamos", "/#modelo"],
      ["Preguntas", "/#preguntas"],
    ]);
  });
});
