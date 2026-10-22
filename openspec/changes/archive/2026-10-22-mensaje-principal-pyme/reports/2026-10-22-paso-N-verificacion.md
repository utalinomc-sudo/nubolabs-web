# Reporte — paso N: verificación obligatoria

- Fecha: 2026-10-22
- Cambio: mensaje-principal-pyme
- Rama: `feature/mensaje-principal-pyme`
- Ejecutado por: Claude Code (Opus 5.5), sesión de apply
- Entorno: Windows 11, Node 24.16, npm 11.13, sin `.env.local`
- Estado del código al ejecutar: tareas 1.1 a 5.1 implementadas

## Comandos

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ sin errores ni avisos (exit 0) |
| `npx tsc --noEmit` | ✔ sin errores (exit 0) |
| `npm test` | ✔ Test Files 5 passed · Tests 37 passed (37) (exit 0) |
| `npm run build` | ✔ build de producción con Turbopack, 22 rutas, sin advertencias (exit 0) |

Tests nuevos de este cambio:
- `lib/siteConfig.test.ts` (11): `normalizeTags` (no arreglo → `null`, recorte, descarte de vacíos y no-strings, máximo 3, vacío → `null`), `mergeConfig` del hero (sin `content.hero`, override parcial de `title`, `tags` ausente o `[]`, caso de la spec con "  ", 5 → 3, resto de secciones intacto) y defaults del hero (mensaje de la HDU-08 y vocabulario prohibido).
- `components/landing/HeroPanel.test.tsx` (4, jsdom): 5 tareas iniciales con "Tu negocio hoy" y "Piloto automático"; sin rotación con "reducir movimiento" (10 s con timers falsos); con movimiento y panel visible entra `heroFeedMore[0]` arriba y siguen 5; la rotación se detiene al salir de pantalla.

Ciclo TDD registrado: `lib/siteConfig.test.ts` falló primero por falta del módulo (tarea 2.1); tras mover la configuración (2.2) fallaron solo los 3 casos de los defaults nuevos, que pasaron con la tarea 2.3. `HeroPanel.test.tsx` falló por falta del componente (3.3) y pasó con la implementación (3.4).

## Resultados de las verificaciones por tarea

**1.1 — tokens sin clases rotas.** Tras el build, el CSS generado contiene todas las clases que ya usaban los componentes con los grupos que ahora son objetos: `.bg-navy`, `.text-navy`, `.text-brand`, `.border-line`, `.border-line\/60`, `.bg-navy\/25`, `.text-brand-light`, `.to-brand-light`, `.from-brand`, `.bg-brand`, `.border-brand`, `.text-accent`, `.bg-accent`, `.accent-brand` (1 coincidencia cada una). Las clases nuevas usadas por el hero también se generan (`.text-gradient-brand`, `.bg-dots`, `animate-feed-in`, `animate-bob`, `.bg-success-50`, `.text-brand-deep`, `.bg-brand-light-50`, `.shadow-lift`).

**1.2 — contraste sobre blanco (WCAG 2.x, luminancia relativa):**

| Color | Uso | Contraste vs `#FFFFFF` | Cumple |
|---|---|---|---|
| `#1565FF` (`brand`) | inicio del degradado del resalte | 4,84:1 | AA texto normal y grande |
| `#0A8FD6` (`brand-deep`) | fin del degradado del resalte | **3,55:1** | AA texto grande (≥ 3:1) ✔ |
| `#00C2FF` (`brand-light`, descartado para el resalte) | — | 2,07:1 | no cumple |
| `#138A4D` (`success`) | checks de las etiquetas | 4,40:1 | ≥ 3:1 para íconos ✔ |
| `#D63C2F` (`accent-strong`) | ícono de cobranza | 4,62:1 | ✔ |
| `#93A5C4` (`ink-faint`) | solo decorativo | 2,49:1 | no se usa para texto |

**Corrección tras la revisión adversarial (2026-10-22).** La tabla anterior solo midió contra blanco y pasó por alto que "Piloto automático" es **texto** (12,5 px, negrita = texto normal) sobre `success-50`: con `success` daba **4,09:1 (no cumple 4,5:1)**. Se agregó el token `success-strong` (`#0F7A43`). Medición de todo texto e ícono del hero y del panel sobre su fondo real:

