// Ejemplos por rubro (cambio casos-por-rubro, design.md decisión 4; referencia #ejemplos de la HDU-08). Server
// Component: entrega todos los casos y el filtro vive en UseCasesFilter (cliente). Textos del CMS (content.casos).
import { SectionHead } from "@/components/landing/SectionHead";
import { UseCasesFilter } from "@/components/landing/UseCasesFilter";
import { defaultSiteConfig, type SiteContent } from "@/lib/siteConfig";

export function UseCases({ content }: { content?: SiteContent["casos"] }) {
  const c = content ?? defaultSiteConfig().content.casos;
  if (c.items.length === 0) return null;
  return (
    <section id="casos" aria-labelledby="h-casos" className="scroll-mt-20 bg-surface-soft py-[76px] lg:py-[104px]">
      <div className="container-page">
        <SectionHead id="h-casos" eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} className="mb-10 lg:mb-[52px]" />
        <UseCasesFilter items={c.items} />
      </div>
    </section>
  );
}
