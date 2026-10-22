"use client";

// Guarda el referido de la visita en la pestaña (cambio landing-referidos-oa, design.md decisión 4). Sin interfaz.
import { useEffect } from "react";
import type { Referral } from "@/lib/leadOptions";
import { rememberReferral } from "@/lib/referral";

export function ReferralTracker({ referral }: { referral: Referral }) {
  useEffect(() => {
    rememberReferral(referral);
  }, [referral]);
  return null;
}
