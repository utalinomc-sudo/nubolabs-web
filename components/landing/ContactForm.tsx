"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo enviar.");
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }

  return (
    <section id="contacto" className="container-page grid items-center gap-14 py-20 lg:grid-cols-2">
      <div>
        <div className="mb-3.5 text-xs font-bold tracking-[2.5px] text-accent">EMPECEMOS</div>
        <h2 className="mb-4 text-[32px] font-extrabold leading-[1.12] tracking-[-1.2px] text-balance md:text-[36px]">
          Agenda un diagnóstico de rediseño y automatización
        </h2>
        <p className="mb-6 text-base leading-relaxed text-ink-muted text-balance">
          Conversemos sobre los procesos que hoy consumen tiempo en tu empresa. En una primera
          sesión identificamos qué rediseñar, qué automatizar y qué impacto tendría.
        </p>
        <ul className="flex flex-col gap-2.5 text-sm text-ink-soft">
          <li>✓&nbsp; Sin compromiso, 30 minutos</li>
          <li>✓&nbsp; Entregable inicial con oportunidades priorizadas</li>
          <li>✓&nbsp; Respuesta en menos de 24 horas</li>
        </ul>
        <a href="/diagnostico" className="mt-6 inline-flex text-sm font-semibold text-brand hover:underline">
          ¿Prefieres estimar tu ahorro primero? Prueba el diagnóstico interactivo →
        </a>
      </div>

      <div className="rounded-[20px] border border-line bg-white p-8 shadow-[0_20px_50px_rgba(11,29,58,.08)]">
        {status === "ok" ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8FBF1] text-2xl text-[#18A45C]">
              ✓
            </span>
            <div className="text-xl font-extrabold">¡Solicitud enviada!</div>
            <p className="mt-2 max-w-[320px] text-sm text-ink-muted">
              Gracias. Te contactaremos en menos de 24 horas para coordinar tu diagnóstico.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-5 text-sm font-semibold text-brand hover:underline"
            >
              Enviar otra solicitud
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2">
              <input name="name" required placeholder="Nombre" className="field" />
              <input name="email" type="email" required placeholder="Email corporativo" className="field" />
            </div>
            <input name="company" placeholder="Empresa" className="field mb-3.5" />
            <textarea
              name="message"
              rows={3}
              placeholder="¿Qué proceso te gustaría rediseñar o automatizar?"
              className="field mb-[18px] resize-none"
            />
            {status === "error" && (
              <p className="mb-3 text-sm font-medium text-accent">{error}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-xl bg-brand py-4 text-center text-[15.5px] font-bold text-white transition hover:brightness-95 disabled:opacity-60"
            >
              {status === "loading" ? "Enviando…" : "Agendar diagnóstico →"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
