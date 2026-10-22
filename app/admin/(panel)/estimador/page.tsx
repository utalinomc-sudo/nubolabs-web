import { EstimadorInterno } from "@/components/admin/EstimadorInterno";

// Estimador de ahorro interno (cambio diagnostico-mapa-oportunidades). El layout del panel exige sesión (redirige a
// /admin/login); la página no lee ni escribe Firestore.
export const dynamic = "force-dynamic";

export default function EstimadorPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Estimador de ahorro</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Para preparar propuestas: describe los procesos repetitivos del cliente y estima horas y pesos. Desde octubre de
        2026 el diagnóstico público ya no muestra montos: entrega un mapa de oportunidades.
      </p>
      <div className="mt-8">
        <EstimadorInterno />
      </div>
    </div>
  );
}
