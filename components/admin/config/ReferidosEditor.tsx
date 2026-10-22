"use client";

import { Field } from "./Field";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// Franja de bienvenida de /oa (cambio landing-referidos-oa, design.md decisión 6). Solo la ven las visitas referidas.
export function ReferidosEditor({ value, onChange, defaults }: EditorProps<"referidos">) {
  const setOa = (patch: Partial<typeof value.oa>) => onChange({ ...value, oa: { ...value.oa, ...patch } });
  return (
    <SectionCard
      title="Franja de referidos (O&A)"
      description={
        <>
          Se muestra arriba de la portada solo a quienes entran por <b>/oa</b> (el link del correo de Osorio &amp; Asociados)
          o por <b>/?ref=oa</b>. El visitante puede cerrarla.
        </>
      }
      onReset={() => onChange(defaults)}
    >
      <Field label="Título" value={value.oa.titulo} onChange={(v) => setOa({ titulo: v })} hint="Va en negrita. Vacío, se usa el recomendado." />
      <Field label="Texto" value={value.oa.texto} onChange={(v) => setOa({ texto: v })} textarea rows={2} />
    </SectionCard>
  );
}
