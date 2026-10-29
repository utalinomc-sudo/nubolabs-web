// @vitest-environment jsdom
// Editor de /admin/config dividido por sección (cambio lenguaje-sin-jerga, design.md decisión 5).
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigEditor, MANAGED_KEYS, changedKeys, pickManaged, type ManagedContent } from "@/components/admin/ConfigEditor";
import { SECTIONS, defaultSiteConfig } from "@/lib/siteConfig";

// El editor renderiza todas las secciones: con la máquina cargada algunas pruebas pasan de los 5 s por defecto.
vi.setConfig({ testTimeout: 20_000 });

const NOTICE = /Textos recomendados cargados/;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderEditor(initialContent: ManagedContent = defaultSiteConfig().content) {
  const { visible } = defaultSiteConfig();
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <ConfigEditor sections={SECTIONS} initialVisible={visible} initialContent={initialContent} defaults={defaultSiteConfig().content} />,
  );
  const lastBody = () => JSON.parse(fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1].body);
  return { fetchMock, lastBody };
}

async function save(fetchMock: ReturnType<typeof vi.fn>, calls: number) {
  fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(calls));
  await waitFor(() => expect(screen.getByText("✓ Guardado")).toBeInTheDocument());
}

describe("MANAGED_KEYS, pickManaged y changedKeys", () => {
  it("MANAGED_KEYS cubre todas las secciones de SiteContent menos equipo (que se edita en /admin/equipo)", () => {
    const all = Object.keys(defaultSiteConfig().content).sort();
    expect([...MANAGED_KEYS, "equipo"].sort()).toEqual(all);
  });

  it("pickManaged deja solo las claves pedidas y nunca equipo", () => {
    const content = defaultSiteConfig().content;
    expect(Object.keys(pickManaged(content)).sort()).toEqual([...MANAGED_KEYS].sort());
    expect(pickManaged(content)).not.toHaveProperty("equipo");
    expect(Object.keys(pickManaged(content, ["proceso"]))).toEqual(["proceso"]);
  });

  it("changedKeys devuelve solo las secciones que cambiaron", () => {
    const a = defaultSiteConfig().content;
    const b = { ...a, problema: { ...a.problema, title: "Otro" } };
    expect(changedKeys(a, a)).toEqual([]);
    expect(changedKeys(b, a)).toEqual(["problema"]);
  });
});

