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

  it("el botón que abre el menú mide 44 × 44 px", () => {
    render(<Nav />);
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    expect(toggle).toHaveClass("h-11", "w-11");
  });
});
