// Encabezado común de las secciones de la portada: etiqueta en mono, título y bajada (diseño de la HDU-08).
interface SectionHeadProps {
  id: string; // id del h2, para el aria-labelledby de la sección
  eyebrow?: string;
  title: string;
  subtitle?: string;
  dark?: boolean; // sobre fondo navy
  className?: string;
}

export function SectionHead({ id, eyebrow, title, subtitle, dark = false, className = "" }: SectionHeadProps) {
  return (
    <div className={`flex max-w-[820px] flex-col gap-4 ${className}`}>
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2.5 font-mono text-[12.5px] font-semibold uppercase tracking-[2.2px] before:h-0.5 before:w-[22px] before:flex-none before:rounded-sm before:bg-gradient-to-r before:from-brand before:to-brand-light before:content-[''] ${
            dark ? "text-brand-light" : "text-brand"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2 id={id} className="text-balance text-[clamp(30px,4.2vw,46px)] font-extrabold leading-[1.08] tracking-[-1.4px]">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-pretty text-lg leading-[1.65] ${dark ? "text-inverse" : "text-ink-muted"}`}>{subtitle}</p>
      )}
    </div>
  );
}
