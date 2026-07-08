"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

// ── Paleta (coincide con la landing) ────────────────────────────────────
const C = {
  navy: "#0B1D3A",
  blue: "#1565FF",
  cyan: "#00C2FF",
  orange: "#FF6B5E",
  muted: "#5A6B85",
  faint: "#93A5C4",
  border: "#E3EAF5",
  cardBorder: "#E7EDF7",
  bg: "#F6F9FE",
  soft: "#EBF1FF",
};

// ── Configuración del cálculo ───────────────────────────────────────────
const CONFIG = {
  sueldoPromedioDefault: 800000, // CLP mensual por persona
  horasMesJornada: 180, // horas de jornada mensual para costo/hora
  factorAutomatizacion: 0.8, // fracción máxima automatizable de lo repetitivo
};

const fmtCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

type Errores = "bajo" | "medio" | "alto";

interface Proceso {
  id: number;
  nombre: string;
  descripcion: string;
  herramientas: string;
  personas: number;
  horas: number;
  sueldo: number;
  repetitivo: number;
  errores: Errores;
  abierto: boolean;
}

let uid = 0;
function blank(abierto = true): Proceso {
  return {
    id: ++uid,
    nombre: "",
    descripcion: "",
    herramientas: "",
    personas: 2,
    horas: 8,
    sueldo: CONFIG.sueldoPromedioDefault,
    repetitivo: 60,
    errores: "medio",
    abierto,
  };
}

function calc(p: Proceso) {
  const errBump = p.errores === "alto" ? 1.15 : p.errores === "medio" ? 1.05 : 1;
  const horasMes = (Number(p.horas) || 0) * 4.33;
  const ahorroHoras = horasMes * (Number(p.repetitivo) / 100) * CONFIG.factorAutomatizacion;
  const costoHora = (Number(p.sueldo) || 0) / CONFIG.horasMesJornada;
  const ahorroMes = ahorroHoras * costoHora * errBump;
  return { horasMes, ahorroHoras, ahorroMes };
}

