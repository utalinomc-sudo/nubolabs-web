import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Results } from "@/components/landing/Results";
import { Approach } from "@/components/landing/Approach";
import { Services } from "@/components/landing/Services";
import { Process } from "@/components/landing/Process";
import { UseCases } from "@/components/landing/UseCases";
import { ContactForm } from "@/components/landing/ContactForm";
import { Footer } from "@/components/landing/Footer";
import { safeScheduleUrl } from "@/lib/leads";
import { getSiteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { visible, content } = await getSiteConfig();

  return (
    <>
      <Nav showEquipo={visible.equipo} showMision={visible.nosotros} showContact={visible.contacto} sections={visible} />
      <main>
        {visible.hero && (
          <Hero content={content.hero} contactVisible={visible.contacto} processVisible={visible.proceso} />
        )}
        {/* Orden de la portada (cambio lenguaje-sin-jerga, design.md decisión 4). */}
        {visible.problema && <Problem content={content.problema} resultsVisible={visible.resultados} />}
        {visible.resultados && <Results content={content.resultados} />}
        {visible.enfoque && <Approach content={content.enfoque} />}
        {visible.servicios && <Services content={content.servicios} />}
        {visible.casos && <UseCases content={content.casos} />}
        {visible.proceso && <Process content={content.proceso} />}
        {visible.contacto && <ContactForm scheduleUrl={safeScheduleUrl(process.env.NEXT_PUBLIC_SCHEDULE_URL)} />}
      </main>
      <Footer />
    </>
  );
}
