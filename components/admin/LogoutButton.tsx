"use client";

import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
      const auth = getFirebaseAuth();
      if (auth) await signOut(auth);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      onClick={logout}
      className="mt-auto rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-ink-muted transition hover:text-accent"
    >
      Cerrar sesión
    </button>
  );
}
