## Why

`npm audit --omit=dev` (2026-09-15) reporta 21 alertas en dependencias de producción (1 crítica, 3 altas, 17 moderadas). Parte de ellas se cierran sin cambiar versiones mayores ni código; conviene cerrarlas ya y dejar aislada, como cambio aparte, la migración mayor que exige la alerta crítica de Next.js.

## What Changes

- Se ejecuta `npm audit fix` (sin `--force`): actualiza transitivas dentro de sus versiones mayores actuales, entre ellas `undici` 6.27 → 6.28 (2 alertas altas), `fast-xml-parser` 5.9 → 5.11 (alta), `@google-cloud/storage` 7.21 → 7.22 y utilidades menores.
- `@vercel/blob` `^2.6.1` → `^2.8.0` (menor; la API `put` usada en `app/api/admin/upload/route.ts` no cambia).
- Condicional: si tras el fix persisten las alertas moderadas del SDK cliente (`@firebase/auth`, `@firebase/firestore`, …), `firebase` `^10.12.2` → `^11.10.0`. El sitio usa solo `initializeApp`, `getApps`, `getAuth` y `signInWithEmailAndPassword` (`lib/firebase.ts`, `app/admin/login/page.tsx`), estables entre 10 y 11.
- Se documenta la migración pendiente (Next 16.3.5 + firebase-admin 14.4 + ESLint 9) como HDU en `docs/backlog/migrar-next-16.md` y se actualiza el pendiente 6 de `docs/ESTADO-PROYECTO.md`.
- Sin cambios en código de aplicación ni en variables de entorno.

### Non-goals

- Subir de versión mayor `next`, `react`, `react-dom`, `firebase-admin` o `eslint-config-next` (cambio `migrar-next-16`, pendiente).
- Cambiar código de aplicación, configuración de Next o de ESLint.
- Actualizar devDependencies más allá de lo que toque `npm audit fix`.

## Capabilities

### New Capabilities
<!-- Ninguna: cambio de herramientas/dependencias sin comportamiento nuevo. `.openspec.yaml` declara `skip_specs: true`. -->

### Modified Capabilities
<!-- Ninguna. -->

## Impact

- **Código:** solo `package.json` (rangos de `@vercel/blob` y, condicionalmente, `firebase`) y `package-lock.json`.
- **Comportamiento:** ninguno esperado. Riesgo residual en el login del admin si se sube `firebase` a 11 (SDK cliente) y en la subida de fotos con `@vercel/blob` 2.8.
- **Verificación:** `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`; `curl` a `POST /api/leads` y `POST /api/diagnostico/report` y a las páginas `/`, `/diagnostico`, `/equipo`, `/mision-vision`, `/admin/login` contra `npm run dev`. Playwright MCP no está disponible en esta sesión: la revisión visual y, si aplica, el login la hace el dueño en el preview de Vercel antes de mezclar.
- **Documentación a actualizar (documentation-standards §3):** `docs/ESTADO-PROYECTO.md` (pendiente 6 y sección de dependencias), `docs/backlog/migrar-next-16.md` (nueva HDU), `docs/project-profile.md` §2 si cambia la versión mayor de `firebase`.

## Criterios de aceptación (escenarios)

- **Cuando** se ejecuta `npm audit --omit=dev` tras el cambio, **entonces** las alertas restantes pertenecen exclusivamente a las cadenas que exigen salto mayor: `next`/`postcss` (crítica + alta, solo se resuelven en Next 16) y `firebase-admin`/`@google-cloud/*`/`gaxios`/`google-gax`/`retry-request`/`teeny-request`/`uuid` (moderadas, solo en firebase-admin 14), documentadas en la HDU de migración. Ninguna alerta alta queda fuera de esas cadenas.
- **Cuando** se ejecutan lint, typecheck, `npm test` y build, **entonces** pasan igual que antes del cambio.
- **Cuando** se envía con `curl` un lead válido y uno inválido a `POST /api/leads` en local, **entonces** responde `{ ok: true, persisted: false }` y `400` respectivamente, como antes.
- **Cuando** se despliega el preview de Vercel de la rama, **entonces** las páginas públicas se ven igual y, si `firebase` subió a 11, el dueño puede iniciar sesión en `/admin/login`.
