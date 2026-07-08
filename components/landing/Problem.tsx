import { problems } from "@/lib/content";
import { problemIcons } from "@/components/icons";

export function Problem() {
  return (
    <section className="bg-surface-soft py-16">
      <div className="container-page">
        <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-baseline">
          <h2 className="max-w-[540px] text-[28px] font-extrabold tracking-[-1px] text-balance md:text-[32px]">
            ¿Cuántas horas pierde tu equipo cada semana en esto?
          </h2>
          <span className="max-w-[360px] text-sm leading-relaxed text-ink-muted">
            Tareas que podrían rediseñarse y automatizarse hoy, con la tecnología que ya existe.
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p, i) => {
            const Icon = problemIcons[i];
            return (
              <div key={p.title} className="card p-6">
                <div className="mb-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#EBF1FF] text-brand">
                  <Icon className="h-[19px] w-[19px]" />
                </div>
                <div className="mb-1.5 text-base font-bold">{p.title}</div>
                <div className="text-[13.5px] leading-relaxed text-ink-muted">{p.body}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
