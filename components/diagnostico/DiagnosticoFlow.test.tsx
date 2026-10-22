// @vitest-environment jsdom
// Paso de contacto del diagnóstico (cambio formulario-minimo-consentimiento, spec "Consentimiento y WhatsApp en el
// diagnóstico" y revisión adversarial: un 400 del servidor no puede terminar en una confirmación falsa).
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DiagnosticoFlow } from "@/components/diagnostico/DiagnosticoFlow";

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function answerAll() {
  // Cada opción de la escala es un <span> con el número y la etiqueta ("4Seguido").
  const options = screen.getAllByText("Seguido");
  expect(options).toHaveLength(18);
  options.forEach((o) => fireEvent.click(o));
}
function fillContact(phone = "+56 9 5555 1234") {
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Carolina Rojas" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "carolina@tallerrojas.cl" } });
  fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: phone } });
}
const send = () => fireEvent.click(screen.getByRole("button", { name: /Enviar diagnóstico/ }));
const consent = () => screen.getByRole("checkbox", { name: /Acepto que Nubolabs use mis datos/ });

describe("DiagnosticoFlow: paso de contacto", () => {
  it("los campos obligatorios están marcados y limitan su largo como el servidor", () => {
    render(<DiagnosticoFlow />);
    expect(screen.getByLabelText("WhatsApp")).toHaveAttribute("aria-required", "true");
    expect(screen.getByLabelText("WhatsApp")).toHaveAttribute("maxLength", "30");
    expect(screen.getByLabelText("Email")).toHaveAttribute("maxLength", "254");
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("maxLength", "120");
  });

  it("sin el consentimiento de contacto no llama a la API", () => {
    render(<DiagnosticoFlow />);
    answerAll();
    fillContact();
    send();
    expect(screen.getByText("Necesitamos tu permiso para contactarte sobre el diagnóstico.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("si el servidor rechaza los datos (400) muestra su mensaje y no confirma", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: "El email no es válido." }) });
    render(<DiagnosticoFlow />);
    answerAll();
    fillContact();
    fireEvent.click(consent());
    send();
    expect(await screen.findByText("El email no es válido.")).toBeInTheDocument();
    expect(screen.queryByText(/Descargar mi informe/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar diagnóstico/ })).toBeEnabled();
  });

  it("si el servidor falla (500) confirma igual, como antes", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: "No se pudo guardar la solicitud." }) });
    render(<DiagnosticoFlow />);
    answerAll();
    fillContact();
    fireEvent.click(consent());
    send();
    await waitFor(() => expect(screen.getByText(/Descargar mi informe/)).toBeInTheDocument());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ source: "diagnostico", contactConsent: true, marketingConsent: false, phone: "+56 9 5555 1234" });
  });
});