export function DiagnosticoTool() {
  const [procesos, setProcesos] = useState<Proceso[]>([blank()]);
  const [contact, setContact] = useState({ nombre: "", email: "", empresa: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");

  const totals = useMemo(() => {
    let horas = 0;
    let mes = 0;
    procesos.forEach((p) => {
      const c = calc(p);
      horas += c.ahorroHoras;
      mes += c.ahorroMes;
    });
    return { horas: Math.round(horas), mes: Math.round(mes), anual: Math.round(mes * 12) };
  }, [procesos]);

  const potencial =
    totals.horas >= 80
      ? { txt: "alto", dot: "#22C55E" }
      : totals.horas >= 30
        ? { txt: "medio", dot: C.cyan }
        : { txt: "inicial", dot: C.faint };

  function setF<K extends keyof Proceso>(i: number, field: K, value: Proceso[K]) {
    setProcesos((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }
  function toggle(i: number) {
    setProcesos((prev) => prev.map((p, idx) => (idx === i ? { ...p, abierto: !p.abierto } : p)));
  }
  function addProceso() {
    setProcesos((prev) => [...prev.map((p) => ({ ...p, abierto: false })), blank(true)]);
  }
  function removeProceso(i: number) {
    setProcesos((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function enviar() {
    const nombre = contact.nombre.trim();
    const email = contact.email.trim();
    const empresa = contact.empresa.trim();
    if (!nombre || email.indexOf("@") < 0) {
      setError("Ingresa tu nombre y un email válido.");
      return;
    }
    setError("");
    setStatus("loading");

    const detalle = procesos.map((p) => {
      const c = calc(p);
      return {
        nombre: p.nombre || "Proceso sin nombre",
        herramientas: p.herramientas,
        personas: p.personas,
        horasSemana: p.horas,
        repetitivo: p.repetitivo,
        errores: p.errores,
        ahorroHorasMes: Math.round(c.ahorroHoras),
        ahorroCLPMes: Math.round(c.ahorroMes),
      };
    });

    const message =
      `Diagnóstico de ahorro — ${procesos.length} proceso(s).\n` +
      `Ahorro estimado: ${fmtCLP.format(totals.mes)}/mes · ${fmtCLP.format(totals.anual)}/año · ${totals.horas} h/mes automatizables.\n\n` +
      detalle
        .map(
          (d) =>
            `• ${d.nombre} — ${d.personas} pers · ${d.horasSemana} h/sem · ${d.repetitivo}% repetitivo → ${fmtCLP.format(d.ahorroCLPMes)}/mes`,
        )
        .join("\n");

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombre,
          email,
          company: empresa,
          message,
          source: "diagnostico",
          meta: { totales: totals, procesos: detalle },
        }),
      });
    } catch {
      // No bloqueamos la confirmación si el backend falla; el diagnóstico igual se calculó.
    }

    setFirstName(nombre.split(" ")[0] || "");
    setStatus("ok");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, color: C.navy }}>
      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #EEF2F8" }}>
        <div style={wrap} className="flex items-center justify-between">
          <div className="flex items-center gap-[11px]">
            <LogoMark width={36} height={30} variant="gradient" />
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>
              Nubo<b style={{ color: C.blue }}>labs</b>
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: C.faint,
                marginLeft: 10,
                borderLeft: `1px solid ${C.border}`,
                paddingLeft: 14,
              }}
            >
              DIAGNÓSTICO
            </span>
          </div>
          <Link href="/" style={{ fontSize: 13.5, fontWeight: 600, color: C.muted }}>
            ← Volver a nubolabs.cl
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <header style={{ ...wrap, paddingTop: 48, paddingBottom: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: C.soft,
            color: C.blue,
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "2.5px",
            padding: "7px 14px",
            borderRadius: 999,
          }}
        >
          ◈&nbsp;ESTIMACIÓN DE AHORRO
        </span>
        <h1 style={{ margin: "18px 0 12px", fontSize: 38, fontWeight: 800, letterSpacing: "-1.4px", lineHeight: 1.1, maxWidth: 720 }}>
          ¿Cuánto podría ahorrar tu empresa automatizando?
        </h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: C.muted, maxWidth: 640 }}>
          Describe los procesos que hoy consumen tiempo en tu equipo. Con esos datos calculamos una estimación de alto
          nivel — y en la sesión de diagnóstico la afinamos contigo.
        </p>
      </header>

      {/* MAIN */}
      <main style={{ ...wrap, paddingTop: 32, paddingBottom: 72 }} className="dx-grid">
        {/* Procesos */}
        <div className="flex flex-col gap-4">
          {procesos.map((p, i) => (
            <ProcesoCard
              key={p.id}
              p={p}
              i={i}
              total={procesos.length}
              onToggle={toggle}
              onChange={setF}
              onRemove={removeProceso}
            />
          ))}
          <div onClick={addProceso} style={addBox} className="dx-add">
            + Agregar otro proceso
          </div>
        </div>

        {/* Aside */}
        <aside className="dx-aside">
          <div style={{ background: C.navy, color: "#fff", borderRadius: 20, padding: 28 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "2.5px", color: C.cyan, marginBottom: 18 }}>
              TU ESTIMACIÓN
            </div>
            <div className="flex flex-col gap-[18px]">
              <div>
                <div style={big}>{totals.horas} h</div>
                <div style={cap}>horas automatizables al mes</div>
              </div>
              <div>
                <div style={{ ...big, color: C.cyan }}>{fmtCLP.format(totals.mes)}</div>
                <div style={cap}>ahorro estimado mensual</div>
              </div>
              <div>
                <div style={{ ...big, fontSize: 24, color: C.orange }}>{fmtCLP.format(totals.anual)}</div>
                <div style={cap}>proyección anual</div>
              </div>
            </div>
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,.14)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: potencial.dot, display: "inline-block" }} />
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>Potencial {potencial.txt}</span>
              <span className="font-mono" style={{ fontSize: 11, color: "#5A7699", marginLeft: "auto" }}>
                {procesos.length} {procesos.length === 1 ? "PROCESO" : "PROCESOS"}
              </span>
            </div>
            <div style={{ marginTop: 14, fontSize: 11, lineHeight: 1.5, color: "#5A7699" }}>
              * Estimación referencial de alto nivel. El diagnóstico valida cifras, prioriza por retorno y define la hoja
              de ruta.
            </div>
          </div>

          {status === "ok" ? (
            <div style={{ ...contactCard, textAlign: "center", border: "1.5px solid #B7E4C7", padding: 28 }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#E8FBF1",
                  color: "#18A45C",
                  fontSize: 20,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✓
              </span>
              <div style={{ fontSize: 16, fontWeight: 800, margin: "14px 0 6px" }}>¡Recibido, {firstName}!</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Te contactaremos en menos de 24 horas para agendar la sesión y revisar esta estimación en detalle.
              </div>
            </div>
          ) : (
            <div style={contactCard}>
              <div style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 4 }}>Recibe tu diagnóstico completo</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>
                Te enviamos la estimación detallada y agendamos 30 min para revisarla. Sin compromiso.
              </div>
              <div className="flex flex-col gap-2.5">
                <input
                  style={field}
                  placeholder="Nombre"
                  value={contact.nombre}
                  onChange={(e) => setContact({ ...contact, nombre: e.target.value })}
                />
                <input
                  style={field}
                  type="email"
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
                <input
                  style={field}
                  placeholder="Empresa (opcional)"
                  value={contact.empresa}
                  onChange={(e) => setContact({ ...contact, empresa: e.target.value })}
                />
                <button onClick={enviar} disabled={status === "loading"} style={btn}>
                  {status === "loading" ? "Enviando…" : "Enviar y agendar diagnóstico →"}
                </button>
                <div style={{ fontSize: 11, color: "#F04438", minHeight: 14, textAlign: "center" }}>{error}</div>
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* FOOTER */}
      <footer style={{ marginTop: "auto", background: "#fff", borderTop: "1px solid #EEF2F8" }}>
        <div style={wrap} className="flex items-center justify-between">
          <span style={{ fontSize: 14, fontWeight: 800 }}>
            Nubo<b style={{ color: C.blue }}>labs</b>
            <span style={{ fontSize: 12, fontWeight: 500, color: C.faint, marginLeft: 8 }}>
              Tu operación, en piloto automático.
            </span>
          </span>
          <span style={{ fontSize: 12.5, color: C.faint }}>hola@nubolabs.ai · © {new Date().getFullYear()} Nubolabs</span>
        </div>
      </footer>

      {/* Estilos responsive del grid (no expresables inline) */}
      <style>{`
        .dx-grid{display:grid;grid-template-columns:1fr 380px;gap:28px;align-items:start}
        .dx-aside{position:sticky;top:20px;display:flex;flex-direction:column;gap:16px}
        .dx-add:hover{background:${C.soft}}
        @media (max-width:960px){
          .dx-grid{grid-template-columns:1fr}
          .dx-aside{position:static}
          .dx-row3{grid-template-columns:1fr!important}
          .dx-row2{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}

// ── Tarjeta de proceso ──────────────────────────────────────────────────
function ProcesoCard({
  p,
  i,
  total,
  onToggle,
  onChange,
  onRemove,
}: {
  p: Proceso;
  i: number;
  total: number;
  onToggle: (i: number) => void;
  onChange: <K extends keyof Proceso>(i: number, field: K, value: Proceso[K]) => void;
  onRemove: (i: number) => void;
}) {
  const c = calc(p);
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.cardBorder}`, borderRadius: 18, overflow: "hidden" }}>
      {/* Header */}
      <div
        onClick={() => onToggle(i)}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 24px", cursor: "pointer" }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: C.soft,
            color: C.blue,
            fontWeight: 800,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          {String(i + 1).padStart(2, "0")}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700 }}>{p.nombre || "Proceso sin nombre"}</div>
          <div style={{ fontSize: 12.5, color: C.muted }}>
            {p.personas} persona(s) · {p.horas} h/semana · {p.repetitivo}% repetitivo
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.blue }}>{fmtCLP.format(Math.round(c.ahorroMes))}</div>
          <div style={{ fontSize: 11, color: C.faint }}>ahorro estimado / mes</div>
        </div>
        <span style={{ color: C.faint, fontSize: 13 }}>{p.abierto ? "▲" : "▼"}</span>
        {total > 1 && (
          <span
            title="Eliminar proceso"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(i);
            }}
            style={delBtn}
          >
            ✕
          </span>
        )}
      </div>

      {/* Body */}
      {p.abierto && (
        <div style={{ borderTop: "1px solid #EEF2F8", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="dx-row2" style={row2}>
            <div>
              <label style={lbl}>Nombre del proceso</label>
              <input
                style={field}
                value={p.nombre}
                placeholder="Ej: Generación de cotizaciones"
                onChange={(e) => onChange(i, "nombre", e.target.value)}
              />
            </div>
            <div>
              <label style={lbl}>
                Herramientas involucradas <span style={{ fontWeight: 500, color: C.faint }}>(opcional)</span>
              </label>
              <input
                style={field}
                value={p.herramientas}
                placeholder="Ej: Excel, correo, ERP"
                onChange={(e) => onChange(i, "herramientas", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label style={lbl}>Descripción breve</label>
            <textarea
              rows={2}
              style={{ ...field, resize: "none" }}
              value={p.descripcion}
              placeholder="¿Qué se hace, quién lo hace y dónde se traba hoy?"
              onChange={(e) => onChange(i, "descripcion", e.target.value)}
            />
          </div>
          <div className="dx-row3" style={row3}>
            <div>
              <label style={lbl}>Personas que participan</label>
              <input
                type="number"
                min={1}
                style={field}
                value={p.personas}
                onChange={(e) => onChange(i, "personas", Number(e.target.value))}
              />
            </div>
            <div>
              <label style={lbl}>Horas totales / semana</label>
              <input
                type="number"
                min={0}
                style={field}
                value={p.horas}
                onChange={(e) => onChange(i, "horas", Number(e.target.value))}
              />
              <div style={hint}>Sumando a todas las personas</div>
            </div>
            <div>
              <label style={lbl}>Sueldo promedio mensual (CLP)</label>
              <input
                type="number"
                min={0}
                step={50000}
                style={field}
                value={p.sueldo}
                onChange={(e) => onChange(i, "sueldo", Number(e.target.value))}
              />
              <div style={hint}>De las personas involucradas</div>
            </div>
          </div>
          <div className="dx-row2" style={{ ...row2, alignItems: "end" }}>
            <div>
              <label style={lbl}>
                ¿Qué tan repetitivo / manual es?{" "}
                <span style={{ color: C.blue, fontWeight: 800 }}>{p.repetitivo}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={p.repetitivo}
                onChange={(e) => onChange(i, "repetitivo", Number(e.target.value))}
                style={{ width: "100%", accentColor: C.blue }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.faint, marginTop: 3 }}>
                <span>Requiere mucho criterio</span>
                <span>Casi todo mecánico</span>
              </div>
            </div>
            <div>
              <label style={lbl}>¿Genera errores o retrabajo?</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(
                  [
                    ["bajo", "Pocas veces"],
                    ["medio", "A veces"],
                    ["alto", "Con frecuencia"],
                  ] as [Errores, string][]
                ).map(([val, label]) => {
                  const on = p.errores === val;
                  const alto = on && val === "alto";
                  return (
                    <span
                      key={val}
                      onClick={() => onChange(i, "errores", val)}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        padding: "10px 0",
                        borderRadius: 9,
                        cursor: "pointer",
                        border: `1.5px solid ${alto ? C.orange : on ? C.blue : C.border}`,
                        background: alto ? "#FFEFED" : on ? C.soft : "#fff",
                        color: alto ? C.orange : on ? C.blue : C.muted,
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: C.bg,
              borderRadius: 12,
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", gap: 32 }}>
              <Stat k="HORAS / MES" v={`${Math.round(c.horasMes)} h`} />
              <Stat k="AUTOMATIZABLE" v={`${Math.round(c.ahorroHoras)} h/mes`} color={C.blue} />
              <Stat k="AHORRO / MES" v={fmtCLP.format(Math.round(c.ahorroMes))} color={C.orange} />
            </div>
            {total > 1 && (
              <span
                onClick={() => onRemove(i)}
                style={{ fontSize: 12.5, fontWeight: 600, color: C.faint, cursor: "pointer", textDecoration: "underline" }}
              >
                Eliminar
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, letterSpacing: "1px" }}>{k}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: color ?? C.navy }}>{v}</div>
    </div>
  );
}

// ── Estilos reutilizables (inline) ──────────────────────────────────────
const wrap: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "22px 32px", width: "100%" };
const big: React.CSSProperties = { fontSize: 34, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1 };
const cap: React.CSSProperties = { fontSize: 12.5, color: C.faint, marginTop: 4 };
const lbl: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6 };
const hint: React.CSSProperties = { fontSize: 11, color: C.faint, marginTop: 5 };
const row2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
const row3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 };
const field: React.CSSProperties = {
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 14,
  fontFamily: "inherit",
  color: C.navy,
  outline: "none",
  width: "100%",
  background: "#fff",
};
const addBox: React.CSSProperties = {
  border: "1.5px dashed #C9D6EC",
  borderRadius: 16,
  padding: 18,
  textAlign: "center",
  fontSize: 14.5,
  fontWeight: 700,
  color: C.blue,
  cursor: "pointer",
  background: "#FBFCFF",
};
const delBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  color: C.faint,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  cursor: "pointer",
  flex: "none",
};
const contactCard: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 16px 40px rgba(11,29,58,.07)",
};
const btn: React.CSSProperties = {
  background: C.blue,
  color: "#fff",
  textAlign: "center",
  fontSize: 14.5,
  fontWeight: 700,
  padding: 14,
  borderRadius: 11,
  cursor: "pointer",
  border: "none",
  width: "100%",
  fontFamily: "inherit",
  boxShadow: "0 8px 20px rgba(21,101,255,.25)",
};
