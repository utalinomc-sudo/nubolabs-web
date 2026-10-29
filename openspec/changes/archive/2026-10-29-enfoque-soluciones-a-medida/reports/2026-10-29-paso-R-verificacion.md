# Reporte — paso R: verificación tras la revisión adversarial

- Fecha: 2026-10-29
- Cambio: enfoque-soluciones-a-medida (HDU-11)
- Rama: `feature/enfoque-soluciones-a-medida` (desde `main` eace7d8)
- Ejecutado por: Claude Code (Fable 5.1), sesión de apply, después de aplicar R.1 a R.8 (hallazgos 1 a 8 y decisiones D1 a D7 de `2026-10-29-adversarial-review.md`)
- Entorno: Windows 11, Node 24.16, npm 11.13, sin `.env.local`; servidor de desarrollo detenido durante el build

## Comandos (pasada final, con los textos definitivos del panel)

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ sin errores ni avisos (exit 0) |
| `npx tsc --noEmit` | ✔ sin errores (exit 0) |
| `npm test` | ✔ Test Files 51 passed · **Tests 379 passed** (exit 0) |
| `npm run build` | ✔ compilado con Turbopack, mismas 25 rutas (exit 0) |
| `openspec validate enfoque-soluciones-a-medida --strict` | ✔ válido |

Tests nuevos respecto del paso N (377 → 379):
- `components/landing/HeroPanel.test.tsx`: "ningún título pasa de 29 caracteres ni ningún detalle de 29" (R.2).
- `lib/siteConfig.sections.test.ts`: "la regla no rechaza palabras legítimas parecidas" ("excelente", "incontables", "nubecita" pasan; "Excel", "contador", "contables", "nube" no) (R.5).

Tests modificados: `lib/siteConfig.casos.test.ts` (caso de comercio nuevo), `components/landing/Home.vocabulario.test.tsx` (regex con límites de palabra; "Cotización lista y enviada" como texto esperado), `lib/siteConfig.sections.test.ts` (regex con `\bnube\b`).

## Qué cambió en el código por la revisión
- `lib/content.ts`: 12 tareas del panel con título ≤ 29 y detalle ≤ 29 caracteres; meta "mañana 10:00" en la ilustración de seguimiento; ecuación "Soluciones hechas para ti"; detalle "Taller · retiro coordinado" en vez de "mensaje enviado".
- `components/landing/HeroPanel.tsx`: detalle `max-sm:line-clamp-2 max-sm:min-h-[2rem] sm:truncate` (dos líneas reservadas bajo 640 px).
- `components/landing/Results.tsx`: fila de seguimiento con `flex-wrap`; la hora baja de línea si no cabe (`ml-auto`).
- `lib/siteConfig.ts`: comentario de `notaTecnica`; paso 3 del proceso "Pensado para cómo trabajas…"; caso de comercio "Sabes qué productos dejan margen y cuáles no, antes de reponer."; visión en dos frases.
- Artefactos: deltas `landing/hero` (largos, dos líneas en móvil, escenario "Tareas que rotan sin cortes", alcance medido del "sin cortes"), `landing/contenido-pyme` (excepción ampliada, requisito MODIFIED "Textos recomendados en el admin" con Misión y visión, ecuación y paso 3), `landing/casos-por-rubro` (caso de comercio); `design.md` decisiones 2, 4, 8, 10, 11, 12 y D3/D5/D6, Migration Plan sin "Autodiagnóstico"; `tasks.md` sección R; `docs/ESTADO-PROYECTO.md` (P.1 sin Autodiagnóstico).

## Revisión de archivos
- Fines de línea: sin archivos mixtos; sin caracteres invisibles nuevos (el U+200B de `lib/siteConfig.casos.test.ts` es un caso de prueba preexistente).

## Estado de datos
- Sin acceso a Firestore, Resend ni Blob; ningún comando escribe datos. Restaurado: no aplica.

## Resultado
PASS — E2E en `2026-10-29-paso-R-e2e.md` (PASS con el límite documentado de 1024 px + letra de 20 px).
