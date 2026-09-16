// Tests de normalizePrivateKey (lib/privateKey.ts). Diseño: openspec/changes/migrar-next-16/design.md, decisión 13.
// firebase-admin 14 valida la clave con el crypto nativo de Node, más estricto que node-forge (firebase-admin 12):
// rechaza comillas envolventes, PEM en una sola línea con espacios y espacios sobrantes. Cada variante válida
// se comprueba con createPrivateKey, que es lo mismo que hace cert() por dentro.
import { createPrivateKey, generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { normalizePrivateKey } from "./privateKey";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const pkcs8 = privateKey.export({ type: "pkcs8", format: "pem" }) as string;
const pkcs1 = privateKey.export({ type: "pkcs1", format: "pem" }) as string;
const withLiteralNewlines = pkcs8.replace(/\n/g, "\\n");

/** Node (y por tanto firebase-admin 14) debe aceptar la clave normalizada. */
function parses(key: string | undefined) {
  expect(key).toBeDefined();
  expect(() => createPrivateKey(key as string)).not.toThrow();
}

describe("normalizePrivateKey", () => {
  it("devuelve undefined si la variable está vacía o no existe", () => {
    expect(normalizePrivateKey(undefined)).toBeUndefined();
    expect(normalizePrivateKey("")).toBeUndefined();
    expect(normalizePrivateKey("   ")).toBeUndefined();
  });

  it("conserva un PEM PKCS8 correcto", () => {
    const out = normalizePrivateKey(pkcs8);
    expect(out).toBe(pkcs8);
    parses(out);
  });

  it("convierte los \\n literales de un .env en saltos de línea reales", () => {
    const out = normalizePrivateKey(withLiteralNewlines);
    expect(out).toBe(pkcs8);
    parses(out);
  });

  it("quita las comillas envolventes (dobles o simples) con las que se pega desde un .env", () => {
    const conDobles = normalizePrivateKey(`"${withLiteralNewlines}"`);
    expect(conDobles).toBe(pkcs8);
    parses(conDobles);
    parses(normalizePrivateKey(`'${pkcs8}'`));
  });

  it("acepta saltos de línea CRLF", () => {
    const out = normalizePrivateKey(pkcs8.replace(/\n/g, "\r\n"));
    expect(out).toBe(pkcs8);
    parses(out);
  });

  it("reconstruye un PEM pegado en una sola línea con espacios", () => {
    const out = normalizePrivateKey(pkcs8.trim().replace(/\n/g, " "));
    expect(out).toBe(pkcs8);
    parses(out);
  });

  it("ignora espacios y saltos sobrantes al inicio y al final", () => {
    const out = normalizePrivateKey(`  \n${pkcs8}\n\n  `);
    expect(out).toBe(pkcs8);
    parses(out);
  });

  it("respeta la etiqueta de un PEM PKCS1 (RSA PRIVATE KEY)", () => {
    const out = normalizePrivateKey(pkcs1);
    expect(out).toBe(pkcs1);
    expect(out).toContain("-----BEGIN RSA PRIVATE KEY-----");
    parses(out);
  });

  it("devuelve recortado un texto que no es PEM (cert() lo rechazará con su propio error)", () => {
    expect(normalizePrivateKey("  no-es-una-clave  ")).toBe("no-es-una-clave");
  });
});
