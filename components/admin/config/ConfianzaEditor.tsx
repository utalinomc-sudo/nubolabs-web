"use client";

import { useId } from "react";
import type { Testimonio } from "@/lib/siteConfig";
import { Field, FieldRow } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

const AUTH_NOTICE = "Publica solo testimonios con autorización escrita del cliente.";

function DestacadoToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center gap-2">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-brand" />
      <label htmlFor={id} className="cursor-pointer text-sm font-semibold text-ink-soft">
        Destacado
      </label>
    </div>
  );
}

// Bloque de confianza (cambio confianza-recomendacion, design.md decisión 5): textos, 3 compromisos fijos y
// testimonios con destacado único. "Usar los textos recomendados" no toca los testimonios.
export function ConfianzaEditor({ value, onChange, defaults }: EditorProps<"confianza">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  // Marcar uno como destacado desmarca los demás (solo uno a la vez).
  const setDestacado = (i: number, on: boolean) =>
    set({ testimonios: value.testimonios.map((t, j) => ({ ...t, destacado: on && j === i })) });

  return (
    <SectionCard
      title="Confianza"
      description="Bloque “Nos recomiendan” bajo el inicio. Sin testimonios se muestra el texto puente."
      onReset={() => onChange({ ...defaults, testimonios: value.testimonios })}
    >
      <FieldRow>
        <Field label="Etiqueta" value={value.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Texto puente" value={value.textoPuente} onChange={(v) => set({ textoPuente: v })} hint="Se ve mientras no haya testimonios." />
      </FieldRow>
      <ListField
        label="Compromisos"
        itemLabel="Compromiso"
        hint="Siempre 3; el ícono va por posición (calendario, grilla, escudo). Un título o texto vacío usa el recomendado de esa posición."
        items={value.compromisos}
        onChange={(compromisos) => set({ compromisos })}
        fixed
        renderItem={(item, setItem) => (
          <FieldRow>
            <Field label="Título" value={item.titulo} onChange={(v) => setItem({ ...item, titulo: v })} />
            <Field label="Texto" value={item.texto} onChange={(v) => setItem({ ...item, texto: v })} />
          </FieldRow>
        )}
      />
      <p role="note" className="rounded-lg border border-accent bg-white px-3 py-2 text-[13px] font-semibold text-accent-strong">
        {AUTH_NOTICE}
      </p>
      <ListField<Testimonio>
        label="Testimonios"
        itemLabel="Testimonio"
        hint="La portada muestra hasta 3: el destacado (o el primero) en el panel y los siguientes como tarjetas. Sin nombre o sin texto no se publica ni queda guardado como borrador: carga cada testimonio recién cuando tengas la autorización."
        items={value.testimonios}
        onChange={(testimonios) => set({ testimonios })}
        min={0}
        max={6}
        newItem={() => ({ nombre: "", cargo: "", empresa: "", texto: "", destacado: false })}
        renderItem={(item, setItem, i) => (
          <>
            <FieldRow>
              <Field label="Nombre" value={item.nombre} onChange={(v) => setItem({ ...item, nombre: v })} />
              <Field label="Cargo" value={item.cargo} onChange={(v) => setItem({ ...item, cargo: v })} />
            </FieldRow>
            <Field label="Empresa" value={item.empresa} onChange={(v) => setItem({ ...item, empresa: v })} />
            <Field
              label="Testimonio"
              value={item.texto}
              onChange={(v) => setItem({ ...item, texto: v })}
              textarea
              hint="Ideal: 2 a 3 líneas. Se publica tal cual, sin recortes y con los saltos de línea que escribas."
            />
            <DestacadoToggle checked={item.destacado} onChange={(on) => setDestacado(i, on)} />
          </>
        )}
      />
    </SectionCard>
  );
}
