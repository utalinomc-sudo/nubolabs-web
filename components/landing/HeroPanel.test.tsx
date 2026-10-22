// @vitest-environment jsdom
// Tests del panel "Tu negocio hoy" (cambio mensaje-principal-pyme, design.md decisión 4).
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroPanel } from "@/components/landing/HeroPanel";
import { heroFeed, heroFeedMore } from "@/lib/content";

// jsdom no trae matchMedia ni IntersectionObserver: se simulan por test.
let motionListeners: ((e: { matches: boolean }) => void)[] = [];
function mockReducedMotion(reduce: boolean) {
  motionListeners = [];
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addEventListener: vi.fn((_type: string, cb: (e: { matches: boolean }) => void) => motionListeners.push(cb)),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}
// Simula que el visitante activa "reducir movimiento" con la página abierta.
function turnOnReducedMotion() {
  act(() => {
    motionListeners.forEach((cb) => cb({ matches: true }));
  });
}

let observerCallbacks: IntersectionObserverCallback[] = [];
function mockIntersectionObserver() {
  observerCallbacks = [];
  class FakeObserver {
    constructor(cb: IntersectionObserverCallback) {
      observerCallbacks.push(cb);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", FakeObserver);
}
function setPanelVisible(visible: boolean) {
  act(() => {
    observerCallbacks.forEach((cb) =>
      cb([{ isIntersecting: visible } as IntersectionObserverEntry], {} as IntersectionObserver),
    );
  });
}

function taskTitles(): string[] {
  const list = screen.getByRole("list");
  return within(list)
    .getAllByRole("listitem")
    .map((li) => li.querySelector("[data-task-title]")?.textContent ?? "");
}

beforeEach(() => {
  vi.useFakeTimers();
  mockIntersectionObserver();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("HeroPanel", () => {
  it("muestra las 5 tareas iniciales con su título y la etiqueta Piloto automático", () => {
    mockReducedMotion(false);
    render(<HeroPanel />);
    expect(screen.getByRole("figure", { name: /tareas que avanzan solas/i })).toBeInTheDocument();
    expect(screen.getByText("Tu negocio hoy")).toBeInTheDocument();
    expect(screen.getByText("Piloto automático")).toBeInTheDocument();
    expect(taskTitles()).toEqual(heroFeed.map((t) => t.title));
  });

  it("con 'reducir movimiento' no rota aunque el panel esté a la vista", () => {
    mockReducedMotion(true);
    render(<HeroPanel />);
    setPanelVisible(true);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(taskTitles()).toEqual(heroFeed.map((t) => t.title));
  });

  it("con movimiento permitido y el panel visible entra una tarea nueva arriba y siguen siendo 5", () => {
    mockReducedMotion(false);
    render(<HeroPanel />);
    setPanelVisible(true);
    act(() => {
      vi.advanceTimersByTime(3_300);
    });
    const titles = taskTitles();
    expect(titles).toHaveLength(5);
    expect(titles[0]).toBe(heroFeedMore[0].title);
    expect(titles.slice(1)).toEqual(heroFeed.slice(0, 4).map((t) => t.title));
  });

  it("deja de rotar si el visitante activa 'reducir movimiento' con la página abierta", () => {
    mockReducedMotion(false);
    render(<HeroPanel />);
    setPanelVisible(true);
    act(() => {
      vi.advanceTimersByTime(3_300);
    });
    turnOnReducedMotion();
    const before = taskTitles();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(taskTitles()).toEqual(before);
  });

  it("no agrega tareas con la pestaña oculta", () => {
    mockReducedMotion(false);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    render(<HeroPanel />);
    setPanelVisible(true);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(taskTitles()).toEqual(heroFeed.map((t) => t.title));
    hidden.mockRestore();
  });

  it("deja de rotar cuando el panel sale de la pantalla", () => {
    mockReducedMotion(false);
    render(<HeroPanel />);
    setPanelVisible(true);
    act(() => {
      vi.advanceTimersByTime(3_300);
    });
    setPanelVisible(false);
    const before = taskTitles();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(taskTitles()).toEqual(before);
  });
});
