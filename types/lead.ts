import type { GoalKey, IndustryKey } from "@/lib/leadOptions";

// Lo que envían los formularios a POST /api/leads (todo llega como `unknown` y se valida en lib/leads.ts).
export interface LeadInput {
  name: string;
  email: string;
  phone?: string; // WhatsApp; obligatorio desde formulario-minimo-consentimiento
  company?: string;
  message?: string;
  source?: string;
  goals?: string[];
  industry?: string;
  contactConsent?: boolean; // obligatorio: debe ser exactamente true
  marketingConsent?: boolean;
  website?: string; // campo trampa (honeypot): debe llegar vacío
  // Datos estructurados adicionales (ej. el detalle del diagnóstico de ahorro).
  meta?: Record<string, unknown>;
}

// Texto exacto de cada casilla aceptada (prueba del consentimiento, Ley 21.719).
export interface ConsentText {
  contact: string;
  marketing?: string;
}

// Documento que se guarda en la colección `leads` (salida de normalizeLead).
export interface LeadRecord {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  source: string;
  status: string;
  createdAt: string; // ISO
  goals?: GoalKey[];
  industry?: IndustryKey;
  contactConsent: true;
  marketingConsent: boolean;
  consentAt: string; // ISO, hora del servidor
  consentVersion: string;
  consentText: ConsentText;
  meta?: Record<string, unknown>;
}

// Lead leído desde Firestore. Los leads anteriores a este cambio no traen los campos de consentimiento.
export interface Lead extends Omit<LeadRecord, "contactConsent" | "marketingConsent" | "consentAt" | "consentVersion" | "consentText"> {
  id: string;
  contactConsent?: boolean;
  marketingConsent?: boolean;
  consentAt?: string;
  consentVersion?: string;
  consentText?: ConsentText;
}
