import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Results } from "@/components/landing/Results";
import { Approach } from "@/components/landing/Approach";
import { Services } from "@/components/landing/Services";
import { Process } from "@/components/landing/Process";
import { UseCases } from "@/components/landing/UseCases";
import { Metrics } from "@/components/landing/Metrics";
import { ContactForm } from "@/components/landing/ContactForm";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { StickyCta } from "@/components/landing/StickyCta";
import { WhatsappCard } from "@/components/landing/WhatsappCard";
import { MiniQuote } from "@/components/landing/MiniQuote";
import { Trust } from "@/components/landing/Trust";
import { Footer } from "@/components/landing/Footer";
import { safeScheduleUrl } from "@/lib/leads";
import { getSiteConfig } from "@/lib/site";
import { contactQuote, whatsappLink } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { visible, content } = await getSiteConfig();
  const whatsappQr = whatsappLink(content.contact, "qr");
  // Cita breve en #contacto: solo con un testimonio autorizado y el bloque de confianza visible (confianza-recomendacion).
  const principal = contactQuote(visible, content.confianza);
  const cita = principal ? <MiniQuote testimonio={principal} /> : null;

  return (
    <>
      <Nav showEquipo={visible.equipo} showMision={visible.nosotros} showContact={visible.contacto} sections={visible} />
      <main>
        {visible.hero && (
          <Hero content={content.hero} contactVisible={visible.contacto} processVisible={visible.proceso} />
        )}
        {visible.confianza && <Trust content={content.confianza} spaced={!visible.hero} />}
        {/* Orden de la portada (cambio lenguaje-sin-jerga, design.md decisión 4). */}
        {visible.problema && <Problem content={content.problema} resultsVisible={visible.resultados} />}
        {visible.resultados && <Results content={content.resultados} />}
        {visible.enfoque && <Approach content={content.enfoque} />}
        {visible.servicios && <Services content={content.servicios} />}
        {visible.casos && <UseCases content={content.casos} />}
        {visible.cifras && <Metrics content={content.cifras} />}
        {visible.proceso && <Process content={content.proceso} />}
        {visible.contacto && (
          <ContactForm
            scheduleUrl={safeScheduleUrl(process.env.NEXT_PUBLIC_SCHEDULE_URL)}
            aside={
              cita || whatsappQr ? (
                <>
                  {cita}
                  {whatsappQr && <WhatsappCard link={whatsappQr} />}
                </>
              ) : null
            }
          />
        )}
        {/* Cierre (cambio cierre-landing-faq-cta). */}
        {visible.faq && <Faq content={content.faq} />}
        {visible.cierre && <FinalCta content={content.cierre} contactVisible={visible.contacto} spaced={!visible.faq} />}
      </main>
      <Footer sections={visible} whatsapp={whatsappLink(content.contact)} stickyCta={visible.contacto} />
      {visible.contacto && <StickyCta label={content.hero.ctaPrimary} />}
    </>
  );
}
