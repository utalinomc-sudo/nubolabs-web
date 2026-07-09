"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteLeadButton({ id, name }: { id: string; name?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const canDelete = text.trim().toLowerCase() === "eliminar";

  function close() {
    setOpen(false);
    setText("");
    setStatus("idle");
    setError("");
  }

  async function confirmar() {
    if (!canDelete) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/admin/leads");
      router.refresh();
    } catch {
      setStatus("error");
      setError("No se pudo eliminar. Intenta de nuevo.");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-[#F3C9C4] px-3.5 py-2 text-sm font-semibold text-accent transition hover:bg-[#FFEFED]"
      >
        Eliminar lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-extrabold">Eliminar lead</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Vas a eliminar {name ? <b>{name}</b> : "este lead"} de forma permanente. Esta acción{" "}
              <b>no se puede deshacer</b>.
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              Para confirmar, escribe <b className="text-accent">eliminar</b>:
            </p>
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmar()}
              placeholder="eliminar"
              className="field mt-2"
            />
            {status === "error" && <p className="mt-2 text-sm font-medium text-accent">{error}</p>}
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={close} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-ink-muted hover:text-ink">
                Cancelar
              </button>
              <button
                onClick={confirmar}
                disabled={!canDelete || status === "loading"}
                className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "loading" ? "Eliminando…" : "Eliminar definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