| Elemento | Color / fondo | Contraste | Umbral | Cumple |
|---|---|---|---|---|
| "Piloto automático" (antes) | `#138A4D` / `#E8FBF1` | 4,09:1 | 4,5:1 | ✘ (corregido) |
| "Piloto automático" (ahora, `success-strong`) | `#0F7A43` / `#E8FBF1` | 5,02:1 | 4,5:1 | ✔ |
| Título de cada tarea | `#0B1D3A` / `#F6F9FE` | 15,91:1 | 4,5:1 | ✔ |
| Detalle de cada tarea | `#5A6B85` / `#F6F9FE` | 5,13:1 | 4,5:1 | ✔ |
| Bajada del panel y del hero | `#5A6B85` / `#FFFFFF` | 5,42:1 | 4,5:1 | ✔ |
| Etiquetas del hero | `#3D4E6B` / `#FFFFFF` | 8,40:1 | 4,5:1 | ✔ |
| Eyebrow del hero | `#0B1D3A` / `#FFFFFF` | 16,79:1 | 4,5:1 | ✔ |
| Texto de los CTA y del botón del menú | `#FFFFFF` / `#1565FF` | 4,84:1 | 4,5:1 | ✔ |
| Fin del resalte del título (texto grande) | `#0A8FD6` / `#FFFFFF` | 3,55:1 | 3:1 | ✔ |
| Íconos de las tareas (no texto) | brand/brand-50 4,28 · accent-strong/accent-50 4,14 · brand-deep/brand-light-50 3,27 · success/success-50 4,09 | ≥ 3,27:1 | 3:1 | ✔ |
| Check blanco sobre `success` | `#FFFFFF` / `#138A4D` | 4,40:1 | 3:1 | ✔ |

## Re-verificación tras las correcciones de la revisión adversarial (tarea N.2)

Con el servidor detenido: `npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (**7 archivos, 49 tests**; nuevos: `components/landing/Hero.test.tsx` 5, `components/landing/Nav.test.tsx` 3, +2 en `lib/siteConfig.test.ts` para datos inválidos y +2 en `HeroPanel.test.tsx` para "reducir movimiento" con la página abierta y pestaña oculta) · `npm run build` ✔ (exit 0 en los cuatro). Ciclo TDD: cada test nuevo falló antes de implementar (datos inválidos 2/13, Hero 3/5, Nav 2/3, listener de movimiento 1/6).

**2.3 — `heroTags` retirado:** `grep -rn "heroTags" components lib app` sin resultados.

**3.2 — datos del panel (revisión por lectura):** `heroFeed` (5) y `heroFeedMore` (7) en `lib/content.ts` copian los textos de `#feed` y `pool` de la referencia. Sin cifras de resultados, porcentajes, montos ni nombres de clientes; la única cifra es la hora "23:14" (ilustra "sin despertar a nadie", no es un resultado).

**3.5 — `HeroGraphic` eliminado:** `grep -rn "HeroGraphic" app components lib` sin resultados.

**Ajustes de implementación hechos durante el E2E (paso N+2) y re-verificación:**
- La tarjeta del panel tuvo primero alto fijo (478 px desde `sm`, 488 px en móvil). **La revisión adversarial mostró que cortaba la 5.ª tarea entre 1024 y ~1140 px y con letra grande**; se reemplazó por filas de alto constante y alto natural de la tarjeta (ver la sección de re-verificación y el reporte del paso N+2).
- En móvil la etiqueta "Piloto automático" va bajo el título, el relleno y los íconos son más compactos y la tarjeta flotante superior se oculta (tapaba el título del panel).
- El `grid` del hero usa columnas `minmax(0, …)`: sin eso, en móvil la columna crecía al ancho mínimo del panel y el texto quedaba cortado por el `overflow-hidden` de la sección.
- Los títulos de las tareas no llevan `block` (anulaba el `display` que necesita `line-clamp`).

Tras estos ajustes se volvieron a ejecutar los 4 comandos, con el servidor de desarrollo detenido: `npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (5 archivos, 37 tests) · `npm run build` ✔ (exit 0 en los cuatro).

## Estado de datos
- Antes: sin acceso a Firestore, Resend ni Blob (no hay `.env.local`).
- Después: igual; ningún comando escribe datos.
- Restaurado: no aplica.

## Resultado
PASS
