import { NextResponse } from "next/server";
import { getDb, isAdminConfigured } from "@/lib/firebaseAdmin";
import { sendLeadNotification, sendClientReport } from "@/lib/email";
import { isHoneypotFilled, normalizeLead } from "@/lib/leads";
import { buildReportPdf, reportDataFromLead } from "@/lib/report";
import type { LeadRecord } from "@/types/lead";

export const runtime = "nodejs";

/**
 * Genera el informe en PDF y lo envía por correo al cliente.
 * Solo aplica a leads de diagnóstico con índice de fricción. No bloquea ni lanza:
 * cualquier error se registra y se ignora (el lead ya quedó guardado).
 */
async function maybeSendClientReport(lead: LeadRecord) {
  if (lead.source !== "diagnostico") return;
  if (!lead.email) return;

  const data = reportDataFromLead({ name: lead.name, company: lead.company, meta: lead.meta ?? null });
  if (!data) return; // sin índice de fricción → no hay informe

  try {
    const pdf = await buildReportPdf(data);
    const result = await sendClientReport(
      {
        name: data.name,
        email: lead.email,
        company: data.company,
        indice: data.indice,
        nivel: data.nivel,
        ahorroMes: data.ahorro?.mes ?? null,
      },
      pdf,
    );
    if (result.ok) console.log("[report] informe enviado al cliente");
    else if (!result.skipped) console.error("[report] Resend rechazó el informe:", result.status, result.body);
  } catch (err) {
    console.error("[report] no se pudo generar/enviar el informe:", err);
  }
}

// POST /api/leads — cambio formulario-minimo-consentimiento (design.md decisión 3):
// honeypot → normalizeLead (validación + prueba del consentimiento) → persistencia → efectos no bloqueantes.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // Campo trampa lleno: respondemos como si todo fuera bien, sin guardar ni avisar.
  if (isHoneypotFilled(body)) {
    console.warn("[leads] honeypot");
    return NextResponse.json({ ok: true, persisted: false });
  }

  const result = normalizeLead(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const lead = result.lead;

  // Sin Firebase Admin (ej. desarrollo local) respondemos OK para no bloquear el flujo.
  // El log no lleva datos personales (base-standards §9): solo origen, cantidad de objetivos y rubro.
  const db = getDb();
  if (!db || !isAdminConfigured) {
    console.warn(
      "[leads] Firebase Admin no configurado. Lead válido no persistido:",
      JSON.stringify({ source: lead.source, referral: lead.referral ?? null, goals: lead.goals?.length ?? 0, industry: lead.industry ?? null }),
    );
    await Promise.all([sendLeadNotification(lead), maybeSendClientReport(lead)]);
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    const ref = await db.collection("leads").add(lead);
    await Promise.all([sendLeadNotification({ ...lead, id: ref.id }), maybeSendClientReport(lead)]);
    return NextResponse.json({ ok: true, persisted: true, id: ref.id });
  } catch (err) {
    console.error("[leads] Error escribiendo en Firestore:", err);
    return NextResponse.json({ error: "No se pudo guardar la solicitud. Intenta de nuevo." }, { status: 500 });
  }
}
