---
description: Pasos obligatorios al crear o actualizar tasks.md en cambios de OpenSpec del sitio de Nubolabs, y reglas de ejecución para el agente (lint, typecheck, build, curl, E2E con Playwright MCP, reportes, actualización de docs).
alwaysApply: true
---

# OpenSpec `tasks.md`: pasos obligatorios

Aplica al crear o actualizar `tasks.md` con `/opsx:ff`, `/opsx:propose`, `/opsx:continue` o `/opsx:update`, y al implementarlo con `/opsx:apply`.

## 1. Leer primero

Antes de escribir `tasks.md`, leer `openspec/config.yaml` y `docs/project-profile.md` (§3 capas, §5 comandos de verificación, §7 ramas).

## 2. Estructura obligatoria

### Paso 0 — Rama de trabajo (SIEMPRE el primero)
- Crear y cambiar a `feature/<nombre-del-cambio>` desde `main`. Solo si el usuario lo pide explícitamente (fix pequeño, perfil §7) se trabaja directo en `main`.

### Pasos de implementación
- Tareas pequeñas y verificables, en el orden del diseño. Cada tarea que toque un endpoint o un flujo de UI dice cómo se va a probar.
- Mientras no haya runner de tests (perfil §11), no se crean tareas de "escribir tests unitarios"; se crean tareas de prueba manual documentada. Cuando exista el runner, cada funcionalidad parte con su test (TDD).

### Pasos finales (OBLIGATORIOS, en este orden)
- **N — Ejecutar los comandos de verificación** y guardar el reporte:
  ```
  npm run lint
  npx tsc --noEmit
  npm run build
  ```
- **N+1 — Prueba manual de endpoints con `curl`** (solo si el cambio toca `app/api/**`). El agente levanta `npm run dev`, ejecuta los `curl` (casos OK y de error), y restaura datos si escribió en Firestore real.
- **N+2 — Prueba E2E con Playwright MCP** (solo si el cambio toca un flujo de usuario: landing, diagnóstico, admin). El agente navega, ejecuta el flujo completo, verifica estados de carga/error/éxito y captura evidencia.
- **N+3 — Actualizar documentación técnica** según `documentation-standards.md` §3: como mínimo `docs/ESTADO-PROYECTO.md`; además `docs/api-spec.yml` si hubo endpoints, `docs/data-model.md` si hubo campos, `.env.local.example` si hubo variables.

## 3. Reglas de ejecución para el agente

- **El agente ejecuta las pruebas, nunca las delega al usuario.** Levanta el servidor si hace falta, corre los comandos, captura la salida.
- Una tarea se marca `[x]` solo después de ejecutar su verificación y, para los pasos N..N+2, de guardar el reporte.
- Toda prueba que cree, modifique o borre datos debe **restaurar el estado** al terminar (por ejemplo `DELETE /api/admin/leads/<id>` para leads de prueba) y documentar la restauración. En local sin `.env.local` no se persiste nada, lo que es suficiente para la mayoría de las pruebas.
- Reportes en `openspec/changes/<cambio>/reports/AAAA-MM-DD-paso-<n>-<tema>.md` con: comandos ejecutados, resultados, estado antes/después, restauración, resultado PASS/FAIL.
- Si un comando de verificación falla, se reporta la salida completa y la tarea sigue abierta.
- Nunca probar envíos de correo a clientes reales ni subir archivos a Blob de producción sin autorización explícita.

## 4. Comandos de verificación de este proyecto

```
npm run lint
npx tsc --noEmit
npm run build
```

Servidor local para pruebas manuales: `npm run dev` → http://localhost:3000 (funciona sin credenciales de Firebase).

## 5. Plantilla de reporte

```markdown
# Reporte — paso <n>: <tema>

- Fecha: AAAA-MM-DD
- Cambio: <nombre>
- Ejecutado por: <agente / modelo>

## Comandos
- `<comando>` → <resultado resumido>

## Resultados
<salida de lint/tsc/build, respuestas de curl, pasos y capturas del E2E>

## Estado de datos
- Antes: ...
- Después: ...
- Restaurado: Sí / No (acciones)

## Resultado
PASS | FAIL — <bloqueos si los hay>
```

## 6. Checklist antes de cerrar `tasks.md`

- [ ] Paso 0 es crear la rama `feature/<cambio>`.
- [ ] Los pasos finales N..N+3 están y marcados como OBLIGATORIOS.
- [ ] El paso de `curl` solo aparece si el cambio toca `app/api/**`; el de E2E solo si toca UI.
- [ ] Cada paso de prueba dice explícitamente "el agente lo ejecuta".
- [ ] Los pasos que tocan datos incluyen restauración.
- [ ] Ruta y nombre de los reportes indicados.
- [ ] El paso de documentación nombra `docs/ESTADO-PROYECTO.md` y los demás docs afectados.
