import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getAdminSession } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Crea o actualiza un integrante del equipo. Si viene `id`, actualiza; si no, crea.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de datos no configurada." }, { status: 500 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const nombre = String(body.nombre ?? "").trim();
  if (!nombre) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });

  const data = {
    nombre,
    cargo: String(body.cargo ?? "").trim(),
    habilidades: Array.isArray(body.habilidades)
      ? (body.habilidades as unknown[]).map((h) => String(h).trim()).filter(Boolean)
      : [],
    fotoUrl: String(body.fotoUrl ?? "").trim(),
    orden: typeof body.orden === "number" ? body.orden : 0,
    updatedAt: new Date().toISOString(),
  };

  try {
    const id = typeof body.id === "string" && body.id ? body.id : undefined;
    if (id) {
      await db.collection("team").doc(id).set(data, { merge: true });
      return NextResponse.json({ ok: true, id });
    }
    const ref = await db.collection("team").add({ ...data, createdAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el integrante." }, { status: 500 });
  }
}
