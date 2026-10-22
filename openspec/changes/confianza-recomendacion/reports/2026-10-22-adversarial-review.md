# Revisión adversarial — confianza-recomendacion (HDU-04)

- Fecha: 2026-10-22
- Revisor: agente independiente (sin el contexto de la implementación), skill `/adversarial-review`
- Alcance: `git diff main` de `feature/confianza-recomendacion` más los archivos nuevos; artefactos del cambio, specs vigentes relacionadas y la referencia HDU-08.
- Método del revisor: lectura de artefactos y reportes, `tsc`, `lint`, 227 tests (`--maxWorkers=2`), `openspec validate`, un test temporal con 9 casos de datos raros y del admin (borrado) y cálculo de contraste WCAG.

## Veredicto del revisor
**PASS WITH GAPS** — sin Blocker ni Major. Sin riesgo de publicar testimonios desde el código (defaults vacíos, sin restos del E2E). Preview publicable; archivar tras cerrar o aceptar los Minor de compromisos, destacado único e iniciales, y agregar el paso de revisión de Firestore antes de mezclar.

## Hallazgos y resolución

| # | Severidad | Hallazgo | Resolución |
|---|---|---|---|
| 1 | Minor | Compromisos "fijos" en el admin pero de largo variable al leer: un título vacío dejaba 2, sin forma de recuperar el tercero, y los íconos se corrían | ✅ `mergeFixedList` por posición (vacío → recomendado de esa posición); spec con el escenario "Compromiso con título vacío"; test |
| 2 | Minor | Con 2 destacados guardados a mano, el admin marcaba ambos y al desmarcar uno se desmarcaban los dos | ✅ `normalizeTestimonios` deja solo el primer destacado; spec y test |
| 3 | Minor | `initials` cortaba emojis y tildes escritas por separado ("A\ud83d", "(J") | ✅ NFC + primera letra Unicode por palabra; escenario "Iniciales con emojis o signos"; tests |
| 4 | Minor | Una URL o correo largo desbordaba tarjetas y la cita a 375 px | ✅ `[overflow-wrap:anywhere]` y columnas `minmax(0, …)`; comprobado en el navegador con un testimonio temporal (360 ≤ 375 px) |
| 5 | Minor | Contraste: iniciales chicas 4,28:1; aviso del admin 4,14:1 | ✅ Iniciales en `brand-dark` (5,8:1); aviso con fondo blanco y borde accent (4,6:1) |
| 6 | Minor | La condición de la cita y el render de compromisos editados y del orden de tarjetas no tenían test | ✅ Helper `contactQuote` con tests; `Trust.test.tsx` suma compromisos editados, orden de tarjetas y nombre de la región |
| 7 | Minor | Firestore compartido: un testimonio guardado desde el preview se publicaría al mezclar | ✅ Tarea M.1 "Antes de mezclar": confirmar en Firebase que `content.confianza.testimonios` no existe, está vacío o solo tiene autorizados |
| 8 | Minor | Un testimonio sin texto (borrador) desaparece del admin al recargar | ✅ La ayuda lo aclara: no hay borradores; cargar cada testimonio recién con la autorización |
| 9 | Minor | Estética: cita arriba con hueco; 1 tarjeta a media fila; saltos de línea perdidos; `aria-label` fijo; sin separación si el hero está oculto | ✅ Cita centrada, tarjeta única a todo el ancho, `whitespace-pre-line`, región con el nombre de la etiqueta, prop `spaced` |
| 10 | Minor | Docs: "en preview" antes del push; ruta del test en la propuesta | ✅ Ruta corregida; el estado queda correcto al subir la rama |
| 11 | Pregunta | La cita de `#contacto` repite el testimonio completo (la referencia usaba un extracto) | ⏭ Para Mauro (se mantiene completo según la decisión 4 hasta que responda) |
| 12 | Pregunta | No hay estado "borrador" por testimonio | ⏭ Para Mauro (non-goal vigente; la ayuda del editor lo explica) |

## Re-verificación
`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (`--maxWorkers=2`, **32 archivos, 234 tests**) · `npm run build` ✔. Cambio temporal de E2E revertido (`grep -c TEMPORAL lib/siteConfig.ts` → 0).

## Veredicto final
**PASS** tras las correcciones, con 2 preguntas de producto para Mauro y la tarea M.1 antes de mezclar.
