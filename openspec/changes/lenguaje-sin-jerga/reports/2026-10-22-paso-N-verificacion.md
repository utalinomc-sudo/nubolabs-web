# Reporte — paso N: verificación obligatoria

- Fecha: 2026-10-22
- Cambio: lenguaje-sin-jerga (HDU-02)
- Rama: `feature/lenguaje-sin-jerga` (desde `main` 11f7e2d)
- Ejecutado por: Claude Code (Opus 5.5), sesión de apply
- Entorno: Windows 11, Node 24.16, sin `.env.local`; servidor de desarrollo detenido durante el build

## Comandos

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ sin errores ni avisos (exit 0) |
| `npx tsc --noEmit` | ✔ sin errores (exit 0) |
| `npm test` | ✔ Test Files 18 passed · **Tests 156 passed** (exit 0) |
| `npm run build` | ✔ compilado con Turbopack, mismas rutas que antes (exit 0) |

Tests nuevos o ampliados (TDD: cada archivo falló antes de implementar):
- `lib/siteConfig.sections.test.ts` (17): `mergeFixedList` (no arreglo, posición inválida, completa y recorta), `mergeList` (no arreglo, menos del mínimo, válidos recortados sin rellenar con textos de otra posición, máximo), `mergeConfig` de `problema` (1–8), `resultados` (siempre 4), `enfoque` (siempre 3), `servicios` (items con la forma antigua siguen sirviendo; `destacado`, `acompanamiento` y `notaTecnica` caen al default), `proceso` (siempre 4 y `exito` 1–6), formas inesperadas sin fallar, `visible.resultados` por defecto; textos aprobados de la HDU-08; **prueba de vocabulario** (regex de la decisión 7 con "pyme(s)") sobre los defaults, `nav`, `resultsVisuals` y `approachExample`, excluyendo la nota técnica; "n8n" en la nota técnica; orden de `SECTIONS` y menú.
- `components/landing/Results.test.tsx` (3, jsdom): 4 resultados con título y texto, cierre, ancla `#resultados`, ilustraciones con `aria-hidden="true"` y textos propios del CMS.
- `components/landing/Nav.test.tsx` (+2): ítems nuevos en escritorio y móvil sin activo fijo ni "Inicio"; ítem de una sección oculta no se muestra.
- `components/admin/ConfigEditor.test.tsx` (6, jsdom): `pickManaged` y `MANAGED_KEYS` exactos (sin `equipo`), un editor por sección, listas fijas sin agregar/quitar, "Usar los textos recomendados" solo en su sección y sin guardar, y payload al guardar con exactamente las claves administradas.
- `components/diagnostico/DiagnosticoFlow.test.tsx` (+1): encabezado nuevo sin "automatización" ni "fricción operativa" y las 18 preguntas intactas.

## Decisiones tomadas durante el apply (registradas en `design.md` y `tasks.md`)
- **Listas variables:** un campo vacío de un ítem válido queda `""` y no toma el texto del default de su posición (describe otro ítem). Se aplica también a `casos.items` (1–12).
- **Encabezado común** `SectionHead.tsx`, tokens `inverse.*` (texto sobre navy, todos ≥ 5:1) y `.bg-dots-inverse`; sin hex en el JSX de las secciones nuevas.
- **Subgrilla CSS** en Proceso y Servicios: título, texto y "Recibes" / "lo que ganas" quedan a la misma altura en cada fila aunque los textos del CMS tengan distinto largo.
- **Menú:** el ítem de una sección oculta no se muestra (todas las páginas pasan `sections={visible}`); "Mira lo que cambia" se oculta si "Lo que ganas" está oculta.
- **Nota técnica** admite `**resalte**`; el default pone "Cómo lo hacemos:" en negrita como la referencia.
- **Admin:** aviso de textos recomendados por sección con `SaveVersionContext` (se apaga al guardar); el panel `/admin` cuenta los servicios del CMS en vez de la lista retirada de `lib/content.ts`.
- **Test de dependencias:** `lib/firebaseAdminAuthDeps.test.ts` con `timeout` de 20 s; el `require("jose")` tardaba más de 5 s al correr en paralelo con los tests de jsdom (pasaba solo).

## Estado de datos
- Antes / después: sin acceso a Firestore, Resend ni Blob (no hay `.env.local`); ningún comando escribe datos.
- Restaurado: no aplica.

## Re-verificación tras los ajustes del E2E

Después de agregar `scroll-mt-20` a `UseCases.tsx` y de limitar el desplazamiento suave a `prefers-reduced-motion: no-preference` (`app/globals.css`), con el servidor detenido: `npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (**18 archivos, 156 tests**) · `npm run build` ✔ (exit 0 en los cuatro).

Durante `/opsx:verify` se sumó `components/landing/Problem.test.tsx` (3: dolores por defecto con resalte y enlace, 4 dolores editados, enlace oculto si "Lo que ganas" está oculta): `npm test` ✔ (**19 archivos, 159 tests**), `npx tsc --noEmit` ✔, `npm run lint` ✔.

## Re-verificación tras la revisión adversarial (sección R de `tasks.md`)

`npm run lint` ✔ (corregido `react-hooks/refs` en `ListField`) · `npx tsc --noEmit` ✔ · `npm test` ✔ (**22 archivos, 170 tests**) · `npm run build` ✔. Tests nuevos: `Home.vocabulario.test.tsx` (2), `Services.test.tsx` (2), `Process.test.tsx` (1), `ConfigEditor.test.tsx` (de 6 a 10) y `siteConfig.sections.test.ts` (+2). Detalle en `2026-10-22-adversarial-review.md`.

## Resultado
PASS
