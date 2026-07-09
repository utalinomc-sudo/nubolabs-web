import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebaseAdmin";

const COOKIE = "admin_session";

export interface AdminSession {
  email: string;
}

/**
 * Verifica la cookie de sesión del admin.
 * - Devuelve la sesión si es válida.
 * - Devuelve null si no hay sesión o es inválida.
 * - Si Firebase Admin no está configurado (ej. desarrollo local sin
 *   credenciales), devuelve una sesión "dev" para no bloquear el trabajo local.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isAdminConfigured) return { email: "dev@local" };

  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;

  const auth = getAdminAuth();
  if (!auth) return null;

  try {
    const decoded = await auth.verifySessionCookie(token, true);
    return { email: decoded.email ?? "admin" };
  } catch {
    return null;
  }
}
