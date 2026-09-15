---
description: Reglas de desarrollo del sitio y panel de Nubolabs (Next.js 14 + TypeScript + Tailwind + Firebase + Vercel), aplicables a todos los agentes de IA (Claude Code, Cursor, Codex, Gemini). Fuente única de verdad.
alwaysApply: true
---

## 0. Estado del proyecto (leer primero)

Antes de planificar, generar specs o escribir código, lee `docs/project-profile.md`.

- Si `status: TEMPLATE` → el proyecto **aún no fue adaptado**. Detente y ejecuta `/bootstrap-project` (skill `bootstrap-project`). No generes specs ni código con el contexto genérico de la plantilla.
- Si `status: FILLED` (estado actual) → el perfil es la fuente de los datos del proyecto (stack, capas activas, idiomas, comandos de verificación, modelos). Estos estándares se derivan de él; si se contradicen, manda el perfil y hay que correr `/bootstrap-project --update`.

## 1. Principios

- **Tareas pequeñas, de a una:** trabaja en pasos cortos. Nunca avances más de un paso sin verificar.
- **Tests primero (TDD):** el proyecto usa Vitest (`npm test`, perfil §5). Toda funcionalidad nueva con lógica testeable en aislamiento parte con un test que falla, co-ubicado con el código como `*.test.ts(x)`. Además siguen siendo obligatorios los comandos de §8 y las pruebas manuales documentadas (curl para endpoints, Playwright MCP para flujos de UI).
- **Tipado completo:** todo el código nuevo va totalmente tipado; nada de `any` sin justificación escrita. `tsconfig` está en `strict`.
- **Nombres claros:** variables, funciones y archivos con nombres descriptivos.
- **Cambios incrementales:** prefiere cambios enfocados y revisables antes que refactors grandes.
- **Cuestiona supuestos:** verifica en el código antes de asumir cómo funciona algo (por ejemplo, cómo `lib/site.ts` mezcla la config del CMS sobre los defaults).
- **Detecta patrones repetidos** y propón extraerlos cuando aparezcan por tercera vez.
- **Nunca rompas el sitio por una integración opcional:** si falta una credencial (Firebase, Resend, Blob) el flujo principal sigue y se registra un aviso. Es el patrón de todo el repo.

## 2. Idiomas

Definidos en `docs/project-profile.md` §6. Resumen:

| Artefacto | Idioma |
|---|---|
| Código (identificadores) | Inglés para identificadores nuevos; se respetan los campos ya persistidos en español (`nombre`, `cargo`, `habilidades`, `orden`…). No renombrar campos guardados en Firestore |
| Comentarios | Español |
| UI | Español de Chile (`es-CL`) |
| Documentación técnica | Español |
| Specs OpenSpec | Español (encabezados estructurales y SHALL/MUST en inglés) |
| Commits / PRs | Español, estilo del historial (`Admin: …`, `Fix: …`, `docs: …`) |
| Conversación con el agente | Español |

## 3. Estándares específicos

Todas las capas del perfil §3 aplican en este proyecto:

- [Frontend](./frontend-standards.md) — aplica (App Router, componentes, Tailwind con tokens de marca, CMS)
- [Backend](./backend-standards.md) — aplica (Route Handlers en `app/api`, Firestore, sesión admin)
- [Integraciones](./integration-standards.md) — aplica (Firebase, Resend, Vercel Blob)
- [Documentación](./documentation-standards.md) — siempre
- [Pasos obligatorios en tasks.md de OpenSpec](./openspec-tasks-mandatory-steps.md) — siempre
- [API](./api-spec.yml) — aplica (11 endpoints bajo `/api`)
- [Modelo de datos](./data-model.md) — aplica (Firestore: `leads`, `team`, `config/site`)
- [Estado del proyecto](./ESTADO-PROYECTO.md) — documento vivo con lo que funciona en producción, pendientes y roadmap. Se actualiza al cerrar cada cambio.

## 4. Skills del proyecto

