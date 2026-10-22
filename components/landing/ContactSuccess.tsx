"use client";

// Pantalla de éxito del formulario de contacto (cambio formulario-minimo-consentimiento, spec "Agenda inmediata").
// Con URL de agenda invita a elegir horario; sin ella, avisa que escribimos nosotros (sin botón roto).
import { forwardRef } from "react";
import { IconArrowRight, IconCalendar, IconCheck } from "@/components/icons";
import { contactSection } from "@/lib/content";

interface ContactSuccessProps {
  firstName: string;
  goalsTopic: string | null; // "vender más y cobrar a tiempo" o null
  scheduleUrl: string | null;
}

export const ContactSuccess = forwardRef<HTMLDivElement, ContactSuccessProps>(function ContactSuccess(
  { firstName, goalsTopic, scheduleUrl },
  ref,
) {
  const s = contactSection.success;
  const copy = scheduleUrl ? s.withSchedule : s.withoutSchedule;
  return (
    <div ref={ref} tabIndex={-1} aria-live="polite" className="px-1 py-2.5 text-center outline-none motion-safe:animate-feed-in">
      <div className="mx-auto mb-[18px] grid h-16 w-16 place-items-center rounded-full bg-success-50 text-success">
        <IconCheck className="h-[30px] w-[30px] [&_path]:[stroke-width:2.8]" />
      </div>
      <h3 className="text-[24px] font-extrabold leading-[1.2] tracking-[-0.7px] text-balance sm:text-[26px]">
        {copy.title(firstName)}
      </h3>
      <p className="mx-auto mb-[22px] mt-2 max-w-[380px] text-ink-muted">{copy.body}</p>

      {scheduleUrl && (
        <a
          href={scheduleUrl}
          target="_blank"
          rel="noopener"
          className="btn-primary group min-h-11 w-full"
        >
          <IconCalendar className="h-5 w-5" />
          {s.withSchedule.button}
          <IconArrowRight className="h-[18px] w-[18px] transition group-hover:translate-x-[3px]" />
        </a>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-surface-soft px-5 py-[18px] text-left">
        <p className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-ink-muted">{s.nextTitle}</p>
        <ol className="flex flex-col gap-2.5">
          {[...copy.steps, s.topic(goalsTopic)].map((step, i) => (
            <li key={i} className="flex gap-3 text-[14.5px] text-ink-soft">
              <span className="grid h-6 w-6 flex-none place-items-center rounded-lg border border-line-strong bg-white text-[12.5px] font-extrabold text-brand">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <a href="/diagnostico" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-brand hover:underline">
        {s.selfDiagnosis}
      </a>
    </div>
  );
});
