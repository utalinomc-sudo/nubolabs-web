import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getAdminSession } from "@/lib/adminAuth";
import { buildLeadDetailPdf, type LeadRecord } from "@/lib/leadReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Exporta la ficha completa de un lead a PDF. Protegido: requiere sesión de admin.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de datos no configurada." }, { status: 500 });

  const doc = await db.collection("leads").doc(params.id).get();
  if (!doc.exists) return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });

  const lead = { id: doc.id, ...doc.data() } as LeadRecord;

  // Nombre de archivo seguro (ASCII) a partir del nombre del lead.
  const slug =
    String(lead.name ?? "lead")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // quita diacríticos (tildes, ñ→n, etc.)
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "lead";

  try {
    const pdf = await buildLeadDetailPdf(lead);
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="lead-${slug}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[lead-pdf] no se pudo generar el PDF:", err);
    return NextResponse.json({ error: "No se pudo generar el PDF." }, { status: 500 });
  }
}
