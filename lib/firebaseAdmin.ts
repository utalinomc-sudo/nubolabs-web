// Firebase Admin (SDK servidor) — se usa en rutas API para escribir en Firestore.
// Nunca se importa desde componentes cliente.
import "server-only";
import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import { normalizePrivateKey } from "@/lib/privateKey";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// La private key llega con "\n" escapados desde el .env (y a veces con comillas o en una sola línea
// desde Vercel): se lleva a su forma PEM canónica, que es la que exige firebase-admin 14.
const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

export const isAdminConfigured = Boolean(projectId && clientEmail && privateKey);

let adminApp: App | null = null;
// Si la inicialización falla (por ejemplo, clave inválida) no se reintenta en cada petición:
// el sitio degrada como si no hubiera credenciales y el error queda una sola vez en el log.
let initFailed = false;

function getAdminApp(): App | null {
  if (!isAdminConfigured || initFailed) return null;
  if (!adminApp) {
    try {
      adminApp = getApps().length
        ? getApps()[0]
        : initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
          });
    } catch (err) {
      initFailed = true;
      // Nunca se registra la clave: solo el mensaje del SDK.
      console.error(
        "[firebase-admin] no se pudo inicializar el SDK; el sitio sigue sin Firestore ni sesión admin:",
        err instanceof Error ? err.message : err,
      );
      return null;
    }
  }
  return adminApp;
}

export function getDb(): Firestore | null {
  const a = getAdminApp();
  return a ? getFirestore(a) : null;
}

// `firebase-admin/auth` se carga solo cuando el panel lo necesita y de forma protegida: arrastra
// `jwks-rsa` → `jose` (solo ESM), que exige Node ≥ 20.19 / 22.12. Si el runtime no puede cargarlo, el
// sitio público (que solo usa app + firestore) sigue funcionando y el panel responde "Auth no configurado".
let authModule: typeof import("firebase-admin/auth") | null = null;
let authLoadFailed = false;

export async function getAdminAuth(): Promise<Auth | null> {
  const a = getAdminApp();
  if (!a || authLoadFailed) return null;
  if (!authModule) {
    try {
      authModule = await import("firebase-admin/auth");
    } catch (err) {
      authLoadFailed = true;
      console.error(
        "[firebase-admin] no se pudo cargar firebase-admin/auth (¿Node anterior a 20.19/22.12 sin require(esm)?); el panel queda sin sesión:",
        err instanceof Error ? err.message : err,
      );
      return null;
    }
  }
  return authModule.getAuth(a);
}
