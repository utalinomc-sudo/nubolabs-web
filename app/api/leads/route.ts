import { NextResponse } from "next/server";
import { getDb, isAdminConfigured } from "@/lib/firebaseAdmin";
import type { LeadInput } from "@/types/lead";

export const runtime = "nodejs";

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
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    const ref = await db.collection("leads").add(lead);
    return NextResponse.json({ ok: true, persisted: true, id: ref.id });
  } catch (err) {
    console.error("[leads] Error escribiendo en Firestore:", err);
    return NextResponse.json(
      { error: "No se pudo guardar la solicitud. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
