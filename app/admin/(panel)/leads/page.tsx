import Link from "next/link";
import { getDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

interface LeadRow {
  id: string;
  name: string;
  email: string;
  company: string;
  source: string;
  createdAt: string;
  indice: number | null;
  ahorroMes: number | null;
}

async function getLeads(): Promise<{ configured: boolean; leads: LeadRow[] }> {
  const db = getDb();
  if (!db) return { configured: false, leads: [] };

  const snap = await db.collection("leads").orderBy("createdAt", "desc").limit(100).get();
  const leads = snap.docs.map((d) => {
    const x = d.data();
    const meta = (x.meta ?? {}) as Record<string, unknown>;
    const ahorro = meta.ahorro as { totales?: { mes?: number } } | null | undefined;
    return {
      id: d.id,
      name: x.name ?? "",
      email: x.email ?? "",
      company: x.company ?? "",
      source: x.source ?? "landing",
      createdAt: x.createdAt ?? "",
      indice: typeof meta.indiceFriccion === "number" ? meta.indiceFriccion : null,
      ahorroMes: ahorro?.totales?.mes ?? null,
    };
  });
  return { configured: true, leads };
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}
const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export default async function AdminLeads() {
  const { configured, leads } = await getLeads();

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Leads</h1>
        {configured && <span className="text-sm text-ink-muted">{leads.length} en total</span>}
      </div>
      <p className="mt-1 text-sm text-ink-muted">Solicitudes desde la landing y el diagnóstico operativo.</p>

      <div className="mt-8 card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-soft text-[12px] uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Empresa</th>
                <th className="px-5 py-3 font-semibold">Origen</th>
                <th className="px-5 py-3 font-semibold">Fricción</th>
                <th className="px-5 py-3 font-semibold">Ahorro/mes</th>
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {!configured ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-ink-muted">
                    Firebase aún no está configurado.
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-ink-muted">
                    No hay leads todavía.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="border-b border-line/60 last:border-0">
                    <td className="px-5 py-3 font-semibold">{l.name || "—"}</td>
                    <td className="px-5 py-3">
                      <a href={`mailto:${l.email}`} className="text-brand hover:underline">
                        {l.email}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{l.company || "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          l.source === "diagnostico" ? "bg-[#FFEFED] text-accent" : "bg-[#EBF1FF] text-brand"
                        }`}
                      >
                        {l.source}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold">{l.indice ?? "—"}</td>
                    <td className="px-5 py-3 text-ink-soft">{l.ahorroMes != null ? clp.format(l.ahorroMes) : "—"}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-ink-muted">{fmtDate(l.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/leads/${l.id}`} className="text-sm font-semibold text-brand hover:underline">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
