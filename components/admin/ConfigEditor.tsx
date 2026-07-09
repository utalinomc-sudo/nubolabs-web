"use client";

import { useState } from "react";

interface ServiceItem {
  title: string;
  body: string;
  result: string;
}
interface CaseItem {
  title: string;
  body: string;
}
interface Content {
  hero: { eyebrow: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  servicios: { eyebrow: string; title: string; items: ServiceItem[] };
  casos: { eyebrow: string; title: string; subtitle: string; items: CaseItem[] };
}
interface Props {
  sections: { key: string; label: string; hint: string }[];
  initialVisible: Record<string, boolean>;
  initialContent: Content;
}

function Field({ label, value, onChange, hint, textarea }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-ink-soft">{label}</span>
      {textarea ? (
        <textarea className="field mt-1.5 resize-none" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="field mt-1.5" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint ? <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span> : null}
    </label>
  );
}

export function ConfigEditor({ sections, initialVisible, initialContent }: Props) {
  const [visible, setVisible] = useState<Record<string, boolean>>(initialVisible);
  const [content, setContent] = useState<Content>(initialContent);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  function setHero<K extends keyof Content["hero"]>(k: K, v: string) {
    setContent((c) => ({ ...c, hero: { ...c.hero, [k]: v } }));
  }
  function setServiciosMeta(k: "eyebrow" | "title", v: string) {
    setContent((c) => ({ ...c, servicios: { ...c.servicios, [k]: v } }));
  }
  function setServicioItem(i: number, k: keyof ServiceItem, v: string) {
    setContent((c) => {
      const items = c.servicios.items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it));
      return { ...c, servicios: { ...c.servicios, items } };
    });
  }
  function setCasosMeta(k: "eyebrow" | "title" | "subtitle", v: string) {
    setContent((c) => ({ ...c, casos: { ...c.casos, [k]: v } }));
  }
  function setCasoItem(i: number, k: keyof CaseItem, v: string) {
    setContent((c) => {
      const items = c.casos.items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it));
      return { ...c, casos: { ...c.casos, items } };
    });
  }

  async function save() {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible, content }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setError("No se pudo guardar. Intenta de nuevo.");
    }
  }

  const btnRow = (
    <div className="flex items-center gap-3">
      <button
        onClick={save}
        disabled={status === "saving"}
        className="rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        {status === "saving" ? "Guardando…" : "Guardar cambios"}
      </button>
      {status === "ok" && <span className="text-sm font-semibold text-[#18A45C]">✓ Guardado</span>}
      {status === "error" && <span className="text-sm font-semibold text-accent">{error}</span>}
    </div>
  );

  return (
    <div className="max-w-3xl space-y-8">
      {/* Visibilidad */}
      <section className="card p-6">
        <h2 className="font-extrabold">Secciones visibles</h2>
        <p className="mt-1 text-sm text-ink-muted">Elige qué secciones y páginas se muestran en el sitio.</p>
        <div className="mt-4 divide-y divide-line">
          {sections.map((s) => (
            <label key={s.key} className="flex cursor-pointer items-center justify-between gap-4 py-3">
              <span>
                <span className="block text-sm font-semibold">{s.label}</span>
                <span className="block text-[12px] text-ink-muted">{s.hint}</span>
              </span>
              <input
                type="checkbox"
                checked={visible[s.key] ?? true}
                onChange={(e) => setVisible((v) => ({ ...v, [s.key]: e.target.checked }))}
                className="h-5 w-5 accent-brand"
              />
            </label>
          ))}
        </div>
      </section>

      {/* Hero */}
      <section className="card p-6">
        <h2 className="font-extrabold">Inicio (Hero)</h2>
        <div className="mt-4 space-y-4">
          <Field label="Etiqueta superior" value={content.hero.eyebrow} onChange={(v) => setHero("eyebrow", v)} />
          <Field
            label="Título"
            value={content.hero.title}
            onChange={(v) => setHero("title", v)}
            textarea
            hint="Envuelve texto en **dobles asteriscos** para resaltarlo en azul."
          />
          <Field label="Subtítulo" value={content.hero.subtitle} onChange={(v) => setHero("subtitle", v)} textarea />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Botón principal" value={content.hero.ctaPrimary} onChange={(v) => setHero("ctaPrimary", v)} />
            <Field label="Botón secundario" value={content.hero.ctaSecondary} onChange={(v) => setHero("ctaSecondary", v)} />
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="card p-6">
        <h2 className="font-extrabold">Servicios</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Etiqueta" value={content.servicios.eyebrow} onChange={(v) => setServiciosMeta("eyebrow", v)} />
          <Field label="Título" value={content.servicios.title} onChange={(v) => setServiciosMeta("title", v)} />
        </div>
        <div className="mt-4 space-y-3">
          {content.servicios.items.map((it, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">Servicio {i + 1}</span>
                <button
                  onClick={() =>
                    setContent((c) => ({ ...c, servicios: { ...c.servicios, items: c.servicios.items.filter((_, idx) => idx !== i) } }))
                  }
                  className="text-[12px] font-semibold text-accent hover:underline"
                >
                  Quitar
                </button>
              </div>
              <div className="space-y-3">
                <Field label="Título" value={it.title} onChange={(v) => setServicioItem(i, "title", v)} />
                <Field label="Descripción" value={it.body} onChange={(v) => setServicioItem(i, "body", v)} textarea />
                <Field label="Resultado (línea naranja)" value={it.result} onChange={(v) => setServicioItem(i, "result", v)} />
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              setContent((c) => ({ ...c, servicios: { ...c.servicios, items: [...c.servicios.items, { title: "", body: "", result: "" }] } }))
            }
            className="text-sm font-semibold text-brand hover:underline"
          >
            + Agregar servicio
          </button>
        </div>
      </section>

      {/* Casos de uso */}
      <section className="card p-6">
        <h2 className="font-extrabold">Casos de uso</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Etiqueta" value={content.casos.eyebrow} onChange={(v) => setCasosMeta("eyebrow", v)} />
            <Field label="Título" value={content.casos.title} onChange={(v) => setCasosMeta("title", v)} />
          </div>
          <Field label="Bajada (a la derecha del título)" value={content.casos.subtitle} onChange={(v) => setCasosMeta("subtitle", v)} />
        </div>
        <div className="mt-4 space-y-3">
          {content.casos.items.map((it, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">Caso {i + 1}</span>
                <button
                  onClick={() =>
                    setContent((c) => ({ ...c, casos: { ...c.casos, items: c.casos.items.filter((_, idx) => idx !== i) } }))
                  }
                  className="text-[12px] font-semibold text-accent hover:underline"
                >
                  Quitar
                </button>
              </div>
              <div className="space-y-3">
                <Field label="Título" value={it.title} onChange={(v) => setCasoItem(i, "title", v)} />
                <Field label="Descripción" value={it.body} onChange={(v) => setCasoItem(i, "body", v)} textarea />
              </div>
            </div>
          ))}
          <button
            onClick={() => setContent((c) => ({ ...c, casos: { ...c.casos, items: [...c.casos.items, { title: "", body: "" }] } }))}
            className="text-sm font-semibold text-brand hover:underline"
          >
            + Agregar caso
          </button>
        </div>
      </section>

      <div className="sticky bottom-4 rounded-xl border border-line bg-white/95 p-4 shadow-float backdrop-blur">{btnRow}</div>
    </div>
  );
}
