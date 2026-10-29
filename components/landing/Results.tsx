// "Lo que ganas": 4 resultados en grilla bento 7/5/5/7, cada uno con una ilustración decorativa según su posición
// (cambio lenguaje-sin-jerga, design.md decisión 3): seguimiento de una venta (sin chat, cambio
// enfoque-soluciones-a-medida, decisión 4), barras, avisos y ecuación. Los textos vienen del CMS; las ilustraciones,
// de lib/content.ts.
import { IconBell, IconChart, IconCheck, IconClock, IconLayers, IconTrend, IconUsers, IconZap } from "@/components/icons";
import { SectionHead } from "@/components/landing/SectionHead";
import { resultsVisuals as v } from "@/lib/content";
import { defaultSiteConfig, type SiteContent } from "@/lib/siteConfig";

// Estilo de cada posición: ícono, color del ícono, fondo de la tarjeta y ancho en la grilla de 12 columnas.
const CARDS = [
  {
    Icon: IconTrend,
    tile: "bg-brand-50 text-brand",
    card: "border-line bg-gradient-to-br from-white from-40% to-brand-50 md:col-span-7",
  },
  { Icon: IconChart, tile: "bg-brand-light-50 text-brand-deep", card: "border-line bg-white md:col-span-5" },
  {
    Icon: IconBell,
    tile: "bg-brand-light/15 text-brand-light",
    card: "border-navy-800 bg-gradient-to-br from-navy to-navy-700 text-white md:col-span-5",
  },
  { Icon: IconLayers, tile: "bg-success-50 text-success", card: "border-line bg-white md:col-span-7" },
];

// Seguimiento de una venta: lo que ya pasó (marcado) y lo que queda programado (punteado). Si el texto y la hora no
// caben en una línea (375 px), la hora baja a una segunda línea alineada a la derecha en vez de partir el texto.
function FollowUpVisual() {
  return (
    <ol data-viz aria-hidden="true" className="mt-auto flex max-w-[360px] flex-col gap-2 pt-3.5">
      {v.followup.map((row) => (
        <li
          key={row.text}
          className={`flex flex-wrap items-center gap-x-2.5 gap-y-0.5 rounded-xl border px-3.5 py-2.5 text-sm leading-[1.4] ${
            row.done ? "border-line bg-white shadow-card" : "border-dashed border-brand-100 bg-brand-50"
          }`}
        >
          {row.done ? (
            <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-success text-white">
              <IconCheck className="h-3 w-3" />
            </span>
          ) : (
            <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full border-2 border-dashed border-brand text-brand">
              <IconClock className="h-3 w-3" />
            </span>
          )}
          <span className="min-w-0 flex-auto font-semibold">{row.text}</span>
          <small className="ml-auto flex-none text-[11px] text-ink-muted">{row.meta}</small>
        </li>
      ))}
    </ol>
  );
}

function BarsVisual() {
  const last = v.bars.length - 1;
  return (
    <div data-viz aria-hidden="true" className="mt-auto pt-3.5">
      <div className="flex h-24 items-end gap-2.5">
        {v.bars.map((b, i) => (
          <span
            key={b.day}
            className={`flex-1 rounded-b rounded-t-lg ${i === last ? "bg-gradient-to-r from-brand to-brand-light" : "bg-brand-100"}`}
            style={{ height: `${b.height}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-2.5 font-mono text-[11px] text-ink-muted">
        {v.bars.map((b) => (
          <span key={b.day} className="flex-1 text-center">
            {b.day}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChecksVisual() {
  return (
    <ul data-viz aria-hidden="true" className="mt-auto flex flex-col gap-[9px] pt-3.5">
      {v.checks.map((c) => (
        <li key={c.text} className="flex items-center gap-2.5 text-[14.5px] font-semibold text-inverse-strong">
          {c.done ? (
            <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-brand-light text-navy">
              <IconCheck className="h-3 w-3" />
            </span>
          ) : (
            <span className="h-[22px] w-[22px] flex-none rounded-full border-2 border-dashed border-white/35" />
          )}
          {c.text}
        </li>
      ))}
    </ul>
  );
}

function GrowVisual() {
  const node = "flex items-center gap-2 rounded-xl border px-[13px] py-[9px] text-[13.5px] font-bold";
  return (
    <div data-viz aria-hidden="true" className="mt-auto flex flex-wrap items-center gap-2.5 pt-3.5">
      <span className={`${node} border-line bg-surface-soft`}>
        <IconUsers className="h-4 w-4 text-brand" />
        {v.grow.team}
      </span>
      <span className="font-extrabold text-ink-faint">+</span>
      <span className={`${node} border-line bg-surface-soft`}>
        <IconZap className="h-4 w-4 text-brand" />
        {v.grow.tasks}
      </span>
      <span className="font-extrabold text-ink-faint">=</span>
      <span className={`${node} border-navy bg-navy text-white`}>
        <IconTrend className="h-4 w-4 text-brand-light" />
        {v.grow.result}
      </span>
    </div>
  );
}

const VISUALS = [FollowUpVisual, BarsVisual, ChecksVisual, GrowVisual];

export function Results({ content }: { content?: SiteContent["resultados"] }) {
  const c = content ?? defaultSiteConfig().content.resultados;
  return (
    <section id="resultados" aria-labelledby="h-resultados" className="scroll-mt-20 bg-surface-soft py-[76px] lg:py-[104px]">
      <div className="container-page">
        <SectionHead id="h-resultados" eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} className="mb-[52px]" />

        <div className="grid gap-[18px] md:grid-cols-12">
          {c.items.slice(0, CARDS.length).map((item, i) => {
            const { Icon, tile, card } = CARDS[i];
            const Visual = VISUALS[i];
            const dark = i === 2;
            return (
              <article
                key={i}
                className={`relative flex flex-col gap-3 overflow-hidden rounded-3xl border p-6 shadow-card md:min-h-[300px] md:p-[30px] ${card}`}
              >
                <span className={`grid h-[46px] w-[46px] flex-none place-items-center rounded-[14px] ${tile}`}>
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <h3 className="text-[23px] font-extrabold leading-[1.15] tracking-[-0.8px] md:text-[26px]">{item.title}</h3>
                <p className={`max-w-[420px] ${dark ? "text-inverse" : "text-ink-muted"}`}>{item.body}</p>
                <Visual />
              </article>
            );
          })}
        </div>

        <p className="mt-[26px] flex items-center gap-3 text-[16.5px] text-ink-soft">
          <IconUsers className="h-[22px] w-[22px] flex-none text-brand" />
          {c.cierre}
        </p>
      </div>
    </section>
  );
}
