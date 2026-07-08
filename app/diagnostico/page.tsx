import type { Metadata } from "next";
import { DiagnosticoTool } from "@/components/diagnostico/DiagnosticoTool";

export const metadata: Metadata = {
  title: "Diagnóstico de ahorro — Nubolabs",
  description:
    "Estima cuánto podría ahorrar tu empresa automatizando sus procesos con IA. Diagnóstico de alto nivel de Nubolabs.",
};

export default function DiagnosticoPage() {
  return <DiagnosticoTool />;
}
