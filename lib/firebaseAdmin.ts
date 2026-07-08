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

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// La private key llega con "\n" escapados desde el .env → los normalizamos.
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const isAdminConfigured = Boolean(projectId && clientEmail && privateKey);

let adminApp: App | null = null;

function getAdminApp(): App | null {
  if (!isAdminConfigured) return null;
  if (!adminApp) {
    adminApp = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        });
  }
  return adminApp;
}

export function getDb(): Firestore | null {
  const a = getAdminApp();
  return a ? getFirestore(a) : null;
}
