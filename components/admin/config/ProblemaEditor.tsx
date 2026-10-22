"use client";

import { Field, FieldRow } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// "¿Te suena?": dolores del día a día (1 a 8) y la franja de cierre.
export function ProblemaEditor({ value, onChange, defaults }: EditorProps<"problema">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard title="¿Te suena?" description="Los dolores del día a día, justo después del inicio." onReset={() => onChange(defaults)}>
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} />
      </FieldRow>
      <Field label="Bajada" value={value.subtitle} onChange={(v) => set({ subtitle: v })} textarea />
      <ListField
        label="Dolores"
        itemLabel="Dolor"
        hint="Entre 1 y 8. Cada uno lleva un ícono según su posición. Un dolor vacío no se publica; si no queda ninguno, se usan los recomendados."
        items={value.items}
        onChange={(items) => set({ items })}
        min={1}
        max={8}
        newItem={() => ({ title: "" })}
        inline
        renderItem={(item, setItem, i) => (
          <input
            className="field"
            aria-label={`Dolor ${i + 1}`}
            value={item.title}
            onChange={(e) => setItem({ title: e.target.value })}
          />
        )}
      />
      <Field
        label="Frase de cierre"
        value={value.cierre}
        onChange={(v) => set({ cierre: v })}
        textarea
        hint="Va en la franja oscura. Envuelve texto en **dobles asteriscos** para destacarlo en celeste."
      />
      <Field
        label="Enlace del cierre"
        value={value.cierreCta}
        onChange={(v) => set({ cierreCta: v })}
        hint="Lleva a la sección “Lo que ganas”."
      />
    </SectionCard>
  );
}
