"use client";

// Chips de rubro y grilla de casos de "Ejemplos por rubro" (cambio casos-por-rubro, design.md decisión 4). El estado
// inicial ("Todos") coincide con el HTML del servidor, que trae todos los casos: sin JavaScript se ven completos.
import { useState, type ComponentType } from "react";
import { IconBag, IconBriefcase, IconBuilding, IconCar, IconGrid, IconUtensils } from "@/components/icons";
import { availableRubros, filterCases, resultsLabel, rubroLabel, type CaseFilter } from "@/components/landing/casesFilter";
import { casesLabels } from "@/lib/content";
import { hasContent, type CaseItem, type CaseRubro } from "@/lib/siteConfig";

const RUBRO_ICONS: Record<CaseRubro, ComponentType<{ className?: string }>> = {
  todos: IconGrid,
  gastronomia: IconUtensils,
  automotriz: IconCar,
  construccion: IconBuilding,
  servicios: IconBriefcase,
  comercio: IconBag,
};

export function UseCasesFilter({ items }: { items: CaseItem[] }) {
  const [filter, setFilter] = useState<CaseFilter>("all");
  const rubros = availableRubros(items);
  const shown = new Set(filterCases(items, filter));
  const chips: { key: CaseFilter; label: string; Icon: ComponentType<{ className?: string }> }[] = [
    { key: "all", label: casesLabels.all, Icon: IconGrid },
    ...rubros.map((r) => ({ key: r, label: rubroLabel(r), Icon: RUBRO_ICONS[r] })),
  ];

  return (
    <>
      {/* Con menos de 2 rubros (todos "para todos" o uno solo) elegir uno mostraría lo mismo que "Todos": sin chips. */}
      {rubros.length >= 2 && (
        <>
          <div role="group" aria-label={casesLabels.filterGroup} className="mb-7 flex flex-wrap gap-2.5">
            {chips.map(({ key, label, Icon }) => {
              const pressed = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={pressed}
                  // aria-pressed anuncia un botón que se suelta: pulsar el rubro elegido vuelve a "Todos".
                  onClick={() => setFilter(pressed ? "all" : key)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] px-4 py-2.5 text-[14.5px] font-bold transition-[background-color,border-color,color,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-safe:active:scale-[.97] ${
                    pressed ? "border-navy bg-navy text-white" : "border-line-strong bg-white text-ink-soft hover:border-brand hover:text-brand"
                  }`}
                >
                  <Icon className="h-[17px] w-[17px] flex-none" />
                  {label}
                </button>
              );
            })}
          </div>
          <p role="status" className="sr-only">
            {resultsLabel(shown.size, filter)}
          </p>
        </>
      )}

      {/* Los casos ocultos se quitan del render; la clave es la posición original, así los que siguen visibles no se rehacen. */}
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c, i) => {
          if (!shown.has(c)) return null;
          const Icon = RUBRO_ICONS[c.rubro];
          return (
            <li
              key={i}
              className="flex flex-col gap-3.5 rounded-[20px] border border-line bg-white p-[22px] shadow-card motion-safe:animate-feed-in"
            >
              <span className="inline-flex items-center gap-[7px] font-mono text-[11.5px] font-semibold uppercase tracking-[1.2px] text-ink-muted">
                <Icon className="h-4 w-4 flex-none text-brand" />
                {rubroLabel(c.rubro)}
              </span>
              <p className="text-[17px] font-bold leading-[1.4] tracking-[-0.2px] [overflow-wrap:anywhere]">{c.title}</p>
              {hasContent(c.body) && <p className="-mt-1.5 text-[14.5px] leading-relaxed text-ink-muted [overflow-wrap:anywhere]">{c.body}</p>}
            </li>
          );
        })}
      </ul>
    </>
  );
}
