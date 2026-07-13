"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { nav as baseNav } from "@/lib/content";

export function Nav({ showEquipo = true, showMision = true }: { showEquipo?: boolean; showMision?: boolean }) {
  const [open, setOpen] = useState(false);

  // "Nosotros" agrupa las páginas Misión y visión + Equipo (según visibilidad).
  const nosotros = [
    showMision ? { label: "Misión y visión", href: "/mision-vision" } : null,
    showEquipo ? { label: "Equipo", href: "/equipo" } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <header className="sticky top-0 z-40 border-b border-[#EEF2F8] bg-white/90 backdrop-blur">
      <div className="container-page flex items-center justify-between py-4">
        <a href="/#inicio" aria-label="Nubolabs — inicio">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink-soft lg:flex">
          {baseNav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              className={
                i === 0
                  ? "border-b-2 border-brand pb-[3px] text-brand"
                  : "transition hover:text-brand"
              }
            >
              {item.label}
            </a>
          ))}

          {nosotros.length > 0 && (
            <div className="group relative">
              <button
                type="button"
                aria-haspopup="true"
                className="flex items-center gap-1 transition hover:text-brand focus-visible:text-brand focus:outline-none group-hover:text-brand"
              >
                Nosotros
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {/* Panel: visible al pasar el mouse o con foco dentro del grupo. pt-3 = puente para el hover. */}
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="min-w-[200px] rounded-xl border border-[#EEF2F8] bg-white p-1.5 shadow-float">
                  {nosotros.map((c) => (
                    <a
                      key={c.href}
                      href={c.href}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-surface-soft hover:text-brand"
                    >
                      {c.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          <a href="/diagnostico" className="rounded-full bg-brand px-5 py-[11px] text-sm text-white transition hover:brightness-95">
            Agendar diagnóstico →
          </a>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="#0B1D3A" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-[#EEF2F8] bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            {baseNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-ink-soft hover:bg-surface-soft"
              >
                {item.label}
              </a>
            ))}

            {nosotros.length > 0 && (
              <>
                <div className="px-3 pb-1 pt-3 text-[12px] font-bold uppercase tracking-wide text-ink-muted">Nosotros</div>
                {nosotros.map((c) => (
                  <a
                    key={c.href}
                    href={c.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg py-3 pl-6 pr-3 text-sm font-semibold text-ink-soft hover:bg-surface-soft"
                  >
                    {c.label}
                  </a>
                ))}
              </>
            )}

            <a
              href="/diagnostico"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-brand px-3 py-3 text-center text-sm font-semibold text-white"
            >
              Agendar diagnóstico →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
