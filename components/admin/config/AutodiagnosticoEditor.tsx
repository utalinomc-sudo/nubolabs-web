"use client";

import { Field, FieldRow } from "./Field";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// Bloque "Autodiagnóstico" de la portada (cambio diagnostico-mapa-oportunidades, design.md decisión 8). El ejemplo del
// mapa es fijo (sale de las dimensiones del diagnóstico) y el botón siempre lleva a /diagnostico.
export function AutodiagnosticoEditor({ value, onChange, defaults }: EditorProps<"autodiagnostico">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard
      title="Autodiagnóstico"
      description={
        <>
          Va después de «Cómo trabajamos» e invita a hacer el autodiagnóstico en <b>/diagnostico</b>. El ejemplo del mapa
          es fijo y no muestra cifras.
        </>
      }
      onReset={() => onChange(defaults)}
    >
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Botón" value={value.cta} onChange={(v) => set({ cta: v })} />
      </FieldRow>
      <Field label="Título" value={value.title} onChange={(v) => set({ title: v })} />
      <Field label="Texto" value={value.body} onChange={(v) => set({ body: v })} textarea rows={3} />
    </SectionCard>
  );
}
