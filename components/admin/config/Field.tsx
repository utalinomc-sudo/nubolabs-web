"use client";

import { useId, type ReactNode } from "react";

// Campo de texto con etiqueta para los editores de /admin/config. La ayuda va como descripción (aria-describedby),
// no dentro de la etiqueta, para que el nombre accesible del campo sea solo su título.
export function Field({
  label,
  value,
  onChange,
  hint,
  textarea,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  textarea?: boolean;
  rows?: number;
}) {
  const hintId = useId();
  const describedBy = hint ? hintId : undefined;
  return (
    <div>
      <label className="block">
        <span className="text-[13px] font-semibold text-ink-soft">{label}</span>
        {textarea ? (
          <textarea
            className={`field mt-1.5 ${rows > 3 ? "resize-y" : "resize-none"}`}
            rows={rows}
            value={value}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input className="field mt-1.5" value={value} aria-describedby={describedBy} onChange={(e) => onChange(e.target.value)} />
        )}
      </label>
      {hint ? (
        <span id={hintId} className="mt-1 block text-[11px] text-ink-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

// Fila de dos campos lado a lado (etiqueta + título, por ejemplo).
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
