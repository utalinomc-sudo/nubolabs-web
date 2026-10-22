// @vitest-environment jsdom
// Sección "¿Te suena?" (cambio lenguaje-sin-jerga, spec landing/contenido-pyme).
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Problem } from "@/components/landing/Problem";
import { defaultSiteConfig } from "@/lib/siteConfig";

afterEach(cleanup);

describe("Problem", () => {
  it("muestra los 6 dolores por defecto, el cierre con su resalte y el enlace a #resultados", () => {
    const { container } = render(<Problem />);
    expect(screen.getByRole("heading", { level: 2, name: "¿Te suena?" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-pain]")).toHaveLength(6);
    expect(screen.getByText("tu negocio creció y la forma de trabajar no.").tagName).toBe("EM");
    expect(screen.getByRole("link", { name: "Mira lo que cambia" })).toHaveAttribute("href", "#resultados");
  });

  it("con 4 dolores editados muestra esos 4", () => {
    const base = defaultSiteConfig().content.problema;
    const items = [{ title: "Uno" }, { title: "Dos" }, { title: "Tres" }, { title: "Cuatro" }];
    const { container } = render(<Problem content={{ ...base, items }} />);
    expect([...container.querySelectorAll("[data-pain]")].map((p) => p.textContent)).toEqual(["Uno", "Dos", "Tres", "Cuatro"]);
  });

  it("si 'Lo que ganas' está oculta no muestra el enlace del cierre", () => {
    render(<Problem resultsVisible={false} />);
    expect(screen.queryByRole("link", { name: "Mira lo que cambia" })).toBeNull();
  });
});
