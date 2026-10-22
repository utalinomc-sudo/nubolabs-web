// @vitest-environment jsdom
// Preguntas frecuentes (cambio cierre-landing-faq-cta, spec landing/cierre).
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Faq } from "@/components/landing/Faq";
import { defaultSiteConfig } from "@/lib/siteConfig";

afterEach(cleanup);

describe("Faq", () => {
  it("muestra las 6 preguntas como details/summary cerrados, con ancla #preguntas", () => {
    const { container } = render(<Faq />);
    expect(container.querySelector("section#preguntas")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Lo que nos preguntan antes de partir" })).toBeInTheDocument();
    const details = container.querySelectorAll("details");
    expect(details).toHaveLength(6);
    details.forEach((d) => {
      expect(d.open).toBe(false);
      expect(d.querySelector("summary")).not.toBeNull();
    });
    expect(details[2].querySelector("summary")).toHaveTextContent("¿Cuánto cuesta?");
  });

  it("la respuesta sobre datos enlaza a /privacidad", () => {
    render(<Faq />);
    expect(screen.getByRole("link", { name: "Política de privacidad completa" })).toHaveAttribute("href", "/privacidad");
  });

  it("muestra HTML literal y no enlaza destinos externos", () => {
    const base = defaultSiteConfig().content.faq;
    const { container } = render(
      <Faq
        content={{
          ...base,
          items: [
            { pregunta: "¿HTML?", respuesta: "<b>hola</b>" },
            { pregunta: "¿Externo?", respuesta: "Mira el [sitio](https://ejemplo.com) o [clic](javascript:alert(1))." },
            { pregunta: "¿Barra invertida?", respuesta: "Ve a [otro](/\\evil.com)." },
          ],
        }}
      />,
    );
    expect(screen.getByText("<b>hola</b>")).toBeInTheDocument();
    expect(container.querySelector("b")).toBeNull();
    expect(screen.queryByRole("link", { name: "sitio" })).toBeNull();
    expect(screen.queryByRole("link", { name: "clic" })).toBeNull();
    expect(screen.getByText("Mira el sitio o clic.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "otro" })).toBeNull();
    expect(container.querySelector("a[href*=evil]")).toBeNull();
  });
});
