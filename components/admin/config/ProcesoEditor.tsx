"use client";

import { Field, FieldRow } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// "Cómo trabajamos": siempre 4 pasos con lo que recibe el cliente y la franja "Tú defines qué es éxito" (1 a 6).
export function ProcesoEditor({ value, onChange, defaults }: EditorProps<"proceso">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard title="Cómo trabajamos" onReset={() => onChange(defaults)}>
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} />
      </FieldRow>
      <Field label="Bajada" value={value.subtitle} onChange={(v) => set({ subtitle: v })} />
      <ListField
        label="Pasos"
        itemLabel="Paso"
        hint="Siempre 4. Un campo vacío usa el texto recomendado."
        items={value.items}
        onChange={(items) => set({ items })}
        fixed
        renderItem={(item, setItem) => (
          <>
            <Field label="Título" value={item.title} onChange={(v) => setItem({ ...item, title: v })} />
            <Field label="Texto" value={item.body} onChange={(v) => setItem({ ...item, body: v })} textarea />
            <Field label="Recibes" value={item.recibes} onChange={(v) => setItem({ ...item, recibes: v })} />
          </>
        )}
      />
      <Field
        label="Franja de éxito: título"
        value={value.exito.title}
        onChange={(v) => set({ exito: { ...value.exito, title: v } })}
      />
      <ListField
        label="Franja de éxito: ejemplos"
        itemLabel="Ejemplo"
        hint="Entre 1 y 6. Las casillas vacías no se publican."
        items={value.exito.items}
        onChange={(items) => set({ exito: { ...value.exito, items } })}
        min={1}
        max={6}
        newItem={() => ""}
        inline
        renderItem={(text, setText, i) => (
          <input className="field" aria-label={`Ejemplo de éxito ${i + 1}`} value={text} onChange={(e) => setText(e.target.value)} />
        )}
      />
    </SectionCard>
  );
}
