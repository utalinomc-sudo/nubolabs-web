"use client";

import { useState, useRef } from "react";

interface Equipo {
  eyebrow: string;
  title: string;
  historia: string;
}
interface Member {
  id: string; // id de Firestore, o "" si aún no se guarda
  nombre: string;
  cargo: string;
  habilidadesText: string;
  fotoUrl: string;
  orden: number;
}
interface Props {
  initialEquipo: Equipo;
  initialMembers: { id: string; nombre: string; cargo: string; habilidades: string[]; fotoUrl: string; orden: number }[];
}

export function TeamEditor({ initialEquipo, initialMembers }: Props) {
  const [equipo, setEquipo] = useState<Equipo>(initialEquipo);
  const [members, setMembers] = useState<Member[]>(
    initialMembers.map((m) => ({ ...m, habilidadesText: m.habilidades.join(", ") })),
  );
  const [storyStatus, setStoryStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [busy, setBusy] = useState<string | null>(null); // key del miembro en operación

  async function saveStory() {
    setStoryStatus("saving");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { equipo } }),
      });
      if (!res.ok) throw new Error();
      setStoryStatus("ok");
      setTimeout(() => setStoryStatus("idle"), 2500);
    } catch {
      setStoryStatus("error");
    }
  }

  function updateMember(idx: number, patch: Partial<Member>) {
    setMembers((ms) => ms.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  }

  function addMember() {
    setMembers((ms) => [...ms, { id: "", nombre: "", cargo: "", habilidadesText: "", fotoUrl: "", orden: ms.length }]);
  }

  async function uploadPhoto(idx: number, file: File) {
    setBusy(`up-${idx}`);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "");
      updateMember(idx, { fotoUrl: json.url });
    } catch (e) {
      alert(e instanceof Error && e.message ? e.message : "No se pudo subir la imagen.");
    } finally {
      setBusy(null);
    }
  }

  async function saveMember(idx: number) {
    const m = members[idx];
    if (!m.nombre.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }
    setBusy(`save-${idx}`);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: m.id || undefined,
          nombre: m.nombre,
          cargo: m.cargo,
          habilidades: m.habilidadesText.split(",").map((s) => s.trim()).filter(Boolean),
          fotoUrl: m.fotoUrl,
          orden: m.orden,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error();
      updateMember(idx, { id: json.id });
    } catch {
      alert("No se pudo guardar el integrante.");
    } finally {
      setBusy(null);
    }
  }

  async function removeMember(idx: number) {
    const m = members[idx];
    if (m.id) {
      if (!confirm(`¿Eliminar a ${m.nombre || "este integrante"}?`)) return;
      setBusy(`del-${idx}`);
      try {
        const res = await fetch(`/api/admin/team/${m.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
      } catch {
        alert("No se pudo eliminar.");
        setBusy(null);
        return;
      }
      setBusy(null);
    }
    setMembers((ms) => ms.filter((_, i) => i !== idx));
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Historia del equipo */}
      <section className="card p-6">
        <h2 className="font-extrabold">Historia del equipo</h2>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-[13px] font-semibold text-ink-soft">Etiqueta</span>
            <input className="field mt-1.5" value={equipo.eyebrow} onChange={(e) => setEquipo({ ...equipo, eyebrow: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-[13px] font-semibold text-ink-soft">Título</span>
            <input className="field mt-1.5" value={equipo.title} onChange={(e) => setEquipo({ ...equipo, title: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-[13px] font-semibold text-ink-soft">Historia</span>
            <textarea
              className="field mt-1.5 resize-none"
              rows={5}
              value={equipo.historia}
              onChange={(e) => setEquipo({ ...equipo, historia: e.target.value })}
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={saveStory}
              disabled={storyStatus === "saving"}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60"
            >
              {storyStatus === "saving" ? "Guardando…" : "Guardar historia"}
            </button>
            {storyStatus === "ok" && <span className="text-sm font-semibold text-[#18A45C]">✓ Guardado</span>}
            {storyStatus === "error" && <span className="text-sm font-semibold text-accent">Error al guardar</span>}
          </div>
        </div>
      </section>

      {/* Integrantes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Integrantes</h2>
          <button onClick={addMember} className="text-sm font-semibold text-brand hover:underline">
            + Agregar integrante
          </button>
        </div>
        <div className="space-y-4">
          {members.length === 0 && <p className="text-sm text-ink-muted">Aún no hay integrantes. Agrega el primero.</p>}
          {members.map((m, i) => (
            <MemberCard
              key={i}
              m={m}
              busy={busy}
              idx={i}
              onChange={(patch) => updateMember(i, patch)}
              onUpload={(file) => uploadPhoto(i, file)}
              onSave={() => saveMember(i)}
              onRemove={() => removeMember(i)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function MemberCard({
  m,
  idx,
  busy,
  onChange,
  onUpload,
  onSave,
  onRemove,
}: {
  m: Member;
  idx: number;
  busy: string | null;
  onChange: (patch: Partial<Member>) => void;
  onUpload: (file: File) => void;
  onSave: () => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploading = busy === `up-${idx}`;
  const saving = busy === `save-${idx}`;

  return (
    <div className="card p-5">
      <div className="flex gap-5">
        {/* Foto */}
        <div className="flex-none">
          <div className="h-28 w-28 overflow-hidden rounded-2xl bg-surface-soft">
            {m.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.fotoUrl} alt={m.nombre} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-light text-3xl font-extrabold text-white">
                {(m.nombre.trim()[0] || "?").toUpperCase()}
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-2 w-28 rounded-lg border border-line py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-soft disabled:opacity-60"
          >
            {uploading ? "Subiendo…" : m.fotoUrl ? "Cambiar foto" : "Subir foto"}
          </button>
        </div>

        {/* Datos */}
        <div className="flex-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field" placeholder="Nombre" value={m.nombre} onChange={(e) => onChange({ nombre: e.target.value })} />
            <input className="field" placeholder="Cargo / rol" value={m.cargo} onChange={(e) => onChange({ cargo: e.target.value })} />
          </div>
          <input
            className="field"
            placeholder="Principales habilidades (separadas por coma)"
            value={m.habilidadesText}
            onChange={(e) => onChange({ habilidadesText: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[12px] text-ink-muted">
              Orden
              <input
                type="number"
                className="w-16 rounded-lg border border-line px-2 py-1 text-sm"
                value={m.orden}
                onChange={(e) => onChange({ orden: Number(e.target.value) || 0 })}
              />
            </label>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={onRemove} className="rounded-lg px-3 py-2 text-sm font-semibold text-accent hover:bg-[#FFEFED]">
                Eliminar
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60"
              >
                {saving ? "Guardando…" : m.id ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
