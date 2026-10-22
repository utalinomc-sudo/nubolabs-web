import type { Metadata } from "next";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { getSiteConfig } from "@/lib/site";

// Página de privacidad (cambio formulario-minimo-consentimiento, spec sitio/privacidad). Siempre disponible:
// no tiene interruptor de visibilidad. El texto viene del CMS (content.privacidad) y se muestra como texto plano.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacidad — Nubolabs",
  description: "Cómo Nubolabs cuida los datos que le entregas en nubolabs.cl.",
};

// "Responsable. Nubolabs es…" → { lead: "Responsable.", rest: "Nubolabs es…" } para destacar el inicio del párrafo.
function splitLead(paragraph: string): { lead: string | null; rest: string } {
  const m = paragraph.match(/^([^.\n]{2,40}\.)\s+([\s\S]+)$/);
  return m ? { lead: m[1], rest: m[2] } : { lead: null, rest: paragraph };
}

export default async function PrivacidadPage() {
  const { visible, content } = await getSiteConfig();
  const { titulo, texto } = content.privacidad;
  const paragraphs = texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Nav showEquipo={visible.equipo} showMision={visible.nosotros} showContact={visible.contacto} sections={visible} />
      <main>
        <article className="container-page max-w-3xl py-16 md:py-20">
          <div className="mb-3 text-xs font-bold tracking-[2.5px] text-brand">PRIVACIDAD</div>
          <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-[-1.2px] text-balance md:text-[44px]">{titulo}</h1>
          <div className="mt-10 flex flex-col gap-5">
            {paragraphs.map((p, i) => {
              const { lead, rest } = splitLead(p);
              return (
                <p key={i} className="whitespace-pre-wrap text-[17px] leading-relaxed text-ink-soft">
                  {lead && <b className="font-bold text-ink">{lead} </b>}
                  {rest}
                </p>
              );
            })}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
