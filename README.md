# Nubolabs — AI & Automation Agency

Sitio web de Nubolabs. Primera versión: landing pública (dirección de diseño **1b · claro & azul**) + estructura de backend (Firestore para leads y panel de administración placeholder).

Mismo stack que ConCar Chile: **Next.js 14 · TypeScript · Tailwind CSS · Firebase · Vercel**.

## Arquitectura

```
Visitante ──HTTPS──▶ App Next.js 14 (Vercel) ──▶ Servicios en la nube
                     ├─ Sitio público  /            ├─ Firestore   (leads, config)
                     └─ Panel admin    /admin        ├─ Firebase Auth (login admin)
                                                      └─ Vercel Blob (imágenes, v2)
```

- **Sitio público** (`/`): hero, problema, enfoque, servicios, modelo de trabajo, casos de uso y formulario de contacto.
- **Panel admin** (`/admin`): dashboard con KPIs, leads, servicios y configuración (placeholders listos para conectar).
- **API** (`/api/leads`): recibe el formulario y lo guarda en Firestore. Si Firebase no está configurado, no rompe: registra el lead en consola.

## Correr en local

```bash
npm install
cp .env.local.example .env.local   # completar credenciales (opcional para ver la UI)
npm run dev                        # http://localhost:3000
```

La landing funciona **sin credenciales**. El formulario responde OK igual (el lead queda solo en consola del servidor hasta configurar Firebase).

## Configurar Firebase (para persistir leads y login admin)

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com) y habilitar **Firestore** y **Authentication (Email/Password)**.
2. **Cliente**: Project settings → General → tus apps → copiar el SDK config a las variables `NEXT_PUBLIC_FIREBASE_*`.
3. **Admin**: Project settings → Service accounts → *Generate new private key* → copiar `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`.
4. Crear un usuario admin en Authentication para entrar a `/admin/login`.

## Deploy a Vercel

1. Push del repo a GitHub.
2. Import en Vercel → framework detectado automáticamente (Next.js).
3. Cargar las variables de entorno (las mismas de `.env.local.example`).
4. (Opcional) Dominio propio `nubolabs.ai` apuntando a los DNS de Vercel. HTTPS automático.

## Estructura

```
app/
  layout.tsx            Fuentes + metadata
  page.tsx              Landing (compone las secciones)
  globals.css           Tailwind + primitivas (.btn-primary, .card, .field…)
  api/leads/route.ts    POST → Firestore
  admin/                Panel: layout, dashboard, leads, servicios, config, login
components/
  Logo.tsx  icons.tsx   Marca e íconos
  landing/*             Nav, Hero, Problem, Approach, Services, Process, UseCases, ContactForm, Footer
lib/
  content.ts            Todos los textos de la landing (editar aquí)
  firebase.ts           SDK cliente (Auth)
  firebaseAdmin.ts      SDK servidor (Firestore)
types/lead.ts           Tipos de Lead
tailwind.config.ts      Paleta de marca (navy, brand, accent…)
```

## Personalizar

- **Textos**: `lib/content.ts`.
- **Colores**: `tailwind.config.ts` (`navy #0B1D3A`, `brand #1565FF`, `brand-light #00C2FF`, `accent #FF6B5E`).
- **Logo**: `components/Logo.tsx` (isotipo vectorial con nodo naranjo de acento).
```
