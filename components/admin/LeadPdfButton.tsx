"use client";

import { useState } from "react";

// Descarga la ficha completa del lead en PDF (endpoint protegido por sesión de admin).
export function LeadPdfButton({ id }: { id: string }) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  async function exportar() {
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/admin/leads/${id}/pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // El nombre real viene del header Content-Disposition; damos un fallback.
      a.download = "ficha-lead.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <button
      onClick={exportar}
      disabled={status === "loading"}
      className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-surface-soft disabled:opacity-60"
    >
      {status === "loading" ? "Generando…" : "Exportar PDF ↓"}
    </button>
  );
}
