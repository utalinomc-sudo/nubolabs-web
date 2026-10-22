"use client";

import { useId } from "react";
import { formatWhatsapp } from "@/lib/siteConfig";
import { Field } from "./Field";
import { SectionCard } from "./SectionCard";
import type { EditorProps } from "./types";

// Casilla con título (nombre accesible) y explicación (descripción).
function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <span>
        <label htmlFor={id} className="block cursor-pointer text-sm font-semibold">
          {label}
        </label>
        <span id={`${id}-hint`} className="block text-[12px] text-ink-muted">
          {hint}
        </span>
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        aria-describedby={`${id}-hint`}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 flex-none cursor-pointer accent-brand"
      />
    </div>
  );
}

// WhatsApp de contacto de Nubolabs (cambio cierre-landing-faq-cta, design.md decisión 8): número y dos interruptores
// independientes, apagados por defecto. Sin "Usar los textos recomendados": no son textos.
export function ContactEditor({ value, onChange }: EditorProps<"contact">) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });
  const digits = value.whatsappNumber.replace(/\D/g, "");
  const valid = digits.length >= 8 && digits.length <= 15;

  return (
    <SectionCard title="Contacto por WhatsApp" description="Apagado por defecto. Cada interruptor es independiente.">
      <Field
        label="Número de WhatsApp"
        value={value.whatsappNumber}
        onChange={(v) => set({ whatsappNumber: v })}
        hint="Con código de país, por ejemplo +56 9 3259 0783."
      />
      <p aria-live="polite" className={`text-[12px] font-semibold ${valid ? "text-ink-soft" : "text-accent-strong"}`}>
        {valid
          ? `Se verá como ${formatWhatsapp(digits)} y abrirá https://wa.me/${digits}`
          : "Número inválido (debe tener entre 8 y 15 dígitos): no se mostrará en el sitio."}
      </p>
      <Toggle
        label="Mostrar WhatsApp en el pie de página"
        hint="El número aparece en la columna Contacto de todas las páginas."
        checked={value.showWhatsapp}
        onChange={(v) => set({ showWhatsapp: v })}
      />
      <Toggle
        label="Mostrar QR junto al formulario"
        hint="Tarjeta “¿Prefieres escribirnos?”; en celular, un enlace directo."
        checked={value.showWhatsappQr}
        onChange={(v) => set({ showWhatsappQr: v })}
      />
    </SectionCard>
  );
}
