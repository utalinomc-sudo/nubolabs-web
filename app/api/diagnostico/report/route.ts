import { NextResponse } from "next/server";
import { buildReportPdf, reportDataFromLead } from "@/lib/report";
import { normalizeDiagnosticMeta } from "@/components/diagnostico/oportunidades";
import { META_MAX_BYTES } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Genera el informe de diagnóstico en PDF y lo devuelve para descarga.
// Recibe { name, company, meta } (los mismos datos que se envían a /api/leads).
export async function POST(req: Request) {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  // Solo un objeto, con un meta acotado (antes un `null` daba 500 y el tamaño no tenía límite).
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const body = parsed as { name?: unknown; company?: unknown; meta?: unknown };
  const rawMeta = body.meta && typeof body.meta === "object" && !Array.isArray(body.meta) ? (body.meta as Record<string, unknown>) : null;
  if (rawMeta && JSON.stringify(rawMeta).length > META_MAX_BYTES) {
    return NextResponse.json({ error: "Faltan datos del diagnóstico para generar el informe." }, { status: 400 });
  }

  const data = reportDataFromLead({
    name: typeof body.name === "string" ? body.name : "",
    company: typeof body.company === "string" ? body.company : "",
    // Misma limpieza que el lead: solo preguntas abiertas conocidas y puntajes válidos (cambio diagnostico-mapa-oportunidades).
    meta: rawMeta ? normalizeDiagnosticMeta(rawMeta) : null,
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
