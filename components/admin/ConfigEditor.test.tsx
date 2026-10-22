// @vitest-environment jsdom
// Editor de /admin/config dividido por sección (cambio lenguaje-sin-jerga, design.md decisión 5).
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigEditor, MANAGED_KEYS, changedKeys, pickManaged, type ManagedContent } from "@/components/admin/ConfigEditor";
import { SECTIONS, defaultSiteConfig } from "@/lib/siteConfig";

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
  it("preguntas frecuentes: 1 a 10, con ayuda de enlaces; restablecer devuelve las 6 sin guardar", () => {
    const { fetchMock } = renderEditor();
    const faq = screen.getByRole("region", { name: "Preguntas frecuentes" });
    expect(within(faq).getByText(/\[texto\]\(\/ruta\)/)).toBeInTheDocument();
    fireEvent.click(within(faq).getByRole("button", { name: "Quitar Pregunta 1" }));
    fireEvent.click(within(faq).getByRole("button", { name: "Quitar Pregunta 1" }));
    expect(within(faq).getAllByRole("button", { name: /^Quitar Pregunta/ })).toHaveLength(4);
    fireEvent.click(within(faq).getByRole("button", { name: "Usar los textos recomendados" }));
    expect(within(faq).getAllByRole("button", { name: /^Quitar Pregunta/ })).toHaveLength(6);
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
