import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { getSiteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Misión y visión — Nubolabs",
  description: "La misión, la visión y los objetivos de Nubolabs.",
};

export default async function MisionVisionPage() {
  const { visible, content } = await getSiteConfig();
  if (!visible.nosotros) notFound();

  const n = content.nosotros;

  return (
    <>
      <Nav showEquipo={visible.equipo} showMision={visible.nosotros} />
      <main>
        <section className="container-page py-16 md:py-20">
          <div className="mb-3 text-xs font-bold tracking-[2.5px] text-brand">{n.eyebrow}</div>
          <h1 className="max-w-3xl text-[34px] font-extrabold leading-[1.1] tracking-[-1.2px] text-balance md:text-[44px]">
            {n.title}
          </h1>

          {/* Misión y Visión */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <article className="rounded-[20px] border border-line bg-white p-8 shadow-[0_10px_30px_rgba(11,29,58,.05)]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EBF1FF] text-brand">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="4.5" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                  </svg>
                </span>
                <div className="text-xs font-bold tracking-[2.5px] text-brand">MISIÓN</div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-ink-soft">{n.mision}</p>
            </article>

            <article className="rounded-[20px] border border-line bg-white p-8 shadow-[0_10px_30px_rgba(11,29,58,.05)]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E1F8FF] text-[#00A9E0]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="2.6" />
                  </svg>
                </span>
                <div className="text-xs font-bold tracking-[2.5px] text-[#00A9E0]">VISIÓN</div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-ink-soft">{n.vision}</p>
            </article>
          </div>

          {/* Objetivos */}
          {n.objetivos.length > 0 && (
            <div className="mt-12">
              <div className="text-xs font-bold tracking-[2.5px] text-brand">OBJETIVOS</div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {n.objetivos.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(11,29,58,.04)]"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-brand text-sm font-extrabold text-white">
                      {i + 1}
                    </span>
                    <span className="text-[15px] leading-relaxed text-ink-soft">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
