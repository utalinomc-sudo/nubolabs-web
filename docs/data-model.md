---
description: Modelo de datos del sitio de Nubolabs — colecciones de Firestore (leads, team, config/site), forma del meta del diagnóstico, usuarios de Firebase Auth y reglas de persistencia.
---

# Modelo de datos — Nubolabs

## 1. Motor de persistencia

**Firestore** (Firebase), accedido solo desde el servidor con el Admin SDK (`lib/firebaseAdmin.ts` → `getDb()`). No hay esquema forzado ni migraciones: la forma de cada documento la fijan los handlers que escriben y los tipos de `types/lead.ts` y `lib/site.ts`. Las fechas se guardan como **strings ISO 8601** y se muestran en `America/Santiago`.

Sin credenciales de Admin (`FIREBASE_*`), `getDb()` devuelve `null`: las lecturas usan los defaults del código y las escrituras públicas no persisten.

## 2. Entidades

### `leads/{id}` — solicitudes de contacto y diagnósticos

Escribe `POST /api/leads`; lee el panel (`app/admin/(panel)/leads/**`); borra `DELETE /api/admin/leads/{id}`. Tipos en `types/lead.ts` (`LeadInput`, `Lead`).

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `name` | string | Sí | Nombre del contacto (trim) |
| `email` | string | Sí | Validado con regex simple |
| `phone` | string | No (default `""`) | Teléfono |
| `company` | string | No (default `""`) | Empresa |
| `message` | string | No (default `""`) | Mensaje libre; en diagnósticos, resumen generado (índice, área crítica, ahorro) |
| `source` | string | Sí (default `"landing"`) | `landing` (formulario del home) o `diagnostico` |
| `status` | string | Sí (siempre `"new"` hoy) | Reservado para el pipeline/mini-CRM del roadmap |
| `createdAt` | string ISO | Sí | Fecha de creación (servidor) |
| `meta` | objeto | No | Solo en diagnósticos; ver §2.1 |

#### 2.1 Forma de `meta` (diagnóstico)

Lo arma `components/diagnostico/DiagnosticoFlow.tsx`; lo consumen `lib/report.ts` (`reportDataFromLead`) y `lib/leadReport.ts`.

| Campo | Tipo | Descripción |
|---|---|---|
| `rubro` | string | Rubro declarado por el contacto |
| `indiceFriccion` | number | Índice de fricción global. **Sin este campo no se genera informe** |
| `nivelFriccion` | string | Nivel en texto (p. ej. "Alto") |
| `areas[]` | `{ area, corto, friccion, pct }` | Fricción por área del cuestionario (`components/diagnostico/cuestionario.ts`) |
| `abiertas[]` | `{ pregunta, respuesta }` | Preguntas abiertas respondidas |
| `ahorro` | objeto \| null | Estimación opcional: `totales { horas, semana, mes, anual }` y `procesos[] { nombre, ahorroCLPMes, … }` (cálculo en `components/diagnostico/ahorro.ts`) |

### `team/{id}` — integrantes del equipo

Escribe `POST /api/admin/team` (crea con `add` o actualiza con `set merge`); borra `DELETE /api/admin/team/{id}`; lee `getTeamMembers()` en `lib/site.ts` (ordenado por `orden` asc). Tipo `TeamMember` en `lib/site.ts`.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `nombre` | string | Sí | Nombre completo |
| `cargo` | string | No | Cargo |
| `habilidades` | string[] | No | Lista de habilidades (trim, sin vacíos) |
| `fotoUrl` | string | No | URL pública de Vercel Blob **o** data URL JPEG ≤ 512 px (fallback sin Blob) |
| `linkedin` | string | No | URL normalizada con `https://` |
| `orden` | number | No (default 0) | Orden de aparición en `/equipo` |
| `createdAt` | string ISO | Sí (al crear) | |
| `updatedAt` | string ISO | Sí | Se actualiza en cada guardado |

### `config/site` — configuración del CMS (documento único)

Escribe `POST /api/admin/config` con `set(patch, { merge: true })`; lee `getSiteConfig()` en `lib/site.ts`, que mezcla el documento **sobre los defaults** de `defaultSiteConfig()` (los textos por defecto vienen de `lib/content.ts`). Tipos `SiteConfig`, `SiteContent` en `lib/site.ts`.

| Campo | Tipo | Descripción |
|---|---|---|
| `visible` | `Record<string, boolean>` | Visibilidad por sección. Claves válidas = `SECTIONS[].key`: `hero`, `problema`, `enfoque`, `servicios`, `proceso`, `casos`, `nosotros`, `equipo`, `contacto` |
| `content.hero` | `{ eyebrow, title, subtitle, ctaPrimary, ctaSecondary }` | `title` admite `**resalte**` → texto azul (`renderHighlight`) |
| `content.servicios` | `{ eyebrow, title, items[] { title, body, result } }` | |
| `content.casos` | `{ eyebrow, title, subtitle, items[] { title, body } }` | |
| `content.nosotros` | `{ eyebrow, title, mision, vision, objetivos[] }` | Página `/mision-vision` |
| `content.equipo` | `{ eyebrow, title, historia }` | Página `/equipo` |

Las secciones **Problemas, Enfoque y Proceso** solo tienen toggle de visibilidad; sus textos siguen en `lib/content.ts` (pendiente del roadmap).

### Usuarios admin — Firebase Authentication

No están en Firestore. Proveedor email/password; se crean a mano en la consola de Firebase. Cualquier usuario autenticado del proyecto es admin (sin roles). La sesión se materializa en la cookie `admin_session` (5 días) y se representa en servidor como `AdminSession { email }` (`lib/adminAuth.ts`).

## 3. Relaciones

```
Firebase Auth (usuarios admin) ──cookie admin_session──▶ /admin/** y /api/admin/**

leads/{id}  ── independiente (sin referencias a otras colecciones)
team/{id}   ── independiente; se lista en /equipo ordenado por `orden`
config/site ── documento único; sus defaults viven en código (lib/content.ts + lib/site.ts)
```

No hay relaciones entre colecciones ni subcolecciones.

## 4. Reglas

- **No renombrar campos existentes** (`nombre`, `cargo`, `habilidades`, `orden`, `fotoUrl`, `mision`, …): hay datos guardados con esos nombres.
- Campos nuevos: en `leads` en inglés; en `team` y `config` en español, por consistencia con cada colección.
- Escrituras parciales siempre con `set(..., { merge: true })`; nunca reemplazar `config/site` completo.
- Todo campo nuevo se refleja aquí, en `docs/api-spec.yml` (si entra por la API) y en los tipos de `types/` o `lib/site.ts` en el mismo cambio.
- Al agregar una sección nueva al CMS: sumar la clave a `SECTIONS`, su default a `defaultSiteConfig()`, su mezcla a `mergeConfig()` y su editor en `components/admin/ConfigEditor.tsx`.
- Leads de prueba creados durante verificaciones se borran al terminar (`DELETE /api/admin/leads/{id}`). Hoy hay leads de prueba pendientes de limpieza en producción (ver `docs/ESTADO-PROYECTO.md`).
