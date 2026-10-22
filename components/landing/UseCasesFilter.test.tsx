// @vitest-environment jsdom
// Ejemplos por rubro: chips, filtro y anuncio de resultados (cambio casos-por-rubro, design.md decisión 4).
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UseCases } from "@/components/landing/UseCases";
import { UseCasesFilter } from "@/components/landing/UseCasesFilter";
import { defaultSiteConfig, type CaseItem } from "@/lib/siteConfig";

afterEach(cleanup);

const casos = defaultSiteConfig().content.casos;
const cards = () => screen.getAllByRole("listitem");
const chip = (name: string) => screen.getByRole("button", { name });

describe("UseCasesFilter", () => {
  it("parte con los 14 casos y 'Todos' presionado", () => {
    render(<UseCasesFilter items={casos.items} />);
    expect(cards()).toHaveLength(14);
    const group = screen.getByRole("group", { name: "Filtrar ejemplos por rubro" });
    expect(within(group).getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Todos",
      "Gastronomía",
      "Automotriz",
      "Construcción",
      "Servicios profesionales",
      "Comercio",
    ]);
    expect(chip("Todos")).toHaveAttribute("aria-pressed", "true");
    expect(chip("Comercio")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("status")).toHaveTextContent("Mostrando 14 ejemplos");
  });

  it("al elegir un rubro muestra sus casos y los 'para todos', y lo anuncia", () => {
    render(<UseCasesFilter items={casos.items} />);
    fireEvent.click(chip("Gastronomía"));
    expect(cards()).toHaveLength(6);
    expect(cards().map((c) => within(c).getByText(/Para todos|Gastronomía/).textContent)).toEqual([
      "Para todos",
      "Para todos",
      "Para todos",
      "Gastronomía",
      "Gastronomía",
      "Gastronomía",
    ]);
    const pressed = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-pressed") === "true");
    expect(pressed).toEqual([chip("Gastronomía")]);
    expect(screen.getByRole("status")).toHaveTextContent("Mostrando 6 ejemplos de Gastronomía");

    fireEvent.click(chip("Automotriz"));
    expect(cards()).toHaveLength(5);
    fireEvent.click(chip("Todos"));
    expect(cards()).toHaveLength(14);
    expect(chip("Todos")).toHaveAttribute("aria-pressed", "true");
  });

  it("no muestra chips de rubros sin casos", () => {
    const items: CaseItem[] = [
      { title: "Stock al día", body: "", rubro: "comercio" },
      { title: "Reservas al instante", body: "", rubro: "gastronomia" },
      { title: "Cobranza automática", body: "", rubro: "todos" },
    ];
    render(<UseCasesFilter items={items} />);
    expect(within(screen.getByRole("group")).getAllByRole("button").map((b) => b.textContent)).toEqual(["Todos", "Gastronomía", "Comercio"]);
    expect(screen.queryByRole("button", { name: "Construcción" })).toBeNull();
  });

  // Revisión adversarial: con un solo rubro, elegirlo mostraría lo mismo que "Todos".
  it("con un solo rubro no hay chips y cada caso lleva su etiqueta", () => {
    const items: CaseItem[] = [
      { title: "Reservas al instante", body: "", rubro: "gastronomia" },
      { title: "Cobranza automática", body: "", rubro: "todos" },
    ];
    render(<UseCasesFilter items={items} />);
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(cards()).toHaveLength(2);
    expect(screen.getByText("Gastronomía")).toBeInTheDocument();
    expect(screen.getByText("Para todos")).toBeInTheDocument();
  });

  it("pulsar de nuevo el chip elegido vuelve a 'Todos'", () => {
    render(<UseCasesFilter items={casos.items} />);
    fireEvent.click(chip("Gastronomía"));
    expect(cards()).toHaveLength(6);
    fireEvent.click(chip("Gastronomía"));
    expect(cards()).toHaveLength(14);
    expect(chip("Todos")).toHaveAttribute("aria-pressed", "true");
    expect(chip("Gastronomía")).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(chip("Todos"));
    expect(chip("Todos")).toHaveAttribute("aria-pressed", "true");
  });

  it("el ícono de la etiqueta de cada caso va en el color de marca", () => {
    render(<UseCasesFilter items={casos.items} />);
    expect(cards()[0].querySelector("span svg")).toHaveClass("text-brand");
  });

  it("hidrata el HTML del servidor sin avisos", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    container.innerHTML = renderToString(<UseCases />);
    document.body.appendChild(container);
    await act(async () => {
      hydrateRoot(container, <UseCases />);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(container.querySelectorAll("li")).toHaveLength(14);
    errors.mockRestore();
    container.remove();
  });

  it("con solo casos para todos no hay chips y cada caso dice 'Para todos'; el detalle se muestra si existe", () => {
    const items: CaseItem[] = [
      { title: "Cobranzas y seguimiento", body: "Recordatorios de pago que salen a tiempo.", rubro: "todos" },
      { title: "Tus números en un reporte", body: "", rubro: "todos" },
    ];
    render(<UseCasesFilter items={items} />);
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(cards()).toHaveLength(2);
    expect(screen.getAllByText("Para todos")).toHaveLength(2);
    expect(screen.getByText("Recordatorios de pago que salen a tiempo.")).toBeInTheDocument();
  });
});

describe("UseCases", () => {
  it("sección #casos con etiqueta y título, sin bajada vacía, y los 14 casos", () => {
    const { container } = render(<UseCases />);
    const section = container.querySelector("section#casos");
    expect(section).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: casos.title })).toBeInTheDocument();
    expect(screen.getByText("Ejemplos por rubro")).toBeInTheDocument();
    expect(section?.querySelectorAll("p.text-lg")).toHaveLength(0);
    expect(cards()).toHaveLength(14);
  });

  it("sin casos no se renderiza", () => {
    const { container } = render(<UseCases content={{ ...casos, items: [] }} />);
    expect(container.innerHTML).toBe("");
  });
});
