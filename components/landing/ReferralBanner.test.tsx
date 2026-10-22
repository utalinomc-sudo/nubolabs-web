// @vitest-environment jsdom
// Franja de bienvenida de /oa y marca del referido (cambio landing-referidos-oa, design.md decisiones 4 y 5).
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReferralBanner } from "@/components/landing/ReferralBanner";
import { ReferralTracker } from "@/components/landing/ReferralTracker";
import { BANNER_CLOSED_KEY, REFERRAL_STORAGE_KEY } from "@/lib/referral";
import { defaultSiteConfig } from "@/lib/siteConfig";

const oa = defaultSiteConfig().content.referidos.oa;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("ReferralBanner", () => {
  it("muestra el título en negrita, el texto y un botón 'Cerrar aviso'", () => {
    render(<ReferralBanner content={oa} />);
    const region = screen.getByRole("region", { name: "Recomendación" });
    expect(region).toHaveTextContent(`${oa.titulo} ${oa.texto}`);
    expect(screen.getByText(oa.titulo).tagName).toBe("STRONG");
    expect(screen.getByRole("button", { name: "Cerrar aviso" })).toHaveClass("h-11", "w-11");
  });

  it("al cerrarla desaparece, queda cerrada en la pestaña y no borra el referido", () => {
    sessionStorage.setItem(REFERRAL_STORAGE_KEY, "oa");
    render(<ReferralBanner content={oa} />);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar aviso" }));
    expect(screen.queryByRole("region", { name: "Recomendación" })).toBeNull();
    expect(sessionStorage.getItem(BANNER_CLOSED_KEY)).toBe("1");
    expect(sessionStorage.getItem(REFERRAL_STORAGE_KEY)).toBe("oa");
  });

  it("al cerrarla el foco pasa al primer enlace del menú", () => {
    render(
      <>
        <ReferralBanner content={oa} />
        <header>
          <a href="#inicio">Nubolabs — inicio</a>
        </header>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cerrar aviso" }));
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Nubolabs — inicio" }));
  });

  it("si ya se cerró en esta pestaña no se muestra", () => {
    sessionStorage.setItem(BANNER_CLOSED_KEY, "1");
    render(<ReferralBanner content={oa} />);
    expect(screen.queryByRole("region", { name: "Recomendación" })).toBeNull();
  });

  it("con el almacenamiento bloqueado se muestra y se puede cerrar sin errores", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    render(<ReferralBanner content={oa} />);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar aviso" }));
    expect(screen.queryByRole("region", { name: "Recomendación" })).toBeNull();
  });

  it("hidrata sin avisos aunque esté cerrada, y luego se oculta", async () => {
    // hydrateRoot directo (sin Testing Library): se declara el entorno de act para que React no avise por eso.
    const g = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const prevAct = g.IS_REACT_ACT_ENVIRONMENT;
    g.IS_REACT_ACT_ENVIRONMENT = true;
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    sessionStorage.setItem(BANNER_CLOSED_KEY, "1");
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ReferralBanner content={oa} />); // el servidor siempre la entrega abierta
    document.body.appendChild(container);
    expect(container.querySelector('[role="region"]')).not.toBeNull();
    await act(async () => {
      hydrateRoot(container, <ReferralBanner content={oa} />);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(container.querySelector('[role="region"]')).toBeNull();
    container.remove();
    g.IS_REACT_ACT_ENVIRONMENT = prevAct;
  });
});

describe("ReferralTracker", () => {
  it("no dibuja nada y guarda el referido de la visita", () => {
    const { container } = render(<ReferralTracker referral="oa" />);
    expect(container.innerHTML).toBe("");
    expect(sessionStorage.getItem(REFERRAL_STORAGE_KEY)).toBe("oa");
  });
});
