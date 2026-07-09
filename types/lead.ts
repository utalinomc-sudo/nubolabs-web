export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  source?: string;
  // Datos estructurados adicionales (ej. el detalle del diagnóstico de ahorro).
  meta?: Record<string, unknown>;
}

export interface Lead extends LeadInput {
  id: string;
  createdAt: string; // ISO
  source: string;
}
