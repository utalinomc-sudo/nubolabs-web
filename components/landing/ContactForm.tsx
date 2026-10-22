"use client";

// Formulario de contacto de 2 pasos de la portada (#contacto). Cambio formulario-minimo-consentimiento,
// design.md decisión 4 y spec leads/formulario-contacto. Referencia visual: docs/design/propuesta-web-hdu-08.html.
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconArrowLeft, IconArrowRight, IconCheck, IconFile, IconSearch, IconUsers } from "@/components/icons";
import { ContactSuccess } from "@/components/landing/ContactSuccess";
import { contactSection as copy } from "@/lib/content";
import { CONSENT_TEXTS, GOALS, INDUSTRIES, describeGoals, type GoalKey, type IndustryKey } from "@/lib/leadOptions";
import { LEAD_MAX, isValidEmail, isValidPhone, type LeadSource } from "@/lib/leads";

type Status = "idle" | "loading" | "ok";
type RequiredField = "name" | "phone" | "email";
type Values = { name: string; phone: string; email: string; company: string; message: string };

const REQUIRED: RequiredField[] = ["name", "phone", "email"]; // orden visual: el foco va al primero inválido
const RULES: Record<RequiredField, (v: string) => boolean> = {
  name: (v) => v.trim().length > 0,
  phone: isValidPhone,
  email: isValidEmail,
};
const TAKEAWAY_ICONS = { search: IconSearch, file: IconFile, users: IconUsers } as const;
const TAKEAWAY_TONES = ["bg-brand-50 text-brand", "bg-brand-light-50 text-brand-deep", "bg-success-50 text-success"];

interface ContactFormProps {
  source?: LeadSource;
  scheduleUrl?: string | null; // NEXT_PUBLIC_SCHEDULE_URL validada en el servidor; null = sin agenda
  // Contenido extra bajo los beneficios (por ejemplo la tarjeta de WhatsApp, cambio cierre-landing-faq-cta).
  aside?: ReactNode;
}

