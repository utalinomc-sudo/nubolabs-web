// @vitest-environment jsdom
// Bloque "Autodiagnóstico" de la portada (cambio diagnostico-mapa-oportunidades, spec landing/autodiagnostico).
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SelfDiagnosis } from "@/components/landing/SelfDiagnosis";
import { defaultSiteConfig } from "@/lib/siteConfig";

afterEach(cleanup);
const c = defaultSiteConfig().content.autodiagnostico;

describe("SelfDiagnosis", () => {
  it("muestra los textos por defecto y el botón lleva a /diagnostico", () => {
    const { container } = render(<SelfDiagnosis />);
    expect(container.querySelector("section#autodiagnostico")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: c.title })).toBeInTheDocument();
    expect(screen.getByText(c.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(c.body)).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: c.cta });
    expect(cta).toHaveAttribute("href", "/diagnostico");
    expect(cta.className).toMatch(/min-h-\[52px\]|min-h-11/);
  });

  it("la tarjeta de ejemplo dice 'Ejemplo', trae las 4 dimensiones con nivel en texto y ninguna cifra", () => {
    render(<SelfDiagnosis />);
    const card = screen.getByRole("figure", { name: "Ejemplo de resultado del autodiagnóstico" });
    expect(card).toHaveTextContent("Tu mapa de oportunidades");
    expect(card).toHaveTextContent("Ejemplo");
    for (const d of ["Ventas y clientes", "Control y números", "Orden y seguimiento", "Equipo y crecimiento"]) {
      expect(card).toHaveTextContent(d);
    }
    expect(within(card).getAllByText(/^Oportunidad (alta|media)$/)).toHaveLength(4);
    expect(card).toHaveTextContent("Próximo paso sugerido");
    expect(card.textContent).not.toMatch(/\d|%|\$/);
  });

  it("con el proceso oculto suma separación arriba", () => {
    const { container, rerender } = render(<SelfDiagnosis />);
    expect(container.querySelector("section")?.className).not.toMatch(/pt-\[76px\]/);
    rerender(<SelfDiagnosis spaced />);
    expect(container.querySelector("section")?.className).toMatch(/pt-\[76px\]/);
  });
});
