# Reporte — paso N: verificación obligatoria

- Fecha: 2026-10-22
- Cambio: diagnostico-mapa-oportunidades (HDU-09)
- Rama: `feature/diagnostico-mapa-oportunidades` (desde `main` 4fcea0d)
- Ejecutado por: Claude Code (Opus 5.5), sesión de apply
- Entorno: Windows 11, Node 24.16, sin `.env.local`; servidor de desarrollo detenido durante el build

## Comandos

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ sin errores ni avisos (exit 0) |
| `npx tsc --noEmit` | ✔ sin errores (exit 0) |
| `npm test` (`npx vitest run --maxWorkers=2`) | ✔ Test Files 49 passed · **Tests 360 passed** (exit 0) |
| `npm run build` | ✔ compilado con Turbopack; ruta nueva `/admin/estimador` (exit 0) |
| `openspec validate diagnostico-mapa-oportunidades --strict` | ✔ válido |

`--maxWorkers=2`: la máquina sigue cargada por procesos de otros proyectos. `DiagnosticoFlow.test.tsx` y `ConfigEditor.test.tsx` suben su tiempo máximo a 20 s (`vi.setConfig`): hacen clic en las 18 preguntas o renderizan el editor completo y, con la carga, pasaban de los 5 s por defecto.

Tests nuevos o ampliados (fallaron antes de implementar, salvo los marcados como cobertura):
- `components/diagnostico/oportunidades.test.ts` (14): dimensiones y textos de la spec (sin cifras ni "horas"); `areaScore`; umbrales 60/59/35/34; 75 y 50 → 63 alta; "Tres principales", máximo 3, "Todo bajo", sin datos fuera de principales, sin respuestas; `areaScoresFromMeta` (formato nuevo, antiguo y entradas inválidas); `withOpportunityMap` (recalcula, quita `ahorro`, no muta); `mapFromMeta`. Los 11 tests de `ahorro.test.ts` siguen sin cambios.
- `app/api/diagnostico/report/route.test.ts` (4, PDF real y texto extraído con `lib/pdfTestText.ts`): meta nuevo → PDF con mapa, principales y próximo paso, sin "fricción", "ahorro", "$", "h/mes" ni "automatiz"; meta antiguo → mapa calculado sin el ahorro; sin áreas → 400 con el mensaje de la spec; JSON inválido → 400 (cobertura).
- `app/api/leads/route.test.ts` (+2): el diagnóstico se guarda con el mapa recalculado y sin `ahorro`; un lead del formulario no recibe `meta`. El test de HDU-07 del informe pasó a la forma nueva (`mapa`, `oportunidadPrincipal`).
- `lib/email.test.ts` (2): el correo nombra la mayor oportunidad y el próximo paso, con el botón para agendar y sin "fricción", "ahorro", "$" ni "automatizar"; escapa HTML y funciona sin oportunidad.
- `components/diagnostico/DiagnosticoFlow.test.tsx` (+5): panel con 4 dimensiones "Sin datos" y sin "Estimar mi ahorro"; avance parcial; sin palabras prohibidas con todo respondido; preguntas abiertas nuevas en orden; `meta` con `areas[].id` y `oportunidades`, sin `ahorro`, y confirmación con el mapa.
- `components/admin/EstimadorInterno.test.tsx` (2): $155.187/mes con un proceso, $310.374 con dos, sin `fetch`; aviso de herramienta interna.
- `lib/leadReport.test.ts` (+1): ficha de un diagnóstico antiguo con mapa, índice y ahorro. La prueba de emojis del informe pasó a un área real.
- `lib/siteConfig.autodiagnostico.test.ts` (3), `components/landing/SelfDiagnosis.test.tsx` (3) y `components/admin/ConfigEditor.test.tsx` (+1): sección entre proceso y contacto, visible por defecto, textos de la spec, override parcial; bloque con "Ejemplo" sin cifras y botón a `/diagnostico`; editor con textos recomendados. `LandingPage.test.tsx`, `Home.vocabulario.test.tsx` y `siteConfig.sections.test.ts` ajustados al bloque nuevo.

## Decisiones tomadas durante el apply (registradas en `design.md` y `tasks.md`)
- `mapFromMeta` recalcula siempre el mapa desde `areas` para el panel, el detalle y la ficha (mismo resultado que guardó el servidor y sirve para los leads antiguos).
- Mensaje interno del lead con la mayor oportunidad; textos del informe y del correo sin "automatizar"; título de la pestaña "Autodiagnóstico — Nubolabs".
- `SelfDiagnosis` sin padding superior (sigue al proceso) y con `spaced` si el proceso está oculto; textos fijos en `selfDiagnosisLabels`.
- Arreglo del scroll horizontal previo del encabezado de `/diagnostico` a 375 px.

## Estado de datos
- Sin acceso a Firestore, Resend ni Blob; ningún comando escribe datos.

## Re-verificación tras la revisión adversarial (sección R de `tasks.md`)

`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (`--maxWorkers=2`, **51 archivos, 374 tests**) · `npm run build` ✔ · `openspec validate diagnostico-mapa-oportunidades --strict` ✔. Detalle en `2026-10-22-adversarial-review.md`.

## Resultado
PASS