export function ContactForm({ source = "landing", scheduleUrl = null, aside = null }: ContactFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [goals, setGoals] = useState<GoalKey[]>([]);
  const [industry, setIndustry] = useState<IndustryKey | null>(null);
  // Detalle de "Otra cosa" / "Otro": se conserva si la persona desmarca y vuelve a marcar, pero solo se envía si la
  // opción está elegida (design.md decisión 4b).
  const [goalOther, setGoalOther] = useState("");
  const [industryOther, setIndustryOther] = useState("");
  const [values, setValues] = useState<Values>({ name: "", phone: "", email: "", company: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<RequiredField, boolean>>>({});
  const [contactConsent, setContactConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const legend1 = useRef<HTMLLegendElement>(null);
  const legend2 = useRef<HTMLLegendElement>(null);
  const inputs = useRef<Partial<Record<RequiredField, HTMLInputElement | null>>>({});
  const consentBox = useRef<HTMLInputElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const stepChanged = useRef(false);

  // Al cambiar de paso, el foco va al título del paso (no en la primera carga).
  useEffect(() => {
    if (!stepChanged.current) return;
    (step === 1 ? legend1 : legend2).current?.focus();
  }, [step]);
  useEffect(() => {
    if (status === "ok") success.current?.focus();
  }, [status]);

  function goTo(next: 1 | 2) {
    stepChanged.current = true;
    setStep(next);
  }
  function toggleGoal(key: GoalKey) {
    setGoals((g) => (g.includes(key) ? g.filter((k) => k !== key) : [...g, key]));
  }
  function setValue(key: keyof Values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    // Si el campo ya mostraba error, se revalida mientras se corrige.
    if (key in RULES && errors[key as RequiredField]) {
      setErrors((e) => ({ ...e, [key]: !RULES[key as RequiredField](value) }));
    }
  }
  function onBlur(key: RequiredField) {
    if (values[key].trim()) setErrors((e) => ({ ...e, [key]: !RULES[key](values[key]) }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    const nextErrors = Object.fromEntries(REQUIRED.map((k) => [k, !RULES[k](values[k])])) as Record<RequiredField, boolean>;
    setErrors(nextErrors);
    setConsentError(!contactConsent);
    const firstBad = REQUIRED.find((k) => nextErrors[k]);
    if (firstBad) return inputs.current[firstBad]?.focus();
    if (!contactConsent) return consentBox.current?.focus();

    setStatus("loading");
    setServerError("");
    const payload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      company: values.company.trim() || undefined,
      message: values.message.trim() || undefined,
      goals: goals.length ? goals : undefined,
      industry: industry ?? undefined,
      goalOther: goals.includes("other") && goalOther.trim() ? goalOther.trim() : undefined,
      industryOther: industry === "otro" && industryOther.trim() ? industryOther.trim() : undefined,
      contactConsent: true,
      marketingConsent,
      source,
      website: honeypot.current?.value ?? "",
    };
    // Solo se muestra el mensaje del servidor ({ error }); sin red o sin respuesta legible, el texto propio
    // (nunca "Failed to fetch" u otros mensajes técnicos del navegador).
    let message: string = copy.errors.server;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: { error?: unknown } = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("ok");
        return;
      }
      if (typeof json.error === "string" && json.error.trim()) message = json.error;
    } catch {
      // red caída: queda el mensaje por defecto
    }
    setServerError(message);
    setStatus("idle");
  }

  const s1 = copy.step1;
  const s2 = copy.step2;

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="scroll-mt-20 bg-surface-soft">
      <div className="container-page grid grid-cols-[minmax(0,1fr)] items-start gap-12 py-20 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] lg:gap-14">
        <div>
          <span className="inline-flex items-center gap-2.5 font-mono text-[12.5px] font-semibold uppercase tracking-[2.2px] text-brand">
            <span aria-hidden="true" className="h-0.5 w-[22px] rounded bg-gradient-to-r from-brand to-brand-light" />
            {copy.eyebrow}
          </span>
          <h2
            id="contacto-title"
            className="mt-4 text-[32px] font-extrabold leading-[1.1] tracking-[-1.2px] text-balance md:text-[42px] md:tracking-[-1.6px]"
          >
            {copy.title}
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-muted">{copy.lead}</p>
          <ul className="mt-7 flex flex-col gap-3.5">
            {copy.takeaways.map((t, i) => {
              const Icon = TAKEAWAY_ICONS[t.icon];
              return (
                <li key={t.title} className="flex items-start gap-3.5 text-base text-ink-soft">
                  <span className={`grid h-10 w-10 flex-none place-items-center rounded-xl ${TAKEAWAY_TONES[i]}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <b className="block text-ink">{t.title}</b>
                    {t.body}
                  </span>
                </li>
              );
            })}
          </ul>
          {aside}
        </div>

        <div className="relative rounded-3xl border border-line bg-white p-[18px] shadow-form sm:p-8">
          {status === "ok" ? (
            <ContactSuccess
              ref={success}
              firstName={values.name.trim().split(/\s+/)[0]}
              goalsTopic={describeGoals(goals)}
              scheduleUrl={scheduleUrl}
            />
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="mb-[22px] flex items-center gap-3" aria-hidden="true">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <i
                    className={`block h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-[width] duration-500 ${
                      step === 1 ? "w-1/2" : "w-full"
                    }`}
                  />
                </div>
                <small className="whitespace-nowrap font-mono text-xs font-semibold text-ink-muted">{copy.progress(step)}</small>
              </div>

              {/* Campo trampa (honeypot): fuera de pantalla, sin foco ni autocompletar. Si llega con texto, es un bot. */}
              <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
                <label>
                  No llenar
                  <input ref={honeypot} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              {step === 1 ? (
                <fieldset className="m-0 min-w-0 border-0 p-0 motion-safe:animate-feed-in">
                  <legend ref={legend1} tabIndex={-1} className="mb-1.5 scroll-mt-28 p-0 text-2xl font-extrabold leading-tight tracking-[-0.6px] outline-none">
                    <span className="sr-only">{copy.progress(1)}: </span>
                    <span>{s1.legend}</span>
                  </legend>
                  <p className="mb-[18px] text-[14.5px] text-ink-muted">{s1.hint}</p>
                  <div role="group" aria-label={s1.goalsLabel} className="flex flex-wrap gap-2">
                    {GOALS.map((g) => (
                      <Chip key={g.key} pressed={goals.includes(g.key)} onClick={() => toggleGoal(g.key)}>
                        {g.label}
                      </Chip>
                    ))}
                  </div>
                  {goals.includes("other") && (
                    <OtherField
                      id="contacto-goal-other"
                      label={s1.goalOther.label}
                      optional={s1.optional}
                      placeholder={s1.goalOther.placeholder}
                      value={goalOther}
                      onChange={setGoalOther}
                    />
                  )}
                  <span id="contacto-rubro" className="mb-2.5 mt-5 block text-sm font-bold">
                    {s1.industryLabel}
                  </span>
                  <div role="group" aria-labelledby="contacto-rubro" className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((ind) => (
                      <Chip
                        key={ind.key}
                        pressed={industry === ind.key}
                        onClick={() => setIndustry((cur) => (cur === ind.key ? null : ind.key))}
                      >
                        {ind.label}
                      </Chip>
                    ))}
                  </div>
                  {industry === "otro" && (
                    <OtherField
                      id="contacto-industry-other"
                      label={s1.industryOther.label}
                      optional={s1.optional}
                      placeholder={s1.industryOther.placeholder}
                      value={industryOther}
                      onChange={setIndustryOther}
                    />
                  )}
                  <div className="mt-[22px] flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => goTo(2)} className="min-h-11 px-1 text-[14.5px] font-bold text-ink-muted hover:text-brand">
                      {s1.skip}
                    </button>
                    <button type="button" onClick={() => goTo(2)} className="btn-primary group min-h-11">
                      {s1.next}
                      <IconArrowRight className="h-[18px] w-[18px] transition group-hover:translate-x-[3px]" />
                    </button>
                  </div>
                </fieldset>
              ) : (
                <fieldset className="m-0 min-w-0 border-0 p-0 motion-safe:animate-feed-in">
                  <legend ref={legend2} tabIndex={-1} className="mb-1.5 scroll-mt-28 p-0 text-2xl font-extrabold leading-tight tracking-[-0.6px] outline-none">
                    <span className="sr-only">{copy.progress(2)}: </span>
                    <span>{s2.legend}</span>
                  </legend>
                  <p className="mb-[18px] text-[14.5px] text-ink-muted">{s2.hint}</p>

                  <div className="grid gap-x-3.5 sm:grid-cols-2">
                    <Field
                      id="name"
                      label={s2.labels.name}
                      required
                      error={errors.name ? copy.errors.name : null}
                      inputProps={{
                        ref: (el) => {
                          inputs.current.name = el;
                        },
                        value: values.name,
                        onChange: (e) => setValue("name", e.target.value),
                        onBlur: () => onBlur("name"),
                        autoComplete: "given-name",
                        maxLength: 120,
                      }}
                    />
                    <Field
                      id="phone"
                      label={s2.labels.phone}
                      required
                      error={errors.phone ? copy.errors.phone : null}
                      inputProps={{
                        ref: (el) => {
                          inputs.current.phone = el;
                        },
                        value: values.phone,
                        onChange: (e) => setValue("phone", e.target.value),
                        onBlur: () => onBlur("phone"),
                        type: "tel",
                        inputMode: "tel",
                        autoComplete: "tel",
                        placeholder: s2.placeholders.phone,
                        maxLength: 30,
                      }}
                    />
                  </div>
                  <Field
                    id="email"
                    label={s2.labels.email}
                    required
                    error={errors.email ? copy.errors.email : null}
                    inputProps={{
                      ref: (el) => {
                        inputs.current.email = el;
                      },
                      value: values.email,
                      onChange: (e) => setValue("email", e.target.value),
                      onBlur: () => onBlur("email"),
                      type: "email",
                      inputMode: "email",
                      autoComplete: "email",
                      placeholder: s2.placeholders.email,
                      maxLength: 254,
                    }}
                  />
                  <Field
                    id="company"
                    label={s2.labels.company}
                    optional={s2.optional}
                    inputProps={{
                      value: values.company,
                      onChange: (e) => setValue("company", e.target.value),
                      autoComplete: "organization",
                      maxLength: 120,
                    }}
                  />
                  <div className="mb-3.5 flex flex-col gap-[7px]">
                    <label htmlFor="contacto-message" className="text-sm font-bold">
                      {s2.labels.message} <span className="font-medium text-ink-muted">{s2.optional}</span>
                    </label>
                    <textarea
                      id="contacto-message"
                      rows={2}
                      maxLength={1000}
                      value={values.message}
                      onChange={(e) => setValue("message", e.target.value)}
                      placeholder={s2.placeholders.message}
                      className="min-h-[84px] w-full scroll-mt-28 resize-y rounded-xl border-[1.5px] border-line-strong bg-white px-[15px] py-[13px] text-base leading-normal outline-none transition placeholder:text-ink-muted focus:border-brand focus:ring-4 focus:ring-brand/10"
                    />
                  </div>

                  <label className="my-2.5 flex cursor-pointer items-start gap-3 text-sm leading-normal text-ink-soft">
                    <input
                      ref={consentBox}
                      type="checkbox"
                      checked={contactConsent}
                      onChange={(e) => {
                        setContactConsent(e.target.checked);
                        if (e.target.checked) setConsentError(false);
                      }}
                      aria-invalid={consentError}
                      aria-describedby={consentError ? "contacto-consent-error" : undefined}
                      className="mt-0.5 h-5 w-5 flex-none scroll-mt-28 cursor-pointer accent-brand"
                    />
                    <span>
                      {CONSENT_TEXTS.contact}{" "}
                      <Link href="/privacidad" target="_blank" rel="noopener" className="font-semibold text-brand underline underline-offset-2">
                        {s2.privacyLink}
                      </Link>{" "}
                      <span className="text-accent-strong" aria-hidden="true">
                        *
                      </span>
                    </span>
                  </label>
                  {consentError && (
                    <p id="contacto-consent-error" role="alert" className="mb-2 ml-8 text-[13.5px] font-semibold text-accent-strong">
                      {copy.errors.consent}
                    </p>
                  )}
                  <label className="my-2.5 flex cursor-pointer items-start gap-3 text-sm leading-normal text-ink-soft">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="mt-0.5 h-5 w-5 flex-none scroll-mt-28 cursor-pointer accent-brand"
                    />
                    <span>{CONSENT_TEXTS.marketing}</span>
                  </label>

                  {serverError && (
                    <p role="alert" className="mt-3 rounded-xl bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-strong">
                      {serverError}
                    </p>
                  )}

                  <div className="mt-[22px] flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => goTo(1)}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 px-1 text-[14.5px] font-bold text-ink-muted hover:text-brand"
                    >
                      <IconArrowLeft className="h-4 w-4" />
                      {s2.back}
                    </button>
                    <button type="submit" disabled={status === "loading"} className="btn-primary group min-h-11 disabled:opacity-60">
                      {status === "loading" ? s2.sending : s2.submit}
                      {status !== "loading" && (
                        <IconArrowRight className="h-[18px] w-[18px] transition group-hover:translate-x-[3px]" />
                      )}
                    </button>
                  </div>
                  <p className="mt-3 text-center text-[13.5px] text-ink-muted">{s2.note}</p>
                </fieldset>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] px-3.5 py-2 text-sm font-bold transition ${
        pressed ? "border-brand bg-brand text-white" : "border-line-strong bg-white text-ink-soft hover:border-brand hover:text-brand"
      }`}
    >
      {pressed && <IconCheck className="h-3.5 w-3.5 [&_path]:[stroke-width:3.2]" />}
      {children}
    </button>
  );
}

// Campo de una línea para el detalle de "Otra cosa" u "Otro" (opcional, máx. 70 caracteres, con contador).
function OtherField({ id, label, optional, placeholder, value, onChange }: {
  id: string;
  label: string;
  optional: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-col gap-[7px] motion-safe:animate-feed-in">
      <label htmlFor={id} className="text-sm font-bold">
        {label} <span className="font-medium text-ink-muted">{optional}</span>
      </label>
      <input
        id={id}
        type="text"
        maxLength={LEAD_MAX.goalOther}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-describedby={`${id}-count`}
        className="min-h-[50px] w-full scroll-mt-28 rounded-xl border-[1.5px] border-line-strong bg-white px-[15px] py-[13px] text-base outline-none transition placeholder:text-ink-muted focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
      <span id={`${id}-count`} className="self-end font-mono text-xs text-ink-muted">
        {value.length}/{LEAD_MAX.goalOther}
      </span>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  optional?: string;
  error?: string | null;
  inputProps: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> };
}

function Field({ id, label, required, optional, error, inputProps }: FieldProps) {
  const inputId = `contacto-${id}`;
  const errorId = `${inputId}-error`;
  const { ref, ...rest } = inputProps;
  return (
    <div className="mb-3.5 flex flex-col gap-[7px]">
      <label htmlFor={inputId} className="text-sm font-bold">
        {label}{" "}
        {required ? (
          <span className="text-accent-strong" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="font-medium text-ink-muted">{optional}</span>
        )}
      </label>
      <input
        id={inputId}
        ref={ref}
        required={required}
        aria-required={required || undefined}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-[50px] w-full scroll-mt-28 rounded-xl border-[1.5px] bg-white px-[15px] py-[13px] text-base outline-none transition placeholder:text-ink-muted focus:border-brand focus:ring-4 focus:ring-brand/10 ${
          error ? "border-accent-strong" : "border-line-strong"
        }`}
        {...rest}
      />
      {error && (
        <span id={errorId} role="alert" className="text-[13.5px] font-semibold text-accent-strong">
          {error}
        </span>
      )}
    </div>
  );
}
