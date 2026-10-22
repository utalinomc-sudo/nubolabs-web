# Revisión adversarial — landing-referidos-oa (HDU-07)

- Fecha: 2026-10-22
- Revisor: agente independiente (skill `adversarial-review`), sobre el working tree de `feature/landing-referidos-oa` antes del commit
- Veredicto: **PASS WITH GAPS** (sin Blocker ni Major; 9 Minor y 2 preguntas)
- Incidente del revisor: copió por error un script temporal a la raíz del repo y lo borró enseguida; se confirmó que `git status` quedó igual (48 entradas) y que no hay archivos temporales.

## Verificación propia del revisor
Suite completa (41 archivos, 314 tests), `npx tsc --noEmit` y `npm run lint` limpios. Revisó inyección por `referral` (solo se guarda el literal `"oa"`; correo escapado), WinAnsi en la ficha, `?ref=` y `?origen=` raros, conteo de 30 días en milisegundos, contraste (≥ 7,8:1) y que `maybeSendClientReport` no cambia.

## Hallazgos y resolución

| Severidad | Hallazgo | Resolución |
|---|---|---|
| Minor | La spec decía que la franja cerrada "no vuelve a mostrarse", pero al recargar se ve hasta hidratar | Spec precisada ("una vez cargada la página") y design.md §5 explica por qué no se usa un script inline (atributo en `<html>` = diferencia de hidratación) |
| Minor | `noindex` + `canonical: "/"` en `/oa` y `/?ref=oa` (señales contradictorias) | Solo `noindex, follow`; `/` sin referido declara `canonical: "/"`; tests en `app/page.test.ts` |
| Minor | Desde `/oa`, menú, logo y pie llevan a `/` y la franja desaparece | Aceptado y documentado (spec, design §3, ESTADO); escenario "Del menú a la portada" y E2E: `/oa` → "Diagnóstico gratis" del menú → envío con `referral: "oa"` |
| Minor | "Diagnóstico referido recibe su informe" sin prueba directa | `app/api/leads/route.test.ts`: se guarda con `referral` y `source`, `sendClientReport` se llama una vez y el aviso lleva el referido; referido no permitido se guarda sin `referral` |
| Minor | Sin pruebas de `generateMetadata` ni de la composición de `LandingPage` | `app/page.test.ts` y `components/landing/LandingPage.test.tsx` (orden de secciones, franja antes del menú, `main` idéntico con y sin referido) |
| Minor | El filtro de la lista mira 200 leads sin decirlo | "N entre los últimos 200" y estado vacío con el mismo aviso |
| Minor | El borrador de `/privacidad` no mencionaba el referido | Línea nueva en "Qué datos guardamos" (test); P.5 para el texto guardado en producción y la validación legal |
| Minor | Documentación desactualizada (design §7, tarea 1.2, resúmenes de superficies, nota del dashboard) | Corregida; nota del dashboard con `/?ref=oa`; `/oa` en `docs/frontend-standards.md` §1 y `docs/project-profile.md` §12 |
| Minor | El foco al cerrar no tenía prueba | Test en `ReferralBanner.test.tsx` (pasa al primer enlace del menú) |
| Pregunta | `/OA` daría 404: ¿redirigir? | Probado y **descartado**: las redirecciones de Next no distinguen mayúsculas y `/oa` se redirigía a sí mismo en bucle (lo detectó el curl de re-verificación). P.2 pide el link exacto en minúsculas y probarlo desde un correo de prueba |
| Pregunta | Leads de prueba desde `/oa` cuentan como O&A | P.4: borrarlos después en el admin; anotado en ESTADO |

## Re-verificación (sección R de `tasks.md`)
`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (`--maxWorkers=2`, **43 archivos, 323 tests**) · `npm run build` ✔ · `openspec validate landing-referidos-oa --strict` ✔. Curl: `/oa` 200 con `noindex, follow` y sin canónica; `/?ref=oa` igual; `/` y `/?ref=otro` con canónica y sin `noindex`; `/OA` 404 (sin redirección). E2E del camino por el menú en verde. Los tests de metadatos y de privacidad fallaron antes del arreglo; los de la API, `LandingPage` y el foco son de cobertura y pasaron desde el inicio.
