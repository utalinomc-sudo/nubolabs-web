## Why

El proyecto no tiene ningún test automatizado ni runner (perfil §5 y §11). La fórmula del estimador de ahorro (`components/diagnostico/ahorro.ts`) alimenta el informe PDF y el correo que recibe cada cliente, y hoy un error en ella solo se detectaría a ojo. `docs/base-standards.md` §1 exige TDD "cuando hay runner": este cambio crea esa condición y deja la primera red de seguridad sobre la lógica más sensible del sitio.

## What Changes

- Se instala **Vitest** como runner de tests unitarios (entorno `node` por defecto) con `jsdom` y **Testing Library** (react, dom, jest-dom) listos para tests de componentes futuros, que activan jsdom por archivo.
- Se agrega `vitest.config.mts` (alias `@` → raíz, entorno node, setup de matchers, inclusión `**/*.test.{ts,tsx}`, exclusión de `.next/` y `node_modules/`) y `vitest.setup.ts`.
- Nuevos scripts en `package.json`: `npm test` (`vitest run`) y `npm run test:watch` (`vitest`).
- Primer test `components/diagnostico/ahorro.test.ts` que fija el comportamiento de `calc`, `calcTotals`, `blank` y `fmtCLP`.
- `npm test` pasa a ser el **cuarto comando de verificación obligatoria** (junto a lint, typecheck y build) en `docs/base-standards.md` §8, `docs/openspec-tasks-mandatory-steps.md`, los estándares por capa y `openspec/config.yaml`.
- Se retira el TBD "Runner de tests unitarios" del perfil y se actualizan las notas "no hay runner" de agentes, estándares, README y `ESTADO-PROYECTO.md`.
- Sin cambios en la fórmula ni en ningún comportamiento visible del sitio. Solo `devDependencies`: el bundle de producción no cambia.

### Non-goals

- Tests de componentes React o de endpoints (solo se deja la infraestructura preparada).
- Tests E2E automatizados o pipeline de CI (GitHub Actions).
- Cobertura mínima obligatoria.
- Cambiar la lógica de `ahorro.ts` (si un test revela un bug, se registra como cambio aparte).

## Capabilities

### New Capabilities
- `diagnostico/estimador-ahorro`: reglas de cálculo del estimador de ahorro del diagnóstico (ahorro de horas y CLP por proceso, factores por nivel de errores, normalización de entradas, totales semana/mes/año y formato de moneda). Documenta por primera vez el comportamiento existente; el test de este cambio lo verifica.

### Modified Capabilities
<!-- Ninguna: no hay specs previas en openspec/specs/. -->

## Impact

- **Código:** nuevos `vitest.config.mts`, `vitest.setup.ts`, `components/diagnostico/ahorro.test.ts`; `package.json` y `package-lock.json` (devDependencies y scripts). Ningún archivo de `app/`, `lib/` ni `components/*.tsx` cambia.
- **Verificación:** `npm run lint`, `npx tsc --noEmit` y `npm run build` deben seguir pasando con los archivos de test incluidos (tsc los type-checkea porque `tsconfig.json` incluye `**/*.ts`).
- **Documentación a actualizar (documentation-standards §3):** `docs/project-profile.md` (§5 y §11), `docs/base-standards.md` (§1, §8), `docs/frontend-standards.md`, `docs/backend-standards.md`, `docs/integration-standards.md` (secciones de tests y verificación), `docs/openspec-tasks-mandatory-steps.md` (§2, §4), `openspec/config.yaml` (comandos de verificación; retirar "no crear tareas de tests"), `ai-specs/agents/*.md` con re-copia a `.claude/agents/`, `README.md` (correr en local) y `docs/ESTADO-PROYECTO.md`.
- **Dependencias:** Vitest, jsdom y Testing Library como `devDependencies`. Sin dependencias de producción nuevas ni variables de entorno.

## Criterios de aceptación (escenarios)

- **Cuando** se ejecuta `npm test` en un clon limpio con `npm install`, **entonces** corre la suite sin red ni credenciales y todos los casos de `ahorro.test.ts` pasan; a partir de la segunda ejecución (caché de Vite creada) termina en menos de 10 segundos. La primera ejecución en un clon puede tardar más (medido: ~20 s en Windows con antivirus).
- **Cuando** se altera temporalmente `CONFIG.factorAutomatizacion` en `ahorro.ts`, **entonces** `npm test` falla en al menos un caso (el test detecta regresiones); al revertir vuelve a pasar.
- **Cuando** se ejecutan `npm run lint`, `npx tsc --noEmit` y `npm run build`, **entonces** siguen pasando con los archivos de test presentes.
- **Cuando** se busca "no hay runner" o "no test runner" en `docs/`, `ai-specs/` y `openspec/config.yaml`, **entonces** no hay resultados y `docs/project-profile.md` §11 ya no lista ese TBD.
