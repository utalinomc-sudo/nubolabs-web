import type { Metadata } from "next";
import { DiagnosticoFlow } from "@/components/diagnostico/DiagnosticoFlow";

export const metadata: Metadata = {
  title: "Diagnóstico operativo — Nubolabs",
  description:
    "Identifica en 3 minutos dónde está la mayor fricción operativa de tu empresa y, opcionalmente, estima cuánto podrías ahorrar automatizando. Diagnóstico gratuito de Nubolabs.",
};

export default function DiagnosticoPage() {
  return <DiagnosticoFlow />;
}
