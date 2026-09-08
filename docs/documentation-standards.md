---
description: Estándares de documentación técnica y de AI specs del sitio de Nubolabs — qué documentos existen, cuándo se actualizan, en qué idioma y cómo evolucionan las reglas de los agentes.
alwaysApply: true
---

# Estándares de documentación — Nubolabs

## 1. Alcance

- **Documentación técnica:** todo lo que describe cómo está construido, corre y opera el proyecto (README, estado del proyecto, modelo de datos, API, estándares, variables de entorno).
- **AI specs:** los documentos que dicen a los agentes cómo comportarse, planificar, documentar y codificar (`docs/*-standards.md`, `docs/project-profile.md`, `ai-specs/`, `openspec/config.yaml`).

## 2. Idioma

La documentación técnica se escribe en **español** (perfil §6). Los comentarios dentro del código van en **español**. Las specs de OpenSpec en **español**, manteniendo los encabezados estructurales y las palabras clave SHALL/MUST en inglés. Los agentes y skills de `ai-specs/` están en inglés (formato heredado de la plantilla); sus notas de proyecto pueden ir en español.

## 3. Mapa de documentos y cuándo actualizarlos

| Documento | Contenido | Se actualiza cuando |
|---|---|---|
| `README.md` | Cómo correr, configurar Firebase y desplegar; estructura | Cambia la instalación, variables de entorno, el deploy o la estructura de carpetas |
| `docs/ESTADO-PROYECTO.md` | **Documento vivo** para retomar el trabajo: qué funciona en producción, variables en Vercel, pendientes, roadmap | Al cerrar cada cambio (`/opsx:archive`) y cuando cambie un pendiente o el estado de una integración |
| `docs/project-profile.md` | Fuente única de datos del proyecto | Cambia stack, capas, integraciones, idiomas, convenciones o se resuelve un TBD (luego `/bootstrap-project --update`) |
| `docs/data-model.md` | Colecciones de Firestore, campos y forma del `meta` del diagnóstico | Se agrega o modifica un campo persistido |
| `docs/api-spec.yml` | Contrato OpenAPI de `/api/**` | Se agrega o modifica un endpoint |
| `docs/frontend-standards.md`, `backend-standards.md`, `integration-standards.md` | Reglas por capa | Se adopta una librería, patrón o convención nueva |
| `.env.local.example` | Todas las variables de entorno con comentario de origen | Se agrega o cambia una variable |
| `docs/mejoras-nubolabs.html` / `docs/Mejoras-Nubolabs.pdf` | Roadmap de mejoras priorizado | Cambia la priorización (regenerar ambos formatos) |
| `openspec/specs/**` | Specs principales por capacidad | Al archivar cambios (`/opsx:archive`, `/opsx:sync`) |

## 4. Proceso antes de cada commit

1. Revisar los cambios del código.
2. Identificar qué documentos de la tabla §3 se ven afectados.
3. Actualizarlos manteniendo formato y estructura existentes (en `ESTADO-PROYECTO.md`, actualizar también la fecha de "Última actualización").
4. Verificar que reflejan exactamente lo implementado (rutas, nombres, variables).
5. Reportar qué documentos se tocaron y por qué.

La skill `update-docs` automatiza los pasos 1–5.

## 5. Evolución de las AI specs (aprendizaje a partir del feedback)

Cuando el usuario corrige, sugiere o expresa una preferencia durante una interacción, el agente debe:

1. Identificar si el aprendizaje merece cambiar una regla (`docs/*-standards.md`, un agente o una skill en `ai-specs/`).
2. **Proponer** el cambio exacto (archivo y sección) vinculándolo al feedback que lo origina.
3. Aplicarlo solo tras aprobación explícita del usuario, re-sincronizar `.claude/` con `/sync-agent-symlinks` si tocó `ai-specs/`, y confirmar cuando esté hecho.

Si la regla sirve para todos los proyectos, proponer llevarla también a la plantilla `nubolabs-specboot` (`C:\dev\nubolabs-specboot`).

Anti-patrones: cambiar reglas sin aprobación; proponer cambios sin conectarlos al feedback; tocar varias reglas no relacionadas a la vez; modificar reglas sin un feedback que lo motive; olvidar confirmar tras aplicar.

## 6. Formato

- Markdown con encabezados jerárquicos, tablas para inventarios y bloques de código para comandos y rutas.
- Rutas de archivo siempre relativas a la raíz del repo y entre backticks.
- Fechas en formato ISO (`AAAA-MM-DD`); horas en `America/Santiago`.
- Un documento = un propósito. Si un doc crece más allá de ~300 líneas, dividirlo.
