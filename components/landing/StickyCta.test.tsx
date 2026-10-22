// @vitest-environment jsdom
// CTA fija en móvil (cambio cierre-landing-faq-cta, design.md decisión 4).
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StickyCta } from "@/components/landing/StickyCta";

// jsdom no trae IntersectionObserver: se simula y se guarda cada callback por elemento observado.
type Entry = { target: Element; isIntersecting: boolean };
let callbacks: Map<Element, (entries: Entry[]) => void>;

beforeEach(() => {
  callbacks = new Map();
  class FakeObserver {
    constructor(private cb: (entries: Entry[]) => void) {}
    observe(el: Element) {
      callbacks.set(el, this.cb);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  document.body.innerHTML = '<section id="inicio"></section><section id="contacto"></section>';
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

function setVisible(id: string, isIntersecting: boolean) {
  const el = document.getElementById(id)!;
  act(() => callbacks.get(el)?.([{ target: el, isIntersecting }]));
}

const wrapper = () => screen.getByTestId("sticky-cta");
const link = () => wrapper().querySelector("a")!;

describe("StickyCta", () => {
  it("monta oculta, sin foco posible", () => {
    render(<StickyCta label="Quiero mi diagnóstico gratis" />);
    expect(wrapper()).toHaveAttribute("aria-hidden", "true");
    expect(link()).toHaveAttribute("tabindex", "-1");
    expect(link()).toHaveAttribute("href", "#contacto");
    expect(link()).toHaveTextContent("Quiero mi diagnóstico gratis");
  });

  it("aparece cuando el hero sale de pantalla y el formulario no está a la vista", () => {
    render(<StickyCta label="Quiero mi diagnóstico gratis" />);
    setVisible("inicio", true);
    setVisible("contacto", false);
    expect(wrapper()).toHaveAttribute("aria-hidden", "true");
    setVisible("inicio", false);
    expect(wrapper()).not.toHaveAttribute("aria-hidden");
    expect(link()).not.toHaveAttribute("tabindex");
  });

  it("se oculta cuando el formulario entra en pantalla y vuelve al salir", () => {
    render(<StickyCta label="Agendar" />);
    setVisible("inicio", false);
    setVisible("contacto", true);
    expect(wrapper()).toHaveAttribute("aria-hidden", "true");
    setVisible("contacto", false);
    expect(wrapper()).not.toHaveAttribute("aria-hidden");
  });

  it("sin hero (sección oculta) aparece en cuanto el formulario no está a la vista", () => {
    document.getElementById("inicio")!.remove();
    render(<StickyCta label="Agendar" />);
    expect(wrapper()).toHaveAttribute("aria-hidden", "true");
    setVisible("contacto", false);
    expect(wrapper()).not.toHaveAttribute("aria-hidden");
  });

  it("no agrega una segunda flecha si el texto guardado ya termina en →", () => {
    render(<StickyCta label="Agenda tu diagnóstico →" />);
    expect(link().querySelectorAll("svg")).toHaveLength(0);
  });

  it("es solo para pantallas chicas", () => {
    render(<StickyCta label="Agendar" />);
    expect(wrapper().className).toContain("min-[641px]:hidden");
  });
});
