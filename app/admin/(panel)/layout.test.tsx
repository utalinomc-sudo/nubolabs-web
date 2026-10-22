// El panel exige sesión (cambio diagnostico-mapa-oportunidades, spec diagnostico/estimador-ahorro "Sin sesión"):
// /admin/estimador y el resto del grupo (panel) redirigen a /admin/login.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ session: null as null | { email: string } }));

vi.mock("@/lib/adminAuth", () => ({ getAdminSession: async () => mocks.session }));
vi.mock("@/components/admin/LogoutButton", () => ({ LogoutButton: () => null }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const { default: PanelLayout } = await import("@/app/admin/(panel)/layout");

describe("layout del panel", () => {
  it("sin sesión redirige a /admin/login", async () => {
    mocks.session = null;
    await expect(PanelLayout({ children: null })).rejects.toThrow("REDIRECT /admin/login");
  });

  it("con sesión dibuja el menú, con el estimador de ahorro", async () => {
    mocks.session = { email: "dev@local" };
    const el = await PanelLayout({ children: null });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('href="/admin/estimador"');
    expect(html).toContain("Estimador de ahorro");
  });
});
