// @vitest-environment jsdom
// Bloque de confianza (cambio confianza-recomendacion, spec landing/confianza).
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MiniQuote } from "@/components/landing/MiniQuote";
import { Trust } from "@/components/landing/Trust";
import { defaultSiteConfig, type Testimonio } from "@/lib/siteConfig";

afterEach(cleanup);

const base = defaultSiteConfig().content.confianza;
const t = (nombre: string, destacado = false): Testimonio => ({
  nombre,
  cargo: "Socio",
  empresa: `Estudio ${nombre}`,
  texto: `Recomiendo a Nubolabs (${nombre}).`,
  destacado,
});

describe("Trust", () => {
  it("sin testimonios muestra la etiqueta y el texto puente, sin cita ni nombres, y los 3 compromisos", () => {
    const { container } = render(<Trust />);
    expect(screen.getByRole("region", { name: "Nos recomiendan" })).toBeInTheDocument();
    expect(screen.getByText(base.textoPuente)).toBeInTheDocument();
    expect(container.querySelector("blockquote")).toBeNull();
    expect(container.querySelector("figcaption")).toBeNull();
    expect(container.textContent).not.toMatch(/[“”"]/);
    expect(screen.getByRole("heading", { name: "Nuestro compromiso contigo" })).toBeInTheDocument();
    for (const c of base.compromisos) {
      expect(screen.getByText(c.titulo)).toBeInTheDocument();
      expect(screen.getByText(c.texto)).toBeInTheDocument();
    }
  });

  it("con un destacado lo muestra como cita con autor e iniciales decorativas", () => {
    const { container } = render(<Trust content={{ ...base, testimonios: [t("Ana Pérez"), t("Mauricio Osorio", true)] }} />);
    const figure = container.querySelector("figure")!;
    expect(within(figure).getByText("Recomiendo a Nubolabs (Mauricio Osorio).").closest("blockquote")).not.toBeNull();
    const caption = figure.querySelector("figcaption")!;
    expect(caption).toHaveTextContent("Mauricio Osorio");
    expect(caption).toHaveTextContent("Socio · Estudio Mauricio Osorio");
    const avatar = within(caption).getByText("MO");
    expect(avatar).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByText(base.textoPuente)).toBeNull();
  });

  it("con 3 testimonios muestra 1 principal y 2 tarjetas; nunca más de 3", () => {
    const { container } = render(<Trust content={{ ...base, testimonios: ["A", "B", "C", "D"].map((n) => t(n)) }} />);
    expect(container.querySelectorAll("figure")).toHaveLength(3);
    expect(container.querySelectorAll("blockquote")).toHaveLength(3);
    expect(screen.queryByText("Recomiendo a Nubolabs (D).")).toBeNull();
  });
});

describe("Trust: contenido editado", () => {
  it("muestra compromisos personalizados y las tarjetas en el orden de la lista", () => {
    const compromisos = [
      { titulo: "Uno", texto: "Primero" },
      { titulo: "Dos", texto: "Segundo" },
      { titulo: "Tres", texto: "Tercero" },
    ];
    const { container } = render(<Trust content={{ ...base, compromisos, testimonios: [t("A"), t("B", true), t("C")] }} />);
    expect([...container.querySelectorAll("li b")].map((b) => b.textContent)).toEqual(["Uno", "Dos", "Tres"]);
    const autores = [...container.querySelectorAll("figcaption b")].map((b) => b.textContent);
    expect(autores).toEqual(["B", "A", "C"]);
  });

  it("el nombre de la región sale de la etiqueta editada", () => {
    render(<Trust content={{ ...base, eyebrow: "Confían en nosotros" }} />);
    expect(screen.getByRole("region", { name: "Confían en nosotros" })).toBeInTheDocument();
  });
});

describe("MiniQuote", () => {
  it("muestra el texto completo con nombre y empresa", () => {
    render(<MiniQuote testimonio={t("Mauricio Osorio")} />);
    const figure = screen.getByRole("figure");
    expect(within(figure).getByText("Recomiendo a Nubolabs (Mauricio Osorio).").closest("blockquote")).not.toBeNull();
    expect(figure).toHaveTextContent("Mauricio Osorio · Estudio Mauricio Osorio");
  });
});
