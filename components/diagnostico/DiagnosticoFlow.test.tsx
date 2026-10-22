// @vitest-environment jsdom
// Paso de contacto del diagnóstico (cambio formulario-minimo-consentimiento, spec "Consentimiento y WhatsApp en el
// diagnóstico" y revisión adversarial: un 400 del servidor no puede terminar en una confirmación falsa).
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DiagnosticoFlow } from "@/components/diagnostico/DiagnosticoFlow";

// Cada prueba hace clic en las 18 preguntas: con la máquina cargada pasan de los 5 s por defecto.
vi.setConfig({ testTimeout: 20_000 });

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

// Cambio diagnostico-mapa-oportunidades (spec diagnostico/mapa-oportunidades, "Resultado visible en el diagnóstico").
describe("DiagnosticoFlow: mapa de oportunidades", () => {
  const panel = () => screen.getByRole("region", { name: "Tu mapa de oportunidades" });

  it("parte con las 4 dimensiones sin datos y sin el estimador de ahorro", () => {
    render(<DiagnosticoFlow />);
    const p = panel();
    for (const d of ["Ventas y clientes", "Control y números", "Orden y seguimiento", "Equipo y crecimiento"]) {
      expect(p).toHaveTextContent(d);
    }
    expect(within(p).getAllByText("Sin datos")).toHaveLength(4);
    expect(p).toHaveTextContent("0 de 18 preguntas respondidas");
    expect(screen.queryByRole("button", { name: /Estimar mi ahorro/ })).toBeNull();
  });

  it("al responder solo 'Clientes y reportes' cambia solo 'Ventas y clientes'", () => {
    render(<DiagnosticoFlow />);
    screen.getAllByText("Seguido").slice(15).forEach((o) => fireEvent.click(o));
    const p = panel();
    expect(within(p).getAllByText("Sin datos")).toHaveLength(3);
    expect(within(p).getByText("Oportunidad alta")).toBeInTheDocument();
    expect(p).toHaveTextContent("3 de 18 preguntas respondidas");
  });

  it("con todo respondido la página no habla de fricción, ahorro, montos ni horas", () => {
    render(<DiagnosticoFlow />);
    answerAll();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/fricci|ahorro|\$|h\/mes|automatizaci/i);
    expect(within(panel()).getAllByText("Oportunidad alta")).toHaveLength(4);
  });

  it("las preguntas abiertas son la de mejorar este año y la de la solución mágica, en ese orden", () => {
    render(<DiagnosticoFlow />);
    const labels = ["¿Qué es lo que más te gustaría mejorar en tu negocio este año?", "Si pudieras resolver un solo problema del día a día con una solución mágica, ¿cuál sería?"];
    const positions = labels.map((l) => document.body.textContent?.indexOf(l) ?? -1);
    expect(positions.every((i) => i >= 0)).toBe(true);
    expect(positions[0]).toBeLessThan(positions[1]);
  });

  it("envía areas con id y el mapa, sin ahorro; la confirmación habla del mapa", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true, persisted: false }) });
    render(<DiagnosticoFlow />);
    answerAll();
    fillContact();
    fireEvent.click(consent());
    send();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.meta).not.toHaveProperty("ahorro");
    expect(body.meta.areas.map((a: { id: string }) => a.id)).toEqual(["carga", "plazos", "info", "procesos", "conocimiento", "clientes"]);
    expect(body.meta.oportunidades.principales).toEqual(["ventas", "control", "orden"]);
    expect(body.message).toContain("Mayor oportunidad: Ventas y clientes");
    expect(body.message).not.toMatch(/ahorro/i);
    expect(await screen.findByText(/con tu mapa de oportunidades está listo/)).toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toMatch(/fricci|ahorro|\$|h\/mes|automatizaci/i);
  });
});
