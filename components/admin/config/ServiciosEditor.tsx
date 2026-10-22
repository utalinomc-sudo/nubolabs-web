"use client";

import { Field, FieldRow } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// Servicios: diagnóstico destacado, servicios (1 a 6) con "lo que ganas", acompañamiento mensual y nota técnica.
export function ServiciosEditor({ value, onChange, defaults }: EditorProps<"servicios">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  const d = value.destacado;
  const setDestacado = (patch: Partial<typeof d>) => set({ destacado: { ...d, ...patch } });

  return (
    <SectionCard title="Servicios" onReset={() => onChange(defaults)}>
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} />
      </FieldRow>
      <Field label="Bajada" value={value.subtitle} onChange={(v) => set({ subtitle: v })} textarea />

      <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
        <div className="mb-3 text-[12px] font-bold uppercase tracking-wide text-ink-muted">Servicio destacado</div>
        <div className="space-y-3">
          <FieldRow>
            <Field label="Etiqueta azul" value={d.etiqueta} onChange={(v) => setDestacado({ etiqueta: v })} />
            <Field label="Título" value={d.title} onChange={(v) => setDestacado({ title: v })} />
          </FieldRow>
          <Field label="Descripción" value={d.body} onChange={(v) => setDestacado({ body: v })} textarea />
          <Field label="Lo que ganas" value={d.result} onChange={(v) => setDestacado({ result: v })} />
          <ListField
            label="Qué incluye"
            itemLabel="Ítem"
            hint="Entre 1 y 4. Las casillas vacías no se publican."
            items={d.incluye}
            onChange={(incluye) => setDestacado({ incluye })}
            min={1}
            max={4}
            newItem={() => ""}
            inline
            renderItem={(text, setText, i) => (
              <input className="field" aria-label={`Incluye ${i + 1}`} value={text} onChange={(e) => setText(e.target.value)} />
            )}
          />
        </div>
      </div>

      <ListField
        label="Servicios"
        itemLabel="Servicio"
        hint="Entre 1 y 6. Un servicio sin título no se publica."
        items={value.items}
        onChange={(items) => set({ items })}
        min={1}
        max={6}
        newItem={() => ({ title: "", body: "", result: "" })}
        renderItem={(item, setItem) => (
          <>
            <Field label="Título" value={item.title} onChange={(v) => setItem({ ...item, title: v })} />
            <Field label="Descripción" value={item.body} onChange={(v) => setItem({ ...item, body: v })} textarea />
            <Field label="Lo que ganas" value={item.result} onChange={(v) => setItem({ ...item, result: v })} />
          </>
        )}
      />

      <FieldRow>
        <Field
          label="Acompañamiento: título"
          value={value.acompanamiento.title}
          onChange={(v) => set({ acompanamiento: { ...value.acompanamiento, title: v } })}
        />
        <Field
          label="Acompañamiento: texto"
          value={value.acompanamiento.body}
          onChange={(v) => set({ acompanamiento: { ...value.acompanamiento, body: v } })}
        />
      </FieldRow>
      <Field
        label="Nota técnica"
        value={value.notaTecnica}
        onChange={(v) => set({ notaTecnica: v })}
        textarea
        hint="Letra pequeña al final de Servicios: el único lugar de la portada donde se nombran herramientas. **Dobles asteriscos** = negrita."
      />
    </SectionCard>
  );
}
