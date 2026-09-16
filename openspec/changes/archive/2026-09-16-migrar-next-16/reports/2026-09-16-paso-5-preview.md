# Reporte — paso 5: validación del preview de Vercel (tarea 5.2)

- Fecha: 2026-09-16
- Cambio: migrar-next-16
- Rama: `feature/migrar-next-16`
- Preview validado: deployment del commit `385accd` ("Fix: cargar firebase-admin/auth de forma perezosa y protegida…"), **redesplegado sin caché de build** ("Redeploy" con "Use existing Build Cache" desmarcado) con los ajustes actuales del proyecto
- Ejecutado por: el dueño (Mauricio) en su navegador con las credenciales reales; resultado registrado por Claude Code (Fable 5.1)

## Historial de intentos

| Intento | Commit | Resultado | Causa / acción |
|---|---|---|---|
| 1.º | `2fafb57` | Error de servidor en todas las páginas dinámicas | Sin acceso a los logs en ese momento; se endureció la lectura de `FIREBASE_PRIVATE_KEY` (reporte 2b) |
| 2.º | `fbee74f` | Mismo error | Log de funciones: `Failed to load external module firebase-admin-…/auth: ERR_REQUIRE_ESM` (`jwks-rsa` → `jose` 6 solo ESM). Se cargó `firebase-admin/auth` de forma perezosa y protegida (reporte 2c) |
| 3.º | `385accd` + redeploy sin caché | **Funciona** | Node.js Version en Vercel **ya estaba en 24.x** según el dueño. Como en Node 24 el `require()` de ESM funciona (comprobado en local con el mismo build), el fallo anterior no se explica por el ajuste de versión; la hipótesis más plausible es una caché de build heredada de los despliegues con Next 14 / firebase-admin 12 (Vercel reutiliza `node_modules` y artefactos entre builds) que el redeploy sin caché descartó. No se puede confirmar desde fuera. La carga perezosa y protegida de `firebase-admin/auth` sigue siendo valiosa: si reapareciera, el sitio público seguiría en pie y el log diría `[firebase-admin] no se pudo cargar firebase-admin/auth …` |

## Lista de comprobación (resultado informado por el dueño)

**Sitio público (escritorio y móvil)**
- [x] `/` se ve igual que producción: hero, secciones, menú "Nosotros", formulario de contacto. Contacto de prueba enviado → mensaje de éxito; aviso por correo y lead en el panel.
- [x] `/diagnostico`: cuestionario completo, estimador, envío y descarga del PDF.
- [x] `/equipo` y `/mision-vision` muestran el contenido real del CMS.
- [x] Sin diferencias visibles respecto a producción ("nada raro").

**Panel (login real con Firebase Auth → firebase-admin 14)**
- [x] `/admin/login` con el usuario real → entra al panel (dashboard).
- [x] Detalle del lead de prueba y "Exportar PDF" (ficha descargada).
- [x] "Eliminar" el lead de prueba con la confirmación "eliminar" (datos de prueba restaurados).
- [x] CMS y/o foto de integrante: guardar y revertir / subir foto.

**Vercel**
- [x] Node.js Version = **24.x** (ya estaba así antes de la migración).
- [x] Build del preview en verde (Next 16.3.5 con Turbopack) y recorrido completo sin errores.

## Estado de datos
- El dueño creó un lead de prueba (contacto y/o diagnóstico) y lo eliminó desde el panel; los cambios del CMS se revirtieron.
- Restaurado: sí (informado por el dueño).

## Resultado
**PASS** — el preview con Next 16.3.5, ESLint 9 y firebase-admin 14.4 funciona igual que producción, incluido el login real y las operaciones del panel. Queda libre el camino para `/adversarial-review`, `/opsx:archive` y la mezcla a `main`.

## Tras el merge (tarea 5.3, añadida el 2026-09-16 tras `/adversarial-review`)

El primer deploy de producción desde `main` reutilizará la caché de build de los despliegues con Next 14, la misma condición sospechosa de los intentos 1.º y 2.º. Acción del dueño: redesplegar producción **sin caché de build** ("Redeploy" con "Use existing Build Cache" desmarcado), entrar en `/admin/login` con el usuario real y abrir el detalle de un lead. Si respondiera `500 Auth no configurado`, revisar el log de funciones (aviso `[firebase-admin] no se pudo cargar firebase-admin/auth`) y repetir el redeploy sin caché; el sitio público no depende de ese módulo y seguiría en pie.

| Fecha | Deploy de producción | Redeploy sin caché | Login real | Detalle de lead | Resultado |
|---|---|---|---|---|---|
| 2026-09-16 | `0eae29b`, deploy automático **con caché** tras el merge (comprobado por el agente con `curl`, sin credenciales) | no (aún) | `POST /api/admin/session` con token de prueba → `500 {"error":"Auth no configurado en el servidor."}` (dos veces, con la función ya caliente) | — | **Se confirma el riesgo previsto.** Sitio público en pie con Firestore: `/` 200 con el marcador de Next 16, `/equipo` 200 con los 4 integrantes reales, `/admin/login` 200, `/admin` sin cookie → 307 al login. Solo falla la carga de `firebase-admin/auth` (mismo síntoma que los previews 1 y 2). Queda el redeploy sin caché por el dueño |
| 2026-09-16 | `p3qmsqh55` y `a0ql89o9w`, **redeploys sin caché de build** hechos por el dueño (confirmado en los build logs: "Skipping build cache") | sí, dos veces | `500 Auth no configurado` (intento real del dueño a las 14:30 y pruebas del agente) | — | **La caché no era la causa.** Log completo vía CLI de Vercel: `ERR_REQUIRE_ESM: require() of ES Module …/jose/dist/webapi/index.js from …/jwks-rsa/src/utils.js`, con el proyecto en Node 24.x y configuración idéntica (fluid, iad1, 24.x) al preview que funcionó. Corrección en `main`: `overrides` de `jose` a 5.x (CommonJS) bajo `jwks-rsa` + test guardián `lib/firebaseAdminAuthDeps.test.ts`; simulacro local sin `require(esm)`: login 401 (módulo cargado) en vez de 500 |
| 2026-09-16 14:53 | deploy automático del fix `a1ea8a7` (`overrides` de jose) | no necesario | `POST /api/admin/session` con token falso → **401** `{"error":"No se pudo crear la sesión."}` (módulo de auth cargado; antes 500) · `/` 200 · `/equipo` con los 4 integrantes · `/admin` sin cookie → 307 | revisado por el dueño | **PASS.** El dueño entró con su usuario real y revisó el panel en producción el 2026-09-16 ("Está ok"); pendiente 11 de `ESTADO-PROYECTO.md` cerrado y tarea 5.3 marcada |
