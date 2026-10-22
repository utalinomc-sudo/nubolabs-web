"use client";

import { Field, FieldRow } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// Preguntas frecuentes (cambio cierre-landing-faq-cta, design.md decisión 7): de 1 a 10.
export function FaqEditor({ value, onChange, defaults }: EditorProps<"faq">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard title="Preguntas frecuentes" description="Van después del formulario." onReset={() => onChange(defaults)}>
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} />
      </FieldRow>
      <ListField
        label="Preguntas"
        itemLabel="Pregunta"
        hint="Entre 1 y 10. Una pregunta sin respuesta no se publica. Para un enlace interno escribe [texto](/ruta), por ejemplo [Política de privacidad](/privacidad); los enlaces a otros sitios se muestran como texto."
        items={value.items}
        onChange={(items) => set({ items })}
        min={1}
        max={10}
        newItem={() => ({ pregunta: "", respuesta: "" })}
        renderItem={(item, setItem) => (
          <>
            <Field label="Pregunta" value={item.pregunta} onChange={(v) => setItem({ ...item, pregunta: v })} />
            <Field label="Respuesta" value={item.respuesta} onChange={(v) => setItem({ ...item, respuesta: v })} textarea />
          </>
        )}
      />
    </SectionCard>
  );
}
