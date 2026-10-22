// Pie del sitio público, igual en todas las páginas (cambio cierre-landing-faq-cta, design.md decisión 5).
// `sections` = visibilidad del CMS (como en Nav): no se enlazan secciones ni páginas ocultas. `whatsapp` solo llega
// si está activado en /admin/config → Contacto (whatsappLink). Sin correo público hasta tener hola@nubolabs.cl.
import Link from "next/link";
import { IconCalendar, IconChat, IconGlobe } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { NAVY_950 } from "@/lib/brandColors";
import { contact, footerLinks as f, newTabNote } from "@/lib/content";

interface FooterProps {
  sections?: Record<string, boolean>;
  whatsapp?: { label: string; url: string } | null;
  stickyCta?: boolean; // en celular deja espacio para la CTA fija de la portada
}

const linkClass = "inline-flex min-h-8 items-center gap-2 transition hover:text-white";
const headingClass = "mb-3.5 font-mono text-xs font-semibold uppercase tracking-[1.8px] text-white";

export function Footer({ sections = {}, whatsapp = null, stickyCta = false }: FooterProps) {
  const visible = (key?: string) => !key || sections[key] !== false;
  const nubolabs = f.nubolabs.links.filter((l) => visible(l.section));

  return (
    <footer className={`bg-navy-950 pt-16 text-[14.5px] text-inverse ${stickyCta ? "pb-24 sm:pb-7" : "pb-7"}`}>
      <div className="container-page">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/#inicio" aria-label="Nubolabs — inicio" className="inline-flex">
              <Logo variant="dark" bg={NAVY_950} />
            </Link>
            <p className="mt-3.5 max-w-[280px]">{f.tagline}</p>
          </div>

          {visible(f.servicios.section) && (
            <div>
              <h2 className={headingClass}>{f.servicios.title}</h2>
              <ul className="flex flex-col gap-1.5">
                {f.servicios.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nubolabs.length > 0 && (
            <div>
              <h2 className={headingClass}>{f.nubolabs.title}</h2>
              <ul className="flex flex-col gap-1.5">
                {nubolabs.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className={headingClass}>{f.contacto.title}</h2>
            <ul className="flex flex-col gap-1.5">
              <li>
                <a href={contact.webUrl} className={linkClass}>
                  <IconGlobe className="h-4 w-4 flex-none text-brand-light" />
                  {contact.webLabel}
                </a>
              </li>
              {whatsapp && (
                <li>
                  <a
                    href={whatsapp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${f.whatsappSr}${whatsapp.label}${newTabNote}`}
                    className={linkClass}
                  >
                    <IconChat className="h-4 w-4 flex-none text-brand-light" />
                    {whatsapp.label}
                  </a>
                </li>
              )}
              <li>
                <Link href={visible("contacto") ? "/#contacto" : "/diagnostico"} className={linkClass}>
                  <IconCalendar className="h-4 w-4 flex-none text-brand-light" />
                  {f.contacto.agendar}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-11 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/[0.08] pt-[22px] text-[13px] text-inverse-faint">
          <span>
            © {new Date().getFullYear()} Nubolabs · {f.hechoEn}
          </span>
          <Link
            href="/privacidad"
            className="inline-flex min-h-8 items-center text-inverse-muted underline underline-offset-[3px] hover:text-white"
          >
            {f.privacidad}
          </Link>
        </div>
      </div>
    </footer>
  );
}
