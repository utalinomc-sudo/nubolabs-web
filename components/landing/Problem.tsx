// "¿Te suena?": los dolores del día a día y una franja de cierre que lleva a "Lo que ganas"
// (cambio lenguaje-sin-jerga, design.md decisión 3). Textos editables desde el CMS (content.problema).
import { IconArrowRight, problemIcons } from "@/components/icons";
import { SectionHead } from "@/components/landing/SectionHead";
import { defaultSiteConfig, renderHighlight, type SiteContent } from "@/lib/siteConfig";

interface ProblemProps {
  content?: SiteContent["problema"];
  resultsVisible?: boolean; // con "Lo que ganas" oculta, el enlace del cierre no se muestra
}

export function Problem({ content, resultsVisible = true }: ProblemProps) {
  const c = content ?? defaultSiteConfig().content.problema;
  return (
    <section id="problema" aria-labelledby="h-problema" className="scroll-mt-20 py-[76px] lg:py-[104px]">
      <div className="container-page grid items-start gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-14">
        <SectionHead
          id="h-problema"
          eyebrow={c.eyebrow}
          title={c.title}
          subtitle={c.subtitle}
          className="lg:sticky lg:top-[110px]"
        />

        <div className="grid gap-3.5 sm:grid-cols-2">
          {c.items.map((p, i) => {
            const Icon = problemIcons[i % problemIcons.length];
            return (
              <div
                key={i}
                data-pain
                className="flex items-start gap-3.5 rounded-[18px] border border-line bg-white p-5 text-[16.5px] font-bold leading-[1.4] transition duration-200 hover:shadow-card motion-safe:hover:-translate-y-[3px]"
              >
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-accent-50 text-accent-strong">
                  <Icon className="h-[19px] w-[19px]" />
                </span>
                {p.title}
              </div>
            );
          })}

          <div className="mt-2.5 flex flex-col items-start justify-between gap-[18px] rounded-[18px] bg-navy px-6 py-[22px] text-lg font-bold leading-[1.4] text-white sm:col-span-2 sm:flex-row sm:items-center">
            <span>
              {renderHighlight(c.cierre).map((part, i) =>
                typeof part === "string" ? (
                  part
                ) : (
                  <em key={i} className="not-italic text-brand-light">
                    {part.hl}
                  </em>
                ),
              )}
            </span>
            {resultsVisible && (
              <a
                href="#resultados"
                className="inline-flex min-h-11 flex-none items-center gap-2 text-[15px] sm:whitespace-nowrap text-brand-light hover:underline"
              >
                {c.cierreCta}
                <IconArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
