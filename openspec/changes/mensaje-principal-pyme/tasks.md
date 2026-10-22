## 0. Rama de trabajo

- [x] 0.1 Crear y cambiar a `feature/mensaje-principal-pyme` desde `main` actualizado; verificar con `git branch --show-current`.

## 1. Tokens y primitivas de diseño (design.md, decisión 1)

- [x] 1.1 Extender `tailwind.config.ts` con los tokens de la tabla de la decisión 1 (`navy.950/800/700`, `brand.dark/deep/50/100/light-50`, `accent.strong/50`, `success.*`, `ink.faint`, `line.strong`), las sombras `lift` y `form` y el keyframe `feedIn` con su `animation`; verificar que `npm run build` compila y que una búsqueda de `bg-navy`, `text-brand`, `border-line` en `components/` sigue resolviendo (sin clases rotas).
- [x] 1.2 Agregar a `app/globals.css` las primitivas `.text-gradient-brand` y `.bg-dots`; verificar en el reporte del paso 1 el contraste de `brand-deep` (`#0A8FD6`) sobre blanco ≥ 3:1.

## 2. Configuración pura y testeable (decisiones 2 y 3) — TDD

- [x] 2.1 Escribir `lib/siteConfig.test.ts` (debe fallar): `normalizeTags` (no arreglo → `null`; recorta; descarta vacíos y no-strings; máximo 3; vacío → `null`), `mergeConfig` (sin `content.hero` → defaults; override parcial solo de `title`; `tags: []` y `tags` ausente → tags por defecto; 5 tags → 3) y los defaults del hero (título y bajada sin "horas", "IA", "nube", "automatización"); verificar que `npm test` falla por falta del módulo.
- [x] 2.2 Crear `lib/siteConfig.ts` moviendo tipos, `SECTIONS`, `defaultSiteConfig()`, `mergeConfig()` y `renderHighlight()` desde `lib/site.ts`, agregar `normalizeTags()` y `hero.tags`, y dejar en `lib/site.ts` solo lo de Firestore más re-exports; verificar que `npm test` pasa y que `npx tsc --noEmit` no reporta imports rotos.
- [x] 2.3 Cambiar los defaults del hero (eyebrow, título con `**trabaje para ti**`, bajada, CTAs y `tags`) según la spec `landing/hero` y retirar `heroTags` de `lib/content.ts`; verificar con `npm test` (test de vocabulario) y `grep -rn "heroTags" components lib app` sin resultados.

## 3. Hero y panel "Tu negocio hoy" (decisión 4)

- [x] 3.1 Agregar a `components/icons.tsx` `IconWallet`, `IconChat`, `IconPackage`, `IconCheck`, `IconBell`, `IconUsers`, `IconCalendar`, `IconChart` con el estilo existente; verificar con `npx tsc --noEmit`.
- [x] 3.2 Agregar `heroFeed` (5) y `heroFeedMore` (7) a `lib/content.ts` con los textos de la referencia (`docs/design/propuesta-web-hdu-08.html`, `#feed` y `pool`), sin cifras ni nombres de clientes; verificar por lectura en el reporte.
- [x] 3.3 Escribir `components/landing/HeroPanel.test.tsx` (`// @vitest-environment jsdom`, debe fallar): renderiza 5 tareas iniciales; con `prefers-reduced-motion: reduce` no programa intervalos (`vi.useFakeTimers` + avanzar 10 s → mismas 5 tareas); con movimiento permitido y el panel visible (mock de `IntersectionObserver`) entra una tarea nueva arriba y siguen siendo 5.
- [x] 3.4 Implementar `components/landing/HeroPanel.tsx` (`"use client"`) según la decisión 4 (rotación condicionada, `feedIn`, alto reservado, ocultar 5.º ítem ≤ 640 px, `figure` con `aria-label`, tarjetas flotantes); verificar que el test de 3.3 pasa.
- [x] 3.5 Reescribir `components/landing/Hero.tsx` con el layout de la referencia (pill con check, `h1` con resalte `.text-gradient-brand`, bajada, CTAs `#contacto` y `#modelo` con `min-h-11`, etiquetas con check en `success`, `.bg-dots` y brillo de fondo) y eliminar `components/landing/HeroGraphic.tsx`; verificar `npm run build` y que `grep -rn "HeroGraphic"` no devuelve código.

## 4. Navegación y metadatos (decisiones 5 y 7)

- [x] 4.1 En `components/landing/Nav.tsx`, botón "Diagnóstico gratis" → `/#contacto` en escritorio y menú móvil; verificar en el E2E (paso N+2) que desde `/equipo` lleva al formulario de la portada.
- [x] 4.2 Actualizar `description` y `openGraph.description` en `app/layout.tsx` (decisión 7); verificar con `curl -s http://localhost:3000 | grep -E 'name="description"|og:description'` que no contienen "horas".

## 5. Admin (decisión 6)

- [x] 5.1 En `components/admin/ConfigEditor.tsx`: importar tipos y `defaultSiteConfig` desde `lib/siteConfig.ts` (quitar las interfaces duplicadas), agregar los campos "Etiqueta 1/2/3" del hero y el botón "Usar los textos recomendados" que carga los defaults del hero en el formulario sin guardar; ajustar `app/admin/(panel)/config/page.tsx` si cambia la forma de `initialContent`. Verificar en el E2E que el botón rellena los campos (el guardado se valida en el preview de Vercel, porque localmente no hay Firebase).

## 6. Correcciones de la revisión adversarial (2026-10-22, veredicto FAIL: 2 Major)

