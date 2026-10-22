"use client";

// Botón fijo para agendar en celular (≤ 640 px): aparece después del hero y se oculta mientras el formulario está
// a la vista (cambio cierre-landing-faq-cta, design.md decisión 4). Solo se monta si la sección de contacto existe.
import { useEffect, useState } from "react";
import { IconArrowRight } from "@/components/icons";

export function StickyCta({ label }: { label: string }) {
  // null = todavía no se sabe (oculto hasta que el observador informe dónde está el visitante).
  const [heroVisible, setHeroVisible] = useState<boolean | null>(null);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const hero = document.getElementById("inicio");
    const contact = document.getElementById("contacto");
    const observers: IntersectionObserver[] = [];
    const watch = (el: Element, onChange: (v: boolean) => void, threshold: number) => {
      const io = new IntersectionObserver((entries) => onChange(entries.some((e) => e.isIntersecting)), { threshold });
      io.observe(el);
      observers.push(io);
    };
    if (hero) watch(hero, setHeroVisible, 0);
    if (contact) {
      watch(contact, (v) => {
        setContactVisible(v);
        // Sin hero (sección oculta), basta con saber dónde está el formulario.
        if (!hero) setHeroVisible(false);
      }, 0.05);
    }
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  const show = heroVisible === false && !contactVisible;
  // Textos viejos del CMS terminan en "→": no se agrega una segunda flecha (misma regla que Hero.tsx).
  const hasArrow = label.trim().endsWith("→");
  return (
    <div
      data-testid="sticky-cta"
      aria-hidden={show ? undefined : true}
      className={`fixed inset-x-3 bottom-3 z-40 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 motion-reduce:transition-none min-[641px]:hidden ${
        show ? "translate-y-0" : "translate-y-[140%]"
      }`}
    >
      <a
        href="#contacto"
        tabIndex={show ? undefined : -1}
        className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-brand px-6 text-base font-bold text-white shadow-lift transition hover:bg-brand-dark"
      >
        {label}
        {!hasArrow && <IconArrowRight className="h-5 w-5 flex-none" />}
      </a>
    </div>
  );
}
