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
  sessionStorage.clear();
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

  it("con el rubro 'Otro' permite escribirlo (70 caracteres) y lo envía también como rubro del informe", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true, persisted: false }) });
    render(<DiagnosticoFlow />);
    expect(screen.queryByLabelText("¿Cuál es tu rubro?")).not.toBeInTheDocument();
    answerAll();
    fillContact();
    fireEvent.change(screen.getByLabelText("Rubro (opcional)"), { target: { value: "otro" } });
    const other = screen.getByLabelText("¿Cuál es tu rubro?");
    expect(other).toHaveAttribute("maxLength", "70");
    fireEvent.change(other, { target: { value: "Transporte de carga" } });
    fireEvent.click(consent());
    send();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ industry: "otro", industryOther: "Transporte de carga" });
    expect(body.meta.rubro).toBe("Otro: Transporte de carga");
  });

  // Cambio landing-referidos-oa: una visita que entró por /oa marca también el diagnóstico.
  it("incluye referral 'oa' si la pestaña viene de /oa, sin cambiar el origen", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true, persisted: false }) });
    sessionStorage.setItem("nubolabs_ref", "oa");
    render(<DiagnosticoFlow />);
    answerAll();
    fillContact();
    fireEvent.click(consent());
    send();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ source: "diagnostico", referral: "oa" });
    expect(body.meta).toBeTruthy();
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
    expect(body).not.toHaveProperty("referral");
  });
});

// Cambio lenguaje-sin-jerga (spec landing/contenido-pyme, "Encabezado del autodiagnóstico sin jerga").
describe("DiagnosticoFlow: encabezado", () => {
  it("habla de oportunidades del negocio, sin 'automatización' ni 'fricción operativa', y mantiene las 18 preguntas", () => {
    render(<DiagnosticoFlow />);
    const header = screen.getByRole("heading", { level: 1 }).closest("header") as HTMLElement;
    expect(header).toHaveTextContent("AUTODIAGNÓSTICO");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("¿Dónde está la mayor oportunidad de tu negocio?");
    expect(header).toHaveTextContent("18 preguntas, 5 minutos.");
    expect(header.textContent ?? "").not.toMatch(/automatizaci[oó]n|fricci[oó]n operativa|ahorrar automatizando/i);
    expect(screen.getAllByText("Seguido")).toHaveLength(18);
  });
});
