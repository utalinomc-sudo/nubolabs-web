// Bloque de confianza bajo el hero (cambio confianza-recomendacion, design.md decisión 3): panel navy con el
// testimonio principal (o el texto puente si no hay testimonios autorizados) y "Nuestro compromiso contigo".
// Hasta 2 testimonios más como tarjetas compactas. Textos del CMS (content.confianza).
import { IconShield, promiseIcons } from "@/components/icons";
import { trustLabels } from "@/lib/content";
import { defaultSiteConfig, initials, pickTestimonios, type SiteContent, type Testimonio } from "@/lib/siteConfig";

const PROMISE_TONES = ["bg-brand-50 text-brand", "bg-brand-light-50 text-brand-deep", "bg-success-50 text-success"];

const byline = (t: Testimonio) => [t.cargo, t.empresa].filter(Boolean).join(" · ");

function MainQuote({ t }: { t: Testimonio }) {
  return (
    <figure className="relative z-[1] m-0 flex h-full flex-col justify-center">
      <div aria-hidden="true" className="h-[30px] text-[64px] font-extrabold leading-[0.6] text-brand-light">
        “
      </div>
      <blockquote className="m-0">
        <p className="mb-5 mt-3.5 whitespace-pre-line text-pretty text-[17px] font-medium leading-[1.55] [overflow-wrap:anywhere] sm:text-[19px]">{t.texto}</p>
      </blockquote>
      <figcaption className="flex items-center gap-3 [overflow-wrap:anywhere]">
        <span
          aria-hidden="true"
          className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-[15px] font-extrabold"
        >
          {initials(t.nombre)}
        </span>
        <span className="min-w-0">
          <b className="block text-[15px]">{t.nombre}</b>
          {byline(t) && <span className="text-[13.5px] text-inverse">{byline(t)}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

function SmallQuote({ t }: { t: Testimonio }) {
  return (
    <figure className="m-0 rounded-[18px] border border-line bg-white p-5 shadow-card">
      <blockquote className="m-0">
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft [overflow-wrap:anywhere] before:content-['“'] after:content-['”']">{t.texto}</p>
      </blockquote>
      <figcaption className="mt-3 flex items-center gap-2.5 text-[13.5px] [overflow-wrap:anywhere]">
        <span aria-hidden="true" className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-dark">
          {initials(t.nombre)}
        </span>
        <span className="min-w-0">
          <b className="text-ink">{t.nombre}</b>
          {byline(t) && <span className="text-ink-muted"> · {byline(t)}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

interface TrustProps {
  content?: SiteContent["confianza"];
  spaced?: boolean; // sin hero arriba (sección oculta), suma separación bajo el menú
}

export function Trust({ content, spaced = false }: TrustProps) {
  const c = content ?? defaultSiteConfig().content.confianza;
  const { principal, resto } = pickTestimonios(c.testimonios);
  return (
    <section aria-label={c.eyebrow || trustLabels.section} className={`pb-6 ${spaced ? "pt-10" : ""}`}>
      <div className="container-page">
        <div className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-3xl border border-line bg-white shadow-card min-[821px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-navy to-navy-700 px-6 py-7 text-white sm:px-10 sm:py-9">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-16 h-60 w-60 rounded-full bg-brand-light/25 blur-3xl" />
            {principal ? (
              <MainQuote t={principal} />
            ) : (
              <div className="relative z-[1] flex h-full flex-col justify-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-brand-light">
                  <IconShield className="h-[22px] w-[22px]" />
                </span>
                <span className="font-mono text-[12.5px] font-semibold uppercase tracking-[2.2px] text-brand-light">{c.eyebrow}</span>
                <p className="text-pretty text-[22px] font-bold leading-[1.35] sm:text-[26px]">{c.textoPuente}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-[18px] px-[22px] py-[26px] sm:px-9 sm:py-8">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-[1.8px] text-ink-muted">{trustLabels.promisesTitle}</h2>
            <ul className="flex flex-col gap-4">
              {c.compromisos.map((p, i) => {
                const Icon = promiseIcons[i % promiseIcons.length];
                return (
                  <li key={i} className="flex items-start gap-3.5 text-[15px] text-ink-soft">
                    <span className={`grid h-10 w-10 flex-none place-items-center rounded-xl ${PROMISE_TONES[i % PROMISE_TONES.length]}`}>
                      <Icon className="h-[19px] w-[19px]" />
                    </span>
                    <span>
                      <b className="block text-base text-ink">{p.titulo}</b>
                      {p.texto}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {resto.length > 0 && (
          <div className={`mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 ${resto.length > 1 ? "sm:grid-cols-[repeat(2,minmax(0,1fr))]" : ""}`}>
            {resto.map((t, i) => (
              <SmallQuote key={i} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
