"use client";

// Estimador de ahorro interno (cambio diagnostico-mapa-oportunidades, design.md decisión 6): herramienta del panel para
// preparar propuestas. Mismo cálculo que tenía el diagnóstico (components/diagnostico/ahorro.ts); no guarda nada.
import { useMemo, useState } from "react";
import { AhorroEstimator } from "@/components/diagnostico/AhorroEstimator";
import { blank, calcTotals, fmtCLP, type Proceso } from "@/components/diagnostico/ahorro";

export function EstimadorInterno() {
  const [procesos, setProcesos] = useState<Proceso[]>(() => [blank()]);
  const t = useMemo(() => calcTotals(procesos), [procesos]);
  const n = procesos.length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <AhorroEstimator procesos={procesos} setProcesos={setProcesos} />
      </div>
      <section aria-label="Resumen de la estimación" className="rounded-2xl bg-navy p-6 text-white lg:sticky lg:top-6">
        <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-inverse-muted">
          Ahorro estimado · {n} {n === 1 ? "proceso" : "procesos"}
        </div>
        <div className="mt-2 text-3xl font-extrabold text-brand-light">{fmtCLP.format(t.mes)}</div>
        <div className="text-sm text-inverse">al mes</div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-inverse-muted">A la semana</dt>
            <dd className="font-bold">{fmtCLP.format(t.semana)}</dd>
          </div>
          <div>
            <dt className="text-inverse-muted">Al año</dt>
            <dd className="font-bold">{fmtCLP.format(t.anual)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-inverse-muted">Horas automatizables al mes</dt>
            <dd className="font-bold">{t.horas} h</dd>
          </div>
        </dl>
        <p className="mt-4 text-[12px] leading-relaxed text-inverse-muted">
          Herramienta interna para preparar propuestas: no se guarda ni se muestra al cliente.
        </p>
      </section>
      {/* Columnas del formulario del estimador en pantallas chicas (antes vivían en /diagnostico). */}
      <style>{`@media (max-width:960px){.dx-row3{grid-template-columns:1fr!important}.dx-row2{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
