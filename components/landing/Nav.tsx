"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { nav } from "@/lib/content";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#EEF2F8] bg-white/90 backdrop-blur">
      <div className="container-page flex items-center justify-between py-4">
        <a href="#inicio" aria-label="Nubolabs — inicio">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink-soft lg:flex">
          {nav.map((item, i) => (
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
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-ink-soft hover:bg-surface-soft"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/diagnostico"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-brand px-3 py-3 text-center text-sm font-semibold text-white"
            >
              Agendar diagnóstico →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
