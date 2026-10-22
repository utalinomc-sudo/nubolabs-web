// @vitest-environment jsdom
// Estimador de ahorro interno del panel (cambio diagnostico-mapa-oportunidades, spec diagnostico/estimador-ahorro).
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EstimadorInterno } from "@/components/admin/EstimadorInterno";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("EstimadorInterno", () => {
  it("con un proceso por defecto muestra ≈ $155.187 al mes y no llama a ninguna API", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<EstimadorInterno />);
    const resumen = screen.getByRole("region", { name: "Resumen de la estimación" });
    expect(resumen).toHaveTextContent("$155.187");
    expect(resumen).toHaveTextContent("al mes");
    expect(resumen).toHaveTextContent("1 proceso");
    fireEvent.click(screen.getByText("+ Agregar otro proceso"));
    expect(resumen).toHaveTextContent("2 procesos");
    expect(resumen).toHaveTextContent("$310.374");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("aclara que es una herramienta interna y que nada se guarda", () => {
    render(<EstimadorInterno />);
    expect(screen.getByText(/no se guarda/i)).toBeInTheDocument();
  });
});
