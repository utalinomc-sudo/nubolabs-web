## Context

Ver `proposal.md` (Why). Datos que condicionan el diseño (medidos el 2026-09-15):

- `npm audit fix --dry-run` sin `--force` cambia solo transitivas dentro de sus mayores: `undici` 6.28.1, `fast-xml-parser` 5.11.1, `@google-cloud/storage` 7.22.0, `strnum`, `browserslist`/`caniuse-lite`, `brace-expansion`, `js-yaml`. No toca `next`, `firebase-admin` ni `react`.
- Las alertas de `next` (1 crítica + 2 moderadas + `postcss`) solo se resuelven en `next@16.3.5`: todo 14.x y 15.x figura como vulnerable. Next 16 acepta React 18 (`peer react ^18.2`), exige Node ≥ 20.9 y elimina `next lint`. En el código afecta a `cookies()` síncrono (`lib/adminAuth.ts:21`) y a `params` síncrono en `app/admin/(panel)/leads/[id]/page.tsx`, `app/api/admin/leads/[id]/route.ts`, `app/api/admin/leads/[id]/pdf/route.ts`, `app/api/admin/team/[id]/route.ts`; además `eslint-config-next@16` requiere ESLint 9 con configuración plana.
- Las alertas de `firebase-admin` (`@google-cloud/firestore`, `@google-cloud/storage`, `gaxios`, `google-gax`, `retry-request`, `teeny-request`, `uuid`) se resuelven en `firebase-admin@14.4.0` (Node ≥ 22; Vercel usa 24).
- Las alertas moderadas del SDK cliente (`@firebase/auth` 1.7.x, `@firebase/firestore` 4.7.x, …) vienen de `firebase@10.14.1`; `firebase@11.10.0` es la mayor siguiente. El sitio usa del SDK cliente solo `initializeApp`, `getApps`, `getAuth`, `signInWithEmailAndPassword`.
- Playwright MCP no conectó en esta sesión: no hay navegador automatizado.

## Goals / Non-Goals

**Goals:**
- Cerrar todas las alertas altas y las que no requieren cambios mayores, en un solo commit reversible.
- Dejar el alcance de la migración mayor escrito y priorizado, sin ejecutarla.

**Non-Goals:**
- Migrar Next, React, firebase-admin o ESLint (ver `docs/backlog/migrar-next-16.md`).
- Tocar código de aplicación.

## Decisions

1. **`npm audit fix` sin `--force`.** Es el conjunto exacto de actualizaciones sin salto mayor; el dry-run lo confirma. Alternativa descartada: `npm audit fix --force`, que instalaría Next 16 y firebase-admin 14 de golpe, rompiendo `cookies()`/`params` y `next lint` sin revisión.
2. **`@vercel/blob` a `^2.8.0`.** Menor dentro de la misma mayor; solo se usa `put(key, file, opts)`. Se verifica con `npx tsc --noEmit` (tipos) y build.
3. **`firebase` 10 → 11 solo si hace falta.** Se decide con `npm audit --omit=dev` después del paso 1: si las alertas `@firebase/*` persisten, se sube. Es un salto mayor del SDK cliente, pero la superficie usada es mínima y estable; la prueba de login la hace el dueño en el preview (no hay navegador automatizado ni credenciales locales de Firebase).
4. **La migración mayor va a una HDU aparte (`migrar-next-16`)** con el inventario de archivos afectados ya identificado en Context, para que el próximo `/opsx:ff` parta con alcance cerrado.
5. **Verificación proporcional al riesgo:** además de los cuatro comandos obligatorios, `curl` a los dos endpoints públicos y a las cinco páginas contra `npm run dev` (sin credenciales de Firebase: los leads no persisten, `/admin/login` renderiza). El preview de Vercel es la prueba visual final antes de mezclar.
6. **Rollback:** revertir el commit (restaura `package.json` y `package-lock.json`); no hay migraciones ni datos.

## Risks / Trade-offs

- [Una transitiva actualizada cambia comportamiento en runtime de Vercel (por ejemplo `undici` en `fetch` a Resend)] → `undici` 6.28 es un parche dentro de la misma mayor; se prueba `POST /api/leads` en local (que invoca `sendLeadNotification` con `RESEND_API_KEY` ausente → `skipped`) y el dueño valida un lead real en el preview si lo desea.
- [`firebase@11` cambia el comportamiento de `signInWithEmailAndPassword` o de `getIdToken`] → superficie mínima; validación manual de login en el preview antes de mezclar; rollback trivial.
- [`npm audit` sigue mostrando alertas y genera confusión] → el reporte del cambio y `ESTADO-PROYECTO.md` listan explícitamente cuáles quedan y por qué (dependen de Next 16 / firebase-admin 14).
- [Build cache de Vercel con lockfile nuevo] → Vercel reinstala según `package-lock.json`; si el build falla, no se despliega y se investiga en la rama.

## Migration Plan

Sin migración de datos. Despliegue normal: preview automático de la rama → revisión → merge a `main`. Rollback: `git revert` del commit.
