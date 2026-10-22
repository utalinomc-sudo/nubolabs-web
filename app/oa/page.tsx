import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

// Entrada de los clientes que recomienda Osorio & Asociados (cambio landing-referidos-oa). Es el link del correo de
// Mauricio O.: misma portada con la franja de bienvenida; marca los leads de la visita con referral "oa".
export const dynamic = "force-dynamic";

// Solo noindex: sin canónica, que con noindex daría señales contradictorias a los buscadores.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function OaPage() {
  return <LandingPage referral="oa" />;
}
