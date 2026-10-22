// @vitest-environment jsdom
// Cifras con respaldo (cambio cifras-con-respaldo, spec landing/cifras).
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Metrics } from "@/components/landing/Metrics";
import { defaultSiteConfig, type Cifra } from "@/lib/siteConfig";

afterEach(cleanup);

const frase = defaultSiteConfig().content.cifras.frase;
const c = (valor: string, fuente = "Piloto con cliente de O&A, 2026"): Cifra => ({ valor, texto: `texto de ${valor}`, fuente });

describe("Metrics", () => {
  it("muestra solo las cifras con fuente, cada una con su valor, texto y fuente", () => {
    render(<Metrics content={{ items: [c("Mismo día"), c("Sin fuente", " "), c("2 de 3", "Encuesta a clientes, 2026")], frase }} />);
    expect(screen.getByRole("region", { name: "Resultados medibles" })).toBeInTheDocument();
    expect(screen.getByText("Mismo día")).toBeInTheDocument();
    expect(screen.getByText("texto de Mismo día")).toBeInTheDocument();
    expect(screen.getByText("Fuente: Piloto con cliente de O&A, 2026")).toBeInTheDocument();
    expect(screen.getByText("2 de 3")).toBeInTheDocument();
    expect(screen.getByText("Fuente: Encuesta a clientes, 2026")).toBeInTheDocument();
    expect(screen.queryByText("Sin fuente")).toBeNull();
    expect(screen.queryByText(frase)).toBeNull();
  });

  it("sin cifras válidas muestra solo la frase", () => {
    render(<Metrics content={{ items: [c("Sin fuente", "")], frase }} />);
    expect(screen.getByText(frase)).toBeInTheDocument();
    expect(screen.queryByText("Sin fuente")).toBeNull();
  });

  it("sin cifras ni frase no renderiza nada (también con una frase solo de caracteres invisibles)", () => {
    const { container, rerender } = render(<Metrics content={{ items: [], frase: "" }} />);
    expect(container.innerHTML).toBe("");
    rerender(<Metrics content={{ items: [], frase: "\u200B " }} />);
    expect(container.innerHTML).toBe("");
  });

  it("con más de 4 cifras válidas muestra las 4 primeras", () => {
    render(<Metrics content={{ items: ["1", "2", "3", "4", "5"].map((v) => c(`Cifra ${v}`)), frase }} />);
    expect(screen.getAllByRole("listitem").map((li) => li.firstChild?.textContent)).toEqual(["Cifra 1", "Cifra 2", "Cifra 3", "Cifra 4"]);
  });
});
