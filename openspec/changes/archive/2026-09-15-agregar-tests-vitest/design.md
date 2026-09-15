## Context

Ver `proposal.md` (Why). Estado actual que condiciona el diseño:

- Next.js 14.2 + React 18.3 + TypeScript 5.5 `strict`, sin ningún runner ni archivo de test. `tsconfig.json` incluye `**/*.ts` y `**/*.tsx`, así que cualquier archivo de test queda dentro del type-check de `npx tsc --noEmit` y del `next build`.
- La lógica a cubrir es pura y sin dependencias: `components/diagnostico/ahorro.ts` exporta `CONFIG`, `fmtCLP`, `blank`, `calc` y `calcTotals`. No toca Firebase, Resend ni Blob, por lo que la degradación por credenciales ausentes no aplica a este cambio.
- Entorno: Node 24 (local y Vercel), npm 11, Windows 11 con Git Bash/PowerShell. `@types/node` está en `^20`.
- Verificación obligatoria hoy: `npm run lint` (ESLint `next/core-web-vitals`), `npx tsc --noEmit`, `npm run build` (`docs/base-standards.md` §8).
- Comprobado con `npm install --dry-run`: `vitest@4`, `jsdom@27`, `@testing-library/react@16`, `@testing-library/dom@10` y `@testing-library/jest-dom@6` se instalan sin conflictos de peer dependencies sobre el `package.json` actual (Vitest 5 exigiría subir `@types/node` a 22+; se descarta por ahora).

## Goals / Non-Goals

**Goals:**
- Un solo comando (`npm test`) que corra la suite sin red ni credenciales, en Windows y en cualquier CI futuro, en menos de 10 s en ejecuciones con caché (la primera ejecución tras `npm install` puede tardar más).
- Infraestructura lista para tests de componentes (jsdom + Testing Library) sin obligar a usarla ahora.
- Cero impacto en el bundle de producción y en el deploy de Vercel.
- Convenciones fijas para los tests que vengan (ubicación, imports, tolerancias numéricas).

**Non-Goals:**
- Cobertura mínima, reportes de cobertura o CI (ver proposal Non-goals).
- Tests de `app/api/**`, componentes o E2E en este cambio.
- Ajustar la fórmula de `ahorro.ts`.

## Decisions

1. **Vitest 4 en vez de Jest.** Vitest entiende TypeScript y ESM sin transpiladores extra, arranca en segundos y comparte configuración con Vite; Jest con Next 14 exige `next/jest` + babel/SWC y config adicional. Alternativas: Jest (más configuración), Node test runner nativo (sin jsdom ni Testing Library integrados). Versión: `vitest@4` (compatible con `@types/node ^20`); no `vitest@5` hasta subir `@types/node`.
2. **Entorno `node` por defecto; `jsdom` por archivo + Testing Library instalada.** Medido en este equipo, cargar jsdom cuesta ~25 s por ejecución, incompatible con la meta de < 10 s; los tests de funciones puras no lo necesitan. Por eso el entorno por defecto es `node` y cada test de componentes activa jsdom con el comentario `// @vitest-environment jsdom` en su primera línea. Testing Library (`@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`) queda instalada y el setup carga sus matchers. Alternativa: `happy-dom` (más rápido, menos fiel); se prefiere jsdom por compatibilidad con Testing Library.
3. **Sin `@vitejs/plugin-react`.** Vite ya transforma `.tsx` con el runtime JSX automático por defecto, suficiente para renderizar componentes en tests. Se evita una dependencia con peers pesados (la versión 6 exige Vite 8 y transformadores extra). Si un test de componentes futuro necesita el plugin (por ejemplo Fast Refresh o React Compiler), se agrega en ese cambio.
4. **Configuración en `vitest.config.mts` con alias manual.** Extensión `.mts` para que Vite la cargue como ESM sin avisos (el `package.json` no declara `"type": "module"`) y para que quede fuera del `include` de `tsconfig.json`. `resolve.alias: { "@": <raíz> }` replica `tsconfig.paths` sin agregar `vite-tsconfig-paths`. `test.include: ["**/*.test.{ts,tsx}"]`, `test.exclude` con `node_modules/**` y `.next/**`, `test.environment: "node"`, `test.setupFiles: ["./vitest.setup.ts"]` (importa `@testing-library/jest-dom/vitest`). Sin `globals`: los tests importan `describe/it/expect` desde `vitest`, así no hay que tocar `tsconfig.json` ni ESLint.
5. **Tests co-ubicados `*.test.ts(x)`.** El primer test vive en `components/diagnostico/ahorro.test.ts`, junto al código que verifica. Alternativa descartada: carpeta `__tests__/` o `tests/` en la raíz (aleja el test del código y complica el alias).
6. **Scripts:** `"test": "vitest run"` (una pasada, para verificación y CI) y `"test:watch": "vitest"` (desarrollo). `npm test` se suma como cuarto comando obligatorio en `base-standards.md` §8 y en `openspec-tasks-mandatory-steps.md` §4; el orden recomendado pasa a ser lint → tsc → test → build (el build es el más lento).
7. **Aserciones numéricas y de formato.** Los cálculos usan `toBeCloseTo` con 2 decimales (la fórmula multiplica por 4.33 y divide por 180, produce decimales largos). `fmtCLP` se verifica normalizando espacios (`Intl` en Node puede emitir espacio duro entre `$` y el número) y comprobando que contiene `$` y `155.187` y no contiene `,`.
8. **Prueba de que el test detecta regresiones.** Como parte de la verificación (no como test permanente) se altera temporalmente `CONFIG.factorAutomatizacion`, se comprueba que `npm test` falla y se revierte con `git checkout -- components/diagnostico/ahorro.ts`. Queda documentado en el reporte del cambio.

## Risks / Trade-offs

- [Vitest 4 puede resolver Vite 8, que reemplaza esbuild por rolldown/oxc y podría cambiar detalles de transformación de `.tsx`] → El primer test es `.ts` puro; si un test `.tsx` futuro falla en transformación, fijar `vite@7` como devDependency o agregar `@vitejs/plugin-react` en ese cambio.
- [`next lint` podría reportar reglas de React en archivos de test] → Con imports explícitos y sin JSX en el primer test no debería ocurrir; si aparece, agregar en `.eslintrc.json` un `overrides` mínimo para `**/*.test.{ts,tsx}`.
- [`next build` type-checkea los tests y podría fallar por tipos de `vitest`] → Los tipos vienen con el paquete; se valida con `npx tsc --noEmit` y `npm run build` antes de cerrar.
- [Tiempo de `npm install` y tamaño de `node_modules` crecen (~100 paquetes)] → Solo devDependencies; Vercel las instala pero no las incluye en el bundle.
- [Los tests fijan la fórmula actual; si la fórmula cambia a propósito, los tests fallarán] → Es el comportamiento deseado: el cambio de fórmula debe ir con su cambio de spec y de tests (`base-standards.md` §7).

## Migration Plan

Sin migración: solo devDependencies, configuración y documentación. Despliegue normal por push a `main`; el sitio publicado no cambia. Rollback: revertir el commit (elimina dependencias, scripts, config y test).
