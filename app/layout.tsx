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
  description:
    "Rediseñamos procesos y los convertimos en automatizaciones con IA que trabajan en la nube. Menos horas manuales, menos errores, más escala.",
  metadataBase: new URL("https://nubolabs.ai"),
  openGraph: {
    title: "Nubolabs — AI & Automation Agency",
    description:
      "Primero rediseñamos el proceso. Después lo automatizamos. Tu operación, en piloto automático.",
    type: "website",
    locale: "es_CL",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1D3A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jakarta.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
