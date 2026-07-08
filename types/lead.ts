export interface LeadInput {
  name: string;
  email: string;
  company?: string;
  message?: string;
}

export interface Lead extends LeadInput {
  id: string;
  createdAt: string; // ISO
  source: string;
}
