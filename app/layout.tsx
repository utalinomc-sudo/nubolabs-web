import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nubolabs — AI & Automation Agency",
  // Promesa orientada a resultados de negocio (cambio mensaje-principal-pyme, decisión 7). El título mantiene la marca.
  description:
    "Ordenamos cómo funciona tu empresa y dejamos funcionando solas las tareas que hoy te frenan. Vende más, ten el control y crece sin desordenarte.",
  metadataBase: new URL("https://www.nubolabs.cl"),
  openGraph: {
    title: "Nubolabs — AI & Automation Agency",
    description: "Que tu negocio trabaje para ti, no al revés. Diagnóstico gratis de 30 minutos.",
    type: "website",
    locale: "es_CL",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1D3A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${jakarta.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
