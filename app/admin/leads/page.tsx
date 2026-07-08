import { getDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

interface LeadRow {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  source: string;
  createdAt: string;
}

async function getLeads(): Promise<{ configured: boolean; leads: LeadRow[] }> {
  const db = getDb();
  if (!db) return { configured: false, leads: [] };

  const snap = await db.collection("leads").orderBy("createdAt", "desc").limit(100).get();
  const leads = snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      name: x.name ?? "",
      email: x.email ?? "",
      company: x.company ?? "",
      message: x.message ?? "",
      source: x.source ?? "landing",
      createdAt: x.createdAt ?? "",
    };
  });
  return { configured: true, leads };
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-CL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminLeads() {
  const { configured, leads } = await getLeads();

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Leads</h1>
        {configured && <span className="text-sm text-ink-muted">{leads.length} en total</span>}
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        Solicitudes enviadas desde la landing y el diagnóstico de ahorro.
      </p>

      <div className="mt-8 card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-soft text-[12px] uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Empresa</th>
                <th className="px-5 py-3 font-semibold">Origen</th>
                <th className="px-5 py-3 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {!configured ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-ink-muted">
                    Firebase aún no está configurado. Carga las credenciales en las variables de entorno y los leads
                    aparecerán aquí automáticamente.
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-ink-muted">
                    No hay leads todavía. Cuando alguien envíe el formulario, aparecerá aquí.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="border-b border-line/60 last:border-0 align-top">
                    <td className="px-5 py-3 font-semibold" title={l.message}>
                      {l.name || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <a href={`mailto:${l.email}`} className="text-brand hover:underline">
                        {l.email}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{l.company || "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          l.source === "diagnostico"
                            ? "bg-[#FFEFED] text-accent"
                            : "bg-[#EBF1FF] text-brand"
                        }`}
                      >
                        {l.source}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-ink-muted">{fmtDate(l.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {configured && leads.some((l) => l.message) && (
        <p className="mt-3 text-[12px] text-ink-muted">
          Pasa el cursor sobre un nombre para ver el mensaje / detalle del diagnóstico.
        </p>
      )}
    </div>
  );
}
