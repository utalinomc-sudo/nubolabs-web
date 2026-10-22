// "Cómo trabajamos contigo": 4 pasos con lo que recibe el cliente y la franja "Tú defines qué es éxito"
// (cambio lenguaje-sin-jerga, design.md decisión 3). Textos del CMS (content.proceso).
import { SectionHead } from "@/components/landing/SectionHead";
import { sectionLabels } from "@/lib/content";
import { defaultSiteConfig, type SiteContent } from "@/lib/siteConfig";

export function Process({ content }: { content?: SiteContent["proceso"] }) {
  const c = content ?? defaultSiteConfig().content.proceso;
  const last = c.items.length - 1;
  return (
    <section id="modelo" aria-labelledby="h-proceso" className="scroll-mt-20 py-[76px] lg:py-[104px]">
      <div className="container-page">
        <SectionHead id="h-proceso" eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} className="mb-[52px]" />

        {/* Línea punteada entre los números (solo con los 4 pasos en una fila). */}
        <ol className="relative grid gap-x-[18px] gap-y-[34px] sm:grid-cols-2 min-[1080px]:grid-cols-4 min-[1080px]:before:absolute min-[1080px]:before:left-[4%] min-[1080px]:before:right-[4%] min-[1080px]:before:top-[27px] min-[1080px]:before:h-0.5 min-[1080px]:before:bg-[repeating-linear-gradient(90deg,theme(colors.brand.100)_0_8px,transparent_8px_14px)] min-[1080px]:before:content-['']">
          {c.items.map((s, i) => (
            // Subgrilla: número, título, texto y "Recibes" quedan alineados entre los pasos de una misma fila.
            <li key={i} className="relative row-span-4 grid grid-rows-subgrid gap-y-3">
              <span
                aria-hidden="true"
                className={`relative z-[1] grid h-14 w-14 place-items-center rounded-[18px] border-2 text-xl font-extrabold shadow-card ${
                  i === last
                    ? "border-transparent bg-gradient-to-br from-brand to-brand-deep text-white"
                    : "border-brand-100 bg-white text-brand"
                }`}
              >
                {i + 1}
              </span>
              <h3 className="mt-1.5 text-xl font-extrabold tracking-[-0.4px]">{s.title}</h3>
              <p className="text-[15px] text-ink-muted">{s.body}</p>
              <div className="min-h-[74px] rounded-[14px] border border-line bg-surface-soft px-3.5 py-3 text-sm text-ink-soft">
                <b className="mb-[3px] block font-mono text-[11px] uppercase tracking-[1.4px] text-brand">{sectionLabels.recibes}</b>
                {s.recibes}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-[30px] flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-[20px] bg-navy px-[26px] py-[22px] text-white">
          <strong className="mr-1.5 text-lg">{c.exito.title}</strong>
          <ul className="flex flex-wrap gap-x-3.5 gap-y-3">
            {c.exito.items.map((text, i) => (
              <li
                key={i}
                className="rounded-full border border-white/[0.14] bg-white/[0.08] px-3.5 py-2 text-sm font-semibold"
              >
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
