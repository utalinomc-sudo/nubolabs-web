import { getDb } from "@/lib/firebaseAdmin";
import { services } from "@/lib/content";

export const dynamic = "force-dynamic";

async function getStats() {
  const db = getDb();
  if (!db) return { configured: false, total: 0, mes: 0, diagnosticos: 0 };

  const snap = await db.collection("leads").get();
  const now = new Date();
  let mes = 0;
  let diagnosticos = 0;
  snap.docs.forEach((d) => {
    const x = d.data();
    if (x.source === "diagnostico") diagnosticos++;
    const created = x.createdAt ? new Date(x.createdAt) : null;
    if (created && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()) {
      mes++;
    }
  });
  return { configured: true, total: snap.size, mes, diagnosticos };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const kpis = [
    { label: "Leads este mes", value: stats.configured ? String(stats.mes) : "—" },
    { label: "Leads en total", value: stats.configured ? String(stats.total) : "—" },
    { label: "Vía diagnóstico", value: stats.configured ? String(stats.diagnosticos) : "—" },
    { label: "Servicios activos", value: String(services.length) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {stats.configured
          ? "Resumen de leads capturados desde el sitio."
          : "Estructura lista; los KPIs se poblarán al conectar Firestore."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <div className="text-[13px] font-semibold text-ink-muted">{k.label}</div>
            <div className="mt-1 text-3xl font-extrabold">{k.value}</div>
          </div>
        ))}
      </div>

      {!stats.configured && (
        <div className="mt-8 card p-6">
          <h2 className="text-lg font-bold">Próximos pasos</h2>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-ink-soft">
            <li>Crear proyecto en Firebase y habilitar Firestore + Authentication.</li>
            <li>Cargar las credenciales de Admin en las variables de entorno de Vercel.</li>
            <li>Los leads aparecerán automáticamente en la pestaña Leads.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
