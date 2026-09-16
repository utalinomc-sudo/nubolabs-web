## 0. Setup: rama de trabajo (OBLIGATORIO, PRIMER PASO)

- [x] 0.1 Crear la rama `feature/actualizar-dependencias-seguras` desde `main` actualizado y verificar con `git status -sb` que es la rama activa y está limpia

## 1. Actualizaciones sin salto de versión mayor

- [x] 1.1 Registrar el punto de partida: guardar la salida de `npm audit --omit=dev` (conteo por severidad y paquetes) para el reporte; verificar que coincide con 21 alertas (1 crítica, 3 altas, 17 moderadas)
- [x] 1.2 Ejecutar `npm audit fix` (sin `--force`) y verificar en la salida que solo cambian transitivas (`undici`, `fast-xml-parser`, `@google-cloud/storage`, utilidades) y que `next`, `react`, `firebase-admin` y `firebase` conservan su versión (`npm ls next react firebase-admin firebase --depth=0`)
- [x] 1.3 Actualizar `@vercel/blob` a `^2.8.0` (`npm install @vercel/blob@^2.8.0`) y verificar con `npm ls @vercel/blob` que instala 2.8.x sin `ERESOLVE`
- [x] 1.4 Volver a ejecutar `npm audit --omit=dev`; verificar que no quedan alertas altas fuera de la cadena de Next (`postcss` solo se resuelve con Next 16). Si persisten alertas `@firebase/*`, ejecutar `npm install firebase@^11.10.0`, repetir `npm audit --omit=dev` y verificar que desaparecen; registrar la decisión tomada en el reporte
- [x] 1.5 Verificar que las alertas restantes pertenecen solo a las cadenas `next`/`postcss` y `firebase-admin`/`@google-cloud/*`/`gaxios`/`google-gax`/`retry-request`/`teeny-request`/`uuid` (`npm audit --omit=dev --json` → nombres de paquetes)

## 2. Verificación obligatoria (OBLIGATORIO — el agente la ejecuta)

- [x] 2.1 Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`; verificar que los cuatro terminan sin errores
- [x] 2.2 Prueba manual de endpoints con `curl` contra `npm run dev`: `POST /api/leads` con lead válido → `{ ok: true, persisted: false }`; con `{"name":"x"}` → `400`; `POST /api/diagnostico/report` con `meta.indiceFriccion` → `200` y `Content-Type: application/pdf`; verificar y detener el servidor al terminar
- [x] 2.3 Smoke de páginas con `curl -s -o /dev/null -w "%{http_code}"` contra `npm run dev`: `/`, `/diagnostico`, `/equipo`, `/mision-vision`, `/admin/login` → `200` (con sesión dev, `/admin` también `200`); verificar
- [x] 2.4 Prueba E2E con Playwright MCP: NO DISPONIBLE en esta sesión (el servidor MCP no conectó). Sustituida por 2.2, 2.3 y la revisión del preview de Vercel por el dueño antes de mezclar (login en `/admin/login` si `firebase` subió a 11); dejar constancia en el reporte
- [x] 2.5 Crear el reporte `openspec/changes/actualizar-dependencias-seguras/reports/2026-09-16-paso-2-verificacion.md` con: audit antes/después (conteos y paquetes), versiones cambiadas, salidas de los comandos, resultados de `curl`, decisión sobre `firebase` y lista de alertas restantes con su causa; verificar que el archivo existe

## 3. Documentación

- [x] 3.1 Crear `docs/backlog/migrar-next-16.md`: HDU de la migración (Next 16.3.5 con React 18, firebase-admin 14.4, ESLint 9 flat config, reemplazo de `next lint`, `cookies()` y `params` asíncronos en los 5 archivos identificados en `design.md`, alertas que cierra, plan de verificación con E2E completo); verificar que lista los archivos afectados
- [x] 3.2 Actualizar `docs/ESTADO-PROYECTO.md`: pendiente 6 dividido en "hecho" (alertas cerradas hoy) y "pendiente: migrar-next-16" (alertas restantes), fecha de actualización; y `docs/project-profile.md` §2 solo si `firebase` cambió de mayor; verificar con `grep -n "migrar-next-16" docs/ESTADO-PROYECTO.md`

## 4. Cierre

- [x] 4.1 Revisar `git status` y `git diff --stat`: solo `package.json`, `package-lock.json`, los documentos de la sección 3 y los artefactos del cambio; verificar que no hay archivos generados ni `.env*`
