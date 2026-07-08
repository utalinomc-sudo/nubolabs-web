import Link from "next/link";
import { Logo } from "@/components/Logo";

const items = [
  { label: "Dashboard", href: "/admin" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Servicios", href: "/admin/servicios" },
  { label: "Configuración", href: "/admin/config" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
        <Link
          href="/admin/login"
          className="mt-auto rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-muted hover:text-accent"
        >
          Cerrar sesión
        </Link>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
