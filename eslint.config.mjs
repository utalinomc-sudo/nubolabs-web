// Configuración plana de ESLint 9 (reemplaza a `next lint` y .eslintrc.json, eliminados en Next 16).
// Equivale al `next/core-web-vitals` anterior: reglas de Next, React y React Hooks, sin reglas nuevas.
// Ver openspec/changes/archive/2026-09-16-migrar-next-16/design.md (decisión 4) y docs/frontend-standards.md §2.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    // Excepción heredada (cambio migrar-next-16): el logo del menú enlaza con `<a href="/#inicio">` y la regla,
    // que en eslint-config-next 16 ya reconoce rutas del App Router, lo marca. No se refactoriza en la migración;
    // evaluar `<Link>` como pendiente en docs/ESTADO-PROYECTO.md. La regla sigue activa en el resto del código.
    files: ["components/landing/Nav.tsx"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  globalIgnores([
    // Ignorados por defecto en eslint-config-next
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Carpetas del proyecto que no son código de la app (specboot, OpenSpec, documentación)
    "ai-specs/**",
    ".claude/**",
    "openspec/**",
    "docs/**",
    // Carpetas locales con punto (ESLint 9 no las ignora por defecto): worktree de línea base que crea el E2E
    // y artefactos del navegador de Playwright MCP. Sin esto, `npm run lint` lintearía una segunda copia de la app.
    ".worktrees/**",
    ".playwright-mcp/**",
  ]),
]);
