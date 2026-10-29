"use client";

import { Field, FieldRow } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// "Lo que ganas": siempre 4 resultados (cada uno con su ilustración fija según la posición).
export function ResultadosEditor({ value, onChange, defaults }: EditorProps<"resultados">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard title="Lo que ganas" description="Los 4 resultados que gana el cliente." onReset={() => onChange(defaults)}>
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} />
      </FieldRow>
      <Field label="Bajada" value={value.subtitle} onChange={(v) => set({ subtitle: v })} textarea />
      <ListField
        label="Resultados"
        itemLabel="Resultado"
        hint="Siempre 4. La ilustración de cada uno es fija: 1 seguimiento de una venta, 2 gráfico, 3 lista de avisos, 4 “tu equipo + soluciones a tu medida”. Un campo vacío usa el texto recomendado."
        items={value.items}
        onChange={(items) => set({ items })}
        fixed
        renderItem={(item, setItem) => (
          <>
            <Field label="Título" value={item.title} onChange={(v) => setItem({ ...item, title: v })} />
            <Field label="Texto" value={item.body} onChange={(v) => setItem({ ...item, body: v })} textarea />
          </>
        )}
      />
      <Field label="Frase de cierre" value={value.cierre} onChange={(v) => set({ cierre: v })} textarea />
    </SectionCard>
  );
}
