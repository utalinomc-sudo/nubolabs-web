## Context

Motivación en `proposal.md`; requisitos en `specs/landing/contenido-pyme/spec.md`. Este diseño asume mezclados `mensaje-principal-pyme` (HDU-01) y `formulario-minimo-consentimiento` (HDU-03):

- **De HDU-01:** tipos, `SECTIONS`, `defaultSiteConfig()`, `mergeConfig()` y `renderHighlight()` viven en `lib/siteConfig.ts` (puro, testeado en `lib/siteConfig.test.ts`) y `lib/site.ts` los re-exporta; tokens de la HDU-08 en `tailwind.config.ts` (`navy.950/800/700`, `brand.dark/deep/50/100/light-50`, `accent.strong/50`, `success.*`, `ink.faint`, `line.strong`, `shadow-lift`, `shadow-form`, animación `feedIn`) y primitivas `.text-gradient-brand` y `.bg-dots`; íconos nuevos en `components/icons.tsx`; botón "Usar los textos recomendados" en el editor del hero.
- **De HDU-03:** formulario de 2 pasos en `#contacto`, `/privacidad`, `lib/leadOptions.ts` y `lib/leads.ts`. Este cambio no los toca.
- **Hoy en el código:** `components/landing/Problem.tsx`, `Approach.tsx` y `Process.tsx` leen arreglos fijos de `lib/content.ts` (`problems`, `approach`, `steps`) y no son editables (pendiente 2 de `docs/ESTADO-PROYECTO.md`). `Services.tsx` y `UseCases.tsx` reciben `content.servicios` / `content.casos` del CMS. `app/page.tsx` compone las secciones por `visible[key]` en el orden hero, problema, enfoque, servicios, proceso, casos, contacto. `lib/content.ts` exporta `nav` con "Inicio" y `Nav.tsx` marca fijo el primer ítem como activo (`i === 0`).
- **Admin:** `components/admin/ConfigEditor.tsx` (≈ 280 líneas antes de HDU-01) guarda todo `content` con `POST /api/admin/config` (merge). `app/admin/(panel)/config/page.tsx` le pasa un subconjunto (`hero`, `servicios`, `casos`, `nosotros`).
- **Producción:** `config/site` ya tiene `servicios.items` y `casos.items` editados con los textos antiguos (con "agentes IA", "n8n, Make, APIs e IA"). Como `mergeConfig()` usa `items` guardado si existe, esos textos seguirán visibles hasta que Mauro los reemplace.
- **Referencia visual:** `docs/design/propuesta-web-hdu-08.html`, secciones `#problema`, `#resultados`, `#enfoque`, `#servicios` y `#proceso`.

## Goals / Non-Goals

**Goals:**
- Un modelo de CMS para las 5 secciones que tolere documentos viejos o incompletos sin romper el diseño.
- Admin mantenible después de sumar 4 secciones (y las de HDU-04, 05, 06, 09 y 10 que vienen).
- Una prueba automática del vocabulario que impida que la jerga vuelva por los defaults.

**Non-Goals:**
- Animaciones de entrada al hacer scroll (la referencia las tiene; aquí las secciones quedan como Server Components estáticos).
- Validar en el servidor el contenido que guarda el admin (`POST /api/admin/config` no cambia; la normalización ocurre al leer).

## Decisions

### 1. Forma de los datos en `config/site.content`
Se reutilizan las claves en inglés que ya usa el CMS (`eyebrow`, `title`, `subtitle`, `body`, `items`, `result`) y los conceptos nuevos van en español (regla de `docs/data-model.md`):

