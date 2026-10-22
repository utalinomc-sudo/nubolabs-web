// @vitest-environment jsdom
// Composición compartida de / y /oa (cambio landing-referidos-oa, design.md decisión 3).
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { defaultSiteConfig } from "@/lib/siteConfig";

vi.mock("@/lib/site", () => ({ getSiteConfig: async () => defaultSiteConfig() }));

const { LandingPage } = await import("@/components/landing/LandingPage");

async function renderLanding(referral?: "oa") {
  const root = document.createElement("div");
  root.innerHTML = renderToStaticMarkup(await LandingPage({ referral }));
  return root;
}

describe("LandingPage", () => {
  it("sin referido no hay franja y las secciones van en el orden de la portada", async () => {
    const root = await renderLanding();
    expect(root.querySelector('[aria-label="Recomendación"]')).toBeNull();
    const ids = [...root.querySelectorAll("main > section[id]")].map((s) => s.id);
    expect(ids).toEqual(["inicio", "problema", "resultados", "enfoque", "servicios", "casos", "modelo", "autodiagnostico", "contacto", "preguntas"]);
    expect(root.firstElementChild?.tagName).toBe("HEADER");
  });

  it("con referido 'oa' la franja va primero, antes del menú, y el resto es igual", async () => {
    const [con, sin] = await Promise.all([renderLanding("oa"), renderLanding()]);
    const banner = con.firstElementChild;
    expect(banner?.getAttribute("aria-label")).toBe("Recomendación");
    expect(banner?.textContent).toContain(defaultSiteConfig().content.referidos.oa.titulo);
    expect(banner?.nextElementSibling?.tagName).toBe("HEADER");
    expect(con.querySelector("main")?.innerHTML).toBe(sin.querySelector("main")?.innerHTML);
  });
});
