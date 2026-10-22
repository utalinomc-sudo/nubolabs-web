// @vitest-environment jsdom
// Tests del botón "Diagnóstico gratis" del menú (cambio mensaje-principal-pyme, spec landing/hero).
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Nav } from "@/components/landing/Nav";

afterEach(cleanup);

function ctaHrefs(): (string | null)[] {
  fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
  return screen.getAllByRole("link", { name: "Diagnóstico gratis" }).map((a) => a.getAttribute("href"));
}

describe("Nav", () => {
  it("lleva 'Diagnóstico gratis' al formulario de la portada en escritorio y en el menú móvil", () => {
    render(<Nav />);
    expect(ctaHrefs()).toEqual(["/#contacto", "/#contacto"]);
  });

  it("con el contacto oculto lleva al cuestionario", () => {
    render(<Nav showContact={false} />);
    expect(ctaHrefs()).toEqual(["/diagnostico", "/diagnostico"]);
  });

  // Cambio lenguaje-sin-jerga (spec landing/contenido-pyme, "Orden de secciones y navegación").
  it("ofrece Lo que ganas, Servicios, Ejemplos y Cómo trabajamos en escritorio y móvil, sin ítem activo fijo", () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    const expected = [
      ["Lo que ganas", "/#resultados"],
      ["Servicios", "/#servicios"],
      ["Ejemplos", "/#casos"],
      ["Cómo trabajamos", "/#modelo"],
    ];
    for (const [label, href] of expected) {
      const links = screen.getAllByRole("link", { name: label });
      expect(links).toHaveLength(2);
      for (const a of links) {
        expect(a).toHaveAttribute("href", href);
        expect(a).not.toHaveAttribute("aria-current");
        expect(a.className).not.toMatch(/border-b-2/);
      }
    }
    expect(screen.queryByRole("link", { name: "Inicio" })).toBeNull();
  });

  it("no muestra el ítem de una sección oculta", () => {
    render(<Nav sections={{ resultados: false, proceso: false }} />);
    expect(screen.queryByRole("link", { name: "Lo que ganas" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Cómo trabajamos" })).toBeNull();
    expect(screen.getByRole("link", { name: "Servicios" })).toBeInTheDocument();
  });

  it("el botón que abre el menú mide 44 × 44 px", () => {
    render(<Nav />);
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    expect(toggle).toHaveClass("h-11", "w-11");
  });
});
