"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function AdminLogin() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));

    const auth = getFirebaseAuth();
    if (!auth) {
      setStatus("error");
      setError("Firebase no está configurado. Completa las variables NEXT_PUBLIC_FIREBASE_* para habilitar el login.");
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("session");
      router.push("/admin");
      router.refresh();
    } catch {
      setStatus("error");
      setError("Credenciales incorrectas.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-6">
      <div className="w-full max-w-sm rounded-[20px] border border-line bg-white p-8 shadow-card">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-1 text-center text-xl font-extrabold">Panel de administración</h1>
        <p className="mb-6 text-center text-sm text-ink-muted">Acceso interno de Nubolabs</p>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input name="email" type="email" required placeholder="Email" className="field" />
          <input name="password" type="password" required placeholder="Contraseña" className="field" />
          {status === "error" && <p className="text-sm font-medium text-accent">{error}</p>}
          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-1 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {status === "loading" ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        {!isFirebaseConfigured && (
          <p className="mt-4 text-center text-[11px] text-ink-muted">
            Firebase (cliente) aún no configurado — faltan las variables <code>NEXT_PUBLIC_FIREBASE_*</code>.
          </p>
        )}
      </div>
    </div>
  );
}
