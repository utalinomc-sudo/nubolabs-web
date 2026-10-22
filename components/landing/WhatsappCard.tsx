// Tarjeta "¿Prefieres escribirnos?" junto al formulario (cambio cierre-landing-faq-cta, design.md decisión 8).
// Solo se monta si "Mostrar QR junto al formulario" está activo (whatsappLink(contact, "qr")). Hasta 820 px no se
// muestra el QR (no se puede escanear la propia pantalla): toda la tarjeta es un enlace directo.
import { IconChat } from "@/components/icons";
import { newTabNote, whatsappCard as t } from "@/lib/content";
import { qrPath } from "@/lib/qrSvg";

export function WhatsappCard({ link }: { link: { label: string; url: string } }) {
  const qr = qrPath(link.url);
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-[22px] flex items-center gap-[18px] rounded-[18px] border border-line bg-white px-[18px] py-4 text-[14.5px] text-ink-soft shadow-card transition hover:border-brand-100"
    >
      <svg
        role="img"
        aria-label={t.qrLabel}
        viewBox={qr.viewBox}
        shapeRendering="crispEdges"
        className="hidden h-[104px] w-[104px] flex-none text-navy min-[821px]:block"
      >
        <path fill="currentColor" d={qr.d} />
      </svg>
      <span
        aria-hidden="true"
        className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[14px] bg-brand-light-50 text-brand-deep min-[821px]:hidden"
      >
        <IconChat className="h-[22px] w-[22px]" />
      </span>
      <span>
        <b className="mb-0.5 block text-[15.5px] text-ink">{t.title}</b>
        <span className="hidden min-[821px]:inline">{t.desktop}</span>
        <span className="min-[821px]:hidden">{t.mobile}</span>
        <span className="sr-only">{newTabNote}</span>
      </span>
    </a>
  );
}
