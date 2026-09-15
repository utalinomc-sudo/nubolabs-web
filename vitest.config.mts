// Configuración de Vitest (tests unitarios). Ver docs/base-standards.md §8 y design.md del cambio agregar-tests-vitest.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    // Mismo alias que tsconfig.json ("@/*" → raíz del repo).
    alias: { "@": root },
  },
  test: {
    // node por defecto (rápido). Los tests de componentes activan jsdom con
    // el comentario `// @vitest-environment jsdom` en su primera línea.
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
