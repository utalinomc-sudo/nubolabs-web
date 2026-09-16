# Reporte — paso 5: validación del preview de Vercel (tarea 5.2)

- Fecha de preparación: 2026-09-16
- Cambio: migrar-next-16
- Rama: `feature/migrar-next-16`
- Estado: **PENDIENTE** — se completa cuando el dueño valide el preview que Vercel genera al hacer push de la rama (`/commit`). Es la única prueba que necesita las credenciales reales (Firebase Auth, Firestore, Resend, Blob), que no existen en la máquina local.

## Por qué hace falta
Sin `.env.local`, la sesión del admin es la sesión "dev" y las rutas de datos responden `500 Base de datos no configurada.`. Por eso en local no se pudo ejercitar: `verifySessionCookie`/`createSessionCookie` con firebase-admin 14, la lectura y borrado de leads con `await params` contra Firestore real, la exportación del PDF de un lead real, el guardado del CMS ni la subida de fotos a Vercel Blob.

## Lista de comprobación (la hace el dueño en el navegador; marcar cada punto)

Preview: la URL `https://nubolabs-web-git-feature-migrar-next-16-<equipo>.vercel.app` (Vercel la muestra en el PR o en el panel del proyecto). Comparar con producción https://www.nubolabs.cl.

**Sitio público (escritorio y móvil)**
- [ ] `/` se ve igual que producción: hero, secciones, menú "Nosotros", formulario de contacto. Enviar un contacto de prueba → mensaje "Gracias. Te contactaremos…"; llega el aviso por correo (Resend) y el lead aparece en `/admin/leads`.
- [ ] `/diagnostico`: completar el cuestionario con un correo propio, activar el estimador con un proceso, enviar y descargar el PDF; llega el informe por correo al cliente (Resend) y el lead aparece en el panel con índice de fricción y ahorro.
- [ ] `/equipo` y `/mision-vision` muestran el contenido real del CMS (integrantes con foto, misión/visión editadas).
- [ ] En el móvil: menú hamburguesa, landing y diagnóstico legibles (los desbordamientos de 16 px en `/diagnostico` y de la tabla de leads en el móvil ya existían en producción; ver `ESTADO-PROYECTO.md` pendiente 9c).

**Panel (login real con Firebase Auth → firebase-admin 14)**
- [ ] `/admin/login`: iniciar sesión con el usuario admin real → entra a `/admin` (dashboard con KPIs reales).
- [ ] `/admin/leads`: abrir el lead de prueba creado arriba → detalle completo (contacto, índice, respuestas, ahorro).
- [ ] "Exportar PDF" del lead → descarga la ficha (`lead-<nombre>.pdf`).
- [ ] "Eliminar" el lead de prueba escribiendo "eliminar" → desaparece de la lista (esto restaura los datos de prueba).
- [ ] `/admin/config`: cambiar un toggle de visibilidad, "Guardar cambios" → "✓ Guardado"; comprobar en `/` y **revertirlo** después.
- [ ] `/admin/equipo`: subir una foto a un integrante de prueba (con `BLOB_READ_WRITE_TOKEN` en Vercel va a Blob; sin token queda incrustada) y **eliminar** el integrante de prueba al terminar.
- [ ] "Cerrar sesión" → vuelve a `/admin/login`; `/admin` redirige al login.

**Vercel**
- [ ] **Antes de probar:** Settings → Build and Deployment → Node.js Version = **24.x** (firebase-admin 14 exige Node ≥ 22 y su módulo de auth necesita `require(esm)`, Node ≥ 20.19/22.12). Si estaba en otra versión, cambiarla y pulsar "Redeploy" en el último deployment de la rama. Confirmar en el log de build del deployment que usa Node 24.
- [ ] El build del preview terminó en verde (Next 16.3.5 con Turbopack, Node 24) y los logs de funciones no muestran errores tras el recorrido (en particular, ningún aviso `[firebase-admin]`).

Historial de intentos: 1.º preview (`2fafb57`) error 500 en páginas dinámicas; 2.º preview (`fbee74f`) mismo error, log `ERR_REQUIRE_ESM` en `firebase-admin/auth` (reporte del paso 2c); 3.º preview (carga perezosa de auth) pendiente.

## Resultado informado por el dueño
- Fecha: —
- Observaciones: —
- Datos de prueba restaurados (lead eliminado, toggle revertido, integrante eliminado): —

## Resultado
**PENDIENTE** — el merge a `main` depende de que esta lista quede en PASS.
