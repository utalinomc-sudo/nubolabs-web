// Hero de la portada (cambio mensaje-principal-pyme). Textos editables desde el CMS (content.hero) y panel
// ilustrativo "Tu negocio hoy". Referencia visual: docs/design/propuesta-web-hdu-08.html, sección HERO.
import { IconArrowRight, IconCheck } from "@/components/icons";
import { HeroPanel } from "@/components/landing/HeroPanel";
import { defaultSiteConfig, renderHighlight, type SiteContent } from "@/lib/siteConfig";

interface HeroProps {
  content?: SiteContent["hero"];
  // Visibilidad de las secciones de destino (CMS). Sin contacto, el CTA principal va al cuestionario;
  // sin proceso, el secundario no se muestra (spec landing/hero, "Llamados a la acción").
  contactVisible?: boolean;
  processVisible?: boolean;
}

export function Hero({ content, contactVisible = true, processVisible = true }: HeroProps) {
  const h = content ?? defaultSiteConfig().content.hero;
  const primaryHref = contactVisible ? "#contacto" : "/diagnostico";
  // Textos viejos del CMS terminan en "→": no se agrega una segunda flecha.
  const primaryHasArrow = h.ctaPrimary.trim().endsWith("→");
  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Fondo decorativo: trama de puntos enfocada a la derecha y brillo de marca arriba. */}
      <div
        aria-hidden="true"
        className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_70%_at_78%_40%,black_20%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[180px] -top-40 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,theme(colors.brand.light.DEFAULT/20%),theme(colors.brand.DEFAULT/8%)_45%,transparent_70%)]"
      />

      <div className="container-page relative z-[1] grid grid-cols-[minmax(0,1fr)] items-center gap-12 pb-16 pt-11 sm:pb-24 sm:pt-[72px] lg:grid-cols-[minmax(0,1.06fr)_minmax(0,.94fr)] lg:gap-16">
        <div>
          {/* Etiqueta superior opcional: por defecto no hay (design.md decisión 5b); el admin puede escribir una. */}
          {h.eyebrow.trim() && (
            <span
              data-hero-eyebrow
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-white py-2 pl-2.5 pr-3.5 font-mono text-xs font-semibold tracking-[1.6px] text-navy shadow-card"
            >
              <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-gradient-to-br from-brand to-brand-light text-white">
                <IconCheck className="h-3 w-3 [&_path]:[stroke-width:3]" />
              </span>
              {h.eyebrow}
            </span>
          )}

          <h1
            id="hero-title"
            className="mb-[22px] text-[clamp(40px,5.6vw,66px)] font-extrabold leading-[1.02] tracking-[-1.6px] text-balance sm:tracking-[-2.4px]"
          >
            {renderHighlight(h.title).map((p, i) =>
              typeof p === "string" ? (
                <span key={i}>{p}</span>
              ) : (
                <span key={i} className="text-gradient-brand">
                  {p.hl}
                </span>
              ),
            )}
          </h1>

          <p className="max-w-[540px] text-[17.5px] leading-[1.65] text-ink-muted [text-wrap:pretty] sm:text-[19px]">
            {h.subtitle}
          </p>

          <div className="mt-[34px] flex flex-wrap gap-3.5">
            <a href={primaryHref} className="btn-primary group min-h-11 max-sm:w-full">
              {h.ctaPrimary}
              {!primaryHasArrow && (
                <IconArrowRight className="h-[18px] w-[18px] transition group-hover:translate-x-[3px]" />
              )}
            </a>
            {processVisible && (
              <a href="#modelo" className="btn-ghost min-h-11 bg-white max-sm:w-full">
                {h.ctaSecondary}
              </a>
            )}
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-[22px] gap-y-2.5">
            {h.tags.map((tag) => (
              <li key={tag} className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <IconCheck className="h-[18px] w-[18px] text-success [&_path]:[stroke-width:2.5]" />
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <HeroPanel />
      </div>
    </section>
  );
}
