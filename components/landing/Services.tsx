// Servicios orientados a resultados: diagnóstico destacado, lista de servicios con "lo que ganas", acompañamiento
// mensual y la nota técnica (único lugar con nombres de herramientas). Cambio lenguaje-sin-jerga, design.md decisión 3.
import { IconArrowRight, IconRefresh, IconZap, includeIcons, serviceIcons } from "@/components/icons";
import { SectionHead } from "@/components/landing/SectionHead";
import { sectionLabels } from "@/lib/content";
import { defaultSiteConfig, renderHighlight, type SiteContent } from "@/lib/siteConfig";

// Color del ícono de cada servicio, por posición (en ciclo si hay más de 4).
const TONES = [
  "bg-brand-50 text-brand",
  "bg-brand-light-50 text-brand-deep",
  "bg-success-50 text-success",
  "bg-accent-50 text-accent-strong",
];

function Gain({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-2 text-[14.5px] font-bold text-navy">
      <IconArrowRight className="mt-0.5 h-[17px] w-[17px] flex-none text-accent-strong" />
      <span>
        <span className="sr-only">{sectionLabels.ganas}</span>
        {text}
      </span>
    </p>
  );
}

export function Services({ content }: { content?: SiteContent["servicios"] }) {
  const c = content ?? defaultSiteConfig().content.servicios;
  const d = c.destacado;
  return (
    <section id="servicios" aria-labelledby="h-servicios" className="scroll-mt-20 py-[76px] lg:py-[104px]">
      <div className="container-page">
        <SectionHead id="h-servicios" eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} className="mb-[52px]" />

        <div className="mb-[18px] grid items-center gap-8 rounded-3xl border-[1.5px] border-brand-100 bg-gradient-to-br from-brand-50 to-white to-70% p-6 md:grid-cols-[1.3fr_1fr] md:px-9 md:py-[34px]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand px-3 py-1.5 text-[12.5px] font-bold tracking-[0.2px] text-white">
              <IconZap className="h-4 w-4" />
              {d.etiqueta}
            </span>
            <h3 className="mb-2.5 mt-3.5 text-[28px] font-extrabold leading-[1.15] tracking-[-0.8px]">{d.title}</h3>
            <p className="mb-4 text-ink-soft">{d.body}</p>
            <Gain text={d.result} />
          </div>
          <ul className="flex flex-col gap-3">
            {d.incluye.map((text, i) => {
              const Icon = includeIcons[i % includeIcons.length];
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5 text-[15.5px] font-semibold"
                >
                  <Icon className="h-[22px] w-[22px] flex-none text-brand" />
                  {text}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid gap-[18px] sm:grid-cols-2 min-[1080px]:grid-cols-4">
          {c.items.map((s, i) => {
            const Icon = serviceIcons[i % serviceIcons.length];
            return (
              <article
                key={i}
                data-service
                className="row-span-4 grid grid-rows-subgrid gap-y-3 rounded-[20px] border border-line bg-white p-[26px] shadow-card transition duration-200 hover:border-brand-100 hover:shadow-lift motion-safe:hover:-translate-y-1"
              >
                <span className={`grid h-[46px] w-[46px] flex-none place-items-center rounded-[14px] ${TONES[i % TONES.length]}`}>
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <h3 className="text-[19px] font-extrabold leading-[1.25] tracking-[-0.4px]">{s.title}</h3>
                <p className="text-[15px] text-ink-muted">{s.body}</p>
                {/* Subgrilla: "lo que ganas" queda a la misma altura en todas las tarjetas de la fila. */}
                <div className="border-t border-dashed border-line-strong pt-3.5">{s.result && <Gain text={s.result} />}</div>
              </article>
            );
          })}
        </div>

        <div className="mt-[18px] flex items-center gap-[18px] rounded-[20px] border border-line bg-surface-soft px-[26px] py-[22px]">
          <span className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[14px] bg-navy text-brand-light">
            <IconRefresh className="h-[22px] w-[22px]" />
          </span>
          <div>
            <h3 className="text-[17px] font-bold">{c.acompanamiento.title}</h3>
            <p className="text-[15px] text-ink-muted">{c.acompanamiento.body}</p>
          </div>
        </div>

        <p data-nota-tecnica className="mt-[22px] max-w-[860px] font-mono text-[12.5px] leading-[1.6] text-ink-muted">
          {renderHighlight(c.notaTecnica).map((part, i) =>
            typeof part === "string" ? (
              part
            ) : (
              <b key={i} className="text-ink-soft">
                {part.hl}
              </b>
            ),
          )}
        </p>
      </div>
    </section>
  );
}
