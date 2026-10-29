# Reporte — paso N: verificación obligatoria

- Fecha: 2026-10-29
- Cambio: enfoque-soluciones-a-medida (HDU-11)
- Rama: `feature/enfoque-soluciones-a-medida` (desde `main` eace7d8)
- Ejecutado por: Claude Code (Fable 5.1), sesión de apply
- Entorno: Windows 11, Node 24.16, npm 11.13, sin `.env.local`; servidor de desarrollo detenido durante el build

## Comandos

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ sin errores ni avisos (exit 0) |
| `npx tsc --noEmit` | ✔ sin errores (exit 0) |
| `npm test` | ✔ Test Files 51 passed · **Tests 377 passed** (exit 0; 27 s) |
| `npm run build` | ✔ compilado con Turbopack, mismas 25 rutas que antes (exit 0) |

## TDD

Antes de tocar los textos, con los tests ya actualizados a los textos nuevos: `npm test` → **19 archivos fallidos, 31 tests fallidos**, todos por los textos viejos (hero, dolores, resultados, enfoque, servicios, casos, compromisos, 6 → 7 preguntas, CTA final, pie, franja de /oa, etiqueta del objetivo, textos de "Control y números", "Piloto automático" en el panel, ilustración de chat, lema en PDF y correo, vocabulario con WhatsApp/contador/n8n). Después de implementar: 377 en verde.

Tests nuevos o ampliados:
- `lib/siteConfig.sections.test.ts`: textos aprobados (dolores, resultados, enfoque y sus 3 pasos, servicios, proceso y franja de éxito, título de Ejemplos, eyebrow de la CTA final); regla de vocabulario ampliada (`WhatsApp|Excel|Sheets|Google|planillas?|contador|contables?|contabilidad|piloto autom` además de la jerga y "pyme") sobre **todos** los defaults salvo `privacidad` y `contact`, más `nav`, pie (frase y enlaces), `heroFeed`, `heroFeedMore`, `resultsVisuals`, `approachExample` y `siteSlogan`; nota técnica única que empieza con "Cómo lo hacemos:" y no nombra herramientas; lema único.
- `components/landing/Home.vocabulario.test.tsx`: barrido de la portada completa **incluida la nota técnica**, lema presente y sin "piloto automático".
- `lib/siteConfig.test.ts` (hero: título, bajada, etiquetas; vocabulario del hero con herramientas y contador), `lib/siteConfig.casos.test.ts`, `lib/siteConfig.confianza.test.ts`, `lib/siteConfig.cierre.test.ts` (7 preguntas, respuestas sin herramientas, CTA final), `lib/siteConfig.referidos.test.ts`, `lib/leadOptions.test.ts` (etiqueta y tema de `drop_spreadsheets`).
- `components/landing/Hero.test.tsx`, `HeroPanel.test.tsx` ("Todo al día", `aria-label` nuevo, tareas sin WhatsApp/planilla/contador y con reportes), `Results.test.tsx` (títulos; ilustración 1 con "Cotización enviada" y sin chat), `Footer.test.tsx`, `FinalCta.test.tsx`, `Faq.test.tsx` (7 preguntas).
- `components/admin/ConfigEditor.test.tsx`: 7 preguntas al restablecer; **nuevo**: "Usar los textos recomendados" en Misión y visión repone misión, visión y objetivos sin guardar y el guardado envía solo `nosotros`.
- `components/diagnostico/oportunidades.test.ts` (textos de "Control y números"), `components/diagnostico/DiagnosticoFlow.test.tsx` (lema en el pie), `lib/email.test.ts` y `app/api/diagnostico/report/route.test.ts` (lema en el correo y en el PDF, sin "piloto automático").

## Revisión de archivos

- Fines de línea: los 36 archivos de código y tests tocados siguen en CRLF (ninguno quedó mixto); los artefactos nuevos de `openspec/changes/enfoque-soluciones-a-medida/` van en LF (git los normaliza al commit).
- Caracteres invisibles: el único U+200B detectado está en `lib/siteConfig.casos.test.ts`, en un caso de prueba preexistente que lo usa a propósito (título invisible); no se tocó.
- `openspec validate enfoque-soluciones-a-medida --strict` → válido.

## Estado de datos
- Antes / después: sin acceso a Firestore, Resend ni Blob (no hay `.env.local`); ningún comando escribe datos.
- Restaurado: no aplica.

## Resultado
PASS