```ts
problema:   { eyebrow; title; subtitle; items: { title: string }[]; cierre: string; cierreCta: string }
resultados: { eyebrow; title; subtitle; items: { title; body }[] /* siempre 4 */; cierre: string }
enfoque:    { eyebrow; title; body; items: { title; body }[] /* siempre 3 */ }
servicios:  { eyebrow; title; subtitle;
              destacado: { etiqueta; title; body; result; incluye: string[] /* 1–4 */ };
              items: ServiceItem[] /* { title; body; result }, 1–6 */;
              acompanamiento: { title; body };
              notaTecnica: string }
proceso:    { eyebrow; title; subtitle; items: { title; body; recibes }[] /* siempre 4 */;
              exito: { title: string; items: string[] /* 1–6 */ } }
```

- `problema.cierre` admite `**resalte**` (se pinta en `brand-light` sobre navy con `renderHighlight()`); `cierreCta` es el texto del enlace a `#resultados`.
- `servicios.items` mantiene la forma actual (`ServiceItem`), así los documentos guardados siguen siendo válidos; el "resultado" pasa a mostrarse como "lo que ganas".
- Defaults: textos de la HDU-08 §2, §3 y §5.1 y de la referencia (copiados en la spec). La lista de 4 servicios por defecto reemplaza a `services` de `lib/content.ts`, y "Diagnóstico y plan de mejora" sale de la lista porque pasa a `destacado`.
- *Alternativa descartada:* todo en español (`titulo`, `texto`). Rompería la simetría con `hero`, `servicios` y `casos`, que ya están guardados con claves en inglés.

### 2. Mezcla tolerante en `lib/siteConfig.ts`
Helpers puros y testeados, usados por `mergeConfig()`:

- `mergeFixedList(stored, defaults, mergeItem)`: devuelve siempre `defaults.length` ítems; en cada posición mezcla campo a campo el ítem guardado (si es objeto) sobre el default de esa posición, y si no hay objeto usa el default completo. Para `resultados.items` (4), `enfoque.items` (3) y `proceso.items` (4): las ilustraciones y el diseño dependen de la posición.
- `mergeList(stored, defaults, { min, max }, mergeItem, blank)`: un ítem es válido si es objeto con `title` no vacío tras `trim`; si `stored` no es arreglo o quedan menos de `min` válidos, usa `defaults`; si no, recorta a `max`. Para `problema.items` (1–8), `servicios.items` (1–6) y `casos.items` (1–12). En un ítem válido, un campo vacío o que no sea string queda `""` (`blank`) y no toma el texto del default de su posición, que describe otro ítem (*ajuste del apply*: la versión anterior de esta nota decía "default de su posición"). Las listas de textos `servicios.destacado.incluye` (1–4) y `proceso.exito.items` (1–6) usan la misma regla con strings. Los campos sueltos usan `pickText` (de HDU-01): un valor que no sea string o quede vacío cae al default, para que un documento con forma inesperada no deje huecos ni tumbe la portada (pendiente 15 de `docs/ESTADO-PROYECTO.md`).
- Objetos anidados (`destacado`, `acompanamiento`, `exito`) se mezclan campo a campo sobre el default, como `hero`.
- `visible` (ajuste de la revisión adversarial): solo los valores booleanos guardados ganan; `null`, textos o números usan el default, para que la portada (`visible[k] &&`), el menú (`!== false`) y el admin (`?? true`) lean lo mismo.
- *Alternativa descartada:* validar en `POST /api/admin/config`. Igual habría que tolerar documentos viejos al leer, y el endpoint quedaría acoplado a cada sección.

