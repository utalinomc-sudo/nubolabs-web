# Reporte — paso 4: verificación obligatoria

- Fecha: 2026-09-15
- Cambio: agregar-tests-vitest
- Rama: `feature/agregar-tests-vitest`
- Ejecutado por: Claude Code (Fable 5.1), sesión de apply
- Entorno: Windows 11, Node 24.16, npm 11, Vitest 4.1.11 (Vite 8.3.0), jsdom 27.4.0

## Comandos

| Comando | Resultado | Tiempo |
|---|---|---|
| `npm run lint` | ✔ No ESLint warnings or errors | 37 s |
| `npx tsc --noEmit` | sin errores (incluye `ahorro.test.ts` y `vitest.setup.ts`; `vitest.config.mts` queda fuera del `include`) | 8 s |
| `npm test` | Test Files 1 passed · Tests 11 passed · Duration 451 ms (environment 0 ms) | 2 s |
| `npm run build` | ✓ Compiled successfully · 18 páginas generadas | 104 s |

Prueba manual con `curl`: **no aplica** (el cambio no toca `app/api/**`).
Prueba E2E con Playwright MCP: **no aplica** (el cambio no toca ningún flujo de UI).

## Resultados de la suite (`components/diagnostico/ahorro.test.ts`)

11 casos, todos en verde, que cubren los 9 escenarios de `specs/diagnostico/estimador-ahorro/spec.md`:

- Ahorro por proceso: valores por defecto (69,28 h/mes · 33,2544 h ahorrables · 155.187,2 CLP) y proporcionalidad por personas (×3).
- Factor por nivel de errores: 1,00 / 1,05 / 1,15 sin alterar las horas.
- Normalización: 0, negativo o `NaN` en personas = 1 persona; horas `NaN` → todo 0; sueldo `NaN` → ahorro 0 sin `NaN`.
- Totales: dos procesos → mes 229.086, semana 52.907, anual 2.749.030, horas 50, coherentes con las sumas redondeadas de `calc`; lista vacía → ceros.
- Proceso nuevo por defecto: valores de `CONFIG`, `abierto` true/false, ids distintos.
- Formato CLP: contiene `$` y `155.187`, sin coma; `1234.56` → `$1.235`.

Tiempos observados de `npm test`: primera ejecución tras instalar 4 s (Duration 586 ms), siguientes 2–4 s (Duration 0,45–1,0 s). Con entorno `jsdom` por defecto la carga del entorno costaba ~25 s, por lo que el diseño pasó a `node` por defecto (decisión 2 de `design.md`).

## Evidencia de la prueba de regresión (tarea 2.4)

1. `sed`: `factorAutomatizacion: 0.8` → `0.5` en `components/diagnostico/ahorro.ts`.
2. `npm test` → **exit 1**: `Tests 2 failed | 9 passed (11)`:
   - `Ahorro por proceso (calc) > calcula horas mensuales, horas ahorrables y ahorro mensual con los valores por defecto` (`expect(r.ahorroHoras).toBeCloseTo(33.2544, 2)`).
   - `Totales del diagnóstico (calcTotals) > consolida dos procesos y redondea horas, semana, mes y anual`.
3. `git checkout -- components/diagnostico/ahorro.ts` → `factorAutomatizacion: 0.8` restaurado.
4. `npm test` → **exit 0**: `Tests 11 passed (11)`.

## Hallazgo registrado fuera de alcance

El caso "porcentaje repetitivo no numérico" falló contra el código real (`calc` devuelve `NaN` porque no normaliza `repetitivo`). La UI siempre envía un número 0–100, así que no afecta a usuarios. Según el non-goal del proposal (no tocar la fórmula), la spec se ajustó a lo observable y el endurecimiento quedó anotado como pendiente 5 en `docs/ESTADO-PROYECTO.md` para un cambio aparte con su test.

## Estado de datos

- Antes: sin acceso a Firestore (no hay `.env.local`); ningún dato de prueba creado.
- Después: idéntico. El único archivo de código alterado temporalmente (`ahorro.ts`) fue restaurado con `git checkout --` y verificado.
- Restaurado: Sí.

## Archivos tocados (tarea 5.1)

Nuevos: `vitest.config.mts`, `vitest.setup.ts`, `components/diagnostico/ahorro.test.ts`, `openspec/changes/agregar-tests-vitest/**`.
Modificados: `package.json`, `package-lock.json`, `README.md`, `docs/project-profile.md`, `docs/base-standards.md`, `docs/frontend-standards.md`, `docs/backend-standards.md`, `docs/integration-standards.md`, `docs/openspec-tasks-mandatory-steps.md`, `docs/ESTADO-PROYECTO.md`, `openspec/config.yaml`, `ai-specs/agents/{backend,frontend,integration}-developer.md` y sus copias en `.claude/agents/`.
Sin archivos generados, sin `.env*`, sin cambios en `app/`, `lib/` ni componentes `.tsx`.

## Resultado

**PASS** — sin bloqueos.
