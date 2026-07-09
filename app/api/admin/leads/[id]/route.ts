import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getAdminSession } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Elimina un lead. Requiere sesión de admin válida.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no configurada." }, { status: 500 });
  }

  try {
    await db.collection("leads").doc(params.id).delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el lead." }, { status: 500 });
  }
}
