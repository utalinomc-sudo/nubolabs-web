import type { SiteContent } from "@/lib/siteConfig";

// Props comunes de los editores por sección (design.md decisión 5): el valor del formulario, cómo cambiarlo y los
// textos recomendados (defaults vigentes) para "Usar los textos recomendados".
export interface EditorProps<K extends keyof SiteContent> {
  value: SiteContent[K];
  onChange: (value: SiteContent[K]) => void;
  defaults: SiteContent[K];
}
