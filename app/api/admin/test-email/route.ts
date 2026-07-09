import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { sendLeadNotification } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnóstico: dispara un correo de prueba y devuelve la respuesta de Resend.
// Protegido: requiere sesión de admin. No expone la API key.
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const configured = Boolean(process.env.RESEND_API_KEY);
  const result = await sendLeadNotification({
    name: "PRUEBA de correo",
    email: session.email,
    phone: "+56 9 1234 5678",
    company: "Test",
    source: "test-email",
  });

  return NextResponse.json({
    resendKeyPresent: configured,
    notifyEmail: process.env.NOTIFY_EMAIL || "(default) mauricio.nubolabs@gmail.com",
    notifyFrom: process.env.NOTIFY_FROM || "(default) Nubolabs <onboarding@resend.dev>",
    result,
  });
}
