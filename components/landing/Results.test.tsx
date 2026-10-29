// @vitest-environment jsdom
// Sección "Lo que ganas" (cambio lenguaje-sin-jerga, spec landing/contenido-pyme).
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Results } from "@/components/landing/Results";
import { defaultSiteConfig } from "@/lib/siteConfig";

afterEach(cleanup);

describe("Results", () => {
  it("muestra los 4 resultados por defecto, la línea de cierre y el ancla #resultados", () => {
    const { container } = render(<Results />);
    const c = defaultSiteConfig().content.resultados;
    expect(container.querySelector("section#resultados")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: c.title })).toBeInTheDocument();
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Vendes más", "Decides con datos", "Nada se olvida", "Creces sin desordenarte"]);
    for (const item of c.items) expect(screen.getByText(item.body)).toBeInTheDocument();
    expect(screen.getByText(c.cierre)).toBeInTheDocument();
  });

  it("cada resultado tiene su ilustración oculta para lectores de pantalla; la primera es el seguimiento de una venta, no un chat", () => {
    const { container } = render(<Results />);
    const visuals = container.querySelectorAll("[data-viz]");
    expect(visuals).toHaveLength(4);
    visuals.forEach((v) => expect(v).toHaveAttribute("aria-hidden", "true"));
    expect(visuals[0].textContent).toContain("Cotización enviada");
    expect(container.textContent).not.toMatch(/respuesta automática|WhatsApp|Declaración mensual/);
  });

  it("con textos propios del CMS los muestra", () => {
    const base = defaultSiteConfig().content.resultados;
    const content = {
      ...base,
      title: "Lo que cambia en tu negocio",
      items: base.items.map((it, i) => (i === 1 ? { title: "Sabes cuánto ganas", body: "Tus números al día." } : it)),
      cierre: "Y tú duermes tranquilo.",
    };
    render(<Results content={content} />);
    expect(screen.getByRole("heading", { level: 2, name: "Lo que cambia en tu negocio" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Sabes cuánto ganas" })).toBeInTheDocument();
    expect(screen.getByText("Tus números al día.")).toBeInTheDocument();
    expect(screen.getByText("Y tú duermes tranquilo.")).toBeInTheDocument();
  });
});
