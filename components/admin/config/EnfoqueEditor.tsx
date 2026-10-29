"use client";

import { Field, FieldRow } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// Enfoque: siempre 3 pasos. El ejemplo "antes / después" del informe del mes es fijo (lib/content.ts).
export function EnfoqueEditor({ value, onChange, defaults }: EditorProps<"enfoque">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard
      title="Enfoque"
      description="Sección oscura “Primero entendemos tu problema, después construimos la solución”. El ejemplo antes/después (el informe del mes) es fijo."
      onReset={() => onChange(defaults)}
    >
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} />
      </FieldRow>
      <Field label="Texto" value={value.body} onChange={(v) => set({ body: v })} textarea />
      <ListField
        label="Pasos"
        itemLabel="Paso"
        hint="Siempre 3. Un campo vacío usa el texto recomendado."
        items={value.items}
        onChange={(items) => set({ items })}
        fixed
        renderItem={(item, setItem) => (
          <>
            <Field label="Título" value={item.title} onChange={(v) => setItem({ ...item, title: v })} />
            <Field label="Texto" value={item.body} onChange={(v) => setItem({ ...item, body: v })} />
          </>
        )}
      />
    </SectionCard>
  );
}
