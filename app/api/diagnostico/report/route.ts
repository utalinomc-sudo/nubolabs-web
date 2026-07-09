import { NextResponse } from "next/server";
import { buildReportPdf, reportDataFromLead } from "@/lib/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Genera el informe de diagnóstico en PDF y lo devuelve para descarga.
// Recibe { name, company, meta } (los mismos datos que se envían a /api/leads).
export async function POST(req: Request) {
  let body: { name?: unknown; company?: unknown; meta?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const data = reportDataFromLead({
    name: typeof body.name === "string" ? body.name : "",
    company: typeof body.company === "string" ? body.company : "",
    meta: (body.meta as Record<string, unknown>) ?? null,
  });

  if (!data) {
    return NextResponse.json({ error: "Faltan datos del diagnóstico para generar el informe." }, { status: 400 });
  }

  try {
    const pdf = await buildReportPdf(data);
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Informe-diagnostico-Nubolabs.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[report] no se pudo generar el PDF:", err);
    return NextResponse.json({ error: "No se pudo generar el informe." }, { status: 500 });
  }
}
