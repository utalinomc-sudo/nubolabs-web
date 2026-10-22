"use client";

import { Field, FieldRow } from "./Field";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

const HERO_TAG_SLOTS = 3;

// Hero (cambio mensaje-principal-pyme): textos, 3 etiquetas bajo los botones y textos recomendados.
export function HeroEditor({ value, onChange, defaults }: EditorProps<"hero">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  // Siempre 3 casillas; las vacías no se muestran en la portada (normalizeTags).
  const setTag = (i: number, v: string) => {
    const tags = Array.from({ length: HERO_TAG_SLOTS }, (_, idx) => value.tags[idx] ?? "");
    tags[i] = v;
    set({ tags });
  };

  return (
    <SectionCard title="Inicio (Hero)" onReset={() => onChange(defaults)}>
      <Field
        label="Etiqueta superior (opcional)"
        value={value.eyebrow}
        onChange={(v) => set({ eyebrow: v })}
        hint="Texto corto sobre el título. Déjala vacía para no mostrar etiqueta (recomendado)."
      />
      <Field
        label="Título"
        value={value.title}
        onChange={(v) => set({ title: v })}
        textarea
        hint="Envuelve texto en **dobles asteriscos** para destacarlo con el degradado de marca."
      />
      <Field label="Subtítulo" value={value.subtitle} onChange={(v) => set({ subtitle: v })} textarea />
      <FieldRow>
        <Field label="Botón principal" value={value.ctaPrimary} onChange={(v) => set({ ctaPrimary: v })} />
        <Field label="Botón secundario" value={value.ctaSecondary} onChange={(v) => set({ ctaSecondary: v })} />
      </FieldRow>
      <div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: HERO_TAG_SLOTS }, (_, i) => (
            <Field key={i} label={`Etiqueta ${i + 1}`} value={value.tags[i] ?? ""} onChange={(v) => setTag(i, v)} />
          ))}
        </div>
        <span className="mt-1 block text-[11px] text-ink-muted">
          Frases cortas bajo los botones, con un ✓. Deja una vacía para ocultarla; si las tres quedan vacías se usan las
          recomendadas.
        </span>
      </div>
    </SectionCard>
  );
}