### 3. Secciones como Server Components con el diseño de la referencia
| Sección | Componente | Notas |
|---|---|---|
| ¿Te suena? | `Problem.tsx` (reescrito) | Encabezado fijo a la izquierda en `lg`, grilla 2×N de dolores con ícono por posición (`problemIcons`: luna, reloj, billetera, ayuda, nota, usuario-x; cicla si hay más), franja navy de cierre |
| Lo que ganas | `Results.tsx` (nuevo, `id="resultados"`) | Grilla bento de 12 columnas (7/5/5/7); ilustración por posición: chat (vendes), barras (control), checklist sobre navy (nada se olvida), ecuación "tu equipo + tareas = más clientes" (creces). Textos de las ilustraciones en `lib/content.ts` (`resultsVisuals`), envueltas en `aria-hidden` |
| Enfoque | `Approach.tsx` (reescrito) | Sección navy con `.bg-dots`; 3 pasos numerados; ilustración antes/después desde `approachExample` en `lib/content.ts` (`antes: { text; cut }[]`, `despues: string[]`) |
| Servicios | `Services.tsx` (reescrito) | Tarjeta destacada (degradado `brand-50`, etiqueta, 3 "incluye"), grilla de 4 en `lg` / 2 en `md` / 1 en móvil con "lo que ganas" alineado abajo, banda "Acompañamiento mensual", nota técnica en `font-mono text-xs` con `data-nota-tecnica` |
| Proceso | `Process.tsx` (reescrito, `id="modelo"`) | 4 pasos con línea punteada, último en degradado, caja "Recibes" de alto mínimo común, franja navy "Tú defines qué es éxito" con chips |

- Todos aceptan `content?` y caen a `defaultSiteConfig()` (patrón de `Hero.tsx`). Solo tokens; nada de hex en el JSX.
- *Ajustes del apply:* encabezado común `components/landing/SectionHead.tsx` (etiqueta mono, h2 y bajada); tokens `inverse.*` en `tailwind.config.ts` para texto sobre navy y clase `.bg-dots-inverse` en `app/globals.css`; Proceso y Servicios usan subgrilla CSS (`grid-rows-subgrid`) para que título, texto y "Recibes" / "lo que ganas" queden a la misma altura en cada fila; `notaTecnica` admite `**resalte**` (el default pone "Cómo lo hacemos:" en negrita); `Problem` oculta el enlace "Mira lo que cambia" si "Lo que ganas" está oculta; el número del último paso usa `brand → brand-deep` (contraste del número blanco).
- *Por qué sin animaciones de scroll:* exigirían Client Components o un wrapper con `IntersectionObserver` en cada sección; no suman a la comprensión y el hero ya concentra el movimiento (HDU-01). Se puede agregar después sin tocar specs.

### 4. Orden, visibilidad y navegación
- `SECTIONS` queda en el orden de la portada: `hero`, `problema`, `resultados`, `enfoque`, `servicios`, `casos`, `proceso`, `contacto`, `nosotros`, `equipo` (más las claves que HDU-03 haya sumado). `resultados` es visible por defecto: los documentos guardados no traen esa clave y `mergeConfig()` mezcla `visible` sobre los defaults.
- `app/page.tsx` renderiza en ese orden; `Process` pasa después de `UseCases`.
- `nav` en `lib/content.ts`: "Lo que ganas" `/#resultados`, "Servicios" `/#servicios`, "Ejemplos" `/#casos`, "Cómo trabajamos" `/#modelo`. Se quita "Inicio" (el logo lleva a `/#inicio`) y en `Nav.tsx` se elimina el estilo activo fijo del primer ítem, que con el nuevo orden marcaría "Lo que ganas" como activo. *Ajuste del apply:* cada ítem declara su `section` y `Nav` recibe `sections={visible}`: el ítem de una sección oculta no se muestra (evita enlaces a anclas inexistentes).

### 5. Admin dividido en editores por sección
`ConfigEditor.tsx` ya supera ~400 líneas con este cambio, así que se divide:

```
components/admin/ConfigEditor.tsx          contenedor: estado, visibilidad, guardado (sigue siendo el import de la página)
components/admin/config/Field.tsx          input/textarea con etiqueta (extraído)
components/admin/config/SectionCard.tsx    tarjeta con título + botón "Usar los textos recomendados"
components/admin/config/ListField.tsx      lista editable (agregar, quitar, subir/bajar) con mín./máx.
components/admin/config/{Hero,Problema,Resultados,Enfoque,Servicios,Casos,Proceso,Nosotros,Privacidad}Editor.tsx
```

