// Metadatos de la portada y de /oa (cambio landing-referidos-oa, spec "Entrada para referidos de O&A").
import { describe, expect, it, vi } from "vitest";

// La composición lee Firestore: aquí solo se prueban los metadatos.
vi.mock("@/components/landing/LandingPage", () => ({ LandingPage: () => null }));

const { generateMetadata } = await import("@/app/page");
const { metadata: oaMetadata } = await import("@/app/oa/page");

const meta = (ref?: string | string[]) => generateMetadata({ searchParams: Promise.resolve(ref === undefined ? {} : { ref }) });

describe("metadatos de / y /oa", () => {
  it("con un referido válido: noindex, follow y sin canónica", async () => {
    for (const ref of ["oa", ["oa"], " oa "]) {
      const m = await meta(ref);
      expect(m.robots).toEqual({ index: false, follow: true });
      expect(m.alternates).toBeUndefined();
    }
  });

  it("sin referido o con uno desconocido: indexable y con canónica a /", async () => {
    for (const ref of [undefined, "otro", "OA", ""]) {
      const m = await meta(ref);
      expect(m.robots).toBeUndefined();
      expect(m.alternates).toEqual({ canonical: "/" });
    }
  });

  it("/oa: noindex, follow y sin canónica", () => {
    expect(oaMetadata.robots).toEqual({ index: false, follow: true });
    expect(oaMetadata.alternates).toBeUndefined();
  });
});
