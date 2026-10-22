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
