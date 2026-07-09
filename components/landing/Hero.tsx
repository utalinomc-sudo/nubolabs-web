import { heroTags } from "@/lib/content";
import { HeroGraphic } from "@/components/landing/HeroGraphic";
import { defaultSiteConfig, renderHighlight, type SiteContent } from "@/lib/site";

export function Hero({ content }: { content?: SiteContent["hero"] }) {
  const h = content ?? defaultSiteConfig().content.hero;
  return (
    <section id="inicio" className="container-page grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr]">
      <div className="flex flex-col items-start gap-6">
        <span className="pill">{h.eyebrow}</span>
        <h1 className="text-[38px] font-extrabold leading-[1.08] tracking-[-1.4px] text-balance md:text-[50px] md:tracking-[-1.8px]">
          {renderHighlight(h.title).map((p, i) =>
            typeof p === "string" ? <span key={i}>{p}</span> : <span key={i} className="text-brand">{p.hl}</span>,
          )}
        </h1>
        <p className="max-w-[520px] text-lg leading-relaxed text-ink-muted">{h.subtitle}</p>
        <div className="flex flex-wrap items-center gap-3.5">
          <a href="/diagnostico" className="btn-primary">
            {h.ctaPrimary}
          </a>
          <a href="#servicios" className="btn-ghost">
            {h.ctaSecondary}
          </a>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-semibold text-ink-muted">
          {heroTags.map((t) => (
            <span key={t.label} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <HeroGraphic />
      </div>
    </section>
  );
}
