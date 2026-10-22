// @vitest-environment jsdom
// "Cómo trabajamos" (cambio lenguaje-sin-jerga, spec landing/contenido-pyme "Proceso con lo que recibe el cliente").
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Process } from "@/components/landing/Process";
import { defaultSiteConfig } from "@/lib/siteConfig";

afterEach(cleanup);

describe("Process", () => {
  it("muestra 4 pasos con su 'Recibes', el ancla #modelo y la franja de éxito", () => {
    const { container } = render(<Process />);
    const c = defaultSiteConfig().content.proceso;
    expect(container.querySelector("section#modelo")).not.toBeNull();
    const pasos = within(container.querySelector("ol") as HTMLElement).getAllByRole("listitem");
    expect(pasos).toHaveLength(4);
    pasos.forEach((li, i) => {
      expect(within(li).getByRole("heading", { level: 3 })).toHaveTextContent(c.items[i].title);
      expect(li).toHaveTextContent("Recibes" + c.items[i].recibes);
    });
    expect(screen.getByText("Tú defines qué es éxito:")).toBeInTheDocument();
    for (const e of c.exito.items) expect(screen.getByText(e)).toBeInTheDocument();
    expect(pasos[3].textContent).not.toMatch(/horas/i);
  });
});
