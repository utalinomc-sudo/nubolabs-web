// Bloque "Autodiagnóstico" de la portada (cambio diagnostico-mapa-oportunidades, design.md decisión 8; referencia
// `.selfdx`/`.map` de la HDU-08). Invita a /diagnostico con un ejemplo del mapa: niveles en texto, sin cifras.
// Va justo después de "Cómo trabajamos" (sin padding arriba); con `spaced` (proceso oculto) suma el suyo.
import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { DIMENSIONS, OPPORTUNITY_LABELS, type DimensionId, type OpportunityLevel } from "@/components/diagnostico/oportunidades";
import { selfDiagnosisLabels as L } from "@/lib/content";
import { defaultSiteConfig, type SiteContent } from "@/lib/siteConfig";

// Ejemplo ilustrativo (anchos de barra fijos, no son datos de nadie), en el orden de las dimensiones.
const EXAMPLE: { id: DimensionId; width: string; nivel: OpportunityLevel }[] = [
  { id: "ventas", width: "78%", nivel: "alta" },
  { id: "control", width: "48%", nivel: "media" },
  { id: "orden", width: "66%", nivel: "alta" },
  { id: "equipo", width: "40%", nivel: "media" },
];
const LEVEL_CHIP: Record<OpportunityLevel, string> = {
  // Contraste AA a 12 px: rojo sobre blanco (4,6:1) y azul oscuro sobre celeste (5,8:1).
  alta: "border border-accent/30 bg-white text-accent-strong",
  media: "bg-brand-50 text-brand-dark",
  baja: "bg-surface-muted text-ink-soft",
};

interface SelfDiagnosisProps {
  content?: SiteContent["autodiagnostico"];
  spaced?: boolean;
}

export function SelfDiagnosis({ content, spaced = false }: SelfDiagnosisProps) {
  const c = content ?? defaultSiteConfig().content.autodiagnostico;
  const paso = DIMENSIONS.find((d) => d.id === EXAMPLE[0].id)?.proximoPaso ?? "";
  return (
    <section
      id="autodiagnostico"
      aria-labelledby="h-autodiagnostico"
      className={`scroll-mt-20 pb-[76px] lg:pb-[104px] ${spaced ? "pt-[76px] lg:pt-[104px]" : ""}`}
    >
      <div className="container-page">
        <div className="relative grid items-center gap-10 overflow-hidden rounded-[28px] bg-gradient-to-br from-navy via-navy-700 to-brand-dark px-5 py-7 text-white sm:p-12 lg:grid-cols-2 lg:gap-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-[360px] w-[360px] rounded-full bg-brand-light/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2.5 font-mono text-[12.5px] font-semibold uppercase tracking-[2.2px] text-brand-light before:h-0.5 before:w-[22px] before:flex-none before:rounded-sm before:bg-gradient-to-r before:from-brand before:to-brand-light before:content-['']">
              {c.eyebrow}
            </span>
            <h2 id="h-autodiagnostico" className="mb-3.5 mt-4 text-balance text-[clamp(28px,3.4vw,38px)] font-extrabold leading-[1.12] tracking-[-1.1px]">
              {c.title}
            </h2>
            <p className="text-pretty text-[17px] leading-relaxed text-inverse">{c.body}</p>
            <Link
              href="/diagnostico"
              className="mt-[26px] inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[14px] bg-white px-[26px] py-3.5 text-base font-bold text-navy transition hover:bg-brand-50 max-sm:w-full"
            >
              {c.cta}
              <IconArrowRight className="h-5 w-5 flex-none" />
            </Link>
          </div>

          <figure aria-label={L.exampleLabel} className="relative m-0 rounded-[20px] bg-white p-6 text-ink shadow-lift">
            <figcaption className="mb-4 flex items-baseline justify-between gap-3">
              <b className="text-[17px]">{L.mapTitle}</b>
              <small className="font-mono text-[11px] uppercase tracking-[1px] text-ink-muted">{L.example}</small>
            </figcaption>
            <ul>
              {EXAMPLE.map((row) => (
                <li
                  key={row.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5 border-t border-line py-2.5 text-[14.5px] font-semibold sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:gap-3.5"
                >
                  <span>{DIMENSIONS.find((d) => d.id === row.id)?.nombre}</span>
                  <span aria-hidden="true" className="col-span-2 row-start-2 h-2 overflow-hidden rounded-full bg-line sm:col-span-1 sm:row-start-auto">
                    <span className="block h-full rounded-full bg-gradient-to-r from-brand to-brand-light" style={{ width: row.width }} />
                  </span>
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${LEVEL_CHIP[row.nivel]}`}>
                    {OPPORTUNITY_LABELS[row.nivel]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-2 text-[13.5px] text-ink-soft">
              <IconArrowRight className="mt-[3px] h-4 w-4 flex-none text-brand" />
              <span>
                {L.nextStep} {paso}
              </span>
            </p>
          </figure>
        </div>
      </div>
    </section>
  );
}
