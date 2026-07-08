export default function AdminLeads() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Leads</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Solicitudes de diagnóstico enviadas desde la landing.
      </p>

      <div className="mt-8 card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-soft text-[12px] uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Nombre</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Empresa</th>
              <th className="px-5 py-3 font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-5 py-10 text-center text-ink-muted">
                No hay leads todavía. Conecta Firestore y llegarán aquí automáticamente.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
