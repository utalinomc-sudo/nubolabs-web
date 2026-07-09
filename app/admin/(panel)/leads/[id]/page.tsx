import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/firebaseAdmin";
import { DeleteLeadButton } from "@/components/admin/DeleteLeadButton";

export const dynamic = "force-dynamic";

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const ESCALA_LBL = ["", "Nunca", "Rara vez", "A veces", "Seguido", "Siempre"];

interface AreaMeta {
  area: string;
  corto?: string;
  friccion: number | null;
  respuestas: { pregunta: string; valor: number | null }[];
}
interface AhorroProceso {
  nombre: string;
  descripcion?: string;
  herramientas?: string;
  personas: number;
  horasSemanaPorPersona?: number;
  horasSemana?: number; // compat leads antiguos
  sueldo?: number;
  repetitivo: number;
  errores?: string;
  horasMes?: number;
  ahorroHorasMes: number;
  ahorroCLPMes: number;
}
interface AhorroMeta {
  totales?: { horas: number; semana?: number; mes: number; anual: number };
  procesos?: AhorroProceso[];
}
const ERRORES_LBL: Record<string, string> = { bajo: "Pocas veces", medio: "A veces", alto: "Con frecuencia" };

async function getLead(id: string) {
  const db = getDb();
  if (!db) return { configured: false, lead: null as null | Record<string, unknown> };
  const doc = await db.collection("leads").doc(id).get();
  if (!doc.exists) return { configured: true, lead: null };
  return { configured: true, lead: { id: doc.id, ...doc.data() } as Record<string, unknown> };
}

function Campo({ k, v, accent }: { k: string; v: string; accent?: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{k}</dt>
      <dd className="mt-0.5 font-semibold" style={accent ? { color: accent } : undefined}>
        {v}
      </dd>
    </div>
  );
}

function Barra({ pct }: { pct: number | null }) {
  const v = pct ?? 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full rounded-full" style={{ width: `${v}%`, background: v >= 60 ? "#FF6B5E" : "#00C2FF" }} />
      </div>
      <span className="w-7 font-mono text-xs text-ink-muted">{pct ?? "—"}</span>
    </div>
  );
}