describe("ConfigEditor", () => {
  it("muestra un editor por sección", () => {
    renderEditor();
    for (const name of ["Inicio (Hero)", "¿Te suena?", "Lo que ganas", "Enfoque", "Servicios", "Ejemplos", "Cómo trabajamos", "Misión y visión", "Privacidad"]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
  });

  it("las listas de largo fijo no se pueden agregar ni quitar; las variables sí", () => {
    renderEditor();
    for (const name of ["Lo que ganas", "Enfoque"]) {
      const region = screen.getByRole("region", { name });
      expect(within(region).queryByRole("button", { name: /^Quitar/ })).toBeNull();
      expect(within(region).queryByRole("button", { name: /Agregar/ })).toBeNull();
    }
    const proceso = screen.getByRole("region", { name: "Cómo trabajamos" });
    expect(within(proceso).queryByRole("button", { name: /Quitar Paso/ })).toBeNull();
    const problema = screen.getByRole("region", { name: "¿Te suena?" });
    expect(within(problema).getAllByRole("button", { name: /^Quitar Dolor/ })).toHaveLength(6);
    fireEvent.click(within(problema).getByRole("button", { name: "Quitar Dolor 1" }));
    expect(within(problema).getAllByRole("button", { name: /^Quitar Dolor/ })).toHaveLength(5);
  });

  it("al subir un ítem, su texto lo acompaña y el foco queda en su botón", () => {
    renderEditor();
    const problema = screen.getByRole("region", { name: "¿Te suena?" });
    const segundo = (within(problema).getByRole("textbox", { name: "Dolor 2" }) as HTMLInputElement).value;
    fireEvent.click(within(problema).getByRole("button", { name: "Subir Dolor 2" }));
    expect(within(problema).getByRole("textbox", { name: "Dolor 1" })).toHaveValue(segundo);
    // En la posición 1 "Subir" queda deshabilitado: el foco pasa a "Bajar" del mismo ítem.
    expect(document.activeElement).toBe(within(problema).getByRole("button", { name: "Bajar Dolor 1" }));
  });

  it("'Usar los textos recomendados' restablece solo su sección (incluida la franja de éxito) y no guarda", () => {
    const { fetchMock } = renderEditor();
    const { proceso } = defaultSiteConfig().content;
    const procesoRegion = screen.getByRole("region", { name: "Cómo trabajamos" });
    const problema = screen.getByRole("region", { name: "¿Te suena?" });
    fireEvent.change(within(procesoRegion).getByDisplayValue(proceso.items[0].title), { target: { value: "Paso editado" } });
    fireEvent.change(within(procesoRegion).getByRole("textbox", { name: "Ejemplo de éxito 1" }), { target: { value: "Éxito editado" } });
    fireEvent.change(within(problema).getByRole("textbox", { name: "Dolor 1" }), { target: { value: "Dolor editado" } });

    fireEvent.click(within(procesoRegion).getByRole("button", { name: "Usar los textos recomendados" }));

    expect(within(procesoRegion).getByDisplayValue(proceso.items[0].title)).toBeInTheDocument();
    expect(within(procesoRegion).queryByDisplayValue("Paso editado")).toBeNull();
    expect(within(procesoRegion).getByRole("textbox", { name: "Ejemplo de éxito 1" })).toHaveValue(proceso.exito.items[0]);
    expect(within(problema).getByRole("textbox", { name: "Dolor 1" })).toHaveValue("Dolor editado");
    expect(within(procesoRegion).getByText(NOTICE)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sin cambios de contenido, guardar envía solo la visibilidad", async () => {
    const { fetchMock, lastBody } = renderEditor();
    await save(fetchMock, 1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/config");
    expect(lastBody().content).toBeUndefined();
    expect(lastBody().visible.resultados).toBe(true);
  });

  it("envía solo la sección editada, con la edición, y después de guardar ya no la reenvía", async () => {
    const { fetchMock, lastBody } = renderEditor();
    const problema = screen.getByRole("region", { name: "¿Te suena?" });
    fireEvent.change(within(problema).getByRole("textbox", { name: "Dolor 1" }), { target: { value: "Dolor editado" } });
    await save(fetchMock, 1);
    expect(Object.keys(lastBody().content)).toEqual(["problema"]);
    expect(lastBody().content.problema.items[0].title).toBe("Dolor editado");
    expect(within(problema).queryByText(NOTICE)).toBeNull();

    await save(fetchMock, 2);
    expect(lastBody().content).toBeUndefined();
  });

  // Cambio cifras-con-respaldo: la casilla de la sección parte desmarcada (oculta por defecto) y activarla se guarda.
  it("cifras: la casilla de visibilidad parte desmarcada y al marcarla se envía visible.cifras = true", async () => {
    const { fetchMock, lastBody } = renderEditor();
    const casilla = screen.getByRole("checkbox", { name: /Cifras de resultados/ });
    expect(casilla).not.toBeChecked();
    fireEvent.click(casilla);
    await save(fetchMock, 1);
    expect(lastBody().visible.cifras).toBe(true);
  });

  it("cifras: sin la clave en la visibilidad cargada, la casilla también parte desmarcada", () => {
    const { visible } = defaultSiteConfig();
    const { cifras: _omitida, ...sinCifras } = visible;
    void _omitida;
    vi.stubGlobal("fetch", vi.fn());
    render(<ConfigEditor sections={SECTIONS} initialVisible={sinCifras} initialContent={defaultSiteConfig().content} defaults={defaultSiteConfig().content} />);
    expect(screen.getByRole("checkbox", { name: /Cifras de resultados/ })).not.toBeChecked();
  });

  // Cambio cifras-con-respaldo: ayuda fija, aviso por cifra incompleta, máximo 4 y restablecer solo la frase.
  it("cifras: ayuda, aviso de cifra sin fuente, máximo 4 y textos recomendados solo para la frase", async () => {
    const { fetchMock, lastBody } = renderEditor();
    const cifras = screen.getByRole("region", { name: "Cifras de resultados" });
    expect(within(cifras).getByText(/Usa solo datos reales con su fuente/)).toBeInTheDocument();

    const agregar = () => within(cifras).getByRole("button", { name: /Agregar cifra/ });
    fireEvent.click(agregar());
    fireEvent.change(within(cifras).getByRole("textbox", { name: "Valor" }), { target: { value: "Mismo día" } });
    fireEvent.change(within(cifras).getByRole("textbox", { name: "Texto" }), { target: { value: "en responder cotizaciones" } });
    expect(within(cifras).getByText("No se mostrará: falta la fuente.")).toBeInTheDocument();
    fireEvent.change(within(cifras).getByRole("textbox", { name: "Fuente" }), { target: { value: "\u200B." } });
    expect(within(cifras).getByText("No se mostrará: falta la fuente.")).toBeInTheDocument();
    fireEvent.change(within(cifras).getByRole("textbox", { name: "Fuente" }), { target: { value: "Piloto con cliente de O&A, 2026" } });
    expect(within(cifras).queryByText(/No se mostrará/)).toBeNull();

    for (let i = 0; i < 3; i++) fireEvent.click(agregar());
    expect(within(cifras).getAllByRole("textbox", { name: "Valor" })).toHaveLength(4);
    expect(agregar()).toBeDisabled();

    fireEvent.change(within(cifras).getByRole("textbox", { name: "Frase (si no hay cifras)" }), { target: { value: "Otra" } });
    fireEvent.click(within(cifras).getByRole("button", { name: "Usar los textos recomendados" }));
    expect(within(cifras).getByRole("textbox", { name: "Frase (si no hay cifras)" })).toHaveValue(defaultSiteConfig().content.cifras.frase);
    expect(within(cifras).getAllByRole("textbox", { name: "Valor" })).toHaveLength(4);
    expect(fetchMock).not.toHaveBeenCalled();

    await save(fetchMock, 1);
    expect(Object.keys(lastBody().content)).toEqual(["cifras"]);
    expect(lastBody().content.cifras.items[0]).toEqual({ valor: "Mismo día", texto: "en responder cotizaciones", fuente: "Piloto con cliente de O&A, 2026" });
  });

  // Cambio confianza-recomendacion: testimonios con destacado único y textos recomendados que no tocan testimonios.
  it("confianza: aviso de autorización, destacado único y restablecer sin tocar los testimonios", async () => {
    const { fetchMock, lastBody } = renderEditor();
    const conf = screen.getByRole("region", { name: "Confianza" });
    expect(within(conf).getByText("Publica solo testimonios con autorización escrita del cliente.")).toBeInTheDocument();
    expect(within(conf).queryByRole("button", { name: /Quitar Compromiso/ })).toBeNull();

    fireEvent.click(within(conf).getByRole("button", { name: /Agregar testimonio/ }));
    fireEvent.click(within(conf).getByRole("button", { name: /Agregar testimonio/ }));
    const nombres = within(conf).getAllByRole("textbox", { name: "Nombre" });
    const textos = within(conf).getAllByRole("textbox", { name: "Testimonio" });
    fireEvent.change(nombres[0], { target: { value: "Ana Pérez" } });
    fireEvent.change(textos[0], { target: { value: "Muy recomendables." } });
    fireEvent.change(nombres[1], { target: { value: "Mauricio Osorio" } });
    fireEvent.change(textos[1], { target: { value: "Los recomiendo sin dudar." } });

    const destacados = () => within(conf).getAllByRole("checkbox", { name: "Destacado" }) as HTMLInputElement[];
    fireEvent.click(destacados()[0]);
    fireEvent.click(destacados()[1]);
    expect(destacados().map((c) => c.checked)).toEqual([false, true]);

    fireEvent.change(within(conf).getByRole("textbox", { name: "Texto puente" }), { target: { value: "Otro texto" } });
    fireEvent.click(within(conf).getByRole("button", { name: "Usar los textos recomendados" }));
    expect(within(conf).getByRole("textbox", { name: "Texto puente" })).toHaveValue(defaultSiteConfig().content.confianza.textoPuente);
    expect(within(conf).getAllByRole("textbox", { name: "Nombre" }).map((i) => (i as HTMLInputElement).value)).toEqual(["Ana Pérez", "Mauricio Osorio"]);
    expect(fetchMock).not.toHaveBeenCalled();

    await save(fetchMock, 1);
    expect(Object.keys(lastBody().content)).toEqual(["confianza"]);
    expect(lastBody().content.confianza.testimonios.map((t: { nombre: string; destacado: boolean }) => [t.nombre, t.destacado])).toEqual([
      ["Ana Pérez", false],
      ["Mauricio Osorio", true],
    ]);
  });

  // Cambio cierre-landing-faq-cta: preguntas frecuentes, CTA final y WhatsApp.
  it("preguntas frecuentes: 1 a 10, con ayuda de enlaces; restablecer devuelve las 7 sin guardar", () => {
    const { fetchMock } = renderEditor();
    const faq = screen.getByRole("region", { name: "Preguntas frecuentes" });
    expect(within(faq).getByText(/\[texto\]\(\/ruta\)/)).toBeInTheDocument();
    fireEvent.click(within(faq).getByRole("button", { name: "Quitar Pregunta 1" }));
    fireEvent.click(within(faq).getByRole("button", { name: "Quitar Pregunta 1" }));
    expect(within(faq).getAllByRole("button", { name: /^Quitar Pregunta/ })).toHaveLength(5);
    fireEvent.click(within(faq).getByRole("button", { name: "Usar los textos recomendados" }));
    expect(within(faq).getAllByRole("button", { name: /^Quitar Pregunta/ })).toHaveLength(7);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("region", { name: "CTA final" })).toBeInTheDocument();
  });

  it("contacto: activar los interruptores envía content.contact con ellos y la vista previa del número", async () => {
    const { fetchMock, lastBody } = renderEditor();
    const contacto = screen.getByRole("region", { name: "Contacto por WhatsApp" });
    expect(within(contacto).getByText(/Se verá como \+56 9 3259 0783/)).toBeInTheDocument();
    fireEvent.click(within(contacto).getByRole("checkbox", { name: "Mostrar WhatsApp en el pie de página" }));
    fireEvent.click(within(contacto).getByRole("checkbox", { name: "Mostrar QR junto al formulario" }));
    await save(fetchMock, 1);
    expect(Object.keys(lastBody().content)).toEqual(["contact"]);
    expect(lastBody().content.contact).toEqual({ whatsappNumber: "56932590783", showWhatsapp: true, showWhatsappQr: true });
    fireEvent.change(within(contacto).getByRole("textbox", { name: "Número de WhatsApp" }), { target: { value: "123" } });
    expect(within(contacto).getByText(/no se mostrará/)).toBeInTheDocument();
  });

  // Cambio casos-por-rubro: rubro por caso, casos nuevos "Para todos" y textos recomendados con los 14 casos.
  it("casos: cada caso tiene texto principal, detalle y rubro; al cambiar el rubro se envía solo content.casos", async () => {
    const { fetchMock, lastBody } = renderEditor();
    const casos = screen.getByRole("region", { name: "Ejemplos" });
    const rubros = within(casos).getAllByRole("combobox", { name: "Rubro" });
    expect(rubros).toHaveLength(14);
    expect(within(rubros[0]).getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Para todos",
      "Gastronomía",
      "Automotriz",
      "Construcción",
      "Servicios profesionales",
      "Comercio",
    ]);
    expect(rubros[0]).toHaveValue("todos");
    expect(rubros[3]).toHaveValue("gastronomia");
    expect(within(casos).getAllByRole("textbox", { name: "Texto principal" })[0]).toHaveValue(defaultSiteConfig().content.casos.items[0].title);
    expect(within(casos).getAllByRole("textbox", { name: "Detalle (opcional)" })).toHaveLength(14);

    fireEvent.change(rubros[0], { target: { value: "comercio" } });
    await save(fetchMock, 1);
    expect(Object.keys(lastBody().content)).toEqual(["casos"]);
    expect(lastBody().content.casos.items[0]).toEqual({ ...defaultSiteConfig().content.casos.items[0], rubro: "comercio" });
  });

  it("casos: uno nuevo parte 'Para todos' y los textos recomendados reponen los 14 sin guardar", () => {
    const { fetchMock } = renderEditor();
    const casos = screen.getByRole("region", { name: "Ejemplos" });
    fireEvent.click(within(casos).getByRole("button", { name: /Agregar ejemplo/ }));
    const rubros = within(casos).getAllByRole("combobox", { name: "Rubro" });
    expect(rubros).toHaveLength(15);
    expect(rubros[14]).toHaveValue("todos");
    fireEvent.change(rubros[3], { target: { value: "automotriz" } });

    fireEvent.click(within(casos).getByRole("button", { name: "Usar los textos recomendados" }));
    const repuestos = within(casos).getAllByRole("combobox", { name: "Rubro" });
    expect(repuestos).toHaveLength(14);
    expect(repuestos[3]).toHaveValue("gastronomia");
    expect(within(casos).getByText(NOTICE)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // Cambio diagnostico-mapa-oportunidades: bloque de la portada que invita al autodiagnóstico.
  it("autodiagnóstico: textos editables, recomendados sin guardar y payload solo con su sección", async () => {
    const { fetchMock, lastBody } = renderEditor();
    const { autodiagnostico } = defaultSiteConfig().content;
    const region = screen.getByRole("region", { name: "Autodiagnóstico" });
    const titulo = within(region).getByRole("textbox", { name: "Título" });
    expect(titulo).toHaveValue(autodiagnostico.title);
    expect(within(region).getByRole("textbox", { name: "Botón" })).toHaveValue(autodiagnostico.cta);
    fireEvent.change(titulo, { target: { value: "Otro" } });
    fireEvent.click(within(region).getByRole("button", { name: "Usar los textos recomendados" }));
    expect(titulo).toHaveValue(autodiagnostico.title);
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.change(titulo, { target: { value: "Otro título" } });
    await save(fetchMock, 1);
    expect(Object.keys(lastBody().content)).toEqual(["autodiagnostico"]);
    expect(lastBody().content.autodiagnostico.title).toBe("Otro título");
    expect(screen.getByRole("checkbox", { name: /Autodiagnóstico/ })).toBeChecked();
  });

  // Cambio landing-referidos-oa: franja de /oa, editable y con textos recomendados.
  it("referidos: editar el título de la franja envía solo content.referidos; los recomendados reponen sin guardar", async () => {
    const { fetchMock, lastBody } = renderEditor();
    const { referidos } = defaultSiteConfig().content;
    const region = screen.getByRole("region", { name: "Franja de referidos (O&A)" });
    const titulo = within(region).getByRole("textbox", { name: "Título" });
    expect(titulo).toHaveValue(referidos.oa.titulo);
    expect(within(region).getByRole("textbox", { name: "Texto" })).toHaveValue(referidos.oa.texto);

    fireEvent.change(titulo, { target: { value: "Hola, cliente de O&A." } });
    fireEvent.click(within(region).getByRole("button", { name: "Usar los textos recomendados" }));
    expect(titulo).toHaveValue(referidos.oa.titulo);
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.change(titulo, { target: { value: "Hola, cliente de O&A." } });
    await save(fetchMock, 1);
    expect(Object.keys(lastBody().content)).toEqual(["referidos"]);
    expect(lastBody().content.referidos).toEqual({ oa: { titulo: "Hola, cliente de O&A.", texto: referidos.oa.texto } });
  });

  // Cambio enfoque-soluciones-a-medida: Misión y visión también se puede restablecer, para cargar los textos nuevos en producción.
  it("misión y visión: 'Usar los textos recomendados' repone misión, visión y objetivos sin guardar", async () => {
    const base = defaultSiteConfig().content;
    const viejo = { ...base, nosotros: { ...base.nosotros, mision: "Operar en piloto automático.", objetivos: ["Uno"] } };
    const { fetchMock, lastBody } = renderEditor(viejo);
    const region = screen.getByRole("region", { name: "Misión y visión" });
    const mision = within(region).getByRole("textbox", { name: "Misión" });
    expect(mision).toHaveValue("Operar en piloto automático.");
    fireEvent.click(within(region).getByRole("button", { name: "Usar los textos recomendados" }));
    expect(mision).toHaveValue(base.nosotros.mision);
    expect(within(region).getAllByRole("textbox", { name: /^Objetivo \d/ })).toHaveLength(base.nosotros.objetivos.length);
    expect(fetchMock).not.toHaveBeenCalled();
    await save(fetchMock, 1);
    expect(Object.keys(lastBody().content)).toEqual(["nosotros"]);
    expect(lastBody().content.nosotros).toEqual(base.nosotros);
  });

  it("restablecer Servicios guardados con la forma antigua envía la sección completa con el destacado", async () => {
    const base = defaultSiteConfig().content;
    const viejo = { ...base, servicios: { ...base.servicios, title: "Vendemos resultados", items: [{ title: "Sistemas y agentes IA", body: "x", result: "y" }] } };
    const { fetchMock, lastBody } = renderEditor(viejo);
    const servicios = screen.getByRole("region", { name: "Servicios" });
    fireEvent.click(within(servicios).getByRole("button", { name: "Usar los textos recomendados" }));
    await save(fetchMock, 1);
    expect(Object.keys(lastBody().content)).toEqual(["servicios"]);
    expect(lastBody().content.servicios).toEqual(base.servicios);
  });
});
