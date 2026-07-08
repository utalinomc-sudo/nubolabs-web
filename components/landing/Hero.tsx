import { heroTags } from "@/lib/content";

export function Hero() {
  return (
    <section id="inicio" className="container-page grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr]">
      <div className="flex flex-col items-start gap-6">
        <span className="pill">◈&nbsp;AI &amp; AUTOMATION AGENCY</span>
        <h1 className="text-[38px] font-extrabold leading-[1.08] tracking-[-1.4px] text-balance md:text-[50px] md:tracking-[-1.8px]">
          Rediseñamos procesos y los convertimos en{" "}
          <span className="text-brand">automatizaciones con IA</span> que trabajan en la nube.
        </h1>
        <p className="max-w-[520px] text-lg leading-relaxed text-ink-muted">
          No automatizamos procesos obsoletos: primero los entendemos y simplificamos, luego
          construimos flujos, reportes y agentes que ahorran horas y reducen errores.
        </p>
        <div className="flex flex-wrap items-center gap-3.5">
          <a href="/diagnostico" className="btn-primary">
            Solicitar diagnóstico →
          </a>
          <a href="#servicios" className="btn-ghost">
            Ver servicios
          </a>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-semibold text-ink-muted">
          {heroTags.map((t) => (
            <span key={t.label} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="relative h-[380px] md:h-[440px]">
          <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1565FF] to-[#00C2FF]">
            {/* Placeholder de imagen del hero — reemplazar por foto real */}
            <div className="flex h-full items-center justify-center text-center text-white/80">
              <div>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 opacity-80">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="1.6" />
                  <circle cx="8.5" cy="10" r="1.8" stroke="white" strokeWidth="1.6" />
                  <path d="M4 17l4.5-4 3 2.5L16 11l4 4" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                <span className="text-sm">Foto: equipo + cliente trabajando</span>
              </div>
            </div>
          </div>

          {/* Tarjeta flotante superior */}
          <div className="pointer-events-none absolute -right-3 top-6 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 shadow-float md:-right-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#EBF1FF]">
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                <circle cx="5" cy="15" r="3" stroke="#1565FF" strokeWidth="2" />
                <circle cx="15" cy="5" r="3" stroke="#1565FF" strokeWidth="2" />
                <path d="M7 13 L13 7" stroke="#1565FF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <div className="text-[12.5px] font-bold">Flujo optimizado</div>
              <div className="text-[11px] text-ink-muted">correo → IA → CRM</div>
            </div>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8FBF1] text-[11px] font-extrabold text-[#18A45C]">
              ✓
            </span>
          </div>

          {/* Tarjeta flotante inferior */}
          <div className="pointer-events-none absolute -left-4 bottom-7 rounded-2xl bg-white px-4 py-3.5 shadow-float md:-left-6">
            <div className="text-[11px] font-bold tracking-[1px] text-ink-muted">REPORTE MENSUAL</div>
            <div className="text-xl font-extrabold">
              de días <span className="text-accent">→ minutos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
