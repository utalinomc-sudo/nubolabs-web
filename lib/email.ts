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

/**
 * Notifica por email un nuevo lead. Usa la API REST de Resend.
 * No-op si RESEND_API_KEY no está configurado (no bloquea el guardado del lead).
 */
export async function sendLeadNotification(lead: LeadEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

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

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) console.error("[email] Resend error:", await res.text());
  } catch (err) {
    console.error("[email] envío fallido:", err);
  }
}
