# Reporte — paso N: verificación obligatoria

- Fecha: 2026-10-22
- Cambio: casos-por-rubro (HDU-05)
- Rama: `feature/casos-por-rubro` (desde `main` 3ab6934)
- Ejecutado por: Claude Code (Opus 5.5), sesión de apply
- Entorno: Windows 11, Node 24.16, sin `.env.local`; servidor de desarrollo detenido durante el build

## Comandos

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ sin errores ni avisos (exit 0) |
| `npx tsc --noEmit` | ✔ sin errores (exit 0) |
| `npm test` (`npx vitest run --maxWorkers=2`) | ✔ Test Files 37 passed · **Tests 277 passed** (exit 0) |
| `npm run build` | ✔ compilado con Turbopack (exit 0) |
| `openspec validate casos-por-rubro --strict` | ✔ válido (con el delta MODIFIED de `landing/contenido-pyme`) |

`--maxWorkers=2`: la máquina sigue cargada por procesos de otros proyectos.

Tests nuevos o ampliados (fallaron antes de implementar):
- `lib/siteConfig.casos.test.ts` (11): `CASE_RUBROS` = rubros del formulario sin "otro"; `normalizeCaseRubro` (válido, ausente, desconocido, "otro", con espacios, no texto); defaults (encabezado sin bajada, 14 casos por rubro en orden, `body: ""`, sin jerga ni "horas"); `mergeConfig` (sin casos → defaults; no lista, vacía o sin texto principal → defaults; casos viejos → "todos" con su descripción; recorte y descarte; máximo 18; bajada vacía).
- `components/landing/casesFilter.test.ts` (7): `availableRubros` (orden de la lista, sin rubros vacíos, solo "todos" → `[]`), `filterCases` (todos; rubro + "para todos" en orden; 5 en Automotriz y 6 en Gastronomía), `resultsLabel` (plural, singular y sin rubro) y `rubroLabel`.
- `components/landing/UseCasesFilter.test.tsx` (6): 14 tarjetas y "Todos" presionado al cargar; Gastronomía → 6, solo ese chip presionado y anuncio "Mostrando 6 ejemplos de Gastronomía"; Automotriz → 5; Todos → 14; sin chip de rubro sin casos; solo "para todos" → sin chips; detalle visible; `UseCases` con etiqueta, título, sin bajada vacía y `return null` sin casos.
- `components/admin/ConfigEditor.test.tsx` (+2): selector "Rubro" con "Para todos" + 5 rubros, "Texto principal" y "Detalle (opcional)", cambio de rubro → payload solo con `casos`; caso nuevo "Para todos"; "Usar los textos recomendados" repone 14 casos sin guardar.
- `lib/siteConfig.sections.test.ts`: la bajada de Casos pasa a vacía y se fija el título nuevo (delta MODIFIED). `components/landing/Home.vocabulario.test.tsx`: el barrido incluye "Para todos" y "Servicios profesionales".

## Decisiones tomadas durante el apply (registradas en `design.md`, `tasks.md` y las specs)
- Casos con la regla común de listas variables (`mergeList`, 1 a 18): lista vacía o sin casos válidos → defaults; la sección se oculta con su casilla. Escenario "Sin casos válidos" movido y corregido en la spec.
- Sin rubros (solo "para todos") no se muestran chips.
- Etiqueta "Ejemplos por rubro" en minúsculas (mayúsculas por CSS); sin bajada (delta MODIFIED de `landing/contenido-pyme`).
- Banda de cifras navy propia (sin `spaced`), porque Ejemplos pasó a fondo claro.
- Textos fijos en `casesLabels` (`lib/content.ts`); `SelectField` nuevo en el admin.

## Estado de datos
- Sin acceso a Firestore, Resend ni Blob; ningún comando escribe datos.

## Re-verificación tras la revisión adversarial (sección R de `tasks.md`)

`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (`--maxWorkers=2`, **37 archivos, 283 tests**) · `npm run build` ✔ · `openspec validate casos-por-rubro --strict` ✔. Detalle en `2026-10-22-adversarial-review.md`.

## Resultado
PASS
