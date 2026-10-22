"use client";

import { Field, FieldRow } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// Ejemplos (Casos): bajada y tarjetas. El rediseño por rubro es HDU-05.
export function CasosEditor({ value, onChange, defaults }: EditorProps<"casos">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard title="Ejemplos" onReset={() => onChange(defaults)}>
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} />
      </FieldRow>
      <Field label="Bajada (a la derecha del título)" value={value.subtitle} onChange={(v) => set({ subtitle: v })} />
      <ListField
        label="Ejemplos"
        itemLabel="Ejemplo"
        hint="Entre 1 y 12. Un ejemplo sin título no se publica."
        items={value.items}
        onChange={(items) => set({ items })}
        min={1}
        max={12}
        newItem={() => ({ title: "", body: "" })}
        renderItem={(item, setItem) => (
          <>
            <Field label="Título" value={item.title} onChange={(v) => setItem({ ...item, title: v })} />
            <Field label="Descripción" value={item.body} onChange={(v) => setItem({ ...item, body: v })} textarea />
          </>
        )}
      />
    </SectionCard>
  );
}
