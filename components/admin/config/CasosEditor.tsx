"use client";

import { Field, FieldRow, SelectField } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";
import { casesLabels } from "@/lib/content";
import { CASE_RUBROS, type CaseItem, type CaseRubro } from "@/lib/siteConfig";

// "Para todos" + los rubros del formulario de contacto (cambio casos-por-rubro, design.md decisión 5).
const RUBRO_OPTIONS: { value: CaseRubro; label: string }[] = [
  { value: "todos", label: casesLabels.forAll },
  ...CASE_RUBROS.map((r) => ({ value: r.key, label: r.label })),
];

// Ejemplos por rubro: encabezado y casos con su rubro. "Usar los textos recomendados" repone el encabezado y los 14 casos.
export function CasosEditor({ value, onChange, defaults }: EditorProps<"casos">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard title="Ejemplos" onReset={() => onChange(defaults)}>
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} />
      </FieldRow>
      <Field label="Bajada (opcional)" value={value.subtitle} onChange={(v) => set({ subtitle: v })} hint="Vacía, no se muestra." />
      <ListField
        label="Ejemplos"
        itemLabel="Ejemplo"
        hint="Entre 1 y 18. Un ejemplo sin texto principal no se publica. En la portada aparece un filtro por cada rubro con ejemplos; los «Para todos» se ven con cualquier filtro."
        items={value.items}
        onChange={(items) => set({ items })}
        min={1}
        max={18}
        newItem={(): CaseItem => ({ title: "", body: "", rubro: "todos" })}
        renderItem={(item, setItem) => (
          <>
            <Field label="Texto principal" value={item.title} onChange={(v) => setItem({ ...item, title: v })} />
            <Field label="Detalle (opcional)" value={item.body} onChange={(v) => setItem({ ...item, body: v })} textarea rows={2} />
            <SelectField label="Rubro" value={item.rubro} options={RUBRO_OPTIONS} onChange={(rubro) => setItem({ ...item, rubro })} />
          </>
        )}
      />
    </SectionCard>
  );
}