- Las skills viven en `ai-specs/skills` (fuente canónica) y se exponen en `.claude/skills` como **copias** (instalación en modo copia, ver §6).
- Cuando una petición calza con la `description` de una skill, carga y sigue su `SKILL.md` antes de continuar, incluyendo los archivos que referencia (`references/*.md`, etc.).
- Flujo por feature: `/enrich-us` → `/opsx:ff` (o `/opsx:propose`) → `/opsx:apply` → `/opsx:verify` → `/adversarial-review` → `/opsx:archive` → `/commit`.
- Agentes disponibles para planificar (proponen plan en `.claude/doc/<feature>/`, no implementan): `backend-developer`, `frontend-developer`, `integration-developer`, `product-strategy-analyst`.

## 5. Modelos de IA

Definidos en el perfil §10: planificar con **Claude Fable 5.1 u Opus con razonamiento alto**, implementar con **el modelo por defecto de la sesión**.

Antes de `/enrich-us`, `/opsx:propose` o `/opsx:ff`, comprueba el modelo de la sesión. Si es más liviano que el de planificación, avisa al usuario y sugiere cambiarlo con `/model`; no modifiques `.claude/settings.json` por tu cuenta.

## 6. Fuente única y sincronización

- `ai-specs/` y `docs/` son la fuente canónica. `.claude/` solo la expone.
- Este proyecto está instalado en **modo copia** (`ai-specs/.specboot.json` → `linkMode: copy`, porque Windows sin Modo desarrollador no permite symlinks). Por lo tanto:
  - Tras editar un agente o skill en `ai-specs/`, corre `/sync-agent-symlinks` para re-copiar a `.claude/`. Nunca edites directamente en `.claude/agents` ni `.claude/skills/<skill-de-specboot>`.
  - Las skills `openspec-*` y los comandos `.claude/commands/opsx/*` los administra OpenSpec (`openspec update`); no se tocan a mano.
- `CLAUDE.md`, `AGENTS.md`, `codex.md` y `GEMINI.md` son punteros a este archivo (`@docs/base-standards.md`); las reglas se editan aquí.
- Al crear un agente o skill nuevo en `ai-specs/`, exponlo con `/sync-agent-symlinks`.
- Un cambio queda incompleto si deja copias desactualizadas o artefactos duplicados.

## 7. Cambios después de `/opsx:apply` y antes de `/opsx:archive`

Cualquier fix o pedido nuevo en esa ventana se trata **primero como cambio de spec**, no como "arreglo rápido":

1. Actualiza los artefactos del cambio afectados (specs, escenarios, `design.md`, `tasks.md`). Las tareas nuevas van en la sección que corresponde al diseño, no como "bugfix".
2. Si hace falta regenerar artefactos, corre `/opsx:update` o `/opsx:continue` antes de tocar código.
3. Implementa solo cuando los artefactos reflejan el pedido.
4. Vuelve a verificar contra los artefactos actualizados antes de archivar.

## 8. Verificación obligatoria

Ninguna tarea se marca como terminada sin ejecutar (el agente, no el usuario):

```
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Más, según lo que toque el cambio:

- Endpoints → prueba manual con `curl` contra `npm run dev` (ver `backend-standards.md` §7).
- Flujos de UI → prueba E2E con Playwright MCP (ver `frontend-standards.md` §7).

Si un comando falla, se reporta la salida tal cual y la tarea sigue abierta.

## 9. Seguridad y secretos

- Los secretos (`FIREBASE_PRIVATE_KEY`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`) viven solo en Vercel y en `.env.local`. Nunca se pegan en el chat, en commits ni en docs. Se nombran por su **variable** (perfil §4 y §9). Toda variable nueva se documenta en `.env.local.example` con un comentario de dónde se obtiene.
- Antes de un commit revisa que no queden credenciales, archivos `.env*`, `serviceAccount*.json` ni artefactos generados (`.next/`, `*.tsbuildinfo`).
- Datos personales: los leads contienen nombre, email, teléfono, empresa y respuestas del diagnóstico. No se loguean completos, no se exponen en endpoints públicos y solo se leen desde rutas protegidas con `getAdminSession()`.
- Toda ruta nueva bajo `app/api/admin/**` verifica la sesión en su primera línea y responde `401 { error: "No autorizado." }`.
