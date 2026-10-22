// Cita breve del testimonio principal en la sección de agendar (cambio confianza-recomendacion, design.md
// decisión 4). Texto completo, sin recortes, para no alterar las palabras de la persona. Las comillas son de CSS.
import type { Testimonio } from "@/lib/siteConfig";

export function MiniQuote({ testimonio }: { testimonio: Testimonio }) {
  const autor = [testimonio.nombre, testimonio.empresa].filter(Boolean).join(" · ");
  return (
    <figure className="mt-[30px] rounded-r-[14px] border-l-[3px] border-brand bg-white px-5 py-[18px] text-[15px] italic text-ink-soft">
      <blockquote className="m-0">
        <p className="whitespace-pre-line [overflow-wrap:anywhere] before:content-['“'] after:content-['”']">{testimonio.texto}</p>
      </blockquote>
      <figcaption className="mt-1.5 text-[13.5px] font-bold not-italic text-ink [overflow-wrap:anywhere]">{autor}</figcaption>
    </figure>
  );
}
