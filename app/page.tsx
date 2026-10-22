import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { parseReferral } from "@/lib/referral";

export const dynamic = "force-dynamic";

type HomeProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// `/?ref=oa` es la misma portada con la franja de O&A (alias de /oa): no se indexa, para no duplicar `/`, y no declara
// canónica (noindex + canónica son señales contradictorias). Sin referido, la canónica es `/` (cubre ?utm_… y ?ref=otro).
export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const { ref } = await searchParams;
  return parseReferral(ref) ? { robots: { index: false, follow: true } } : { alternates: { canonical: "/" } };
}

export default async function HomePage({ searchParams }: HomeProps) {
  const { ref } = await searchParams;
  return <LandingPage referral={parseReferral(ref) ?? undefined} />;
}
