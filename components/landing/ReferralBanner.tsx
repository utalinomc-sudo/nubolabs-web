"use client";

// Franja de bienvenida de /oa (cambio landing-referidos-oa, design.md decisión 5; referencia `.ref` de la HDU-08).
// El servidor siempre la entrega abierta; si ya se cerró en esta pestaña, el cliente la oculta al hidratar (lectura con
// useSyncExternalStore: al hidratar usa "abierta", como el servidor, y después lo guardado). Cerrarla no borra el referido.
import { useState, useSyncExternalStore } from "react";
import { IconShield, IconX } from "@/components/icons";
import { referralLabels } from "@/lib/content";
import { isBannerClosed, markBannerClosed } from "@/lib/referral";
import type { SiteContent } from "@/lib/siteConfig";

// sessionStorage no avisa cambios en la misma pestaña: el cierre de esta visita se lleva en estado propio.
const subscribe = () => () => {};
const openOnServer = () => false;

export function ReferralBanner({ content }: { content: SiteContent["referidos"]["oa"] }) {
  const closedBefore = useSyncExternalStore(subscribe, isBannerClosed, openOnServer);
  const [closedNow, setClosedNow] = useState(false);
  if (closedBefore || closedNow) return null;

  function close(e: React.MouseEvent<HTMLButtonElement>) {
    // El foco pasa al primer enlace del menú (que sigue en la página) antes de quitar la franja.
    const next = e.currentTarget.closest('[role="region"]')?.nextElementSibling?.querySelector<HTMLElement>("a, button");
    next?.focus();
    markBannerClosed();
    setClosedNow(true);
  }

  return (
    <div role="region" aria-label={referralLabels.region} className="bg-navy text-[14.5px] text-inverse-strong">
      <div className="container-page flex min-h-[52px] items-center gap-3.5 py-2.5">
        <span className="grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-brand-light/[0.14] text-brand-light">
          <IconShield className="h-[17px] w-[17px]" />
        </span>
        <p className="min-w-0 flex-1 [overflow-wrap:anywhere]">
          <strong className="font-bold text-white">{content.titulo}</strong> {content.texto}
        </p>
        <button
          type="button"
          aria-label={referralLabels.close}
          onClick={close}
          className="grid h-11 w-11 flex-none place-items-center rounded-[10px] text-inverse-muted transition hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-light"
        >
          <IconX className="h-[17px] w-[17px]" />
        </button>
      </div>
    </div>
  );
}
