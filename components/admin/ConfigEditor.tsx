"use client";

// Contenedor de /admin/config: visibilidad, un editor por sección y guardado único (cambio lenguaje-sin-jerga,
// design.md decisión 5). Cada editor vive en components/admin/config/.
import { useState } from "react";
import { CasosEditor } from "@/components/admin/config/CasosEditor";
import { CierreEditor } from "@/components/admin/config/CierreEditor";
import { ConfianzaEditor } from "@/components/admin/config/ConfianzaEditor";
import { ContactEditor } from "@/components/admin/config/ContactEditor";
import { EnfoqueEditor } from "@/components/admin/config/EnfoqueEditor";
import { FaqEditor } from "@/components/admin/config/FaqEditor";
import { HeroEditor } from "@/components/admin/config/HeroEditor";
import { NosotrosEditor } from "@/components/admin/config/NosotrosEditor";
import { PrivacidadEditor } from "@/components/admin/config/PrivacidadEditor";
import { ProblemaEditor } from "@/components/admin/config/ProblemaEditor";
import { ProcesoEditor } from "@/components/admin/config/ProcesoEditor";
import { ResultadosEditor } from "@/components/admin/config/ResultadosEditor";
import { SaveVersionContext } from "@/components/admin/config/SectionCard";
import { ServiciosEditor } from "@/components/admin/config/ServiciosEditor";
import type { SiteContent } from "@/lib/siteConfig";

// Claves de content que administra esta pantalla. `equipo` se edita en /admin/equipo y nunca se envía, para no pisarla.
// Regla: cada sección nueva del CMS suma su editor aquí y su clave a esta lista; si no, sus cambios no se guardan.
export const MANAGED_KEYS = [
  "hero",
  "confianza",
  "problema",
  "resultados",
  "enfoque",
  "servicios",
  "casos",
  "proceso",
  "contact",
  "faq",
  "cierre",
  "nosotros",
  "privacidad",
] as const satisfies readonly (keyof SiteContent)[];

export type ManagedKey = (typeof MANAGED_KEYS)[number];
export type ManagedContent = Pick<SiteContent, ManagedKey>;

// Arma el content que se envía al guardar con las claves pedidas (por defecto, todas las de MANAGED_KEYS).
export function pickManaged(content: ManagedContent, keys: readonly ManagedKey[] = MANAGED_KEYS): Partial<ManagedContent> {
  return Object.fromEntries(keys.map((k) => [k, content[k]])) as Partial<ManagedContent>;
}

// Secciones que cambiaron respecto de lo último cargado o guardado. Solo esas se envían: una sección que nadie tocó no
// queda escrita en Firestore y sigue mostrando los textos por defecto del código (revisión adversarial de
// lenguaje-sin-jerga: guardar todo dejaba fijos los defaults y escribía de más desde el preview, que comparte Firestore).
export function changedKeys(content: ManagedContent, saved: ManagedContent): ManagedKey[] {
  return MANAGED_KEYS.filter((k) => JSON.stringify(content[k]) !== JSON.stringify(saved[k]));
}

interface Props {
  sections: { key: string; label: string; hint: string }[];
  initialVisible: Record<string, boolean>;
  initialContent: ManagedContent;
  defaults: ManagedContent; // textos recomendados vigentes (defaultSiteConfig().content)
}

export function ConfigEditor({ sections, initialVisible, initialContent, defaults }: Props) {
  const [visible, setVisible] = useState<Record<string, boolean>>(initialVisible);
  const [content, setContent] = useState<ManagedContent>(initialContent);
  const [saved, setSaved] = useState<ManagedContent>(initialContent); // base para saber qué secciones cambiaron
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [saveVersion, setSaveVersion] = useState(0);

  // Props de cada editor: su valor, cómo cambiarlo y sus textos recomendados.
  function bind<K extends keyof ManagedContent>(key: K) {
    return {
      value: content[key],
      onChange: (value: ManagedContent[K]) => setContent((c) => ({ ...c, [key]: value })),
      defaults: defaults[key],
    };
  }

  async function save() {
    setStatus("saving");
    setError("");
    const snapshot = content;
    const keys = changedKeys(snapshot, saved);
    const payload: Record<string, unknown> = { visible };
    if (keys.length > 0) payload.content = pickManaged(snapshot, keys);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSaved(snapshot);
      setStatus("ok");
      setSaveVersion((v) => v + 1); // los avisos de "textos recomendados cargados" ya no aplican
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setError("No se pudo guardar. Intenta de nuevo.");
    }
  }

  return (
    <SaveVersionContext.Provider value={saveVersion}>
      <div className="max-w-3xl space-y-8">
        <section className="card p-6" aria-labelledby="config-visibles">
          <h2 id="config-visibles" className="font-extrabold">
            Secciones visibles
          </h2>
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

        {/* En el orden de la portada (SECTIONS). */}
        <HeroEditor {...bind("hero")} />
        <ConfianzaEditor {...bind("confianza")} />
        <ProblemaEditor {...bind("problema")} />
        <ResultadosEditor {...bind("resultados")} />
        <EnfoqueEditor {...bind("enfoque")} />
        <ServiciosEditor {...bind("servicios")} />
        <CasosEditor {...bind("casos")} />
        <ProcesoEditor {...bind("proceso")} />
        <ContactEditor {...bind("contact")} />
        <FaqEditor {...bind("faq")} />
        <CierreEditor {...bind("cierre")} />
        <NosotrosEditor {...bind("nosotros")} />
        <PrivacidadEditor {...bind("privacidad")} />

        <div className="sticky bottom-4 rounded-xl border border-line bg-white/95 p-4 shadow-float backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={status === "saving"}
              className="rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60"
            >
              {status === "saving" ? "Guardando…" : "Guardar cambios"}
            </button>
            {status === "ok" && <span className="text-sm font-semibold text-success-strong">✓ Guardado</span>}
            {status === "error" && <span className="text-sm font-semibold text-accent-strong">{error}</span>}
          </div>
        </div>
      </div>
    </SaveVersionContext.Provider>
  );
}
