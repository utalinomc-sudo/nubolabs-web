# Reporte — paso N: verificación obligatoria

- Fecha: 2026-10-22
- Cambio: cifras-con-respaldo (HDU-06)
- Rama: `feature/cifras-con-respaldo` (desde `main` 657f3f1)
- Ejecutado por: Claude Code (Opus 5.5), sesión de apply
- Entorno: Windows 11, Node 24.16, sin `.env.local`; servidor de desarrollo detenido durante el build

## Comandos

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ sin errores ni avisos (exit 0) |
| `npx tsc --noEmit` | ✔ sin errores (exit 0) |
| `npm test` (`npx vitest run --maxWorkers=2`) | ✔ Test Files 34 passed · **Tests 247 passed** (exit 0) |
| `npm run build` | ✔ compilado con Turbopack (exit 0) |
| `grep -rn "metrics\|120 h\|referenciales" app components lib` | solo `metricsLabels` (rótulos de la sección nueva); ninguna cifra de ejemplo |

`--maxWorkers=2`: la máquina sigue cargada por procesos de otros proyectos; con todos los procesos en paralelo algunos tests de componentes superan los 5 s.

Tests nuevos o ampliados (fallaron antes de implementar):
- `lib/siteConfig.cifras.test.ts` (10): sección oculta por defecto (única) y justo después de `casos`; `visible.cifras` solo con `true` guardado; `normalizeCifras` (no arreglo, recorte, conserva incompletas); `visibleCifras` (sin valor, texto o fuente no se publica; orden; máximo 4); `mergeConfig` (defaults, frase vacía respetada, frase no texto → default, formas raras).
- `components/landing/Metrics.test.tsx` (3): solo cifras con fuente, con "Fuente: …"; sin válidas → frase; sin cifras ni frase → nada.
- `components/admin/ConfigEditor.test.tsx` (+1): ayuda, aviso "No se mostrará: falta la fuente.", máximo 4, "Usar los textos recomendados" solo para la frase y payload solo con `cifras`. La guarda de `MANAGED_KEYS` exigió el editor.
- `lib/siteConfig.sections.test.ts` y `components/landing/Home.vocabulario.test.tsx`: frase en la prueba de vocabulario, `Metrics` en el barrido y comprobación de que no aparecen "+120 h", "−90%", "minutos donde antes había días" ni "referenciales".

## Decisiones tomadas durante el apply (registradas en `design.md` y `tasks.md`)
- `SECTIONS` admite `defaultHidden` (solo `cifras`); `defaultSiteConfig()` lo respeta y `mergeVisible` solo acepta booleanos guardados.
- Editor en `components/admin/config/CifrasEditor.tsx` con `SectionCard` y `ListField` (0 a 4); aviso por cifra según lo que falte.
- Columnas de la banda según la cantidad de cifras (1 a 4), para no dejar espacio vacío.
- Textos fijos en `lib/content.ts` (`metricsLabels`).

## Estado de datos
- Sin acceso a Firestore, Resend ni Blob; ningún comando escribe datos.

## Re-verificación tras la revisión adversarial (sección R de `tasks.md`)

`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (`--maxWorkers=2`, **34 archivos, 251 tests**) · `npm run build` ✔ · `openspec validate cifras-con-respaldo --strict` ✔ (con el delta MODIFIED de `landing/contenido-pyme`). Tests nuevos: caracteres invisibles y signos en `lib/siteConfig.cifras.test.ts` y en el editor, frase invisible y más de 4 cifras en `Metrics.test.tsx`, casilla de visibilidad (por defecto y sin la clave; al marcarla se envía `true`) en `ConfigEditor.test.tsx`; los de invisibles y la casilla sin clave fallaron antes del arreglo. Detalle en `2026-10-22-adversarial-review.md`.

## Resultado
PASS
