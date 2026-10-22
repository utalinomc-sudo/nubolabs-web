// @vitest-environment jsdom
// Pie del sitio público (cambio cierre-landing-faq-cta, spec landing/cierre "Footer del sitio público").
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Footer } from "@/components/landing/Footer";

afterEach(cleanup);

const footer = () => screen.getByRole("contentinfo");

describe("Footer", () => {
  it("muestra las 4 columnas, privacidad y el año actual, sin hola@nubolabs.ai ni WhatsApp", () => {
    render(<Footer />);
    const f = footer();
    expect(f).toHaveTextContent("Ordenamos tu negocio y dejamos funcionando solo lo repetitivo.");
    for (const h of ["Servicios", "Nubolabs", "Contacto"]) {
      expect(within(f).getByRole("heading", { level: 2, name: h })).toBeInTheDocument();
    }
    expect(within(f).getAllByRole("link", { name: /Diagnóstico y plan|Tareas que avanzan solas|Clientes atendidos al instante|Tus números claros/ })).toHaveLength(4);
    expect(within(f).getByRole("link", { name: "Misión y visión" })).toHaveAttribute("href", "/mision-vision");
    expect(within(f).getByRole("link", { name: "Equipo" })).toHaveAttribute("href", "/equipo");
    expect(within(f).getByRole("link", { name: "Cómo trabajamos" })).toHaveAttribute("href", "/#modelo");
    expect(within(f).getByRole("link", { name: "Preguntas frecuentes" })).toHaveAttribute("href", "/#preguntas");
    expect(within(f).getByRole("link", { name: "www.nubolabs.cl" })).toHaveAttribute("href", "https://www.nubolabs.cl");
    expect(within(f).getByRole("link", { name: "Agendar diagnóstico" })).toHaveAttribute("href", "/#contacto");
    expect(within(f).getByRole("link", { name: "Privacidad" })).toHaveAttribute("href", "/privacidad");
    expect(f).toHaveTextContent(`© ${new Date().getFullYear()} Nubolabs · Hecho en Chile`);
    expect(f.textContent).not.toContain("hola@nubolabs.ai");
    expect(f.innerHTML).not.toContain("wa.me");
  });

  it("no ofrece enlaces a secciones o páginas ocultas", () => {
    render(<Footer sections={{ equipo: false, nosotros: false, faq: false, proceso: false, servicios: false, contacto: false }} />);
    const f = footer();
    for (const name of ["Equipo", "Misión y visión", "Preguntas frecuentes", "Cómo trabajamos", "Diagnóstico y plan"]) {
      expect(within(f).queryByRole("link", { name })).toBeNull();
    }
    expect(within(f).queryByRole("heading", { name: "Servicios" })).toBeNull();
    expect(within(f).getByRole("link", { name: "Agendar diagnóstico" })).toHaveAttribute("href", "/diagnostico");
    // Sin ningún enlace, la columna "Nubolabs" no se muestra vacía.
    expect(within(f).queryByRole("heading", { name: "Nubolabs" })).toBeNull();
  });

  it("deja espacio para la CTA fija solo cuando la portada la muestra", () => {
    const { rerender } = render(<Footer />);
    expect(footer().className).not.toContain("pb-24");
    rerender(<Footer stickyCta />);
    expect(footer().className).toContain("pb-24");
  });

  it("muestra el WhatsApp solo si viene activado", () => {
    render(<Footer whatsapp={{ label: "+56 9 3259 0783", url: "https://wa.me/56932590783" }} />);
    const link = within(footer()).getByRole("link", { name: "WhatsApp: +56 9 3259 0783 (abre en otra pestaña)" });
    expect(link).toHaveAttribute("href", "https://wa.me/56932590783");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});
