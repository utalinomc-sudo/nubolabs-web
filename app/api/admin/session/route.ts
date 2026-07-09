import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const COOKIE = "admin_session";
const EXPIRES_MS = 5 * 24 * 60 * 60 * 1000; // 5 días

// Inicia sesión: recibe el ID token del cliente y lo cambia por una cookie
// de sesión httpOnly verificable en el servidor.
export async function POST(req: Request) {
  const auth = getAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: "Auth no configurado en el servidor." }, { status: 500 });
  }

  let idToken: string | undefined;
  try {
    idToken = (await req.json()).idToken;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (!idToken) {
    return NextResponse.json({ error: "Falta el token." }, { status: 400 });
  }

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: EXPIRES_MS });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: EXPIRES_MS / 1000,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "No se pudo crear la sesión." }, { status: 401 });
  }
}

// Cierra sesión: borra la cookie.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
