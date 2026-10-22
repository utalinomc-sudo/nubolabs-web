"use client";

// Panel "Tu negocio hoy" del hero (cambio mensaje-principal-pyme, design.md decisión 4).
// Ilustrativo: tareas de ejemplo que se completan solas. Rota solo si está a la vista, con la pestaña activa
// y sin "reducir movimiento". El render inicial es siempre el mismo (heroFeed) para que coincida con el servidor.
import { useEffect, useRef, useState } from "react";
import {
  IconBell,
  IconCalendar,
  IconChart,
  IconChat,
  IconCheck,
  IconFile,
  IconPackage,
  IconUsers,
  IconWallet,
} from "@/components/icons";
import { heroFeed, heroFeedMore, type HeroFeedIcon, type HeroFeedItem, type HeroFeedTone } from "@/lib/content";

const ROTATE_MS = 3200;
const VISIBLE_TASKS = 5;

const ICONS: Record<HeroFeedIcon, (p: { className?: string }) => React.JSX.Element> = {
  file: IconFile,
  wallet: IconWallet,
  chat: IconChat,
  package: IconPackage,
  chart: IconChart,
  calendar: IconCalendar,
  bell: IconBell,
};

const TONES: Record<HeroFeedTone, string> = {
  brand: "bg-brand-50 text-brand",
  accent: "bg-accent-50 text-accent-strong",
  cyan: "bg-brand-light-50 text-brand-deep",
  success: "bg-success-50 text-success",
};

type Row = HeroFeedItem & { id: number; isNew: boolean };

export function HeroPanel() {
  const figureRef = useRef<HTMLElement>(null);
  const [rows, setRows] = useState<Row[]>(() => heroFeed.map((t, i) => ({ ...t, id: i, isNew: false })));
  const nextTask = useRef(0);
  const nextId = useRef(heroFeed.length);

  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;
    const motionQuery =
      typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (motionQuery?.matches || typeof IntersectionObserver === "undefined") return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const addTask = () => {
      if (document.hidden) return;
      const task = heroFeedMore[nextTask.current % heroFeedMore.length];
      nextTask.current += 1;
      const id = nextId.current++;
      setRows((prev) => [{ ...task, id, isNew: true }, ...prev].slice(0, VISIBLE_TASKS));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1]?.isIntersecting ?? false;
        if (visible && !timer) timer = setInterval(addTask, ROTATE_MS);
        if (!visible) stop();
      },
      { threshold: 0.2 },
    );
    observer.observe(el);

    // Si el visitante activa "reducir movimiento" con la página abierta, la rotación se detiene para siempre.
    const onMotionChange = (e: { matches: boolean }) => {
      if (!e.matches) return;
      observer.disconnect();
      stop();
    };
    motionQuery?.addEventListener?.("change", onMotionChange);

    return () => {
      observer.disconnect();
      stop();
      motionQuery?.removeEventListener?.("change", onMotionChange);
    };
  }, []);

  return (
    <figure
      ref={figureRef}
      aria-label="Ejemplo: tareas que avanzan solas en tu negocio"
      className="relative pb-10 pt-2.5 sm:pb-[34px] sm:pl-[18px] sm:pt-[18px]"
    >
      {/* Alto natural y estable: todas las filas miden lo mismo (título de 1 línea desde sm; 2 líneas reservadas en
          móvil; detalle de 1 línea), así que al rotar el panel no cambia de alto ni corta tareas, con cualquier ancho
          o tamaño de letra. */}
      <div className="relative rounded-3xl border border-line bg-white p-3.5 shadow-lift sm:p-[22px]">
        <div className="flex flex-col items-start gap-2 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="text-[17px] font-extrabold tracking-[-0.3px]">
            Tu negocio hoy
            <small className="block text-[12.5px] font-medium tracking-normal text-ink-muted">
              Lo que avanzó solo mientras atendías
            </small>
          </div>
          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-success-50 px-3 py-[7px] text-[12.5px] font-bold text-success-strong">
            <i aria-hidden="true" className="h-2 w-2 rounded-full bg-success-live motion-safe:animate-live-pulse" />
            Piloto automático
          </span>
        </div>

        <ul aria-live="off" className="mt-3.5 flex flex-col gap-2.5 max-sm:[&>li:nth-child(n+5)]:hidden">
          {rows.map((row) => {
            const Icon = ICONS[row.icon];
            return (
              <li
                key={row.id}
                className={`flex items-center gap-2.5 rounded-[14px] border border-line bg-surface-soft px-3 py-2.5 sm:gap-[13px] sm:px-3.5 sm:py-3 ${
                  row.isNew ? "motion-safe:animate-feed-in" : ""
                }`}
              >
                <span className={`grid h-[34px] w-[34px] flex-none place-items-center rounded-[11px] sm:h-[38px] sm:w-[38px] ${TONES[row.tone]}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-[1.35] sm:text-[14.5px]">
                  <span data-task-title className="line-clamp-2 min-h-[2.7em] sm:line-clamp-1 sm:min-h-0">
                    {row.title}
                  </span>
                  <small className="mt-0.5 block truncate text-xs font-medium text-ink-muted">{row.detail}</small>
                </span>
                <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-success text-white">
                  <IconCheck className="h-[13px] w-[13px] [&_path]:[stroke-width:3.2]" />
                  <span className="sr-only">Completada</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tarjetas flotantes decorativas. La superior va más arriba para no tapar "Piloto automático" y en móvil
          se oculta porque taparía el título del panel. */}
      <div
        aria-hidden="true"
        className="absolute -right-3.5 -top-7 hidden items-center gap-3 rounded-2xl border border-line bg-white px-3.5 py-3 text-[13.5px] font-bold leading-[1.3] shadow-lift motion-safe:animate-bob-slow sm:flex"
      >
        <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] bg-success-50 text-success">
          <IconBell className="h-4 w-4" />
        </span>
        <span>
          Nada pendiente
          <small className="block text-xs font-medium text-ink-muted">Plazos de la semana al día</small>
        </span>
      </div>
      <div
        aria-hidden="true"
        className="absolute -left-1.5 bottom-0 flex items-center gap-3 rounded-2xl border border-line bg-white px-3.5 py-3 text-[13.5px] font-bold leading-[1.3] shadow-lift motion-safe:animate-bob"
      >
        <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-xl bg-navy text-brand-light">
          <IconUsers className="h-4 w-4" />
        </span>
        <span>
          Y tú, enfocado en crecer
          <small className="block text-xs font-medium text-ink-muted">Tu equipo, en lo importante</small>
        </span>
      </div>
    </figure>
  );
}
