"use client";

import { type Dispatch, type SetStateAction } from "react";
import { type Proceso, type Errores, calc, fmtCLP, blank } from "./ahorro";

const C = {
  navy: "#0B1D3A",
  blue: "#1565FF",
  orange: "#FF6B5E",
  muted: "#5A6B85",
  faint: "#93A5C4",
  border: "#E3EAF5",
  cardBorder: "#E7EDF7",
  bg: "#F6F9FE",
  soft: "#EBF1FF",
};

export function AhorroEstimator({
  procesos,
  setProcesos,
}: {
  procesos: Proceso[];
  setProcesos: Dispatch<SetStateAction<Proceso[]>>;
}) {
  function setF<K extends keyof Proceso>(i: number, field: K, value: Proceso[K]) {
    setProcesos((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }
  function toggle(i: number) {
    setProcesos((prev) => prev.map((p, idx) => (idx === i ? { ...p, abierto: !p.abierto } : p)));
  }
  function add() {
    setProcesos((prev) => [...prev.map((p) => ({ ...p, abierto: false })), blank(true)]);
  }
  function remove(i: number) {
    setProcesos((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-4">
      {procesos.map((p, i) => (
        <ProcesoCard
          key={p.id}
          p={p}
          i={i}
          total={procesos.length}
          onToggle={toggle}
          onChange={setF}
          onRemove={remove}
        />
      ))}
      <div onClick={add} style={addBox} className="hover:bg-[#EBF1FF]">
        + Agregar otro proceso
      </div>
    </div>
  );
}

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
                Herramientas <span style={{ fontWeight: 500, color: C.faint }}>(opcional)</span>
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
              <label style={lbl}>Personas</label>
              <input type="number" min={1} style={field} value={p.personas} onChange={(e) => onChange(i, "personas", Number(e.target.value))} />
            </div>
            <div>
              <label style={lbl}>Horas / semana</label>
              <input type="number" min={0} style={field} value={p.horas} onChange={(e) => onChange(i, "horas", Number(e.target.value))} />
              <div style={hint}>Sumando a todas las personas</div>
            </div>
            <div>
              <label style={lbl}>Sueldo prom. mensual (CLP)</label>
              <input type="number" min={0} step={50000} style={field} value={p.sueldo} onChange={(e) => onChange(i, "sueldo", Number(e.target.value))} />
            </div>
          </div>
          <div className="dx-row2" style={{ ...row2, alignItems: "end" }}>
            <div>
              <label style={lbl}>
                ¿Qué tan repetitivo / manual es? <span style={{ color: C.blue, fontWeight: 800 }}>{p.repetitivo}%</span>
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
                <span>Requiere criterio</span>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <Stat k="HORAS / MES" v={`${Math.round(c.horasMes)} h`} />
              <Stat k="AUTOMATIZABLE" v={`${Math.round(c.ahorroHoras)} h/mes`} color={C.blue} />
              <Stat k="AHORRO / MES" v={fmtCLP.format(Math.round(c.ahorroMes))} color={C.orange} />
            </div>
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
