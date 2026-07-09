import "server-only";

interface LeadEmail {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  message?: string;
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
    ["Teléfono", lead.phone],
    ["Empresa", lead.company],
    ["Origen", lead.source],
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

export interface ClientReportInput {
  name?: string;
  email: string;
  company?: string;
  indice?: number | null;
  nivel?: string | null;
  ahorroMes?: number | null;
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
  const firstName = (input.name || "").split(" ")[0];

  const fmtCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
  const subject = `Tu informe de diagnóstico — Nubolabs`;

  const chip = (label: string, value: string, color: string) =>
    `<td style="padding:0 8px 0 0"><div style="background:#F6F9FE;border:1px solid #E7EDF7;border-radius:12px;padding:12px 16px">
      <div style="font-size:11px;font-weight:700;letter-spacing:.5px;color:#5A6B85">${label}</div>
      <div style="font-size:20px;font-weight:800;color:${color};margin-top:2px">${value}</div></div></td>`;

  const chips: string[] = [];
  if (input.indice != null) chips.push(chip("ÍNDICE DE FRICCIÓN", `${input.indice}`, "#0B1D3A"));
  if (input.nivel) chips.push(chip("NIVEL", escapeHtml(input.nivel), "#1565FF"));
  if (input.ahorroMes && input.ahorroMes > 0) chips.push(chip("AHORRO ESTIMADO/MES", fmtCLP.format(input.ahorroMes), "#1565FF"));

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0B1D3A;max-width:560px;margin:0 auto">
      <div style="background:#0B1D3A;border-radius:16px;padding:26px 28px;color:#fff">
        <div style="font-size:22px;font-weight:800;letter-spacing:-.5px">Nubo<span style="color:#1565FF">labs</span></div>
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#00C2FF;margin-top:6px">INFORME DE DIAGNÓSTICO OPERATIVO</div>
      </div>
      <div style="padding:24px 4px">
        <h2 style="margin:0 0 6px;font-size:20px">Hola${firstName ? " " + escapeHtml(firstName) : ""}, aquí está tu informe 📊</h2>
        <p style="margin:0 0 18px;color:#5A6B85;line-height:1.6;font-size:14.5px">
          Gracias por completar el diagnóstico${input.company ? ` de <b>${escapeHtml(input.company)}</b>` : ""}.
          Adjunto va tu <b>informe en PDF</b> con tu índice de fricción, las áreas más críticas
          ${input.ahorroMes && input.ahorroMes > 0 ? "y tu ahorro estimado" : ""}.
        </p>
        ${chips.length ? `<table style="border-collapse:separate;margin:0 0 20px"><tr>${chips.join("")}</tr></table>` : ""}
        <div style="background:#EBF1FF;border-radius:14px;padding:20px 22px;margin:4px 0 20px">
          <div style="font-size:16px;font-weight:800;margin-bottom:4px">El siguiente paso: tu sesión de diagnóstico</div>
          <p style="margin:0 0 16px;color:#5A6B85;line-height:1.55;font-size:13.5px">
            Agendemos 30 minutos para revisar juntos estos resultados y priorizar qué automatizar primero.
          </p>
          <a href="${scheduleUrl}" style="background:#1565FF;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">
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
