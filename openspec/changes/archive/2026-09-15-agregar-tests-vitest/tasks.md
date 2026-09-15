## 0. Setup: rama de trabajo (OBLIGATORIO, PRIMER PASO)

- [x] 0.1 Crear la rama `feature/agregar-tests-vitest` desde `main` actualizado y verificar con `git status -sb` que es la rama activa y está limpia

## 1. Instalación y configuración del runner

- [x] 1.1 Instalar como devDependencies `vitest@4`, `jsdom@27`, `@testing-library/react@16`, `@testing-library/dom@10` y `@testing-library/jest-dom@6`; verificar que `npm install` termina sin `ERESOLVE` y que `package-lock.json` los registra
- [x] 1.2 Agregar a `package.json` los scripts `"test": "vitest run"` y `"test:watch": "vitest"`; verificar con `npm run` que ambos aparecen listados
- [x] 1.3 Crear `vitest.config.mts` (alias `@` → raíz, `environment: "node"` con jsdom activable por archivo, `include: ["**/*.test.{ts,tsx}"]`, `exclude` con `node_modules/**` y `.next/**`, `setupFiles: ["./vitest.setup.ts"]`) y `vitest.setup.ts` importando `@testing-library/jest-dom/vitest`; verificar que `npx vitest run` carga la configuración sin errores

## 2. Primer test: estimador de ahorro (spec `diagnostico/estimador-ahorro`)

- [x] 2.1 Crear `components/diagnostico/ahorro.test.ts` con imports explícitos de `vitest` y los casos de la spec: ahorro por proceso con valores por defecto (`toBeCloseTo`, 2 decimales) y proporcionalidad por personas; verificar que `npm test` los ejecuta y pasan
- [x] 2.2 Agregar los casos de factor por nivel de errores (bajo 1,00 / medio 1,05 / alto 1,15, horas iguales) y de normalización de entradas (0 personas = 1 persona; horas no numéricas → todo 0); verificar que pasan
- [x] 2.3 Agregar los casos de totales (proceso por defecto + proceso con 1 persona y nivel bajo → mes 229.086, semana 52.907, anual 2.749.030, horas 50; lista vacía → ceros), proceso nuevo por defecto (valores de `CONFIG`, ids distintos) y formato CLP (contiene `$` y `155.187`, sin `,`, normalizando espacios); verificar que la suite completa pasa con 10 casos o más
- [x] 2.4 Comprobar que el test detecta regresiones: cambiar temporalmente `factorAutomatizacion` a 0.5 en `components/diagnostico/ahorro.ts`, verificar que `npm test` falla, revertir con `git checkout -- components/diagnostico/ahorro.ts` y verificar que vuelve a pasar; registrar ambas salidas en el reporte del paso 4

## 3. Documentación y reglas del proyecto

- [x] 3.1 Actualizar `docs/project-profile.md`: §5 (unit tests Vitest 4 + Testing Library, comando `npm test` en los obligatorios, cobertura "no exigida aún") y eliminar la fila "Runner de tests unitarios" de §11; verificar que `grep -n "runner" docs/project-profile.md` solo muestra la nueva descripción
- [x] 3.2 Actualizar `docs/base-standards.md` §1 (TDD ya aplica: toda funcionalidad nueva parte con un test que falla) y §8 (agregar `npm test`; orden lint → tsc → test → build); verificar con `grep -n "npm test" docs/base-standards.md`
- [x] 3.3 Actualizar `docs/frontend-standards.md`, `docs/backend-standards.md` e `docs/integration-standards.md` (tabla de stack "Tests" y sección de verificación con `npm test`; convención de tests co-ubicados `*.test.ts(x)` con imports explícitos); verificar que ninguno dice "Ninguno todavía"
- [x] 3.4 Actualizar `docs/openspec-tasks-mandatory-steps.md` (§2: el paso "revisar y actualizar tests" ya aplica y las tareas nuevas parten con test; §4 agregar `npm test`) y `openspec/config.yaml` (comandos de verificación con `npm test`; eliminar la frase "Todavía no hay runner de tests unitarios…"); verificar con `openspec instructions tasks --change agregar-tests-vitest --json` que el contexto ya menciona `npm test`
- [x] 3.5 Actualizar las notas de proyecto de `ai-specs/agents/backend-developer.md`, `frontend-developer.md` e `integration-developer.md` (reemplazar "There is no test runner yet…" por la convención de Vitest) y re-copiar a `.claude/agents/`; verificar con `diff -rq ai-specs/agents .claude/agents` sin diferencias
- [x] 3.6 Actualizar `README.md` (sección "Correr en local": `npm test`) y `docs/ESTADO-PROYECTO.md` (verificación obligatoria con `npm test`, pendiente del runner resuelto, fecha de actualización); verificar con `grep -rn -i "no hay runner\|no test runner\|Ninguno todavía" docs ai-specs README.md openspec/config.yaml` sin resultados

## 4. Verificación obligatoria (OBLIGATORIO — el agente la ejecuta)

- [x] 4.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; verificar que los cuatro terminan sin errores
- [x] 4.2 Crear el reporte `openspec/changes/agregar-tests-vitest/reports/2026-09-15-paso-4-verificacion.md` con los comandos, sus salidas resumidas, la evidencia de la prueba de regresión del 2.4 y el tiempo de `npm test` (< 10 s); verificar que el archivo existe
- [x] 4.3 Prueba manual de endpoints con `curl`: NO APLICA (el cambio no toca `app/api/**`)
- [x] 4.4 Prueba E2E con Playwright MCP: NO APLICA (el cambio no toca ningún flujo de UI)

## 5. Cierre

- [x] 5.1 Revisar `git status` y `git diff --stat`: solo deben aparecer `package.json`, `package-lock.json`, `vitest.config.mts`, `vitest.setup.ts`, `components/diagnostico/ahorro.test.ts`, los documentos de la sección 3, `.claude/agents/*` y los artefactos del cambio; verificar que no hay archivos generados ni `.env*`
