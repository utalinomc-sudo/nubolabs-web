import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Approach } from "@/components/landing/Approach";
import { Services } from "@/components/landing/Services";
import { Process } from "@/components/landing/Process";
import { UseCases } from "@/components/landing/UseCases";
import { ContactForm } from "@/components/landing/ContactForm";
import { Footer } from "@/components/landing/Footer";
import { getSiteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { visible, content } = await getSiteConfig();

  return (
    <>
      <Nav showEquipo={visible.equipo} showMision={visible.nosotros} />
      <main>
        {visible.hero && <Hero content={content.hero} />}
        {visible.problema && <Problem />}
        {visible.enfoque && <Approach />}
        {visible.servicios && <Services content={content.servicios} />}
        {visible.proceso && <Process />}
        {visible.casos && <UseCases content={content.casos} />}
        {visible.contacto && <ContactForm />}
      </main>
      <Footer />
    </>
  );
}
