// @vitest-environment jsdom
// Referido de la visita en el navegador (cambio landing-referidos-oa, design.md decisión 4).
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BANNER_CLOSED_KEY,
  REFERRAL_STORAGE_KEY,
  isBannerClosed,
  markBannerClosed,
  parseReferral,
  readStoredReferral,
  rememberReferral,
} from "@/lib/referral";

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("parseReferral", () => {
  it("acepta 'oa', con espacios o como primer elemento de un arreglo", () => {
    expect(parseReferral("oa")).toBe("oa");
    expect(parseReferral(" oa ")).toBe("oa");
    expect(parseReferral(["oa"])).toBe("oa");
  });

  it("rechaza referidos desconocidos, vacíos, ausentes o que no son texto", () => {
    for (const v of ["otro", "OA", "", "  ", undefined, null, 1, ["x", "oa"], [], { ref: "oa" }]) {
      expect(parseReferral(v)).toBeNull();
    }
  });
});

describe("referido guardado en la pestaña", () => {
  it("rememberReferral lo guarda y readStoredReferral lo lee", () => {
    expect(readStoredReferral()).toBeNull();
    rememberReferral("oa");
    expect(sessionStorage.getItem(REFERRAL_STORAGE_KEY)).toBe("oa");
    expect(readStoredReferral()).toBe("oa");
  });

  it("un valor guardado que no está en la lista se ignora", () => {
    sessionStorage.setItem(REFERRAL_STORAGE_KEY, "xyz");
    expect(readStoredReferral()).toBeNull();
  });

  it("con el almacenamiento bloqueado no falla: no guarda y lee null", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(() => rememberReferral("oa")).not.toThrow();
    expect(readStoredReferral()).toBeNull();
    expect(() => markBannerClosed()).not.toThrow();
    expect(isBannerClosed()).toBe(false);
  });
});

describe("franja cerrada", () => {
  it("markBannerClosed la marca y no borra el referido", () => {
    rememberReferral("oa");
    expect(isBannerClosed()).toBe(false);
    markBannerClosed();
    expect(sessionStorage.getItem(BANNER_CLOSED_KEY)).toBe("1");
    expect(isBannerClosed()).toBe(true);
    expect(readStoredReferral()).toBe("oa");
  });
});