- `PrivacidadEditor` migra el bloque "Privacidad" que agregó HDU-03 (título y texto de `/privacidad`), sin cambiar su comportamiento.

- Cada editor recibe `{ value, onChange, defaults }` con su tipo de `SiteContent`; las listas de largo fijo (resultados, enfoque, proceso) no muestran agregar/quitar.
- "Usar los textos recomendados" llama `onChange(defaults)` para esa sección; no guarda. El aviso "Textos recomendados cargados…" vive en `SectionCard` y se apaga al guardar mediante `SaveVersionContext` (ajuste del apply). Las props comunes están en `components/admin/config/types.ts` (`EditorProps<K>`); `Field.tsx` exporta también `FieldRow`.
- `app/admin/(panel)/config/page.tsx` pasa `content` completo y `defaultSiteConfig().content` como `defaults`.
- **El guardado envía solo las claves que administra esta pantalla**, declaradas en la constante exportada `MANAGED_KEYS` de `ConfigEditor.tsx` (`hero`, `problema`, `resultados`, `enfoque`, `servicios`, `casos`, `proceso`, `nosotros`, `privacidad`), para no pisar `content.equipo.historia`, que se edita en `/admin/equipo`. **Y de ellas, solo las que cambiaron** desde la carga o el último guardado (`changedKeys`; ajuste de la revisión adversarial): guardar todas dejaba fijos en Firestore los defaults de secciones nunca editadas (los defaults nuevos de HDU-10, 04, 05 y 06 no se verían sin restablecer sección por sección) y hacía que un guardado desde el preview escribiera de más en el Firestore compartido con producción. Sin cambios de contenido se envía solo `visible`.
- **Regla para los cambios siguientes** (HDU-10, 04, 06, 05, 07, 09): cada sección nueva del CMS suma su `<Seccion>Editor.tsx` en `components/admin/config/`, lo monta en el contenedor y **agrega su clave a `MANAGED_KEYS`**; si no, sus ediciones no se guardan. `ConfigEditor.test.tsx` comprueba que `MANAGED_KEYS` + `equipo` son exactamente las claves de `SiteContent`, que `pickManaged` no incluye `equipo` y que el payload lleva solo las secciones editadas (con la edición).
- *Alternativa descartada:* pestañas o rutas por sección (`/admin/config/servicios`). Cambia la navegación del panel y cada pestaña necesitaría su propio guardado; el patrón de una página con guardado único se mantiene.

### 6. Casos y `/diagnostico`: solo textos
- `content.casos` por defecto: bajada "Ejemplos reales de lo que dejamos funcionando en empresas como la tuya." y los 6 casos con los reemplazos de la tabla de HDU-02 (por ejemplo "Correos ordenados solos", "Respuestas automáticas por WhatsApp y correo", "Solicitudes y aprobaciones sin cadenas de correos"). El rediseño con rubros es HDU-05; `UseCases.tsx` no cambia de estructura y las cifras `metrics` siguen hasta HDU-06.
- `/diagnostico`: etiqueta "◈ AUTODIAGNÓSTICO", título "¿Dónde está la mayor oportunidad de tu negocio?", bajada "18 preguntas, 5 minutos. Marca con qué frecuencia ocurre cada situación en tu equipo hoy; no hay respuestas correctas. Al final verás en qué áreas tu negocio puede mejorar más." y `description` "Descubre en 5 minutos dónde está la mayor oportunidad de tu negocio: ventas, control, orden y crecimiento. Autodiagnóstico gratuito de Nubolabs." El panel de resultados, el estimador y la nota "oportunidades concretas de automatización" quedan para HDU-09.

