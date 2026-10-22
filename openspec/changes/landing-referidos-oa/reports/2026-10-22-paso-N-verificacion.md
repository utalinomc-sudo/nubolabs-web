# Reporte — paso N: verificación obligatoria

- Fecha: 2026-10-22
- Cambio: landing-referidos-oa (HDU-07)
- Rama: `feature/landing-referidos-oa` (desde `main` 48861b9)
- Ejecutado por: Claude Code (Opus 5.5), sesión de apply
- Entorno: Windows 11, Node 24.16, sin `.env.local`; servidor de desarrollo detenido durante el build

## Comandos

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ sin errores ni avisos (exit 0) |
| `npx tsc --noEmit` | ✔ sin errores (exit 0) |
| `npm test` (`npx vitest run --maxWorkers=2`) | ✔ Test Files 41 passed · **Tests 314 passed** (exit 0) |
| `npm run build` | ✔ compilado con Turbopack; rutas `/` y `/oa` dinámicas (exit 0) |
| `openspec validate landing-referidos-oa --strict` | ✔ válido |

`--maxWorkers=2`: la máquina sigue cargada por procesos de otros proyectos.

Tests nuevos o ampliados (fallaron antes de implementar, salvo los marcados como regresión):
- `lib/leads.test.ts` (+3): `referral` "oa" (y con espacios) se guarda y `source` no cambia; desconocido, vacío, no texto, arreglo, objeto o ausente se omite sin error (regresión); el referido no cambia `source` ni `meta` del diagnóstico.
- `lib/leadOptions.test.ts` (+1): `REFERRALS = ["oa"]`, etiqueta "O&A", `isReferral` exacto.
- `lib/referral.test.ts` (6): `parseReferral` (texto, espacios, primer elemento de arreglo; rechazos), guardar y leer el referido, valor guardado desconocido ignorado, almacenamiento bloqueado sin errores, cerrar la franja sin borrar el referido.
- `components/landing/ContactForm.test.tsx` (+1) y `components/diagnostico/DiagnosticoFlow.test.tsx` (+1, y sin `referral` en el caso normal): el referido se lee al enviar.
- `lib/siteConfig.referidos.test.ts` (3): textos por defecto, fuera de `SECTIONS`, override parcial, vacíos y formas raras → default.
- `components/admin/ConfigEditor.test.tsx` (+1): región "Franja de referidos (O&A)", "Usar los textos recomendados" sin guardar y payload solo con `referidos`; la guarda de `MANAGED_KEYS` exigió la clave.
- `components/landing/ReferralBanner.test.tsx` (6): textos y botón de 44 px, cerrar (marca la pestaña y conserva el referido), cerrada antes → oculta, almacenamiento bloqueado, hidratación sin avisos con la franja cerrada, `ReferralTracker` guarda el referido.
- `lib/leadStats.test.ts` (7): escenario de la spec (3/2/3), fechas inválidas o futuras, borde de 30 días, lead sin `source`, filtros de la lista y orígenes desconocidos.
- `lib/leadSummary.test.ts` (+1): `leadOriginText` y `leadReferralLabel`. `lib/leadReport.test.ts` (+1): ficha de un lead referido.
- `components/landing/Home.vocabulario.test.tsx`: la franja entra al barrido de vocabulario.

## Decisiones tomadas durante el apply (registradas en `design.md`, `tasks.md` y la spec)
- Franja antes del menú (como la referencia); `/?ref=oa` también con `noindex` (`generateMetadata`).
- Estado cerrado con `useSyncExternalStore` (sin `setState` en un efecto); textos fijos en `referralLabels` (`lib/content.ts`); `IconX` nuevo.
- CMS con `pickText`; editor `ReferidosEditor.tsx`; `referidos` en `MANAGED_KEYS`.
- `leadOriginText`/`leadReferralLabel` en `lib/leadSummary.ts` para correo, detalle y ficha; log de la API con `referral`.

## Estado de datos
- Sin acceso a Firestore, Resend ni Blob; ningún comando escribe datos.

## Re-verificación tras la revisión adversarial (sección R de `tasks.md`)

`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (`--maxWorkers=2`, **43 archivos, 323 tests**) · `npm run build` ✔ · `openspec validate landing-referidos-oa --strict` ✔. Detalle en `2026-10-22-adversarial-review.md`.

## Resultado
PASS
