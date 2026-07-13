import { ConfigEditor } from "@/components/admin/ConfigEditor";
import { getSiteConfig, SECTIONS } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminConfig() {
  const { visible, content } = await getSiteConfig();

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Contenido del sitio</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Edita los textos de la landing y elige qué secciones se muestran. Los cambios se publican al guardar.
      </p>
      <div className="mt-8">
        <ConfigEditor
          sections={SECTIONS}
          initialVisible={visible}
          initialContent={{ hero: content.hero, servicios: content.servicios, casos: content.casos, nosotros: content.nosotros }}
        />
      </div>
    </div>
  );
}
