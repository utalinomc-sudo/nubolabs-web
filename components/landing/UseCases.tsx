// Sin cifras de ejemplo: las cifras reales con fuente van en Metrics.tsx (cambio cifras-con-respaldo).
import { defaultSiteConfig, type SiteContent } from "@/lib/siteConfig";

export function UseCases({ content }: { content?: SiteContent["casos"] }) {
  const cfg = content ?? defaultSiteConfig().content.casos;
  return (
    <section id="casos" className="scroll-mt-20 bg-navy py-20 text-white">
      <div className="container-page">
        <div className="mb-9 flex flex-col justify-between gap-3 md:flex-row md:items-baseline">
          <h2 className="text-[28px] font-extrabold tracking-[-1px] md:text-[32px]">{cfg.title}</h2>
          <span className="text-[13.5px] text-[#93A5C4]">{cfg.subtitle}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cfg.items.map((c, i) => (
            <div
              key={`${c.title}-${i}`}
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-[22px] py-5"
            >
              <div className="mb-1.5 text-[15px] font-bold text-brand-light">{c.title}</div>
              <div className="text-[13px] leading-relaxed text-[#B9C6DD]">{c.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
