import { NextResponse } from "next/server";
import { getDb, isAdminConfigured } from "@/lib/firebaseAdmin";
import { sendLeadNotification, sendClientReport } from "@/lib/email";
import { buildReportPdf, reportDataFromLead } from "@/lib/report";
import type { LeadInput } from "@/types/lead";

export const runtime = "nodejs";

/**
 * Genera el informe en PDF y lo envía por correo al cliente.
 * Solo aplica a leads de diagnóstico con índice de fricción. No bloquea ni lanza:
 * cualquier error se registra y se ignora (el lead ya quedó guardado).
 */
async function maybeSendClientReport(lead: Record<string, unknown>) {
  if (lead.source !== "diagnostico") return;
  const email = typeof lead.email === "string" ? lead.email : "";
  if (!email) return;

  const data = reportDataFromLead({
    name: typeof lead.name === "string" ? lead.name : "",
    company: typeof lead.company === "string" ? lead.company : "",
    meta: (lead.meta as Record<string, unknown>) ?? null,
  });
  if (!data) return; // sin índice de fricción → no hay informe

  try {
    const pdf = await buildReportPdf(data);
    const result = await sendClientReport(
      {
        name: data.name,
        email,
        company: data.company,
        indice: data.indice,
        nivel: data.nivel,
        ahorroMes: data.ahorro?.mes ?? null,
      },
      pdf,
    );
    if (result.ok) console.log("[report] informe enviado al cliente:", email);
    else if (!result.skipped) console.error("[report] Resend rechazó el informe:", result.status, result.body);
  } catch (err) {
    console.error("[report] no se pudo generar/enviar el informe:", err);
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  let body: Partial<LeadInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();

  if (!name || !email) {
    return NextResponse.json({ error: "Nombre y email son obligatorios." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "El email no es válido." }, { status: 400 });
  }

  const lead: Record<string, unknown> = {
    name,
    email,
    phone: body.phone?.trim() || "",
    company: body.company?.trim() || "",
    message: body.message?.trim() || "",
    source: body.source?.trim() || "landing",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  // Adjunta el detalle estructurado (ej. procesos y totales del diagnóstico).
  if (body.meta && typeof body.meta === "object") {
    lead.meta = body.meta;
  }

  // Si Firebase Admin no está configurado (ej. desarrollo local sin credenciales),
  // registramos en consola y respondemos OK igual, para no bloquear el flujo.
  const db = getDb();
  if (!db || !isAdminConfigured) {
    console.warn("[leads] Firebase Admin no configurado. Lead recibido (no persistido):", lead);
    await Promise.all([
      sendLeadNotification(lead as Parameters<typeof sendLeadNotification>[0]),
      maybeSendClientReport(lead),
    ]);
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    const ref = await db.collection("leads").add(lead);
    await Promise.all([
      sendLeadNotification({ ...(lead as Parameters<typeof sendLeadNotification>[0]), id: ref.id }),
      maybeSendClientReport(lead),
    ]);
    return NextResponse.json({ ok: true, persisted: true, id: ref.id });
  } catch (err) {
    console.error("[leads] Error escribiendo en Firestore:", err);
    return NextResponse.json(
      { error: "No se pudo guardar la solicitud. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
