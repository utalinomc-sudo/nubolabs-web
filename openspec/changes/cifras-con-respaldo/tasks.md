## 0. Rama de trabajo

- [ ] 0.1 Crear y cambiar a `feature/cifras-con-respaldo` desde `main` actualizado (con HDU-01, 03, 02, 10 y 04 mezcladas); verificar con `git branch --show-current` y que `SECTIONS` ya incluye `confianza`.

## 1. Configuración y lógica pura (design.md, decisiones 1 y 2) — TDD

- [ ] 1.1 Agregar a `lib/siteConfig.test.ts` (deben fallar): `normalizeCifras` (no arreglo → `[]`; recorta; conserva incompletos), `visibleCifras` (descarta sin `valor`, `texto` o `fuente`; máximo 4; respeta el orden), `mergeConfig` (sin `content.cifras` → `items: []` y frase por defecto; `frase: ""` guardada se respeta), `defaultSiteConfig().visible.cifras === false`, frase por defecto sin "horas", y `SECTIONS` con `cifras` justo después de `casos`; verificar que `npm test` falla.
- [ ] 1.2 Implementar en `lib/siteConfig.ts` el tipo `Cifra`, `SiteContent["cifras"]`, la entrada de `SECTIONS`, los defaults y las funciones, más la mezcla en `mergeConfig()`; verificar que `npm test` pasa y `npx tsc --noEmit` queda limpio.

## 2. Portada (decisiones 3 y 4)

- [ ] 2.1 Eliminar `metrics` de `lib/content.ts` y el bloque de métricas y la nota "cifras referenciales de ejemplo" de `components/landing/UseCases.tsx`; verificar con `grep -rn "metrics\|120 h\|referenciales" app components lib` (sin resultados de código) y `npx tsc --noEmit`.
- [ ] 2.2 Escribir `components/landing/Metrics.test.tsx` (`// @vitest-environment jsdom`, debe fallar): con 2 cifras válidas y 1 sin fuente muestra 2 valores y sus fuentes; sin cifras válidas muestra la frase; sin cifras ni frase no renderiza nada.
- [ ] 2.3 Implementar `components/landing/Metrics.tsx` según la decisión 3 (solo tokens) y renderizarlo en `app/page.tsx` después de `casos` según `visible.cifras`; verificar que el test de 2.2 pasa y que `npm run build` compila.

## 3. Editor del admin (decisión 5)

- [ ] 3.1 Crear el editor de la sección Cifras (componente propio en `components/admin/` o bloque del editor existente): ayuda fija, lista de cifras con máximo 4, aviso "No se mostrará: falta la fuente", frase y "Usar los textos recomendados" que solo repone la frase; agregar `cifras` a `MANAGED_KEYS` del contenedor `ConfigEditor.tsx` (si no, el guardado la descarta) y extender su test; pasar `content.cifras` desde `app/admin/(panel)/config/page.tsx`; verificar en el E2E (N+2.2).

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [ ] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/cifras-con-respaldo/reports/AAAA-MM-DD-paso-N-verificacion.md` (plantilla de `docs/openspec-tasks-mandatory-steps.md` §5). Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl

- No aplica: el cambio no toca `app/api/**`.

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [ ] N+2.1 Con `npm run dev` (defaults), a 1280 px y 375 px: la portada no contiene "+120 h", "−90%", "minutos donde antes había días" ni "referenciales" (`document.body.innerText`); entre los casos de uso y la sección siguiente no hay hueco; sin scroll horizontal a 375 px.
- [ ] N+2.2 En `/admin/config` (sesión dev local): el editor de Cifras muestra la ayuda; agregar una cifra sin fuente muestra "No se mostrará: falta la fuente"; no se puede pasar de 4 cifras; "Usar los textos recomendados" repone la frase sin borrar las cifras. El render con la sección activa se cubre con el test de 2.2 (localmente no se puede guardar sin Firestore) y se revisa en el preview de Vercel.
- [ ] N+2.3 Guardar capturas y pasos en `openspec/changes/cifras-con-respaldo/reports/AAAA-MM-DD-paso-N2-e2e.md`. Sin datos que restaurar.

## N+3. Documentación (OBLIGATORIO)

- [ ] N+3.1 Actualizar `docs/data-model.md` (clave `cifras` en `visible`, oculta por defecto, y `content.cifras`), `docs/api-spec.yml` (`SiteContentPartial.cifras`), `docs/ESTADO-PROYECTO.md` (cifras de ejemplo retiradas; cómo publicar la del piloto) y el estado de HDU-06 en `docs/backlog/prospectos-oa.md`; verificar rutas y nombres.

## Post-merge (Mauro, en producción)

- [ ] P.1 Confirmar en https://www.nubolabs.cl que ya no aparecen "+120 h" ni "−90%".
- [ ] P.2 Cuando exista el resultado real del piloto de O&A: cargarlo en `/admin/config` → Cifras con su fuente, activar "Cifras de resultados" y guardar; confirmar que se ve después de los casos de uso.
