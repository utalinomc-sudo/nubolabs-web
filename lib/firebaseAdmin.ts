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
import { getAuth, type Auth } from "firebase-admin/auth";
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

export function getAdminAuth(): Auth | null {
  const a = getAdminApp();
  return a ? getAuth(a) : null;
}
