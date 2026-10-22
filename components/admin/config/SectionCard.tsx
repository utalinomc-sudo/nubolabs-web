"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";

// Sube cada vez que se guarda: así los avisos de "textos recomendados cargados" desaparecen tras guardar.
export const SaveVersionContext = createContext(0);

const DEFAULT_NOTICE = "Textos recomendados cargados. Revísalos y pulsa “Guardar cambios” para publicarlos.";

// Tarjeta de una sección del editor. Con onReset muestra "Usar los textos recomendados", que solo cambia el
// formulario: nada se publica hasta "Guardar cambios" (spec landing/contenido-pyme, "Textos recomendados en el admin").
export function SectionCard({
  title,
  description,
  onReset,
  resetNotice = DEFAULT_NOTICE,
  children,
}: {
  title: string;
  description?: ReactNode;
  onReset?: () => void;
  resetNotice?: string;
  children: ReactNode;
}) {
  const headingId = useId();
  const saveVersion = useContext(SaveVersionContext);
  const [resetAt, setResetAt] = useState<number | null>(null);

  return (
    <section className="card p-6" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="font-extrabold">
          {title}
        </h2>
        {onReset && (
          <button
            type="button"
            onClick={() => {
              onReset();
              setResetAt(saveVersion);
            }}
            className="rounded-lg border border-line-strong px-3 py-2 text-[13px] font-semibold text-ink-soft transition hover:border-brand hover:text-brand"
          >
            Usar los textos recomendados
          </button>
        )}
      </div>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      {/* Región viva siempre montada: los lectores de pantalla anuncian el aviso cuando aparece el texto. */}
      <p role="status" className={resetAt === saveVersion ? "mt-2 text-[12px] font-semibold text-brand" : "sr-only"}>
        {resetAt === saveVersion ? resetNotice : ""}
      </p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
