export default function AdminConfig() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Configuración</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Configuración del sitio (banner, contacto, etc.). Placeholder para la primera versión.
      </p>
      <div className="mt-8 card max-w-lg p-6">
        <label className="text-sm font-semibold">Email de contacto</label>
        <input className="field mt-2" defaultValue="hola@nubolabs.ai" />
        <label className="mt-4 block text-sm font-semibold">Texto del banner</label>
        <input className="field mt-2" defaultValue="Tu operación, en piloto automático." />
        <button className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white opacity-60" disabled>
          Guardar (pendiente de Firestore)
        </button>
      </div>
    </div>
  );
}