export default async function LeadDetail({ params }: { params: { id: string } }) {
  const { configured, lead } = await getLead(params.id);

  if (!configured) {
    return <p className="text-sm text-ink-muted">Firebase no está configurado.</p>;
  }
  if (!lead) notFound();

  const meta = (lead.meta ?? {}) as Record<string, unknown>;
  const areas = (meta.areas as AreaMeta[] | undefined) ?? [];
  const abiertas = (meta.abiertas as { pregunta: string; respuesta: string }[] | undefined) ?? [];
  const ahorro = meta.ahorro as AhorroMeta | null | undefined;
  const indice = typeof meta.indiceFriccion === "number" ? meta.indiceFriccion : null;
  const createdAt = lead.createdAt
    ? new Date(String(lead.createdAt)).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Santiago" })
    : "—";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/leads" className="text-sm font-semibold text-brand hover:underline">
          ← Volver a leads
        </Link>
        <DeleteLeadButton id={params.id} name={String(lead.name || "")} />
      </div>

      {/* Contacto */}
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-extrabold tracking-[-0.5px]">{String(lead.name || "—")}</h1>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            lead.source === "diagnostico" ? "bg-[#FFEFED] text-accent" : "bg-[#EBF1FF] text-brand"
          }`}
        >
          {String(lead.source ?? "landing")}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft">
        <span>
          <a href={`mailto:${lead.email}`} className="text-brand hover:underline">{String(lead.email ?? "")}</a>
        </span>
        {lead.company ? <span>{String(lead.company)}</span> : null}
        {meta.rubro ? <span>{String(meta.rubro)}</span> : null}
        <span className="text-ink-muted">{createdAt}</span>
      </div>

      {/* Índice de fricción */}
      {indice !== null && (
        <div className="mt-6 card p-6">
          <div className="flex items-baseline gap-3">
            <div className="text-4xl font-extrabold">{indice}</div>
            <div className="text-sm font-bold" style={{ color: indice >= 60 ? "#FF6B5E" : indice >= 35 ? "#00A9E0" : "#16A34A" }}>
              {String(meta.nivelFriccion ?? "")}
            </div>
            <span className="ml-auto text-xs text-ink-muted">Índice de fricción (0–100)</span>
          </div>
          {areas.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[...areas].sort((a, b) => (b.friccion ?? -1) - (a.friccion ?? -1)).map((a) => (
                <div key={a.area} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{a.corto ?? a.area}</span>
                  <Barra pct={a.friccion} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Respuestas del cuestionario */}
      {areas.length > 0 && (
        <div className="mt-6 space-y-4">
          {areas.map((a) => (
            <div key={a.area} className="card p-5">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-bold">{a.area}</h2>
                <span className="font-mono text-xs text-ink-muted">fricción {a.friccion ?? "—"}</span>
              </div>
              <ul className="space-y-2.5">
                {a.respuestas.map((r, i) => (
                  <li key={i} className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-ink-soft">{r.pregunta}</span>
                    <span
                      className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        (r.valor ?? 0) >= 4 ? "bg-[#FFEFED] text-accent" : "bg-surface-muted text-ink-soft"
                      }`}
                    >
                      {r.valor ?? "—"} · {ESCALA_LBL[r.valor ?? 0] ?? ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Preguntas abiertas */}
      {abiertas.some((a) => a.respuesta) && (
        <div className="mt-6 card p-5">
          <h2 className="mb-3 font-bold">En sus palabras</h2>
          <div className="space-y-3">
            {abiertas
              .filter((a) => a.respuesta)
              .map((a, i) => (
                <div key={i}>
                  <div className="text-[13px] font-semibold text-ink-muted">{a.pregunta}</div>
                  <div className="text-sm">{a.respuesta}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Estimación de ahorro (opcional) */}
      {ahorro?.totales ? (
        <div className="mt-6 card p-5">
          <h2 className="mb-1 font-bold">Estimación de ahorro (paso opcional)</h2>
          <div className="mb-4 flex flex-wrap gap-6">
            {ahorro.totales.semana != null && (
              <div>
                <div className="text-2xl font-extrabold">{clp.format(ahorro.totales.semana)}</div>
                <div className="text-xs text-ink-muted">a la semana</div>
              </div>
            )}
            <div>
              <div className="text-2xl font-extrabold text-brand">{clp.format(ahorro.totales.mes)}</div>
              <div className="text-xs text-ink-muted">al mes</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-accent">{clp.format(ahorro.totales.anual)}</div>
              <div className="text-xs text-ink-muted">al año</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold">{ahorro.totales.horas} h</div>
              <div className="text-xs text-ink-muted">automatizables/mes</div>
            </div>
          </div>
          <div className="mb-3 text-xs text-ink-muted">
            {(ahorro.procesos ?? []).length} proceso(s) · haz clic en cada uno para ver el detalle completo.
          </div>
          <div className="space-y-2">
            {(ahorro.procesos ?? []).map((p, i) => {
              const hsem = p.horasSemanaPorPersona ?? p.horasSemana;
              return (
                <details key={i} className="group rounded-xl border border-line bg-white [&_summary]:list-none">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="text-ink-muted transition group-open:rotate-90">▸</span>
                      {p.nombre}
                    </span>
                    <span className="text-sm font-bold text-brand">{clp.format(p.ahorroCLPMes)}/mes</span>
                  </summary>
                  <div className="border-t border-line px-4 py-4">
                    {p.descripcion ? (
                      <p className="mb-4 text-sm text-ink-soft">
                        <span className="font-semibold text-ink">Descripción: </span>
                        {p.descripcion}
                      </p>
                    ) : null}
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                      <Campo k="Herramientas" v={p.herramientas || "—"} />
                      <Campo k="Personas" v={String(p.personas)} />
                      <Campo k="Horas/sem por persona" v={hsem != null ? `${hsem} h` : "—"} />
                      <Campo k="Sueldo prom. mensual" v={p.sueldo != null ? clp.format(p.sueldo) : "—"} />
                      <Campo k="% repetitivo / manual" v={`${p.repetitivo}%`} />
                      <Campo k="Errores / retrabajo" v={p.errores ? ERRORES_LBL[p.errores] ?? p.errores : "—"} />
                      <Campo k="Horas totales / mes" v={p.horasMes != null ? `${p.horasMes} h` : "—"} />
                      <Campo k="Horas automatizables / mes" v={`${p.ahorroHorasMes} h`} accent="#1565FF" />
                      <Campo k="Ahorro estimado / mes" v={clp.format(p.ahorroCLPMes)} accent="#FF6B5E" />
                    </dl>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      ) : lead.source === "diagnostico" ? (
        <p className="mt-6 text-sm text-ink-muted">El cliente no agregó el paso opcional de estimación de ahorro.</p>
      ) : null}

      {/* Mensaje crudo (para leads simples de la landing) */}
      {lead.message && areas.length === 0 ? (
        <div className="mt-6 card p-5">
          <h2 className="mb-2 font-bold">Mensaje</h2>
          <p className="whitespace-pre-wrap text-sm text-ink-soft">{String(lead.message)}</p>
        </div>
      ) : null}
    </div>
  );
}
