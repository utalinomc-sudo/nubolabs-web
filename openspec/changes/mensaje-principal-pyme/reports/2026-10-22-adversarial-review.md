# Reporte — /adversarial-review y correcciones

- Fecha: 2026-10-22
- Cambio: mensaje-principal-pyme
- Revisor: agente independiente (Claude Code, Opus 5.5) lanzado aparte de la sesión de apply; solo lectura (lint, tsc, test, build, `openspec validate --strict`, Tailwind con config vieja y nueva, harness externo de `mergeConfig` con 20 documentos raros, `next start -p 3107` + Playwright de 320 a 1440 px con letra 20/24 px).
- Veredicto inicial: **FAIL** (2 Major).

## Hallazgos y resolución

| Severidad | Hallazgo | Resolución | Dónde |
|---|---|---|---|
| Major | Alto fijo del panel (478/488 px) cortaba la 5.ª tarea entre 1024 y ~1140 px (cabecera en 2 líneas) y con letra del navegador aumentada | Filas de alto constante (`line-clamp-1` desde `sm`; `line-clamp-2` + `min-h-[2.7em]` en móvil; detalle `truncate`) y tarjeta con alto natural. E2E de 320 a 1440 px con letra 16 y 20 px: ninguna tarea cortada, alto estable al rotar | `HeroPanel.tsx`, spec (escenario "Anchos intermedios y letra grande"), design.md decisión 4, tarea 6.1, reporte N+2 |
| Major | "Piloto automático" 4,09:1 (texto normal sobre `success-50`) | Token `success-strong` `#0F7A43` → 5,02:1; tabla de contraste completa de textos e íconos | `tailwind.config.ts`, `HeroPanel.tsx`, design.md decisión 1, `docs/frontend-standards.md`, reporte N |
| Minor | CTA a `#contacto`/`#modelo` aunque la sección esté oculta (inconsistente con HDU-10) | `Hero` (`contactVisible`, `processVisible`) y `Nav` (`showContact`): sin contacto → `/diagnostico`; sin proceso → sin botón secundario. Tests nuevos | `Hero.tsx`, `Nav.tsx`, `app/page.tsx`, `app/equipo/page.tsx`, `app/mision-vision/page.tsx`, `Hero.test.tsx`, `Nav.test.tsx`, spec |
| Minor / Question | Preview comparte Firestore con producción; textos viejos con doble flecha | Secuencia de migración explícita en design.md y en `docs/ESTADO-PROYECTO.md`; sin ícono si el texto ya termina en "→" (test) | design.md "Migration Plan", `Hero.tsx` |
| Minor | Sin pausa de animación (WCAG 2.2.2); "reducir movimiento" leído solo al montar | Listener `change` de `matchMedia` (test). Botón de pausa: deuda anotada (pendiente 14 de `docs/ESTADO-PROYECTO.md`) | `HeroPanel.tsx`, `HeroPanel.test.tsx` |
| Minor (preexistente) | Botón "Abrir menú" 26 × 26 px | 44 × 44 px (test) | `Nav.tsx` |
| Minor | A 640 px exactos se ven 5 tareas, la spec decía "hasta 640" | Spec corregida: "menos de 640 px" | spec |
| Minor (preexistente) | `mergeConfig`: `title: null` → 500 en la portada; `subtitle` objeto; `hero` texto con claves basura | `pickText` por campo del hero (tests). Resto de secciones: deuda (pendiente 15) | `lib/siteConfig.ts`, `lib/siteConfig.test.ts` |
| Minor | Docs desactualizados (`frontend-standards.md:69`, `prospectos-oa.md:64`) | Corregidos | docs |
| Minor | Faltaban tests de Hero, Nav, `document.hidden` | Agregados (Hero 5, Nav 3, HeroPanel +2). `ConfigEditor` sigue sin test (se cubre en E2E; HDU-02 lo divide en editores) | tests |
| Minor | Aviso "Textos recomendados cargados" seguía tras guardar | Se oculta al guardar con éxito | `ConfigEditor.tsx` |
| Question | Alcance del commit (archivos ajenos, `HeroGraphic.tsx` en stage) | Commit acotado: se excluyen la skill `ui-ux-pro-max`, `ai-specs/.specboot.json` y `docs/avance.json`; se incluyen los documentos de referencia de la HDU-08 que citan los artefactos | commit |

Detalles menores sin cambio: etiquetas que "suben de casilla" si se deja vacía la primera (comportamiento aceptable de `normalizeTags`), `key` duplicada con etiquetas repetidas (solo SSR, sin efecto).

## Re-verificación
- Tarea N.2: lint, tipos, 49 tests y build en verde.
- Tarea N+2.5: E2E de la tabla del reporte del paso N+2 en verde. Única observación: scroll horizontal de 6 px a 320 px con letra 20 px causado por `#servicios` (preexistente, HDU-02).

## Resultado tras las correcciones
Los 2 Major y los Minor accionables quedan resueltos y verificados; quedan como deuda anotada el botón de pausa (WCAG 2.2.2) y la robustez del resto de secciones del CMS. Listo para preview.
