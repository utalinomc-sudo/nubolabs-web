import "server-only";
import { leadOriginText, leadSummaryRows } from "@/lib/leadSummary";

interface LeadEmail {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  referral?: string; // cambio landing-referidos-oa
  message?: string;
  // Desde formulario-minimo-consentimiento (opcionales para no romper leads antiguos).
  goals?: string[];
  industry?: string;
  goalOther?: string;
  industryOther?: string;
  marketingConsent?: boolean;
  consentAt?: string;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

export interface EmailResult {
  skipped?: boolean;
  ok?: boolean;
  status?: number;
  body?: string;
  from?: string;
  to?: string[];
  error?: string;
}

interface Attachment {
  filename: string;
  content: string; // base64
}

/** Envío directo vía API REST de Resend. Devuelve el resultado sin exponer la key. */
async function sendViaResend(payload: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Attachment[];
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, error: "RESEND_API_KEY no está configurada." };

  const body: Record<string, unknown> = {
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  };
  if (payload.replyTo) body.reply_to = payload.replyTo;
  if (payload.attachments?.length) body.attachments = payload.attachments;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const respText = await res.text();
    if (!res.ok) console.error("[email] Resend error:", res.status, respText);
    return { ok: res.ok, status: res.status, body: respText.slice(0, 500), from: payload.from, to: payload.to };
  } catch (err) {
    console.error("[email] envío fallido:", err);
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed", from: payload.from, to: payload.to };
  }
}

/**
 * Notifica por email un nuevo lead. Usa la API REST de Resend.
 * No-op si RESEND_API_KEY no está configurado (no bloquea el guardado del lead).
 * Devuelve el resultado para diagnóstico (sin exponer la API key).
 */
