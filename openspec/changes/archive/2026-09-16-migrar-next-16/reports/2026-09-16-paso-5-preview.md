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
| — | — | — | — | — | **pendiente** (se completa cuando el dueño lo informe) |
