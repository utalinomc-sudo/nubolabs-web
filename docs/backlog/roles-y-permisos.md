# HDU — Roles y permisos en el panel de administración

> Historia enriquecida con `/enrich-us` el 2026-09-15. Estado: **lista para `/opsx:ff roles-y-permisos`**.
> Decisiones del dueño (2026-09-15): el panel lo usarán 2 o 3 personas → roles predefinidos, sin matriz editable; los usuarios se crean desde el panel.

## Original

Quiero contar con roles y perfiles en el sistema Nubolabs y poder seleccionar qué acciones puede ejecutar cada rol.

## Enhanced

### Contexto
Hoy el panel `/admin` tiene un solo nivel de acceso: cualquier usuario creado en Firebase Authentication puede hacer todo (ver y eliminar leads, exportar fichas, editar el contenido del sitio, editar el equipo, subir fotos y disparar el diagnóstico de correo). La sesión se representa en servidor como `{ email }` (`lib/adminAuth.ts`) y cada endpoint de `app/api/admin/**` solo comprueba que exista sesión. No hay noción de rol ni de permiso, y los usuarios se crean a mano en la consola de Firebase.

### Objetivo
Que el administrador principal pueda **crear usuarios del panel desde el propio panel**, asignarles uno de **cuatro roles predefinidos** y que la interfaz y la API respeten los permisos de cada rol, sin romper el acceso de los usuarios actuales.

### Actores
- **Administrador principal:** crea usuarios, asigna roles, conserva siempre todos los permisos.
- **Usuario del panel:** entra con su cuenta y ve solo las acciones que su rol permite.

### Catálogo de acciones (permisos)
| Clave | Acción | Dónde se ejerce hoy |
|---|---|---|
| `dashboard.ver` | Ver el dashboard con KPIs | `/admin` |
| `leads.ver` | Ver lista y detalle de leads | `/admin/leads`, `/admin/leads/[id]` |
| `leads.exportar` | Exportar la ficha de un lead a PDF | `GET /api/admin/leads/[id]/pdf` |
| `leads.eliminar` | Eliminar un lead | `DELETE /api/admin/leads/[id]` |
| `contenido.editar` | Editar visibilidad y textos del CMS | `/admin/config`, `POST /api/admin/config` |
| `equipo.editar` | Crear, editar y eliminar integrantes | `/admin/equipo`, `POST /api/admin/team`, `DELETE /api/admin/team/[id]` |
| `equipo.subirFotos` | Subir imágenes | `POST /api/admin/upload` |
| `correo.probar` | Ejecutar el diagnóstico de correo | `GET /api/admin/test-email` |
| `usuarios.administrar` | Crear usuarios y asignar roles | nueva pantalla `/admin/usuarios` |

El catálogo vive en código (lista tipada en `lib/permissions.ts`) para que cada endpoint y cada botón referencien la misma clave.

### Roles predefinidos (fijos en código)
| Rol | Permisos |
|---|---|
| **Administrador** | Todos. No se puede eliminar ni degradar al administrador principal. |
| **Editor de contenido** | `dashboard.ver`, `contenido.editar`, `equipo.editar`, `equipo.subirFotos` |
| **Comercial** | `dashboard.ver`, `leads.ver`, `leads.exportar` |
| **Solo lectura** | `dashboard.ver`, `leads.ver` |

Con 2 o 3 usuarios no se justifica una matriz editable de permisos: menos superficie de error y menos pantallas. Si más adelante hace falta un rol distinto, se agrega en código con su test (cambio pequeño).

### Funcionalidad
1. **Pantalla `/admin/usuarios`** (solo con `usuarios.administrar`): lista de usuarios (email, nombre, rol, fecha de creación, último acceso si Firebase lo entrega) con selector de rol; botón **Invitar usuario**.
2. **Crear usuario desde el panel:** formulario con email, nombre y rol. El servidor crea la cuenta en Firebase Auth con el Admin SDK (`createUser`), guarda el rol y envía un **correo de invitación** por Resend desde `avisos@nubolabs.cl` con un enlace para definir la contraseña (`generatePasswordResetLink` de Firebase, con texto "Crea tu contraseña"). Si el email ya existe en Firebase, se le asigna el rol sin crear cuenta y se informa.
3. **Desactivar usuario:** el administrador puede deshabilitar una cuenta (`disabled: true` en Firebase Auth); el usuario deshabilitado no puede iniciar sesión ni usar una sesión vigente (se valida en `getAdminSession()`). No se borran cuentas desde el panel.
4. **Resolución de permisos en servidor:** la sesión pasa a incluir `uid`, `email`, `rol` y `permisos`. Cada endpoint de `app/api/admin/**` exige el permiso de su acción mediante `requirePermission("<clave>")` y responde `403 { error: "No tienes permiso para esta acción." }` si falta (el `401` se mantiene para "sin sesión").
5. **Interfaz según permisos:** el layout del panel oculta del menú las secciones sin permiso; las páginas sin permiso redirigen a `/admin` con un aviso; los botones de acciones puntuales (eliminar, exportar, subir foto, probar correo) se ocultan si el rol no las tiene.
6. **Compatibilidad hacia atrás (degradación controlada):** un usuario sin rol asignado se trata como **Administrador** mientras no exista ningún documento de usuario en Firestore (primer despliegue); en cuanto el administrador principal guarda el primer rol, los usuarios sin rol pasan a **Solo lectura**. Así nadie queda fuera al desplegar.
7. **Administrador principal:** el email definido en la variable `ADMIN_OWNER_EMAIL` siempre resuelve como Administrador y no puede ser degradado ni deshabilitado desde la interfaz.

