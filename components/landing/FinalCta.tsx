// Banda final con el llamado a agendar (cambio cierre-landing-faq-cta, design.md decisión 3). Textos del CMS
// (content.cierre). Degradado brand-dark → navy para que el texto claro cumpla contraste AA en todo el ancho.
import { IconArrowRight } from "@/components/icons";
import { ctaNote } from "@/lib/content";
import { defaultSiteConfig, type SiteContent } from "@/lib/siteConfig";

interface FinalCtaProps {
  content?: SiteContent["cierre"];
  contactVisible?: boolean; // con el formulario oculto, el botón lleva al cuestionario
  spaced?: boolean; // sin preguntas frecuentes antes, suma separación arriba
}

export function FinalCta({ content, contactVisible = true, spaced = false }: FinalCtaProps) {
  const c = content ?? defaultSiteConfig().content.cierre;
  return (
    <section aria-labelledby="h-cierre" className={`pb-[76px] lg:pb-[104px] ${spaced ? "pt-[76px] lg:pt-[104px]" : ""}`}>
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-dark to-navy px-[22px] py-[52px] text-center text-white sm:rounded-[32px] sm:px-12 sm:py-[72px]">
          <div
            aria-hidden="true"
            className="bg-dots-inverse pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_80%_at_50%_0%,black,transparent)]"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2.5 font-mono text-[12.5px] font-semibold uppercase tracking-[2.2px] text-inverse-strong">
              {c.eyebrow}
            </span>
            <h2
              id="h-cierre"
              className="mx-auto mb-4 mt-[18px] max-w-[820px] text-balance text-[clamp(30px,4.4vw,50px)] font-extrabold leading-[1.06] tracking-[-1.6px]"
            >
              {c.title}
            </h2>
            <p className="text-lg text-inverse-strong">{c.body}</p>
            <a
              href={contactVisible ? "#contacto" : "/diagnostico"}
              className="mt-[30px] inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[14px] bg-white px-[26px] py-3.5 text-base font-bold text-navy transition hover:bg-brand-50 max-sm:w-full"
            >
              {c.cta}
              <IconArrowRight className="h-5 w-5 flex-none" />
            </a>
            <small className="mt-3.5 block text-sm text-inverse-strong">{ctaNote}</small>
          </div>
        </div>
      </div>
    </section>
  );
}
