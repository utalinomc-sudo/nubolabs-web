// @vitest-environment jsdom
// Barrido de vocabulario sobre el render completo de la portada con los textos por defecto (cambio lenguaje-sin-jerga,
// spec landing/contenido-pyme "Vocabulario para dueños de negocio"). A diferencia de la prueba de los defaults, cubre
// también los textos fijos: panel del hero, menú, formulario, pie y rótulos escritos en los componentes.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Approach } from "@/components/landing/Approach";
import { ContactForm } from "@/components/landing/ContactForm";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Nav } from "@/components/landing/Nav";
import { Problem } from "@/components/landing/Problem";
import { Process } from "@/components/landing/Process";
import { Results } from "@/components/landing/Results";
import { Trust } from "@/components/landing/Trust";
import { Services } from "@/components/landing/Services";
import { UseCases } from "@/components/landing/UseCases";
import { Metrics } from "@/components/landing/Metrics";
import { ReferralBanner } from "@/components/landing/ReferralBanner";
import { SelfDiagnosis } from "@/components/landing/SelfDiagnosis";
import { defaultSiteConfig } from "@/lib/siteConfig";

// Regex de la decisión 7 de design.md más "nube" (propuesta). "Make" e "IA" con mayúsculas exactas.
const FORBIDDEN_CI = /\bn8n\b|\bAPIs?\b|\bCRM\b|\bERP\b|\bagentes?\b|\bROI\b|horas ahorradas|pymes?|\bnube\b/gi;
const FORBIDDEN_CS = /\bMake\b|\bIA\b/g;

function renderHome(): HTMLElement {
  const html = renderToStaticMarkup(
    <>
      {/* Franja de /oa (cambio landing-referidos-oa): también entra al barrido. */}
      <ReferralBanner content={defaultSiteConfig().content.referidos.oa} />
      <Nav />
      <main>
        <Hero />
        <Trust />
        <Problem />
        <Results />
        <Approach />
        <Services />
        <UseCases />
        <Metrics />
        <Process />
        <SelfDiagnosis />
        <ContactForm />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>,
  );
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
}

// Une los nodos de texto con espacios para que \b funcione entre elementos vecinos.
function visibleText(root: HTMLElement): string {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];
  while (walker.nextNode()) parts.push(walker.currentNode.textContent ?? "");
  return parts.join(" ");
}

describe("portada: vocabulario", () => {
  it("fuera de la nota técnica no hay jerga técnica, 'pyme' ni 'nube'", () => {
    const root = renderHome();
    root.querySelectorAll("[data-nota-tecnica]").forEach((n) => n.remove());
    const text = visibleText(root);
    // El barrido no es vacío: incluye menú, panel del hero, secciones, rótulos fijos, formulario y pie.
    for (const s of ["Lo que ganas", "Cotización enviada al cliente", "Nuestro compromiso contigo", "Medimos cada proyecto", "¿Te suena?", "Recibes", "¿Qué te gustaría lograr?", "¿Cuánto cuesta?", "Empecemos por una conversación", "Hecho en Chile", "Para todos", "Servicios profesionales", "Bienvenido, cliente de Osorio", "Hacer el autodiagnóstico", "Tu mapa de oportunidades"]) {
      expect(text).toContain(s);
    }
    expect([...(text.match(FORBIDDEN_CI) ?? []), ...(text.match(FORBIDDEN_CS) ?? [])]).toEqual([]);
    // Cambio cifras-con-respaldo: sin las cifras de ejemplo ni su nota.
    expect(text).not.toMatch(/\+120 h|−90%|minutos donde antes había días|referenciales/);
  });

  it("hay una sola nota técnica y es el único lugar con n8n", () => {
    const root = renderHome();
    const notas = root.querySelectorAll("[data-nota-tecnica]");
    expect(notas).toHaveLength(1);
    expect(visibleText(root).match(/\bn8n\b/g)).toHaveLength(1);
    expect(notas[0].textContent).toContain("n8n");
  });
});
