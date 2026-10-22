// Preguntas frecuentes en acordeón nativo (<details>/<summary>): funciona con teclado y lectores de pantalla sin
// JavaScript (cambio cierre-landing-faq-cta, design.md decisión 3). Textos del CMS (content.faq).
import Link from "next/link";
import { IconChevronDown } from "@/components/icons";
import { SectionHead } from "@/components/landing/SectionHead";
import { parseInlineLinks } from "@/lib/inlineLinks";
import { defaultSiteConfig, type SiteContent } from "@/lib/siteConfig";

function Answer({ text }: { text: string }) {
  return (
    <p className="max-w-[720px] px-6 pb-[22px] text-ink-muted">
      {parseInlineLinks(text).map((part, i) =>
        part.href ? (
          <Link key={i} href={part.href} className="font-semibold text-brand underline underline-offset-2">
            {part.text}
          </Link>
        ) : (
          part.text
        ),
      )}
    </p>
  );
}

export function Faq({ content }: { content?: SiteContent["faq"] }) {
  const c = content ?? defaultSiteConfig().content.faq;
  return (
    <section id="preguntas" aria-labelledby="h-preguntas" className="scroll-mt-20 py-[76px] lg:py-[104px]">
      <div className="container-page">
        <SectionHead id="h-preguntas" eyebrow={c.eyebrow} title={c.title} className="mx-auto mb-[52px] items-center text-center" />
        <div className="mx-auto flex max-w-[840px] flex-col gap-3">
          {c.items.map((item, i) => (
            <details
              key={i}
              className="group rounded-[18px] border border-line bg-white transition-shadow open:border-brand-100 open:shadow-card"
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-[18px] px-6 py-5 text-[17px] font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
                {item.pregunta}
                <IconChevronDown className="h-[22px] w-[22px] flex-none text-brand transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <Answer text={item.respuesta} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
