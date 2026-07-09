import { metrics } from "@/lib/content";
import { defaultSiteConfig, type SiteContent } from "@/lib/site";

export function UseCases({ content }: { content?: SiteContent["casos"] }) {
  const cfg = content ?? defaultSiteConfig().content.casos;
  return (
    <section id="casos" className="bg-navy py-20 text-white">
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

        <div className="mt-12 flex flex-wrap items-end gap-x-14 gap-y-6 border-t border-white/10 pt-9">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="text-[38px] font-extrabold text-brand-light">{m.value}</div>
              <div className="text-[13px] text-[#93A5C4]">{m.label}</div>
            </div>
          ))}
          <div className="ml-auto font-mono text-[11px] text-ink-muted">
            * cifras referenciales de ejemplo
          </div>
        </div>
      </div>
    </section>
  );
}