export async function sendLeadNotification(lead: LeadEmail): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) return { skipped: true, error: "RESEND_API_KEY no está configurada." };

  const to = (process.env.NOTIFY_EMAIL || "mauricio.nubolabs@gmail.com").split(",").map((s) => s.trim());
  const from = process.env.NOTIFY_FROM || "Nubolabs <onboarding@resend.dev>";

  const subject = `Nuevo LEAD - ${lead.name || "s/nombre"} - ${lead.company || "s/empresa"} - ${lead.phone || "s/teléfono"}`;

  const rows: [string, string | undefined][] = [
    ["Nombre", lead.name],
    ["Email", lead.email],
    ["WhatsApp", lead.phone],
    ["Empresa", lead.company],
    ...leadSummaryRows(lead), // Rubro, Quiere lograr, Novedades (solo si hay dato)
    ["Origen", leadOriginText(lead)], // con el referido: "landing · referido O&A"
  ];
  const rowsHtml = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:5px 14px 5px 0;color:#5A6B85">${k}</td><td style="padding:5px 0;font-weight:600">${escapeHtml(String(v))}</td></tr>`,
    )
    .join("");

  const link = lead.id ? `https://www.nubolabs.cl/admin/leads/${lead.id}` : "https://www.nubolabs.cl/admin/leads";

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#0B1D3A;max-width:520px">
      <h2 style="margin:0 0 4px">Nuevo lead 🚀</h2>
      <p style="margin:0 0 16px;color:#5A6B85">Llegó una nueva solicitud desde nubolabs.cl.</p>
      <table style="font-size:14px;border-collapse:collapse">${rowsHtml}</table>
      ${lead.message ? `<p style="margin:16px 0;color:#5A6B85;white-space:pre-wrap">${escapeHtml(lead.message)}</p>` : ""}
      <p style="margin:20px 0 0">
        <a href="${link}" style="background:#1565FF;color:#fff;padding:11px 20px;border-radius:9px;text-decoration:none;font-weight:700">Ver en el panel →</a>
      </p>
    </div>`;

  return sendViaResend({ from, to, subject, html });
}

// Correo que acompaña al informe (cambio diagnostico-mapa-oportunidades, design.md decisión 4): nombra la mayor
// oportunidad y el próximo paso; nunca el índice de fricción ni montos de ahorro.
export interface ClientReportInput {
  name?: string;
  email: string;
  company?: string;
  oportunidadPrincipal?: string; // nombre de la primera oportunidad principal
  proximoPaso?: string;
}

// HTML del correo al cliente. Pura (exportada para probarla); todo dato del cliente va escapado.
export function buildClientReportHtml(input: ClientReportInput, scheduleUrl: string): string {
  const firstName = (input.name || "").trim().split(" ")[0];
  const oportunidad = input.oportunidadPrincipal?.trim();
  const paso = input.proximoPaso?.trim();
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0B1D3A;max-width:560px;margin:0 auto">
      <div style="background:#0B1D3A;border-radius:16px;padding:26px 28px;color:#fff">
        <div style="font-size:22px;font-weight:800;letter-spacing:-.5px">Nubo<span style="color:#1565FF">labs</span></div>
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#00C2FF;margin-top:6px">TU MAPA DE OPORTUNIDADES</div>
      </div>
      <div style="padding:24px 4px">
        <h2 style="margin:0 0 6px;font-size:20px">Hola${firstName ? " " + escapeHtml(firstName) : ""}, aquí está tu informe 📊</h2>
        <p style="margin:0 0 18px;color:#5A6B85;line-height:1.6;font-size:14.5px">
          Gracias por completar el autodiagnóstico${input.company ? ` de <b>${escapeHtml(input.company)}</b>` : ""}.
          Adjunto va tu <b>informe en PDF</b> con tu mapa de oportunidades y por dónde te conviene partir.
        </p>
        ${
          oportunidad
            ? `<div style="background:#F6F9FE;border:1px solid #E7EDF7;border-radius:12px;padding:14px 18px;margin:0 0 20px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.5px;color:#5A6B85">TU MAYOR OPORTUNIDAD</div>
          <div style="font-size:19px;font-weight:800;color:#1565FF;margin-top:2px">${escapeHtml(oportunidad)}</div>
          ${paso ? `<div style="font-size:13.5px;color:#3D4E6B;line-height:1.5;margin-top:6px"><b>Próximo paso sugerido:</b> ${escapeHtml(paso)}</div>` : ""}
        </div>`
            : ""
        }
        <div style="background:#EBF1FF;border-radius:14px;padding:20px 22px;margin:4px 0 20px">
          <div style="font-size:16px;font-weight:800;margin-bottom:4px">El siguiente paso: tu sesión gratuita</div>
          <p style="margin:0 0 16px;color:#5A6B85;line-height:1.55;font-size:13.5px">
            Agendemos 30 minutos para revisar juntos tu mapa y definir por dónde partir.
          </p>
          <a href="${escapeHtml(scheduleUrl)}" style="background:#1565FF;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">
            Agendar mi sesión →
          </a>
        </div>
        <p style="margin:0;color:#93A5C4;font-size:12.5px;line-height:1.55">
          También puedes simplemente responder este correo. El informe es referencial: en la sesión lo revisamos contigo.
        </p>
      </div>
      <div style="border-top:1px solid #EEF2F8;padding:16px 4px;color:#93A5C4;font-size:12px">
        Nubolabs · <a href="https://www.nubolabs.cl" style="color:#1565FF;text-decoration:none">nubolabs.cl</a> · Tu operación, en piloto automático.
      </div>
    </div>`;
}

/**
 * Envía al cliente su informe de diagnóstico en PDF, con un CTA para agendar.
 * No-op si RESEND_API_KEY no está configurado. Devuelve el resultado (sin exponer la key).
 *
 * ⚠️ Con `onboarding@resend.dev` (sin dominio verificado) Resend SOLO entrega al
 * dueño de la cuenta; para llegar al correo del cliente hay que verificar el dominio
 * en Resend y usar NOTIFY_FROM con ese dominio (ej. informe@nubolabs.cl).
 */
export async function sendClientReport(input: ClientReportInput, pdf: Uint8Array): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) return { skipped: true, error: "RESEND_API_KEY no está configurada." };

  const from = process.env.REPORT_FROM || process.env.NOTIFY_FROM || "Nubolabs <onboarding@resend.dev>";
  const replyTo = (process.env.NOTIFY_EMAIL || "mauricio.nubolabs@gmail.com").split(",")[0].trim();
  const scheduleUrl = process.env.SCHEDULE_URL || "https://www.nubolabs.cl";
  const subject = `Tu mapa de oportunidades — Nubolabs`;
  const html = buildClientReportHtml(input, scheduleUrl);

  // Uint8Array → base64 (Node runtime).
  const content = Buffer.from(pdf).toString("base64");

  return sendViaResend({
    from,
    to: [input.email],
    subject,
    html,
    replyTo,
    attachments: [{ filename: "Informe-diagnostico-Nubolabs.pdf", content }],
  });
}
