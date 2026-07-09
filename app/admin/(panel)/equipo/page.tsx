import { TeamEditor } from "@/components/admin/TeamEditor";
import { getSiteConfig, getTeamMembers } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminEquipo() {
  const [{ content }, members] = await Promise.all([getSiteConfig(), getTeamMembers()]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Nuestro equipo</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Historia del equipo e integrantes (foto, cargo y habilidades). Se muestran en la página{" "}
        <a href="/equipo" target="_blank" className="text-brand hover:underline">/equipo</a>.
      </p>
      <div className="mt-8">
        <TeamEditor initialEquipo={content.equipo} initialMembers={members} />
      </div>
    </div>
  );
}
