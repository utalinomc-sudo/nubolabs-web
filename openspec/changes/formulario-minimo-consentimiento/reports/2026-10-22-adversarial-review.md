# Reporte — /adversarial-review y correcciones

- Fecha: 2026-10-22
- Cambio: formulario-minimo-consentimiento
- Revisor: agente independiente (Claude Code, Opus 5.5), solo lectura: lint, tipos, tests, build, `normalizeLead` con casos límite en Node, `curl` y Playwright contra `next dev -p 3100` (sin `.env.local`).
- Veredicto inicial: **FAIL** (1 Major).

## Hallazgos y resolución

| Severidad | Hallazgo | Resolución |
|---|---|---|
| Major | Leads del diagnóstico perdidos en silencio: el servidor recortaba el WhatsApp a 30 caracteres **antes** de validar, el input del diagnóstico no tenía `maxLength` y `DiagnosticoFlow` no leía la respuesta (un 400 terminaba en "¡Listo!"). Variante: número guardado recortado | `normalizeLead` valida correo y WhatsApp sin recortar y rechaza los que exceden; `LEAD_MAX` compartido y `maxLength` en el diagnóstico; `DiagnosticoFlow` muestra el error de un 400 y no confirma (5xx y red siguen sin bloquear). Tests de paridad navegador/servidor, del diagnóstico y E2E (tareas 8.1, 8.2, 8.7) |
| Minor | Fallo de red mostraba "Failed to fetch" | Solo se muestra `json.error`; si no, "No pudimos enviar tu solicitud. Intenta de nuevo." (test y E2E; 8.3) |
| Minor | Spec decía validar al salir de un campo obligatorio vacío | Spec aclarada: los vacíos se marcan al enviar (comportamiento de la referencia) |
| Minor (preexistente) | PDF con emoji/flecha → error 500 (WinAnsi) en la ficha y en el informe al cliente | `lib/pdfText.ts` (`toWinAnsi`, `winAnsiDeep`) aplicado en `lib/leadReport.ts` y `lib/report.ts`; tests con emojis (8.5) |
| Minor (preexistente) | `meta` sin límite y en cualquier `source` (~3 MB aceptado) | `meta` solo con `source: "diagnostico"` y hasta 64 KB (400 si excede) (8.1) |
| Minor | Sin test del handler ni del diagnóstico | `app/api/leads/route.test.ts` (5) y `DiagnosticoFlow.test.tsx` (4) (8.2, 8.4) |
| Minor | Accesibilidad: el paso no se anunciaba; el diagnóstico sin `aria-required` | "Paso X de 2" dentro del `legend` (oculto a la vista); `aria-required` y marca "*" en el diagnóstico (8.2, 8.3) |
| Question | Honeypot autocompletado por un gestor de contraseñas descartaría un lead real | Riesgo aceptado por el diseño; queda como pendiente evaluar guardarlo como `status: "spam"` (`docs/ESTADO-PROYECTO.md`) |
| Question | Ley 21.719: versionar la política, mencionar a Vercel y el derecho a reclamar; correo de la política vs. footer | Borrador con Vercel y la Agencia de Protección de Datos Personales (8.6). Versionar la política y unificar el correo público quedan para la validación legal (P.3) y HDU-10 |
| Question | Commit con archivos ajenos (skill `ui-ux-pro-max`, `docs/avance.json`) | Commit selectivo, sin esos archivos |
| Question | Sin `NEXT_PUBLIC_SCHEDULE_URL` no hay agenda inmediata | Pendiente P.1 (decisión de Mauro) |

Fuera de alcance (preexistente): scroll horizontal de 31 px en `/diagnostico` a 375 px por el enlace del header (pendiente 9c de `docs/ESTADO-PROYECTO.md`).

## Re-verificación
- 4 comandos en verde (122 tests), `curl` de los casos nuevos y E2E del diagnóstico con 400 y del formulario sin red (ver reportes N, N+1 y N+2).

## Resultado tras las correcciones
El Major y los Minors accionables quedan resueltos y verificados; las preguntas quedan anotadas como pendientes o en los pasos post-merge. Listo para preview.
