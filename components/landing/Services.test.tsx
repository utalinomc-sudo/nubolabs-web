// @vitest-environment jsdom
// Servicios orientados a resultados (cambio lenguaje-sin-jerga, spec landing/contenido-pyme).
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Services } from "@/components/landing/Services";
import { defaultSiteConfig } from "@/lib/siteConfig";

afterEach(cleanup);

describe("Services", () => {
  it("muestra el destacado con su etiqueta e incluye, los 4 servicios, el acompañamiento y la nota técnica al final", () => {
    const { container } = render(<Services />);
    const c = defaultSiteConfig().content.servicios;
    expect(screen.getByText(c.destacado.etiqueta)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Diagnóstico y plan de mejora" })).toBeInTheDocument();
    for (const t of c.destacado.incluye) expect(screen.getByText(t)).toBeInTheDocument();
    expect(container.querySelectorAll("[data-service]")).toHaveLength(4);
    for (const s of c.items) expect(screen.getByText(s.result)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Acompañamiento mensual" })).toBeInTheDocument();
    const notas = container.querySelectorAll("[data-nota-tecnica]");
    expect(notas).toHaveLength(1);
    expect(notas[0]).toBe(container.querySelector("section > div")?.lastElementChild);
    expect(notas[0].querySelector("b")).toHaveTextContent("Cómo lo hacemos:");
  });

  it("anuncia 'Lo que ganas' a lectores de pantalla y no pinta la línea si el servicio no tiene resultado", () => {
    const base = defaultSiteConfig().content.servicios;
    const { container } = render(
      <Services content={{ ...base, items: [{ title: "Uno", body: "Texto", result: "" }, base.items[1]] }} />,
    );
    const cards = container.querySelectorAll("[data-service]");
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).not.toContain("Lo que ganas");
    expect(cards[1].textContent).toContain("Lo que ganas: " + base.items[1].result);
  });
});