- [x] 6.1 (Major) Panel sin alto fijo en px: filas de alto constante (título `line-clamp-1` desde `sm`; en móvil `line-clamp-2` + `min-h-[2.7em]`; detalle `truncate`) y tarjeta con alto natural (design.md decisión 4). Verificar en el E2E (N+2.5) que a 320, 375, 639, 640, 1024, 1093, 1100, 1280 y 1440 px, y a 1280/375 px con letra base de 20 px, ninguna tarea visible queda cortada y el alto no cambia al rotar.
- [x] 6.2 (Major) Token `success.strong` (`#0F7A43`) y "Piloto automático" con `text-success-strong`; medir el contraste de todo texto del hero y del panel y corregir la tabla del reporte del paso N.
- [x] 6.3 Escribir en `lib/siteConfig.test.ts` (deben fallar): `content.hero` como texto, `title: null`, `subtitle` objeto y `ctaPrimary: "  "` → defaults en esos campos y sin claves extra. Implementar `pickText` en `mergeConfig` para los campos de texto del hero; verificar que `npm test` pasa.
- [x] 6.4 Escribir `components/landing/Hero.test.tsx` (`// @vitest-environment jsdom`, debe fallar): hrefs `#contacto` y `#modelo` por defecto; con `contactVisible={false}` el principal va a `/diagnostico`; con `processVisible={false}` no hay botón secundario; etiquetas renderizadas; resalte con `.text-gradient-brand`; sin ícono de flecha extra si el texto termina en "→". Implementar las props en `Hero.tsx` y pasarlas desde `app/page.tsx`; verificar que el test pasa.
- [x] 6.5 Escribir `components/landing/Nav.test.tsx` (jsdom, debe fallar): "Diagnóstico gratis" → `/#contacto`, con `showContact={false}` → `/diagnostico` (escritorio y menú móvil), botón "Abrir menú" con clase de 44 px. Implementar `showContact` en `Nav.tsx` y pasarlo desde `app/page.tsx`, `app/equipo/page.tsx` y `app/mision-vision/page.tsx`; verificar que el test pasa.
- [x] 6.6 Sumar a `HeroPanel.test.tsx` (debe fallar): si "reducir movimiento" se activa con la página abierta (evento `change`), la rotación se detiene; y con `document.hidden` no entra tarea nueva. Implementar el listener en `HeroPanel.tsx`; verificar que el test pasa.
- [x] 6.7 `ConfigEditor.tsx`: ocultar el aviso "Textos recomendados cargados" al guardar con éxito; verificar por lectura y en el E2E.
- [x] 6.8 Docs: `docs/frontend-standards.md` (resalte con `.text-gradient-brand`, eyebrow del hero, `success` no se usa para texto chico, `success-strong`), `docs/backlog/prospectos-oa.md` (el CTA lleva a `#contacto`, no `#agendar`) y la deuda de "pausar animación" (WCAG 2.2.2) en `docs/ESTADO-PROYECTO.md`.

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [x] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/mensaje-principal-pyme/reports/AAAA-MM-DD-paso-N-verificacion.md` (plantilla de `docs/openspec-tasks-mandatory-steps.md` §5). Si algo falla, la tarea sigue abierta.
- [x] N.2 Repetir los 4 comandos tras las correcciones de la sección 6 y agregar el resultado al reporte del paso N.

## N+1. Prueba de endpoints con curl

- No aplica: el cambio no toca `app/api/**` (el guardado usa `POST /api/admin/config` sin modificarlo).

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [x] N+2.1 Con `npm run dev`, a 1280 px y 375 px: portada con los textos por defecto; clic en "Quiero mi diagnóstico gratis" y en "Diagnóstico gratis" del menú baja a `#contacto`; desde `/equipo` el botón del menú lleva a `/#contacto`; el panel rota (esperar 4 s y comparar la primera tarea) sin mover el contenido; sin scroll horizontal a 375 px (`scrollWidth <= innerWidth`); botones ≥ 44 px de alto.
- [x] N+2.2 Emular `prefers-reduced-motion: reduce` y comprobar que el panel no rota tras 8 s.
- [x] N+2.3 En `/admin/config` (sesión dev local), pulsar "Usar los textos recomendados" y comprobar que los campos del hero y las 3 etiquetas se rellenan. Sin datos que restaurar (localmente no hay Firestore).
- [x] N+2.4 Guardar capturas y pasos en `openspec/changes/mensaje-principal-pyme/reports/AAAA-MM-DD-paso-N2-e2e.md`.
- [x] N+2.5 Re-E2E tras la sección 6: anchos de 6.1 con y sin letra base de 20 px (tareas completas, alto estable al rotar, sin scroll horizontal), contraste de "Piloto automático", menú móvil con botón de 44 px, "reducir movimiento" activado con la página abierta, y aviso del admin. Agregar resultados y capturas al reporte del paso N+2.

## N+3. Documentación (OBLIGATORIO)

- [x] N+3.1 Actualizar `docs/data-model.md` (`content.hero.tags`), `docs/api-spec.yml` (`SiteContentPartial.hero.tags`), `docs/frontend-standards.md` (tokens nuevos, primitivas `.text-gradient-brand` y `.bg-dots`, `lib/siteConfig.ts` en la estructura), `docs/ESTADO-PROYECTO.md` (fecha, qué cambió, paso post-merge) y el estado de HDU-01 en `docs/backlog/prospectos-oa.md`; verificar que las rutas y nombres citados existen.

## Post-merge (Mauro, en producción)

- [ ] P.1 Tras el deploy, en `/admin/config` → Hero: "Usar los textos recomendados" → revisar → "Guardar"; confirmar en https://www.nubolabs.cl que el hero muestra el título nuevo.
