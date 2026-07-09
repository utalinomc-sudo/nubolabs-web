"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { AhorroEstimator } from "./AhorroEstimator";
import { type Proceso, blank, calc, calcTotals, fmtCLP } from "./ahorro";
import { AREAS, ESCALA, ABIERTAS, TOTAL_Q, nivelFriccion } from "./cuestionario";

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

type Resp = (number | null)[][];

export function DiagnosticoFlow() {
  const [resp, setResp] = useState<Resp>(() => AREAS.map((a) => a.preguntas.map(() => null)));
  const [abiertas, setAbiertas] = useState({ mayorProblema: "", solucionMagica: "" });
  const [contact, setContact] = useState({ nombre: "", email: "", empresa: "", rubro: "" });
  const [ahorroActivo, setAhorroActivo] = useState(false);
  const [procesos, setProcesos] = useState<Proceso[]>(() => [blank()]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");

  // ── Derivados ──────────────────────────────────────────────────────────
  const contestadas = useMemo(
    () => resp.reduce((n, a) => n + a.filter((v) => v !== null).length, 0),
    [resp],
  );

  const promArea = (ai: number): number | null => {
    const vals = resp[ai].filter((v): v is number => v !== null);
    if (!vals.length) return null;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  };

  const indice = useMemo(() => {
    const todas = resp.flat().filter((v): v is number => v !== null);
    if (!todas.length) return null;
    const avg = todas.reduce((s, v) => s + v, 0) / todas.length;
    return Math.round(((avg - 1) / 4) * 100);
  }, [resp]);

  const nivel = indice === null ? null : nivelFriccion(indice);

  const areaBars = useMemo(
    () =>
      AREAS.map((a, ai) => {
        const p = promArea(ai);
        return { corto: a.corto, pct: p === null ? null : Math.round(((p - 1) / 4) * 100) };
      }).sort((x, y) => (y.pct ?? -1) - (x.pct ?? -1)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resp],
  );

  const ahorroTotals = useMemo(() => calcTotals(procesos), [procesos]);

  // ── Envío ──────────────────────────────────────────────────────────────
  function marcar(ai: number, qi: number, v: number) {
    setResp((prev) => prev.map((a, i) => (i === ai ? a.map((x, j) => (j === qi ? v : x)) : a)));
  }

  async function enviar() {
    const nombre = contact.nombre.trim();
    const email = contact.email.trim();
    const faltan = resp.reduce((n, a) => n + a.filter((v) => v === null).length, 0);

    if (faltan > 0) {
      setError(`Te falta${faltan === 1 ? "" : "n"} ${faltan} pregunta${faltan === 1 ? "" : "s"} por responder.`);
      return;
    }
    if (!nombre || email.indexOf("@") < 0) {
      setError("Ingresa tu nombre y un email válido.");
      return;
    }
    setError("");
    setStatus("loading");

    const areas = AREAS.map((a, ai) => {
      const p = promArea(ai);
      return {
        area: a.nombre,
        corto: a.corto,
        promedio: p === null ? null : Math.round(p * 100) / 100,
        friccion: p === null ? null : Math.round(((p - 1) / 4) * 100),
        respuestas: a.preguntas.map((q, qi) => ({ pregunta: q, valor: resp[ai][qi] })),
      };
    });

    const abiertasArr = ABIERTAS.map((p) => ({ pregunta: p.label, respuesta: abiertas[p.id as keyof typeof abiertas].trim() }));

    const ahorro = ahorroActivo
      ? {
          totales: ahorroTotals,
          procesos: procesos.map((p) => {
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
          }),
        }
      : null;

    const topArea = areaBars[0];
    const message =
      `Cuestionario operativo — Índice de fricción ${indice} (${nivel?.txt.toLowerCase()}).` +
      (topArea?.pct != null ? ` Área más crítica: ${topArea.corto} (${topArea.pct}).` : "") +
      (ahorro ? ` + Estimación de ahorro: ${fmtCLP.format(ahorro.totales.mes)}/mes (${ahorro.procesos.length} procesos).` : " Sin estimación de ahorro.");

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombre,
          email,
          company: contact.empresa.trim(),
          message,
          source: "diagnostico",
          meta: {
            rubro: contact.rubro.trim(),
            indiceFriccion: indice,
            nivelFriccion: nivel?.txt,
            areas,
            abiertas: abiertasArr,
            ahorro,
          },
        }),
      });
    } catch {
      // no bloqueamos la confirmación si el backend falla
    }

    setFirstName(nombre.split(" ")[0] || "");
    setStatus("ok");
  }

  // ── Render ─────────────────────────────────────────────────────────────
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
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: C.faint, marginLeft: 10, borderLeft: `1px solid ${C.border}`, paddingLeft: 14 }}>
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
        <span style={badge}>◈&nbsp;FRICCIÓN OPERATIVA</span>
        <h1 style={{ margin: "18px 0 12px", fontSize: 38, fontWeight: 800, letterSpacing: "-1.4px", lineHeight: 1.1, maxWidth: 720 }}>
          ¿Dónde se está trabando la operación de tu empresa?
        </h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: C.muted, maxWidth: 640 }}>
          18 preguntas, 3 minutos. Marca con qué frecuencia ocurre cada situación en tu equipo hoy — no hay respuestas
          correctas. Al final verás tu índice de fricción y las áreas donde la automatización tendría más impacto.
        </p>
      </header>

      {/* MAIN */}
      <main style={{ ...wrap, paddingTop: 32, paddingBottom: 72 }} className="dx-grid">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-4">
          {AREAS.map((a, ai) => {
            const done = resp[ai].filter((v) => v !== null).length;
            return (
              <div key={a.id} style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 24px" }}>
                  <span style={aNum}>{String(ai + 1).padStart(2, "0")}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700 }}>{a.nombre}</div>
                    <div style={{ fontSize: 12.5, color: C.muted }}>{a.sub}</div>
                  </div>
                  <span className="font-mono" style={{ fontSize: 11, color: done === a.preguntas.length ? C.blue : C.faint }}>
                    {done}/{a.preguntas.length}
                  </span>
                </div>
                <div style={{ borderTop: "1px solid #EEF2F8", padding: "8px 24px 22px" }}>
                  {a.preguntas.map((q, qi) => (
                    <div key={qi} style={{ padding: "16px 0", borderBottom: qi < a.preguntas.length - 1 ? "1px dashed #EEF2F8" : "none" }}>
                      <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12, fontWeight: 500 }}>{q}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {ESCALA.map((e) => {
                          const on = resp[ai][qi] === e.v;
                          const hot = on && e.v >= 4;
                          return (
                            <span
                              key={e.v}
                              onClick={() => marcar(ai, qi, e.v)}
                              style={{
                                flex: 1,
                                textAlign: "center",
                                fontSize: 12.5,
                                fontWeight: 600,
                                padding: "9px 2px",
                                borderRadius: 9,
                                cursor: "pointer",
                                userSelect: "none",
                                border: `1.5px solid ${hot ? C.orange : on ? C.blue : C.border}`,
                                background: hot ? "#FFEFED" : on ? C.soft : "#fff",
                                color: hot ? C.orange : on ? C.blue : C.muted,
                              }}
                            >
                              <small style={{ display: "block", fontSize: 10, fontWeight: 700, opacity: 0.55 }}>{e.v}</small>
                              {e.l}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Preguntas abiertas */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 24px" }}>
              <span style={aNum}>✎</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700 }}>En tus palabras</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>Opcional — pero es lo que más nos ayuda a preparar la sesión</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #EEF2F8", padding: "18px 24px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
              {ABIERTAS.map((p) => (
                <div key={p.id}>
                  <label style={lbl}>{p.label}</label>
                  <textarea
                    rows={2}
                    style={{ ...field, resize: "none" }}
                    placeholder="Escribe libremente…"
                    value={abiertas[p.id as keyof typeof abiertas]}
                    onChange={(e) => setAbiertas((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Paso opcional: estimación de ahorro */}
          {!ahorroActivo ? (
            <div style={{ ...card, borderStyle: "dashed", borderColor: "#C9D6EC", background: "#FBFCFF", textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "2px", color: C.blue, marginBottom: 6 }}>PASO OPCIONAL</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>¿Quieres estimar tu ahorro?</div>
              <p style={{ margin: "0 auto 16px", fontSize: 13.5, lineHeight: 1.55, color: C.muted, maxWidth: 440 }}>
                Agrega 1-2 procesos concretos y calculamos, en 2 minutos, cuántas horas y pesos podrías ahorrar automatizándolos.
                Puedes enviar el diagnóstico con o sin este paso.
              </p>
              <button onClick={() => setAhorroActivo(true)} style={{ ...btn, width: "auto", padding: "12px 22px" }}>
                Estimar mi ahorro (opcional)
              </button>
            </div>
          ) : (
            <div style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "2px", color: C.blue }}>PASO OPCIONAL</div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>Estimación de ahorro</div>
                </div>
                <button onClick={() => setAhorroActivo(false)} style={{ background: "none", border: "none", color: C.faint, fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                  Quitar este paso
                </button>
              </div>
              <AhorroEstimator procesos={procesos} setProcesos={setProcesos} />
            </div>
          )}
        </div>

        {/* Aside */}
        <aside className="dx-aside">
          {/* Panel de fricción */}
          <div style={{ background: C.navy, color: "#fff", borderRadius: 20, padding: 28 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "2.5px", color: C.cyan, marginBottom: 18 }}>TU ÍNDICE DE FRICCIÓN</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1 }}>{indice ?? "—"}</div>
              {nivel && <div style={{ fontSize: 14, fontWeight: 700, color: nivel.color }}>{nivel.txt}</div>}
            </div>
            <div style={{ fontSize: 12.5, color: C.faint, marginTop: 4 }}>{contestadas} de {TOTAL_Q} preguntas respondidas</div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.14)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: "#5A7699", marginBottom: 10 }}>FRICCIÓN POR ÁREA</div>
              {areaBars.map((d) => (
                <div key={d.corto} style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                    <b style={{ fontWeight: 700, color: "#fff" }}>{d.corto}</b>
                    <span className="font-mono" style={{ color: "#5A7699" }}>{d.pct ?? "—"}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,.1)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 99,
                        width: `${d.pct ?? 0}%`,
                        background: (d.pct ?? 0) >= 60 ? C.orange : C.cyan,
                        transition: "width .25s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {ahorroActivo && (
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.14)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: "#5A7699", marginBottom: 8 }}>AHORRO ESTIMADO (OPCIONAL)</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.cyan, lineHeight: 1 }}>{fmtCLP.format(ahorroTotals.mes)}</div>
                <div style={{ fontSize: 12, color: C.faint, marginTop: 3 }}>al mes · {ahorroTotals.horas} h/mes automatizables</div>
              </div>
            )}

            <div style={{ marginTop: 16, fontSize: 11, lineHeight: 1.5, color: "#5A7699" }}>
              * Resultado referencial. En la sesión de diagnóstico lo revisamos contigo y lo traducimos a oportunidades
              concretas de automatización.
            </div>
          </div>

          {/* Contacto / confirmación */}
          {status === "ok" ? (
            <div style={{ ...contactCard, textAlign: "center", border: "1.5px solid #B7E4C7", padding: 28 }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", background: "#E8FBF1", color: "#18A45C", fontSize: 20, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                ✓
              </span>
              <div style={{ fontSize: 16, fontWeight: 800, margin: "14px 0 6px" }}>¡Recibido, {firstName}!</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Te contactaremos en menos de 24 horas con el análisis de tus respuestas
                {ahorroActivo ? " y tu estimación de ahorro" : ""}.
              </div>
            </div>
          ) : (
            <div style={contactCard}>
              <div style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 4 }}>Recibe tu resultado comentado</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>
                Te enviamos el análisis de tus respuestas con las oportunidades que vemos. Sin compromiso.
              </div>
              <div className="flex flex-col gap-2.5">
                <input style={field} placeholder="Nombre" value={contact.nombre} onChange={(e) => setContact({ ...contact, nombre: e.target.value })} />
                <input style={field} type="email" placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                <input style={field} placeholder="Empresa (opcional)" value={contact.empresa} onChange={(e) => setContact({ ...contact, empresa: e.target.value })} />
                <input style={field} placeholder="Rubro o industria (opcional)" value={contact.rubro} onChange={(e) => setContact({ ...contact, rubro: e.target.value })} />
                <button onClick={enviar} disabled={status === "loading"} style={btn}>
                  {status === "loading" ? "Enviando…" : "Enviar diagnóstico →"}
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
            <span style={{ fontSize: 12, fontWeight: 500, color: C.faint, marginLeft: 8 }}>Tu operación, en piloto automático.</span>
          </span>
          <span style={{ fontSize: 12.5, color: C.faint }}>hola@nubolabs.ai · © {new Date().getFullYear()} Nubolabs</span>
        </div>
      </footer>

      <style>{`
        .dx-grid{display:grid;grid-template-columns:1fr 380px;gap:28px;align-items:start}
        .dx-aside{position:sticky;top:20px;display:flex;flex-direction:column;gap:16px}
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

const wrap: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "22px 32px", width: "100%" };
const badge: React.CSSProperties = {
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
};
const card: React.CSSProperties = { background: "#fff", border: `1px solid ${C.cardBorder}`, borderRadius: 18, overflow: "hidden" };
const aNum: React.CSSProperties = {
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
};
const lbl: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6 };
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