### Modelo de datos (Firestore; campos nuevos en español, como `team` y `config`)
- `usuariosAdmin/{uid}`: `{ email, nombre, rolId ("administrador" | "editor" | "comercial" | "lectura"), activo: boolean, invitadoPor, createdAt, updatedAt, ultimoAcceso? }`.
- Los roles y sus permisos **no** se persisten: viven en `lib/permissions.ts`.
- Las cuentas siguen en Firebase Authentication; Firestore solo guarda el rol y metadatos.

### Endpoints nuevos y modificados (`docs/api-spec.yml`)
- `GET /api/admin/usuarios` — lista (permiso `usuarios.administrar`).
- `POST /api/admin/usuarios` — crea usuario + rol + invitación (permiso `usuarios.administrar`).
- `PATCH /api/admin/usuarios/[uid]` — cambia rol o `activo` (permiso `usuarios.administrar`; rechaza cambios sobre `ADMIN_OWNER_EMAIL`).
- `GET /api/admin/session/me` — rol y permisos del usuario actual para la interfaz.
- Todos los endpoints existentes de `app/api/admin/**` pasan a validar su permiso.

### Archivos previstos
- Nuevos: `lib/permissions.ts` (catálogo, roles, `hasPermission`), `lib/adminUsers.ts` (lectura/escritura de `usuariosAdmin`, creación en Firebase Auth, invitación), `app/api/admin/usuarios/route.ts`, `app/api/admin/usuarios/[uid]/route.ts`, `app/api/admin/session/me/route.ts`, `app/admin/(panel)/usuarios/page.tsx`, `components/admin/UsuariosEditor.tsx`, `components/admin/InvitarUsuarioForm.tsx`, tests `lib/permissions.test.ts` y `lib/adminUsers.test.ts` (parte pura).
- Modificados: `lib/adminAuth.ts` (sesión con rol/permisos, `requirePermission`, chequeo de `activo`), `lib/email.ts` (`sendInvitation`), `app/admin/(panel)/layout.tsx` (menú por permisos), páginas y botones de `leads`, `config`, `equipo`; todos los `route.ts` de `app/api/admin/**`.
- Docs: `docs/api-spec.yml`, `docs/data-model.md`, `docs/backend-standards.md` (regla "toda ruta admin exige permiso"), `docs/integration-standards.md` (correo de invitación), `.env.local.example` (`ADMIN_OWNER_EMAIL`), `docs/ESTADO-PROYECTO.md`.

### Requisitos no funcionales
- **Seguridad:** la autorización se decide siempre en servidor; la interfaz solo oculta. Los endpoints de usuarios exponen solo email, nombre, rol y fechas. Los enlaces de invitación expiran según Firebase (1 hora) y se pueden reenviar. Cambios de rol y estado quedan con `updatedAt` e `invitadoPor`.
- **Compatibilidad:** sin credenciales de Firebase Admin (desarrollo local) se mantiene la sesión "dev" con todos los permisos.
- **Rendimiento:** los permisos se resuelven una vez por petición con una lectura de `usuariosAdmin/{uid}`; las páginas públicas no cambian.
- **Pruebas:** tests unitarios de `hasPermission`, de la resolución de rol por defecto y del armado del correo de invitación; `curl` de un `403` por endpoint; E2E de invitar usuario, cambiar rol y verificar que desaparecen los botones.

### Definición de terminado
- Un usuario con rol "Comercial" ve leads y exporta PDF, pero no ve el botón eliminar y recibe `403` si llama al endpoint.
- El administrador invita a un usuario nuevo, este recibe el correo, define su contraseña y entra con su rol.
- Un usuario deshabilitado no puede entrar ni seguir usando el panel.
- Ningún usuario actual pierde acceso al desplegar.
- `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `curl` y E2E documentados; `api-spec.yml`, `data-model.md` y `ESTADO-PROYECTO.md` actualizados.

### Non-goals
- Matriz editable de permisos o roles personalizados (decisión del 2026-09-15).
- Registro de auditoría detallado de acciones.
- Autenticación de dos factores o proveedores externos (Google, Microsoft).
- Borrado físico de cuentas desde el panel.

### Riesgos
- `listUsers`/`createUser` requieren el Admin SDK con credenciales válidas: sin ellas la pantalla muestra un aviso y no rompe el resto del panel.
- El correo de invitación depende de Resend: si falla, el usuario queda creado y el administrador puede reenviar la invitación desde la pantalla.
- Añadir `requirePermission` a 9 endpoints existentes toca código sensible: cada uno lleva su `curl` de `401`, `403` y `200`.
