// @vitest-environment jsdom
// Tests del formulario de 2 pasos (cambio formulario-minimo-consentimiento, spec leads/formulario-contacto).
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/landing/ContactForm";

type FetchMock = ReturnType<typeof vi.fn>;
let fetchMock: FetchMock;

function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValueOnce({ ok: status >= 200 && status < 300, status, json: async () => body });
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const chip = (name: string) => screen.getByRole("button", { name });
const field = (label: RegExp) => screen.getByLabelText(label) as HTMLInputElement;

function goToStep2() {
  fireEvent.click(screen.getByRole("button", { name: "Saltar este paso" }));
}
function fillValid() {
  fireEvent.change(field(/^Nombre/), { target: { value: "Carolina Rojas" } });
  fireEvent.change(field(/^WhatsApp/), { target: { value: "+56 9 5555 1234" } });
  fireEvent.change(field(/^Correo/), { target: { value: "carolina@tallerrojas.cl" } });
}
function submit() {
  fireEvent.click(screen.getByRole("button", { name: /Agendar mi diagnóstico gratis/ }));
}
function sentBody(): Record<string, unknown> {
  return JSON.parse(fetchMock.mock.calls[0][1].body as string);
}

describe("ContactForm: pasos y opciones", () => {
  it("saltar el paso 1 muestra el paso 2", () => {
    render(<ContactForm />);
    expect(screen.getByText("Paso 1 de 2")).toBeInTheDocument();
    goToStep2();
    expect(screen.getByText("Paso 2 de 2")).toBeInTheDocument();
    expect(screen.getByText("¿Dónde te contactamos?")).toBeInTheDocument();
  });

  it("los objetivos son múltiples y el rubro único y deseleccionable", () => {
    render(<ContactForm />);
    fireEvent.click(chip("Vender más"));
    fireEvent.click(chip("Cobrar a tiempo"));
    fireEvent.click(chip("Automotriz"));
    fireEvent.click(chip("Construcción"));
    expect(chip("Vender más")).toHaveAttribute("aria-pressed", "true");
    expect(chip("Cobrar a tiempo")).toHaveAttribute("aria-pressed", "true");
    expect(chip("Automotriz")).toHaveAttribute("aria-pressed", "false");
    expect(chip("Construcción")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(chip("Construcción"));
    expect(chip("Construcción")).toHaveAttribute("aria-pressed", "false");
  });

  it("'Volver' conserva lo elegido y lo escrito", () => {
    render(<ContactForm />);
    fireEvent.click(chip("Vender más"));
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    fireEvent.change(field(/^Nombre/), { target: { value: "Carolina" } });
    fireEvent.click(screen.getByRole("button", { name: "Volver" }));
    expect(chip("Vender más")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(field(/^Nombre/).value).toBe("Carolina");
  });
});

describe("ContactForm: detalle de 'Otra cosa' y 'Otro'", () => {
  it("los campos aparecen al marcar la opción, aceptan 70 caracteres y desaparecen al desmarcar", () => {
    render(<ContactForm />);
    expect(screen.queryByLabelText(/¿Qué otra cosa te gustaría lograr?/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/¿Cuál es tu rubro?/)).not.toBeInTheDocument();
    fireEvent.click(chip("Otra cosa"));
    fireEvent.click(chip("Otro"));
    const goalOther = screen.getByLabelText(/¿Qué otra cosa te gustaría lograr?/);
    const industryOther = screen.getByLabelText(/¿Cuál es tu rubro?/);
    expect(goalOther).toHaveAttribute("maxLength", "70");
    expect(industryOther).toHaveAttribute("maxLength", "70");
    fireEvent.click(chip("Otra cosa"));
    expect(screen.queryByLabelText(/¿Qué otra cosa te gustaría lograr?/)).not.toBeInTheDocument();
  });

  it("envía el texto solo de las opciones marcadas", async () => {
    respond(200, { ok: true, persisted: false });
    render(<ContactForm />);
    fireEvent.click(chip("Otra cosa"));
    fireEvent.change(screen.getByLabelText(/¿Qué otra cosa te gustaría lograr?/), { target: { value: "Abrir una segunda sucursal" } });
    fireEvent.click(chip("Otro"));
    fireEvent.change(screen.getByLabelText(/¿Cuál es tu rubro?/), { target: { value: "Transporte de carga" } });
    fireEvent.click(chip("Otra cosa")); // se desmarca: su texto no debe ir
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    fillValid();
    fireEvent.click(screen.getByRole("checkbox", { name: /Acepto que Nubolabs use mis datos/ }));
    submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = sentBody();
    expect(body.industry).toBe("otro");
    expect(body.industryOther).toBe("Transporte de carga");
    expect(body).not.toHaveProperty("goalOther");
  });
});

describe("ContactForm: validación", () => {
  it("valida el correo al salir del campo", () => {
    render(<ContactForm />);
    goToStep2();
    fireEvent.change(field(/^Correo/), { target: { value: "carolina@tallerrojas" } });
    fireEvent.blur(field(/^Correo/));
    expect(screen.getByText("Revisa el correo: falta la @ o el dominio (ej.: tu@empresa.cl).")).toBeInTheDocument();
    expect(field(/^Correo/)).toHaveAttribute("aria-invalid", "true");
  });

  it("al enviar vacío muestra 3 errores, enfoca el nombre y no llama a la API", () => {
    render(<ContactForm />);
    goToStep2();
    submit();
    expect(screen.getByText("Escribe tu nombre para saber cómo llamarte.")).toBeInTheDocument();
    expect(screen.getByText("Revisa el WhatsApp: debe tener entre 8 y 15 dígitos.")).toBeInTheDocument();
    expect(screen.getByText("Revisa el correo: falta la @ o el dominio (ej.: tu@empresa.cl).")).toBeInTheDocument();
    expect(document.activeElement).toBe(field(/^Nombre/));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sin el consentimiento de contacto no envía y enfoca la casilla", () => {
    render(<ContactForm />);
    goToStep2();
    fillValid();
    submit();
    expect(screen.getByText("Necesitamos tu permiso para contactarte sobre el diagnóstico.")).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: /Acepto que Nubolabs use mis datos/ }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("las casillas parten desmarcadas y el enlace de privacidad abre en otra pestaña", () => {
    render(<ContactForm />);
    goToStep2();
    for (const box of screen.getAllByRole("checkbox")) expect(box).not.toBeChecked();
    const link = screen.getByRole("link", { name: "Cómo cuidamos tus datos" });
    expect(link).toHaveAttribute("href", "/privacidad");
    expect(link).toHaveAttribute("target", "_blank");
  });
});

describe("ContactForm: envío", () => {
  it("envía objetivos, rubro, consentimientos, origen y el honeypot vacío", async () => {
    respond(200, { ok: true, persisted: false });
    render(<ContactForm source="landing" />);
    fireEvent.click(chip("Vender más"));
    fireEvent.click(chip("Cobrar a tiempo"));
    fireEvent.click(chip("Automotriz"));
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    fillValid();
    fireEvent.click(screen.getByRole("checkbox", { name: /Acepto que Nubolabs use mis datos/ }));
    submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toBe("/api/leads");
    expect(sentBody()).toMatchObject({
      name: "Carolina Rojas",
      phone: "+56 9 5555 1234",
      email: "carolina@tallerrojas.cl",
      goals: ["sell_more", "collect_on_time"],
      industry: "automotriz",
      contactConsent: true,
      marketingConsent: false,
      source: "landing",
      website: "",
    });
    expect(await screen.findByText("Conversamos 30 minutos sobre cómo vender más y cobrar a tiempo.")).toBeInTheDocument();
  });

  it("si el servidor falla muestra su error, rehabilita el botón y conserva los datos", async () => {
    respond(500, { error: "No se pudo guardar la solicitud. Intenta de nuevo." });
    render(<ContactForm />);
    goToStep2();
    fillValid();
    fireEvent.click(screen.getByRole("checkbox", { name: /Acepto que Nubolabs use mis datos/ }));
    submit();
    expect(await screen.findByText("No se pudo guardar la solicitud. Intenta de nuevo.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agendar mi diagnóstico gratis/ })).toBeEnabled();
    expect(field(/^Nombre/).value).toBe("Carolina Rojas");
  });

  it("sin red muestra el mensaje en español, no el del navegador", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<ContactForm />);
    goToStep2();
    fillValid();
    fireEvent.click(screen.getByRole("checkbox", { name: /Acepto que Nubolabs use mis datos/ }));
    submit();
    expect(await screen.findByText("No pudimos enviar tu solicitud. Intenta de nuevo.")).toBeInTheDocument();
    expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument();
  });

  it("el paso actual se anuncia dentro del título del paso", () => {
    render(<ContactForm />);
    expect(screen.getByText("¿Qué te gustaría lograr?").closest("legend")).toHaveTextContent("Paso 1 de 2");
    goToStep2();
    expect(screen.getByText("¿Dónde te contactamos?").closest("legend")).toHaveTextContent("Paso 2 de 2");
  });

  it("con URL de agenda ofrece 'Elegir horario' en otra pestaña", async () => {
    respond(200, { ok: true, persisted: false });
    render(<ContactForm scheduleUrl="https://example.com/agenda" />);
    goToStep2();
    fillValid();
    fireEvent.click(screen.getByRole("checkbox", { name: /Acepto que Nubolabs use mis datos/ }));
    submit();
    expect(await screen.findByText("¡Listo, Carolina! Ahora elige el día y la hora.")).toBeInTheDocument();
    const button = screen.getByRole("link", { name: /Elegir horario/ });
    expect(button).toHaveAttribute("href", "https://example.com/agenda");
    expect(button).toHaveAttribute("target", "_blank");
    expect(screen.getByText("Conversamos 30 minutos sobre lo que quieres lograr.")).toBeInTheDocument();
  });

  it("sin URL de agenda no hay botón y dice que escribimos en menos de 24 horas", async () => {
    respond(200, { ok: true, persisted: false });
    render(<ContactForm scheduleUrl={null} />);
    goToStep2();
    fillValid();
    fireEvent.click(screen.getByRole("checkbox", { name: /Acepto que Nubolabs use mis datos/ }));
    submit();
    expect(await screen.findByText("¡Listo, Carolina! Te escribimos en menos de 24 horas.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Elegir horario/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /autodiagnóstico/ })).toHaveAttribute("href", "/diagnostico");
  });
});
