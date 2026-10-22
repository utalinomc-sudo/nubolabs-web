// Referido de la visita en el navegador (cambio landing-referidos-oa, design.md decisión 4). Sin "server-only":
// parseReferral lo usa el servidor (`/?ref=oa`) y el resto, los componentes cliente. Todo acceso a sessionStorage va en
// try/catch: en navegación privada o con el almacenamiento bloqueado no se guarda nada y el sitio sigue igual.
import { isReferral, type Referral } from "@/lib/leadOptions";

export const REFERRAL_STORAGE_KEY = "nubolabs_ref";
export const BANNER_CLOSED_KEY = "nubolabs_ref_banner_closed";

// `?ref=` llega como texto o arreglo (parámetro repetido): se toma el primero, recortado, y se valida contra REFERRALS.
export function parseReferral(value: unknown): Referral | null {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== "string") return null;
  const v = first.trim();
  return isReferral(v) ? v : null;
}

function read(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // almacenamiento bloqueado: el lead sale sin referido y la franja vuelve a aparecer al recargar
  }
}

// sessionStorage dura lo que la pestaña: es justo el alcance de la campaña (no atribuye visitas de otro día).
export function rememberReferral(referral: Referral): void {
  write(REFERRAL_STORAGE_KEY, referral);
}

// Se lee al enviar un formulario. Un valor guardado que no esté en la lista se ignora.
export function readStoredReferral(): Referral | null {
  return parseReferral(read(REFERRAL_STORAGE_KEY));
}

// Cerrar la franja solo la oculta; la marca de referido sigue.
export function markBannerClosed(): void {
  write(BANNER_CLOSED_KEY, "1");
}

export function isBannerClosed(): boolean {
  return read(BANNER_CLOSED_KEY) === "1";
}
