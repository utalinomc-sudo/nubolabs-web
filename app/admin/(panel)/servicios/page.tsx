import { services } from "@/lib/content";

export default function AdminServicios() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Servicios</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Hoy se editan en <code>lib/content.ts</code>. En una siguiente iteración pueden moverse a Firestore.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <div key={s.title} className="card p-5">
            <div className="font-bold">{s.title}</div>
            <p className="mt-1 text-sm text-ink-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
