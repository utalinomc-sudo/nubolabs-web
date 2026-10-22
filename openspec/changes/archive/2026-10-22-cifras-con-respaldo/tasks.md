## 0. Rama de trabajo

- [x] 0.1 Crear y cambiar a `feature/cifras-con-respaldo` desde `main` actualizado (con HDU-01, 03, 02, 10 y 04 mezcladas); verificar con `git branch --show-current` y que `SECTIONS` ya incluye `confianza`.

## 1. Configuración y lógica pura (design.md, decisiones 1 y 2) — TDD

- [x] 1.1 Agregar a `lib/siteConfig.cifras.test.ts` (deben fallar; archivo aparte como en las HDU anteriores): `normalizeCifras` (no arreglo → `[]`; recorta; conserva incompletos), `visibleCifras` (descarta sin `valor`, `texto` o `fuente`; máximo 4; respeta el orden), `mergeConfig` (sin `content.cifras` → `items: []` y frase por defecto; `frase: ""` guardada se respeta), `defaultSiteConfig().visible.cifras === false`, frase por defecto sin "horas", y `SECTIONS` con `cifras` justo después de `casos`; sumar la frase por defecto a la prueba de vocabulario y `Metrics` al barrido de la portada; verificar que `npm test` falla.
- [x] 1.2 Implementar en `lib/siteConfig.ts` el tipo `Cifra`, `SiteContent["cifras"]`, la entrada de `SECTIONS`, los defaults y las funciones, más la mezcla en `mergeConfig()`; verificar que `npm test` pasa y `npx tsc --noEmit` queda limpio.

## 2. Portada (decisiones 3 y 4)

- [x] 2.1 Eliminar `metrics` de `lib/content.ts` y el bloque de métricas y la nota "cifras referenciales de ejemplo" de `components/landing/UseCases.tsx`; verificar con `grep -rn "metrics\|120 h\|referenciales" app components lib` (sin resultados de código) y `npx tsc --noEmit`.
- [x] 2.2 Escribir `components/landing/Metrics.test.tsx` (`// @vitest-environment jsdom`, debe fallar): con 2 cifras válidas y 1 sin fuente muestra 2 valores y sus fuentes; sin cifras válidas muestra la frase; sin cifras ni frase no renderiza nada.
- [x] 2.3 Implementar `components/landing/Metrics.tsx` según la decisión 3 (solo tokens) y renderizarlo en `app/page.tsx` después de `casos` según `visible.cifras`; verificar que el test de 2.2 pasa y que `npm run build` compila.

## 3. Editor del admin (decisión 5)

- [x] 3.1 Crear `components/admin/config/CifrasEditor.tsx`: ayuda fija, lista de cifras con máximo 4, aviso "No se mostrará: falta la fuente", frase y "Usar los textos recomendados" que solo repone la frase; agregar `cifras` a `MANAGED_KEYS` del contenedor `ConfigEditor.tsx` (si no, el guardado la descarta) y extender su test (`app/admin/(panel)/config/page.tsx` ya pasa `content` completo); verificar en el E2E (N+2.2).

## N. Verificación obligatoria (OBLIGATORIO — el agente lo ejecuta)

- [x] N.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; guardar la salida en `openspec/changes/cifras-con-respaldo/reports/AAAA-MM-DD-paso-N-verificacion.md` (plantilla de `docs/openspec-tasks-mandatory-steps.md` §5). Si algo falla, la tarea sigue abierta.

## N+1. Prueba de endpoints con curl

- No aplica: el cambio no toca `app/api/**`.

## N+2. Prueba E2E con Playwright MCP (OBLIGATORIO — el agente lo ejecuta)

- [x] N+2.1 Con `npm run dev` (defaults), a 1280 px y 375 px: la portada no contiene "+120 h", "−90%", "minutos donde antes había días" ni "referenciales" (`document.body.innerText`); entre los casos de uso y la sección siguiente no hay hueco; sin scroll horizontal a 375 px.
- [x] N+2.2 En `/admin/config` (sesión dev local): el editor de Cifras muestra la ayuda; agregar una cifra sin fuente muestra "No se mostrará: falta la fuente"; no se puede pasar de 4 cifras; "Usar los textos recomendados" repone la frase sin borrar las cifras. El render con la sección activa se cubre con el test de 2.2 y con un cambio **temporal y no commiteado** de los defaults (sección visible con 3 cifras de prueba, una sin fuente) a 1280 y 375 px, revertido después (`git diff`). No se guarda nada desde el preview (Firestore compartido).
- [x] N+2.3 Guardar capturas y pasos en `openspec/changes/cifras-con-respaldo/reports/AAAA-MM-DD-paso-N2-e2e.md`. Sin datos que restaurar.

## N+3. Documentación (OBLIGATORIO)

- [x] N+3.1 Actualizar `docs/data-model.md` (clave `cifras` en `visible`, oculta por defecto, y `content.cifras`), `docs/api-spec.yml` (`SiteContentPartial.cifras`), `docs/ESTADO-PROYECTO.md` (cifras de ejemplo retiradas; cómo publicar la del piloto) y el estado de HDU-06 en `docs/backlog/prospectos-oa.md`; verificar rutas y nombres.

## R. Revisión adversarial (2026-10-22, agente independiente: PASS WITH GAPS, 1 Major)

- [x] R.1 Delta MODIFIED de `landing/contenido-pyme` ("Vocabulario para dueños de negocio" sin la excepción "hasta HDU-06") y propuesta con la capacidad modificada; `openspec validate --strict`.
- [x] R.2 `hasContent()` (al menos una letra o dígito) en `visibleCifras`, el aviso del editor y la frase de `Metrics`; tests con U+200B y otros invisibles, "." y "-"; spec con el escenario "Fuente con un carácter invisible o un signo".
- [x] R.3 Banda de cifras como continuación de la de "Ejemplos" (`spaced` si está oculta), fuente en `inverse-muted`, `role="list"`, columnas para 1 y 3 cifras; casilla de visibilidad con `?? !s.defaultHidden` y tests (desmarcada por defecto, también sin la clave; al marcarla se envía `visible.cifras: true`); test de más de 4 cifras en `Metrics`; spec con el escenario "Frase guardada vacía".
- [x] R.4 Docs: excepción de `cifras` en la visibilidad de `docs/data-model.md`; `docs/frontend-standards.md` sin `metrics` y con `normalizeCifras`/`visibleCifras`/`hasContent`.
- [x] R.5 Verificar con `npm run lint`, `npx tsc --noEmit`, `npm test` (`--maxWorkers=2`), `npm run build` y capturas de contexto (Ejemplos → cifras → Cómo trabajamos) con 1, 3 y 4 cifras y en modo solo frase, a 1280 y 375 px.

## Post-merge (Mauro, en producción)

- [ ] P.1 Confirmar en https://www.nubolabs.cl que ya no aparecen "+120 h" ni "−90%".
- [ ] P.2 Antes de guardar, copiar `config/site` desde la consola de Firebase. Cuando exista el resultado real del piloto de O&A: cargarlo en `/admin/config` → Cifras con su fuente, activar "Cifras de resultados" y guardar; confirmar que se ve después de los casos de uso.
