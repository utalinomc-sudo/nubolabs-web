import type { Metadata } from "next";
import { DiagnosticoFlow } from "@/components/diagnostico/DiagnosticoFlow";

export const metadata: Metadata = {
  title: "Autodiagnóstico — Nubolabs",
  description:
    "Descubre en 5 minutos dónde está la mayor oportunidad de tu negocio: ventas, control, orden y crecimiento. Autodiagnóstico gratuito de Nubolabs.",
};

export default function DiagnosticoPage() {
  return <DiagnosticoFlow />;
}
