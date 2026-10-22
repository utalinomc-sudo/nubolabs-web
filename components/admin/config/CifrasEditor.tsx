"use client";

import { hasContent, type Cifra } from "@/lib/siteConfig";
import { Field, FieldRow } from "./Field";
import { ListField } from "./ListField";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

const HELP =
  "Usa solo datos reales con su fuente; prefiere resultados del negocio (por ejemplo, cotizaciones respondidas el mismo día) antes que horas.";

// Qué le falta a una cifra para publicarse (valor, texto y fuente son obligatorios).
function missing(c: Cifra): string | null {
  if (!hasContent(c.fuente)) return "No se mostrará: falta la fuente.";
  if (!hasContent(c.valor)) return "No se mostrará: falta el valor.";
  if (!hasContent(c.texto)) return "No se mostrará: falta el texto.";
  return null;
}

// Cifras de resultados (cambio cifras-con-respaldo, design.md decisión 5). La visibilidad se activa en
// "Secciones visibles" ("Cifras de resultados", oculta por defecto).
export function CifrasEditor({ value, onChange, defaults }: EditorProps<"cifras">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  return (
    <SectionCard
      title="Cifras de resultados"
      description="Oculta por defecto: actívala en “Secciones visibles” cuando tengas datos reales. Va después de los ejemplos."
      onReset={() => onChange({ ...value, frase: defaults.frase })}
    >
      <p role="note" className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-[13px] font-semibold text-ink-soft">
        {HELP}
      </p>
      <ListField<Cifra>
        label="Cifras"
        itemLabel="Cifra"
        hint="Hasta 4. Solo se publican las que tienen valor, texto y fuente."
        items={value.items}
        onChange={(items) => set({ items })}
        min={0}
        max={4}
        newItem={() => ({ valor: "", texto: "", fuente: "" })}
        renderItem={(item, setItem) => {
          const warn = missing(item);
          return (
            <>
              <FieldRow>
                <Field label="Valor" value={item.valor} onChange={(v) => setItem({ ...item, valor: v })} hint="Ej.: Mismo día" />
                <Field label="Texto" value={item.texto} onChange={(v) => setItem({ ...item, texto: v })} hint="Ej.: en responder cotizaciones" />
              </FieldRow>
              <Field label="Fuente" value={item.fuente} onChange={(v) => setItem({ ...item, fuente: v })} hint="Ej.: Piloto con cliente de O&A, 2026" />
              {warn && (
                <p role="status" className="text-[12px] font-semibold text-accent-strong">
                  {warn}
                </p>
              )}
            </>
          );
        }}
      />
      <Field
        label="Frase (si no hay cifras)"
        value={value.frase}
        onChange={(v) => set({ frase: v })}
        textarea
        hint="Se muestra si la sección está visible y no hay cifras válidas. Déjala vacía para no mostrar nada."
      />
    </SectionCard>
  );
}
