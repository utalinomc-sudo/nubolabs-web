"use client";

import { Field } from "./Field";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// Página /privacidad (cambio formulario-minimo-consentimiento, design.md decisión 6). Siempre visible.
export function PrivacidadEditor({ value, onChange, defaults }: EditorProps<"privacidad">) {
  return (
    <SectionCard
      title="Privacidad"
      description={
        <>
          Se muestra en <b>/privacidad</b> y se enlaza desde los formularios. Es un borrador: debe validarlo O&amp;A o un
          abogado antes del 1-dic-2026.
        </>
      }
      onReset={() => onChange(defaults)}
      resetNotice="Borrador recomendado cargado. Revísalo y pulsa “Guardar cambios” para publicarlo."
    >
      <Field label="Título" value={value.titulo} onChange={(v) => onChange({ ...value, titulo: v })} />
      <Field
        label="Texto"
        value={value.texto}
        onChange={(v) => onChange({ ...value, texto: v })}
        textarea
        rows={14}
        hint="Separa los párrafos con una línea en blanco. Se muestra como texto (sin HTML). Si lo dejas vacío, se publica el borrador."
      />
    </SectionCard>
  );
}
