// Guarda de dependencias de lib/firebaseAdmin.ts (getAdminAuth): el `jose` que carga `jwks-rsa` (dependencia de
// firebase-admin/auth) debe tener entrada CommonJS. jose 6 es solo ESM y `require("jose")` dentro de jwks-rsa falla con
// ERR_REQUIRE_ESM en el runtime de funciones de Vercel (visto en producción el 2026-09-16 con Node 24.x configurado y
// build sin caché), lo que deja el panel sin login. package.json fija jose 5 bajo jwks-rsa con `overrides`; si alguien
// quita ese override o jwks-rsa vuelve a resolver jose 6, este test avisa antes del deploy.
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

interface PackageJson {
  name?: string;
  version?: string;
  type?: string;
  exports?: Record<string, { require?: string } | string>;
}

const requireFromHere = createRequire(import.meta.url);

/** Resuelve `jose` tal como lo haría `require("jose")` dentro de jwks-rsa/src/utils.js. */
function resolveJoseFromJwksRsa() {
  const jwksRsaEntry = requireFromHere.resolve("jwks-rsa");
  const requireFromJwksRsa = createRequire(join(dirname(jwksRsaEntry), "utils.js"));
  const entry = requireFromJwksRsa.resolve("jose");

  // Sube desde el archivo de entrada hasta el package.json del propio paquete jose.
  let dir = dirname(entry);
  for (;;) {
    const candidate = join(dir, "package.json");
    if (existsSync(candidate)) {
      const pkg = JSON.parse(readFileSync(candidate, "utf8")) as PackageJson;
      if (pkg.name === "jose") return { entry, pkg, requireFromJwksRsa };
    }
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`No se encontró el package.json de jose desde ${entry}`);
    dir = parent;
  }
}

describe("firebase-admin/auth: jose que carga jwks-rsa", () => {
  it("resuelve un jose con entrada CommonJS (jose 6 es solo ESM y rompe require() en Vercel)", () => {
    const { pkg } = resolveJoseFromJwksRsa();
    const root = pkg.exports?.["."];
    const requireEntry = typeof root === "object" && root !== null ? root.require : undefined;
    expect(pkg.type, `jose ${pkg.version} declara type=module`).not.toBe("module");
    expect(typeof requireEntry, `jose ${pkg.version} no expone exports["."].require`).toBe("string");
  });

  it("ese jose expone las funciones que usa jwks-rsa", () => {
    const { requireFromJwksRsa } = resolveJoseFromJwksRsa();
    const jose = requireFromJwksRsa("jose") as Record<string, unknown>;
    for (const fn of ["importJWK", "exportSPKI", "decodeJwt", "decodeProtectedHeader"]) {
      expect(typeof jose[fn], fn).toBe("function");
    }
  });
});
