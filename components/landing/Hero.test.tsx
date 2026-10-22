// @vitest-environment jsdom
// Tests del hero (cambio mensaje-principal-pyme, spec landing/hero: llamados a la acción y etiquetas).
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Hero } from "@/components/landing/Hero";
import { defaultSiteConfig } from "@/lib/siteConfig";

afterEach(cleanup);

const hero = defaultSiteConfig().content.hero;

describe("Hero", () => {
  it("lleva el CTA principal a #contacto y el secundario a #modelo", () => {
    render(<Hero content={hero} />);
    expect(screen.getByRole("link", { name: /Quiero mi diagnóstico gratis/ })).toHaveAttribute("href", "#contacto");
    expect(screen.getByRole("link", { name: "Ver cómo trabajamos" })).toHaveAttribute("href", "#modelo");
  });

  it("con el contacto oculto, el CTA principal va a /diagnostico", () => {
    render(<Hero content={hero} contactVisible={false} />);
    expect(screen.getByRole("link", { name: /Quiero mi diagnóstico gratis/ })).toHaveAttribute("href", "/diagnostico");
  });

  it("con el proceso oculto, no muestra el botón secundario", () => {
    render(<Hero content={hero} processVisible={false} />);
    expect(screen.queryByRole("link", { name: "Ver cómo trabajamos" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("muestra el título con el resalte de marca y las etiquetas", () => {
    render(<Hero content={hero} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Que tu negocio trabaje para ti, no al revés.");
    expect(h1.querySelector(".text-gradient-brand")).toHaveTextContent("trabaje para ti");
    for (const tag of hero.tags) expect(screen.getByText(tag)).toBeInTheDocument();
  });

  it("sin etiqueta superior no muestra la píldora; con texto, sí", () => {
    const { container } = render(<Hero content={hero} />);
    expect(container.querySelector("[data-hero-eyebrow]")).toBeNull();
    cleanup();
    render(<Hero content={{ ...hero, eyebrow: "Hola" }} />);
    expect(screen.getByText("Hola").closest("[data-hero-eyebrow]")).not.toBeNull();
  });

  it("no agrega otra flecha si el texto del botón ya termina en →", () => {
    render(<Hero content={{ ...hero, ctaPrimary: "Solicitar diagnóstico →" }} />);
    expect(screen.getByRole("link", { name: "Solicitar diagnóstico →" }).querySelector("svg")).toBeNull();
    cleanup();
    render(<Hero content={hero} />);
    expect(screen.getByRole("link", { name: /Quiero mi diagnóstico gratis/ }).querySelector("svg")).not.toBeNull();
  });
});
