const kpis = [
  { label: "Leads este mes", value: "—", hint: "Se llenará al conectar Firestore" },
  { label: "Tasa de respuesta", value: "—", hint: "Placeholder" },
  { label: "Diagnósticos agendados", value: "—", hint: "Placeholder" },
  { label: "Servicios activos", value: "4", hint: "Desde lib/content" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Panel de gestión interna. Estructura lista; los KPIs se poblarán al conectar Firestore.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <div className="text-[13px] font-semibold text-ink-muted">{k.label}</div>
            <div className="mt-1 text-3xl font-extrabold">{k.value}</div>
            <div className="mt-1 text-[11px] text-ink-muted">{k.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <h2 className="text-lg font-bold">Próximos pasos</h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-ink-soft">
          <li>Configurar credenciales de Firebase en <code>.env.local</code> (ver <code>.env.local.example</code>).</li>
          <li>Conectar Firebase Auth para proteger estas rutas.</li>
          <li>Listar los leads reales desde la colección <code>leads</code> de Firestore.</li>
        </ul>
      </div>
    </div>
  );
}
