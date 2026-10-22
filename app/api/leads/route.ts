import { NextResponse } from "next/server";
import { getDb, isAdminConfigured } from "@/lib/firebaseAdmin";
import { sendLeadNotification, sendClientReport } from "@/lib/email";
import { isHoneypotFilled, normalizeLead } from "@/lib/leads";
import { buildReportPdf, reportDataFromLead } from "@/lib/report";
import { diagnosticSummary, dimensionName, normalizeDiagnosticMeta } from "@/components/diagnostico/oportunidades";
import type { LeadRecord } from "@/types/lead";

export const runtime = "nodejs";

/**
 * Genera el informe en PDF y lo envía por correo al cliente.
 * Solo aplica a leads de diagnóstico con respuestas por área (mapa de oportunidades). No bloquea ni lanza:
 * cualquier error se registra y se ignora (el lead ya quedó guardado).
 */
async function maybeSendClientReport(lead: LeadRecord) {
  if (lead.source !== "diagnostico") return;
  if (!lead.email) return;

  const data = reportDataFromLead({ name: lead.name, company: lead.company, meta: lead.meta ?? null });
  if (!data) return; // sin áreas con puntaje → no hay informe

  try {
    const pdf = await buildReportPdf(data);
    const result = await sendClientReport(
      {
        name: data.name,
        email: lead.email,
        company: data.company,
        oportunidadPrincipal: dimensionName(data.mapa.principales[0]) ?? undefined,
        proximoPaso: data.mapa.proximoPaso || undefined,
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
  // El servidor rearma el meta del diagnóstico (áreas completas, respuestas válidas, mapa calculado, sin `ahorro`) y el
  // resumen interno, sin confiar en lo que mande el cliente (cambio diagnostico-mapa-oportunidades, design.md decisión 3).
  if (lead.source === "diagnostico" && lead.meta) {
    lead.meta = normalizeDiagnosticMeta(lead.meta);
    lead.message = diagnosticSummary(lead.meta);
  }

  // Sin Firebase Admin (ej. desarrollo local) respondemos OK para no bloquear el flujo.
  // El log no lleva datos personales (base-standards §9): solo origen, cantidad de objetivos y rubro.
  const db = getDb();
  if (!db || !isAdminConfigured) {
    console.warn(
      "[leads] Firebase Admin no configurado. Lead válido no persistido:",
      JSON.stringify({
        source: lead.source,
        referral: lead.referral ?? null,
        goals: lead.goals?.length ?? 0,
        industry: lead.industry ?? null,
        oportunidades: (lead.meta?.oportunidades as { principales?: unknown } | undefined)?.principales ?? null,
        ahorro: lead.meta ? "ahorro" in lead.meta : false,
      }),
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
