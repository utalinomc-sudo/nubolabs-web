// @vitest-environment jsdom
// Tarjeta "¿Prefieres escribirnos?" con QR a WhatsApp (cambio cierre-landing-faq-cta, design.md decisión 8).
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WhatsappCard } from "@/components/landing/WhatsappCard";

afterEach(cleanup);

describe("WhatsappCard", () => {
  it("es un enlace a wa.me con el QR, el título y los textos de escritorio y celular", () => {
    render(<WhatsappCard link={{ label: "+56 9 3259 0783", url: "https://wa.me/56932590783" }} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://wa.me/56932590783");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByText("¿Prefieres escribirnos?")).toBeInTheDocument();
    const qr = screen.getByRole("img", { name: "Código QR para escribirnos por WhatsApp" });
    expect(qr.tagName.toLowerCase()).toBe("svg");
    expect(qr.querySelectorAll("path")).toHaveLength(1);
    expect(screen.getByText("Escanea el código con tu celular y te respondemos por WhatsApp.")).toBeInTheDocument();
    expect(screen.getByText("Toca aquí y te respondemos por WhatsApp.")).toBeInTheDocument();
  });
});