### 7. Prueba de vocabulario
`lib/siteConfig.test.ts` suma un test que recorre recursivamente todos los strings de `defaultSiteConfig().content` (secciones `hero`, `problema`, `resultados`, `enfoque`, `servicios` salvo `notaTecnica`, `casos`, `proceso`), los labels de `nav`, `resultsVisuals` y `approachExample`, y falla si encuentra `/\bn8n\b|\bMake\b|\bAPIs?\b|\bCRM\b|\bERP\b|\bagentes?\b|\bIA\b|\bROI\b|horas ahorradas|pymes?/i` ("pyme(s)" agregado el 2026-10-22: no se excluye a empresas grandes) (con `\bMake\b` e `\bIA\b` sensibles a mayúsculas). Otro test verifica que `notaTecnica` sí contiene "n8n" (la nota existe y es única). `metrics` queda fuera a propósito: lo resuelve HDU-06 (escrito también en la spec). *Ajuste de la revisión adversarial:* `components/landing/Home.vocabulario.test.tsx` renderiza la portada completa con los defaults (menú, hero con su panel, secciones, formulario y pie) y aplica la misma regex más `nube` sobre el texto, sin la nota técnica; así también cubre los rótulos fijos (`sectionLabels` en `lib/content.ts`).

### Degradación
Sin Firebase, `getSiteConfig()` devuelve los defaults nuevos. No hay integraciones nuevas (Resend y Blob no participan). Las secciones no usan JavaScript del cliente; el admin sigue funcionando con la sesión "dev" local, pero guardar requiere Firestore (500 local; el guardado real se prueba en producción con P.1, ver Risks).

## Risks / Trade-offs

- [El preview de Vercel usa el mismo Firestore que producción: guardar en el admin del preview cambia producción, que aún corre el código de `main`] → no guardar contenido desde el preview; el guardado real se prueba en producción con el paso post-merge P.1 (el endpoint no cambia y el payload está cubierto por tests y por el E2E con el POST interceptado). Si por error se restablece Servicios en el preview, la portada vigente pierde la tarjeta "Diagnóstico" hasta mezclar.
- [Producción sigue mostrando servicios y casos viejos con jerga porque Firestore tiene `items` guardados] → "Usar los textos recomendados" por sección y paso post-merge explícito (P.1), con revisión de la portada en producción después de restablecer.
- [Mientras Mauro no restablezca Servicios, el diagnóstico aparece dos veces: como destacado (default) y como primer ítem viejo] → mismo paso post-merge, que va en la misma sesión del deploy.
- [El refactor del admin rompe la edición de secciones existentes] → tests de `ConfigEditor` y E2E del admin en local (render, editar, restablecer, payload interceptado) y guardado real con P.1 en producción.
- [La portada queda más larga] → secciones estáticas sin imágenes; el CTA del formulario sigue en el hero y en el menú.
- [Un admin guarda listas de largo fijo con menos ítems] → `mergeFixedList` completa con defaults; el editor no permite quitarlos.
- [Las ilustraciones de "Lo que ganas" sugieren datos reales] → textos genéricos sin cifras ni clientes, `aria-hidden` y la spec lo prohíbe.

## Migration Plan

0. Antes de cualquier guardado en producción, copiar el documento `config/site` desde la consola de Firebase como respaldo.
1. Mezclar a `main` tras el preview aprobado por Mauro (deploy automático). En el preview no se guarda contenido (Firestore compartido).
2. En `/admin/config`: "Usar los textos recomendados" en Servicios y Casos (tienen overrides) y revisar ¿Te suena?, Lo que ganas, Enfoque y Proceso (sin overrides, ya muestran los defaults); "Guardar cambios". Verificar la portada en producción.
3. Rollback: revertir el commit. El código anterior ignora `problema`, `resultados`, `enfoque`, `proceso` y los campos nuevos de `servicios`; los `items` restablecidos tienen la forma de siempre. Ojo: si P.1 ya se hizo, la portada anterior mostrará los 4 servicios nuevos **sin** la tarjeta "Diagnóstico" (pasó a `destacado`, que el código anterior no conoce); para recuperarla, agregar ese servicio a mano en el admin anterior.
