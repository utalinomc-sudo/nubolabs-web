# HDU — Migrar a Next 16 y firebase-admin 14 (cierre de alertas de seguridad)

> Historia enriquecida el 2026-09-16 a partir del análisis del cambio `actualizar-dependencias-seguras`. Estado: **implementada el 2026-09-16 (pendiente de archivar)** — cambio OpenSpec `openspec/changes/migrar-next-16/`; se cierra con `/opsx:archive` tras la validación del preview. Prioridad: alta (alerta crítica de `next` abierta).

## Original

Actualizar las dependencias de producción que siguen con alertas de seguridad después de `npm audit fix`.

## Enhanced

### Contexto
Tras `actualizar-dependencias-seguras`, `npm audit --omit=dev` mantiene 10 alertas que solo se resuelven con saltos de versión mayor:

| Cadena | Alertas | Versión que las cierra | Exige |
|---|---|---|---|
| `next` 14.2.35 (+ `postcss` anidado) | 1 crítica, 1 alta, 2 moderadas (DoS por deserialización RSC, request smuggling en rewrites, DoS por `remotePatterns`, XSS/lectura de `.map` en postcss) | `next@16.3.5` | Node ≥ 20.9; React 18 sigue soportado (`peer react ^18.2`) |
| `firebase-admin` 12.7.0 (+ `@google-cloud/firestore`, `@google-cloud/storage`, `gaxios`, `google-gax`, `retry-request`, `teeny-request`, `uuid`) | 7 moderadas | `firebase-admin@14.4.0` | Node ≥ 22 (Vercel y local usan 24) |

Todo 14.x y 15.x de Next figura como vulnerable: no hay parche sin migrar.

### Objetivo
Llevar el sitio a Next 16.3.x y firebase-admin 14.x sin cambios funcionales visibles, dejando `npm audit --omit=dev` en 0 alertas, y sustituir `next lint` (eliminado en Next 16) por ESLint 9.

### Alcance
**Incluye**
- `next` → `^16.3.5`, `eslint-config-next` → `^16.3.5`, `eslint` → `^9` con configuración plana (`eslint.config.mjs`, borrar `.eslintrc.json`), script `lint` → `eslint .`.
- `firebase-admin` → `^14.4.0`.
- Mantener React 18.3 (no subir a 19 en este cambio).
- Cambios de código exigidos por Next 15+/16:
  - `lib/adminAuth.ts:21`: `cookies()` pasa a ser asíncrono (`const store = await cookies()`).
  - `params` asíncronos (`{ params }: { params: Promise<{ id: string }> }` y `const { id } = await params`) en `app/admin/(panel)/leads/[id]/page.tsx`, `app/api/admin/leads/[id]/route.ts`, `app/api/admin/leads/[id]/pdf/route.ts`, `app/api/admin/team/[id]/route.ts`.
  - Revisar `next.config.js` (Turbopack por defecto en dev y build; `images.remotePatterns` se mantiene) y `next-env.d.ts` regenerado.
  - Revisar advertencias del codemod oficial `npx @next/codemod@canary upgrade latest` y aplicarlas solo si afectan a este código.
- `docs/frontend-standards.md`, `docs/backend-standards.md` (APIs asíncronas, lint), `docs/project-profile.md` §2 y §5, `README.md`, `docs/ESTADO-PROYECTO.md`.

**No incluye (non-goals)**
- React 19, nuevas features de Next 16 (cache components, `proxy`), cambios de diseño o de comportamiento.
- Migrar `firebase` (cliente) más allá de la 11 actual.

### Verificación
- `npm run lint` (ESLint 9), `npx tsc --noEmit`, `npm test`, `npm run build` (Turbopack) en verde.
- `curl` de todos los endpoints de `docs/api-spec.yml` contra `npm run dev`: públicos con 200/400, protegidos con 401 sin sesión y 200 con sesión dev.
- **E2E completo con Playwright MCP** (sesión con el servidor MCP conectado): landing, `/diagnostico` hasta descargar el PDF, `/equipo`, `/mision-vision`, login en `/admin/login`, leads (detalle, exportar PDF, eliminar con confirmación), CMS y equipo (incluida subida de foto).
- Preview de Vercel revisado por el dueño, incluido el login real con Firebase Auth, antes de mezclar.
- `npm audit --omit=dev` → 0 alertas.

### Definición de terminado
- Producción en Next 16.3.x y firebase-admin 14.x con el sitio idéntico para el visitante y el admin.
- Todos los endpoints responden igual (contratos de `docs/api-spec.yml` sin cambios).
- Documentación y perfil actualizados; `ESTADO-PROYECTO.md` sin pendientes de seguridad.

### Riesgos
- Turbopack como bundler por defecto puede cambiar el manejo de CSS o de `next/font`: mitigación, comparar visualmente el preview con producción; si hay diferencias, `next build --webpack` como respaldo documentado.
- `firebase-admin` 14 cambia tipos de `Firestore`/`Auth`: mitigación, `npx tsc --noEmit` y los `curl` de los endpoints admin.
- La migración de ESLint a configuración plana puede exigir ajustes de reglas: mitigación, partir de la config generada por `eslint-config-next@16` y no añadir reglas nuevas en este cambio.
- Cambio de tamaño medio: hacerlo en una sesión nueva de Claude Code con Playwright disponible, y la revisión adversaria en otra sesión.
