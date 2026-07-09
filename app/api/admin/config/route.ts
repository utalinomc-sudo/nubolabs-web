import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getAdminSession } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Guarda (merge) la configuración del sitio: visibilidad y/o contenido.
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

  const patch: Record<string, unknown> = {};
  if (body.visible && typeof body.visible === "object") patch.visible = body.visible;
  if (body.content && typeof body.content === "object") patch.content = body.content;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada que guardar." }, { status: 400 });
  }

  try {
    await db.collection("config").doc("site").set(patch, { merge: true });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la configuración." }, { status: 500 });
  }
}
