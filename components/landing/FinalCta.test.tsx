// @vitest-environment jsdom
// CTA final (cambio cierre-landing-faq-cta, spec landing/cierre "CTA final").
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FinalCta } from "@/components/landing/FinalCta";

afterEach(cleanup);

describe("FinalCta", () => {
  it("muestra los textos por defecto, la nota y lleva a #contacto", () => {
    render(<FinalCta />);
    expect(screen.getByText("Soluciones a tu medida, decisiones con datos")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Tu negocio tiene su propio problema. Empecemos por entenderlo." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cuéntanos qué te frena y te mostramos por dónde partir.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agendar mi diagnóstico gratis" })).toHaveAttribute("href", "#contacto");
    expect(screen.getByText("30 minutos · por videollamada · sin compromiso")).toBeInTheDocument();
  });

  it("con el contacto oculto lleva a /diagnostico", () => {
    render(<FinalCta contactVisible={false} />);
    expect(screen.getByRole("link", { name: "Agendar mi diagnóstico gratis" })).toHaveAttribute("href", "/diagnostico");
  });

  it("suma separación arriba cuando no hay preguntas frecuentes antes", () => {
    const { container, rerender } = render(<FinalCta />);
    expect(container.querySelector("section")!.className).not.toMatch(/\bpt-/);
    rerender(<FinalCta spaced />);
    expect(container.querySelector("section")!.className).toMatch(/\bpt-\[76px\]/);
  });
});
