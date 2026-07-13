import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { LinkedInIcon } from "@/components/LinkedInIcon";
import { getSiteConfig, getTeamMembers } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nuestro equipo — Nubolabs",
  description: "Las personas detrás de Nubolabs: rediseño de procesos, ingeniería e IA.",
};

function Inicial({ nombre }: { nombre: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-light text-3xl font-extrabold text-white">
      {(nombre.trim()[0] || "N").toUpperCase()}
    </div>
  );
}

export default async function EquipoPage() {
  const { visible, content } = await getSiteConfig();
  if (!visible.equipo) notFound();

  const equipo = content.equipo;
  const members = await getTeamMembers();

  return (
    <>
      <Nav showEquipo showMision={visible.nosotros} />
      <main>
        <section className="container-page py-16 md:py-20">
          <div className="mb-3 text-xs font-bold tracking-[2.5px] text-brand">{equipo.eyebrow}</div>
          <h1 className="max-w-3xl text-[34px] font-extrabold leading-[1.1] tracking-[-1.2px] text-balance md:text-[44px]">
            {equipo.title}
          </h1>
          <p className="mt-5 max-w-2xl whitespace-pre-wrap text-lg leading-relaxed text-ink-muted">
            {equipo.historia}
          </p>

          {members.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => (
                <div key={m.id} className="rounded-[20px] border border-line bg-white p-6 shadow-[0_10px_30px_rgba(11,29,58,.05)]">
                  <div className="relative mb-5 h-40 w-40 overflow-hidden rounded-2xl">
                    {m.fotoUrl ? (
                      <Image src={m.fotoUrl} alt={m.nombre} fill className="object-cover" sizes="160px" unoptimized />
                    ) : (
                      <Inicial nombre={m.nombre} />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-lg font-extrabold">{m.nombre}</div>
                    {m.linkedin ? (
                      <a
                        href={m.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn de ${m.nombre}`}
                        className="flex-none text-[#0A66C2] transition hover:opacity-70"
                      >
                        <LinkedInIcon size={22} />
                      </a>
                    ) : null}
                  </div>
                  {m.cargo ? <div className="mt-0.5 text-sm font-semibold text-brand">{m.cargo}</div> : null}
                  {m.habilidades.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.habilidades.map((h, i) => (
                        <span key={i} className="rounded-full bg-surface-soft px-2.5 py-1 text-[12px] font-semibold text-ink-soft">
                          {h}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-12 text-sm text-ink-muted">Pronto presentaremos al equipo.</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
