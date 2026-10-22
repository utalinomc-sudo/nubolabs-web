"use client";

import { Field, FieldRow } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// Misión y visión (página /mision-vision). Sin "Usar los textos recomendados": no es parte de este cambio.
export function NosotrosEditor({ value, onChange }: EditorProps<"nosotros">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard
      title="Misión y visión"
      description={
        <>
          Se muestra en la página <b>/mision-vision</b> (menú “Nosotros”).
        </>
      }
    >
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} />
      </FieldRow>
      <Field label="Misión" value={value.mision} onChange={(v) => set({ mision: v })} textarea />
      <Field label="Visión" value={value.vision} onChange={(v) => set({ vision: v })} textarea />
      <ListField
        label="Objetivos"
        itemLabel="Objetivo"
        items={value.objetivos}
        onChange={(objetivos) => set({ objetivos })}
        newItem={() => ""}
        inline
        renderItem={(text, setText, i) => (
          <input
            className="field"
            aria-label={`Objetivo ${i + 1}`}
            placeholder={`Objetivo ${i + 1}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}
      />
    </SectionCard>
  );
}
