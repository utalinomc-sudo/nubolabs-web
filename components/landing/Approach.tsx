import { approach } from "@/lib/content";

export function Approach() {
  return (
    <section className="container-page grid items-center gap-14 py-20 lg:grid-cols-2">
      <div>
        <div className="mb-3.5 text-xs font-bold tracking-[2.5px] text-accent">EL ENFOQUE NUBOLABS</div>
        <h2 className="mb-4 text-[30px] font-extrabold leading-tight tracking-[-1px] text-balance md:text-[34px]">
          Primero rediseñamos el proceso. Después lo automatizamos.
        </h2>
        <p className="text-base leading-relaxed text-ink-muted text-balance">
          Automatizar un proceso mal diseñado solo lo hace fallar más rápido. Por eso partimos
          entendiendo tu operación: simplificamos pasos, eliminamos fricción y recién entonces
          construimos automatizaciones que escalan.
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {approach.map((a) => (
          <div
            key={a.n}
            className={`flex items-center gap-4 rounded-2xl border-[1.5px] bg-white p-[18px_22px] ${
              a.accent ? "border-[#FFD9D4]" : "border-line"
            }`}
          >
            <span
              className={`flex h-9 w-9 flex-none items-center justify-center rounded-[10px] text-[15px] font-extrabold ${
                a.accent ? "bg-[#FFEFED] text-accent" : "bg-[#EBF1FF] text-brand"
              }`}
            >
              {a.n}
            </span>
            <div>
              <div className="text-[15px] font-bold">{a.title}</div>
              <div className="text-[13px] text-ink-muted">{a.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
