// Enfoque "Primero ordenamos, después automatizamos": sección navy con 3 pasos y un ejemplo antes/después de una
// cotización (cambio lenguaje-sin-jerga, design.md decisión 3). Textos del CMS (content.enfoque); el ejemplo, fijo.
import { IconArrowRight, IconCheck } from "@/components/icons";
import { SectionHead } from "@/components/landing/SectionHead";
import { approachExample as ex, sectionLabels } from "@/lib/content";
import { defaultSiteConfig, type SiteContent } from "@/lib/siteConfig";

export function Approach({ content }: { content?: SiteContent["enfoque"] }) {
  const c = content ?? defaultSiteConfig().content.enfoque;
  return (
    <section id="enfoque" aria-labelledby="h-enfoque" className="relative scroll-mt-20 overflow-hidden bg-navy py-[76px] text-white lg:py-[104px]">
      <div aria-hidden="true" className="bg-dots-inverse pointer-events-none absolute inset-0" />
      <div className="container-page relative grid items-center gap-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionHead id="h-enfoque" eyebrow={c.eyebrow} title={c.title} subtitle={c.body} dark />
          <ol className="mt-[34px] flex flex-col gap-4">
            {c.items.map((s, i) => (
              <li key={i} className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] border-[1.5px] border-brand-light/45 font-mono text-sm font-semibold text-brand-light"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <b className="block text-[17px]">{s.title}</b>
                  <span className="text-[15px] text-inverse">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div role="group" aria-label={ex.label} className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5">
            <h3 className="mb-3.5 font-mono text-xs font-semibold uppercase tracking-[1.8px] text-inverse-muted">
              {ex.antesTitle}
            </h3>
            <ol className="flex flex-col gap-2">
              {ex.antes.map((step) => (
                <li
                  key={step.text}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm leading-[1.3] ${
                    step.cut
                      ? "border border-dashed border-white/[0.12] text-inverse-faint line-through decoration-accent decoration-2"
                      : "bg-white/[0.06]"
                  }`}
                >
                  {step.text}
                  {step.cut && <span className="sr-only">{sectionLabels.pasoSobra}</span>}
                </li>
              ))}
            </ol>
          </div>

          <span
            aria-hidden="true"
            className="mx-auto grid h-[46px] w-[46px] rotate-90 place-items-center rounded-full bg-gradient-to-r from-brand to-brand-light text-white shadow-cta md:rotate-0"
          >
            <IconArrowRight className="h-[22px] w-[22px]" />
          </span>

          <div className="rounded-[20px] border border-brand-light/35 bg-brand-light/[0.08] p-5">
            <h3 className="mb-3.5 font-mono text-xs font-semibold uppercase tracking-[1.8px] text-brand-light">
              {ex.despuesTitle}
            </h3>
            <ol className="flex flex-col gap-2">
              {ex.despues.map((text) => (
                <li
                  key={text}
                  className="flex items-center gap-2.5 rounded-xl bg-white/[0.08] px-3 py-2.5 text-sm font-semibold leading-[1.3]"
                >
                  <IconCheck className="h-4 w-4 flex-none text-brand-light" />
                  {text}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
