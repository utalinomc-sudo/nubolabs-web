// Cifras de resultados con su fuente (cambio cifras-con-respaldo, design.md decisión 3). Oculta por defecto; sin
// cifras válidas muestra solo la frase, y sin frase no se renderiza (sin hueco). Textos del CMS (content.cifras).
// Con cifras es la continuación de la banda navy de "Ejemplos" (como el bloque de cifras anterior, ahora con fuente).
import { IconChart } from "@/components/icons";
import { metricsLabels } from "@/lib/content";
import { defaultSiteConfig, hasContent, visibleCifras, type SiteContent } from "@/lib/siteConfig";

// Columnas según la cantidad de cifras (1 a 4), para no dejar columnas vacías.
const COLS = [
  "",
  "sm:grid-cols-[repeat(2,minmax(0,1fr))]",
  "sm:grid-cols-[repeat(3,minmax(0,1fr))]",
  "sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))]",
];

interface MetricsProps {
  content?: SiteContent["cifras"];
  spaced?: boolean; // sin "Ejemplos" antes (sección oculta), la banda suma separación arriba
}

export function Metrics({ content, spaced = false }: MetricsProps) {
  const c = content ?? defaultSiteConfig().content.cifras;
  const cifras = visibleCifras(c.items);
  const frase = c.frase.trim();

  if (cifras.length > 0) {
    return (
      <section aria-label={metricsLabels.section} className={`bg-navy pb-16 text-white lg:pb-20 ${spaced ? "pt-16" : ""}`}>
        <div className="container-page">
          <ul role="list" className={`grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-8 border-t border-white/10 pt-9 ${COLS[cifras.length - 1]}`}>
            {cifras.map((cifra, i) => (
              <li key={i} className="flex flex-col gap-1.5 [overflow-wrap:anywhere]">
                <span className="text-[34px] font-extrabold leading-[1.1] tracking-[-1px] text-brand-light sm:text-[38px]">{cifra.valor}</span>
                <span className="text-[15px] text-inverse">{cifra.texto}</span>
                <span className="mt-1 font-mono text-[11.5px] text-inverse-muted">
                  {metricsLabels.source}
                  {cifra.fuente}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (!hasContent(frase)) return null;
  return (
    <section aria-label={metricsLabels.section} className="py-12 lg:py-16">
      <div className="container-page">
        <p className="flex items-start gap-3.5 rounded-[20px] border border-line bg-surface-soft px-[26px] py-[22px] text-[16.5px] text-ink-soft">
          <IconChart className="mt-0.5 h-[22px] w-[22px] flex-none text-brand" />
          <span className="[overflow-wrap:anywhere]">{frase}</span>
        </p>
      </div>
    </section>
  );
}
