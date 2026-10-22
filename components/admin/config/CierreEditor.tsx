"use client";

import { Field, FieldRow } from "./Field";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// CTA final (cambio cierre-landing-faq-cta, design.md decisión 7).
export function CierreEditor({ value, onChange, defaults }: EditorProps<"cierre">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard
      title="CTA final"
      description="Banda azul al final de la portada. El botón lleva al formulario (o al diagnóstico si el contacto está oculto)."
      onReset={() => onChange(defaults)}
    >
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Texto del botón" value={value.cta} onChange={(v) => set({ cta: v })} />
      </FieldRow>
      <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} textarea />
      <Field label="Texto" value={value.body} onChange={(v) => set({ body: v })} />
    </SectionCard>
  );
}
