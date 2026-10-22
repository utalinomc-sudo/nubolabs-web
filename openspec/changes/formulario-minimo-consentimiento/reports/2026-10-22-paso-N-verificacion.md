# Reporte — paso N: verificación obligatoria

- Fecha: 2026-10-22
- Cambio: formulario-minimo-consentimiento
- Rama: `feature/formulario-minimo-consentimiento`
- Ejecutado por: Claude Code (Opus 5.5), sesión de apply
- Entorno: Windows 11, Node 24.16, npm 11.13, sin `.env.local`

## Comandos

| Comando | Resultado |
|---|---|
| `npm run lint` | ✔ sin errores ni avisos (exit 0) |
| `npx tsc --noEmit` | ✔ sin errores (exit 0) |
| `npm test` | ✔ Test Files 12 passed · **Tests 94 passed** (exit 0) |
| `npm run build` | ✔ build con Turbopack; ruta nueva `ƒ /privacidad` (exit 0) |

Tests nuevos o ampliados (TDD: cada archivo falló antes de implementar):
- `lib/leadOptions.test.ts` (5): claves y etiquetas de objetivos y rubros, helpers, `describeGoals` ("vender más y cobrar a tiempo", 3 temas con comas e "y", "Otra cosa" sin tema) y textos de consentimiento.
- `lib/leads.test.ts` (17): `isValidPhone` (8 a 15 dígitos), `isValidEmail`, honeypot, `safeScheduleUrl` (solo http/https) y `normalizeLead`: cuerpo no objeto, nombre/correo, WhatsApp, `contactConsent` estrictamente `true`, prueba del consentimiento con hora del servidor, `consentText` del cliente ignorado, objetivos únicos y válidos, rubro válido, origen desconocido → `landing`, truncado, `meta` solo objeto plano, campos desconocidos descartados.
- `components/landing/ContactForm.test.tsx` (11, jsdom): pasos, "Volver", chips con `aria-pressed`, validación al salir del campo, envío vacío (3 errores + foco en nombre, sin `fetch`), sin consentimiento (foco en la casilla, sin `fetch`), cuerpo enviado, error 500 conservando datos, éxito con y sin URL de agenda.
- `lib/siteConfig.test.ts` (+3): `content.privacidad` por defecto, campos vacíos → borrador, texto propio.
- `lib/leadSummary.test.ts` (5): rubro (lista o rubro libre antiguo), objetivos, novedades, fecha en hora de Chile, filas para el equipo.
- `lib/leadReport.test.ts` (2): la ficha PDF se genera (`%PDF-`) para un lead nuevo y uno antiguo.

## Decisiones tomadas durante el apply
- **Pantalla de éxito sin agenda** (spec y design actualizados antes de implementar): la spec pedía siempre "Ahora elige el día y la hora." aunque no hubiera agenda (hoy no hay `NEXT_PUBLIC_SCHEDULE_URL`). Sin URL, el título es "¡Listo, {nombre}! Te escribimos en menos de 24 horas." y los pasos hablan de que escribimos nosotros.
- **Resumen para el equipo en un módulo puro** (`lib/leadSummary.ts`): lo comparten el correo, la ficha PDF y el admin, y permite testear lo que antes solo se veía en el correo (servidor).
- **Etiquetas de novedades:** "Acepta novedades" / "Sin novedades" en correo, PDF y admin (texto de la spec; el design decía "Sí, aceptó" / "No" solo para el correo).
- **Log sin PII:** además del aviso sin Firebase, el log del informe al cliente ya no imprime el correo.
- **Ficha PDF:** el mensaje se imprime para leads del formulario; en los del diagnóstico solo si no hay áreas (allí es un resumen automático que repite las áreas).
- **Formulario:** `ContactSuccess.tsx` separado (riesgo del design: componente > 300 líneas); `scroll-mt` en los campos para que el menú fijo no tape el campo enfocado.

## Estado de datos
- Antes / después: sin acceso a Firestore, Resend ni Blob (no hay `.env.local`); ningún comando escribe datos.
- Restaurado: no aplica.

## Re-verificación tras la revisión adversarial (tarea 8.7)

Con el servidor detenido: `npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (**15 archivos, 122 tests**) · `npm run build` ✔ (exit 0 en los cuatro).

Tests nuevos (sección 8 de `tasks.md`): paridad navegador/servidor y límites en `lib/leads.test.ts` (+11; el caso "Mi WhatsApp es el +56 9 1234 5678" y los de `meta` fallaron antes de implementar), `components/diagnostico/DiagnosticoFlow.test.tsx` (4; 2 fallaron antes), `ContactForm.test.tsx` (+2; ambos fallaron antes), `app/api/leads/route.test.ts` (5; cubren el comportamiento existente del handler, pasaron de entrada), `lib/pdfText.test.ts` (4) y `lib/leadReport.test.ts` (+2, fallaron con "WinAnsi cannot encode" antes de `winAnsiDeep`), y `siteConfig.test.ts` (Vercel y la Agencia en el borrador; falló antes).

## Detalle de "Otra cosa" y "Otro" (tareas 9.x, pedido de Mauro)

`npm run lint` ✔ · `npx tsc --noEmit` ✔ · `npm test` ✔ (**15 archivos, 127 tests**) · `npm run build` ✔. Tests nuevos que fallaron antes de implementar: `goalOther`/`industryOther` en `lib/leads.test.ts`, "Otra cosa: …" / "Otro: …" en `lib/leadSummary.test.ts`, campos y envío en `ContactForm.test.tsx` (2) y rubro "Otro" en `DiagnosticoFlow.test.tsx`.

## Resultado
PASS
