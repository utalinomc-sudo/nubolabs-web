import { steps } from "@/lib/content";

export function Process() {
  return (
    <section id="modelo" className="container-page py-20">
      <h2 className="mb-10 text-center text-[30px] font-extrabold tracking-[-1px] md:text-[34px]">
        Cómo trabajamos contigo
      </h2>

      <div className="relative grid gap-8 md:grid-cols-5 md:gap-0">
        <div className="absolute left-[10%] right-[10%] top-[22px] hidden border-t-2 border-dashed border-[#C9D6EC] md:block" />
        {steps.map((s) => (
          <div key={s.n} className="relative px-2.5 text-center">
            <span
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border-[5px] border-white font-extrabold text-white"
              style={{ background: s.color }}
            >
              {s.n}
            </span>
            <div className="mb-1.5 mt-2.5 text-[15px] font-bold">{s.title}</div>
            <div className="text-[12.5px] leading-snug text-ink-muted">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
