import { serviceIcons } from "@/components/icons";
import { defaultSiteConfig, type SiteContent } from "@/lib/site";

export function Services({ content }: { content?: SiteContent["servicios"] }) {
  const c = content ?? defaultSiteConfig().content.servicios;
  return (
    <section id="servicios" className="bg-surface-soft py-20">
      <div className="container-page">
        <div className="mb-10 text-center">
          <div className="mb-3 text-xs font-bold tracking-[2.5px] text-brand">{c.eyebrow}</div>
          <h2 className="text-[30px] font-extrabold tracking-[-1px] md:text-[34px]">{c.title}</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {c.items.map((s, i) => {
            const Icon = serviceIcons[i % serviceIcons.length];
            return (
              <div key={`${s.title}-${i}`} className="rounded-[18px] border border-line bg-white p-7">
                <div className="mb-3.5 flex items-center gap-3">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-light text-white">
                    <Icon className="h-[21px] w-[21px]" />
                  </span>
                  <div className="text-[18px] font-extrabold">{s.title}</div>
                </div>
                <p className="mb-3.5 text-sm leading-relaxed text-ink-muted">{s.body}</p>
                <div className="text-[13px] font-bold text-accent">→ {s.result}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
