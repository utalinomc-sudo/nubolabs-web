import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const items = [
  { label: "Dashboard", href: "/admin" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Contenido", href: "/admin/config" },
  { label: "Nuestro equipo", href: "/admin/equipo" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-surface-soft">
      <aside className="hidden w-60 flex-none flex-col border-r border-line bg-white p-5 md:flex">
        <Link href="/" className="mb-8">
          <Logo size="sm" />
        </Link>
        <nav className="flex flex-col gap-1">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-surface-soft hover:text-brand"
            >
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <div className="px-3 text-[11px] text-ink-muted">{session.email}</div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
