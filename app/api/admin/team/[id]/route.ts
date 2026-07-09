import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getAdminSession } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Elimina un integrante del equipo.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de datos no configurada." }, { status: 500 });

  try {
    await db.collection("team").doc(params.id).delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el integrante." }, { status: 500 });
  }
}
