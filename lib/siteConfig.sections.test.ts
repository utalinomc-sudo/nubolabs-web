// Tests del modelo de las secciones de contenido de la portada (cambio lenguaje-sin-jerga, design.md decisiones 1, 2, 4 y 7).
import { describe, expect, it } from "vitest";
import { approachExample, footerLinks, heroFeed, heroFeedMore, nav, resultsVisuals, siteSlogan } from "@/lib/content";
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

describe("defaults del enfoque de soluciones a medida (cambio enfoque-soluciones-a-medida)", () => {
  const c = defaultSiteConfig().content;

  it("tienen los textos aprobados", () => {
    expect(c.problema.title).toBe("¿Te suena?");
    expect(c.problema.items.map((i) => i.title)).toEqual([
      "Decides a ojo porque los números llegan tarde o no cuadran.",
      "Una cotización tarda días y el cliente se va con otro.",
      "Fin de mes es perseguir pagos y armar informes a mano.",
      "La información está repartida en varios lugares y nadie tiene la foto completa.",
      "Todo depende de que alguien se acuerde.",
      "Te ofrecen la misma solución que a todos, y tu negocio no funciona como todos.",
    ]);
    expect(c.resultados.items.map((i) => i.title)).toEqual(["Vendes más", "Decides con datos", "Nada se olvida", "Creces sin desordenarte"]);
    expect(c.enfoque.title).toBe("Primero entendemos tu problema, después construimos la solución.");
    expect(c.enfoque.items.map((i) => i.title)).toEqual(["Entendemos tu problema", "Diseñamos a tu medida", "Te dejamos datos para decidir"]);
    expect(c.servicios.destacado.title).toBe("Diagnóstico y plan de mejora");
    expect(c.servicios.items.map((i) => i.title)).toEqual([
      "Soluciones a tu medida",
      "Tareas que avanzan solas",
      "Datos y reportes para decidir",
      "Información ordenada y conectada",
    ]);
    expect(c.proceso.items.map((i) => i.title)).toEqual([
      "Conversamos",
      "Entendemos y proponemos",
      "Lo construimos y lo dejamos funcionando",
      "Medimos y mejoramos",
    ]);
    expect(c.proceso.exito.items).toEqual(["Más ventas", "Cobros al día", "Decisiones con datos", "Menos errores", "Más control"]);
    expect(c.proceso.items[3].body + c.proceso.items[3].recibes).not.toMatch(/horas/i);
    // Cambio casos-por-rubro (delta MODIFIED de contenido-pyme): encabezado por rubro, sin bajada.
    expect(c.casos.title).toBe("Problemas concretos que resolvemos en negocios como el tuyo");
    expect(c.casos.subtitle).toBe("");
    // Lema del sitio en la CTA final (spec contenido-pyme, "Enfoque del mensaje en todo el sitio público").
    expect(c.cierre.eyebrow).toBe("Soluciones a tu medida, decisiones con datos");
  });

  // Decisión 7 de lenguaje-sin-jerga (+ "pyme(s)", 2026-10-22) más herramientas, canales y contabilidad
  // (enfoque-soluciones-a-medida, 2026-10-29). "Make" e "IA" se buscan con mayúsculas exactas.
  // Con límites de palabra donde hace falta: "excelente" e "incontables" no son herramientas ni contabilidad
  // (revisión adversarial, hallazgo 4).
  const FORBIDDEN_CI =
    /\bn8n\b|\bAPIs?\b|\bCRM\b|\bERP\b|\bagentes?\b|\bROI\b|horas ahorradas|pymes?|\bnube\b|WhatsApp|\bExcel\b|Sheets|Google|planillas?|\bcontador(es|a|as)?\b|\bcontables?\b|contabilidad|piloto autom/i;
  const FORBIDDEN_CS = /\bMake\b|\bIA\b/;
  function strings(value: unknown, path = ""): [string, string][] {
    if (typeof value === "string") return [[path, value]];
    if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
    if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
    return [];
  }

  it("ningún texto por defecto del sitio público usa jerga, 'pyme', herramientas, canales ni contabilidad (incluida la nota técnica)", () => {
    // Fuera del barrido solo quedan `privacidad` (nombra a los proveedores que tratan los datos y el campo WhatsApp
    // como dato guardado) y `contact` (el número de contacto): ver la excepción de la spec.
    const { hero, confianza, problema, resultados, enfoque, servicios, casos, cifras, proceso, autodiagnostico, faq, cierre, nosotros, equipo, referidos } = c;
    // Del pie entran la frase y los enlaces; `whatsappSr` es el prefijo del número de contacto para lectores de pantalla.
    const footer = { tagline: footerLinks.tagline, servicios: footerLinks.servicios.links.map((l) => l.label), nubolabs: footerLinks.nubolabs.links.map((l) => l.label) };
    const all = strings({ hero, confianza, problema, resultados, enfoque, servicios, casos, cifras, proceso, autodiagnostico, faq, cierre, nosotros, equipo, referidos, nav, footer, heroFeed, heroFeedMore, resultsVisuals, approachExample, siteSlogan });
    const bad = all.filter(([, s]) => FORBIDDEN_CI.test(s) || FORBIDDEN_CS.test(s));
    expect(bad).toEqual([]);
  });

  it("la regla no rechaza palabras legítimas parecidas", () => {
    for (const s of ["Un servicio excelente", "incontables pedidos", "la nubecita del logo"]) expect(FORBIDDEN_CI.test(s)).toBe(false);
    for (const s of ["usa Excel", "tu contador", "estudios contables", "en la nube"]) expect(FORBIDDEN_CI.test(s)).toBe(true);
  });

  it("la nota técnica existe, explica cómo trabajamos y no nombra herramientas", () => {
    expect(c.servicios.notaTecnica).toMatch(/^\*\*Cómo lo hacemos:\*\*/);
    expect(c.servicios.notaTecnica).not.toMatch(/n8n|Make|WhatsApp|Excel|Sheets|Google/);
  });

  it("el lema del sitio es uno solo y está en el pie y en la CTA final", () => {
    expect(siteSlogan).toBe("Soluciones a tu medida, decisiones con datos.");
    expect(c.cierre.eyebrow).toBe(siteSlogan.replace(/\.$/, ""));
    expect(footerLinks.tagline).not.toMatch(/piloto automático/);
  });
});

describe("orden y navegación", () => {
  it("SECTIONS sigue el orden de la portada con 'resultados' después de 'problema'", () => {
    // Las secciones que suman otros cambios (confianza, cifras, autodiagnostico) se prueban en sus propios archivos.
    expect(SECTIONS.map((s) => s.key).filter((k) => !["confianza", "cifras", "autodiagnostico"].includes(k)).slice(0, 8)).toEqual(["hero", "problema", "resultados", "enfoque", "servicios", "casos", "proceso", "contacto"]);
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
