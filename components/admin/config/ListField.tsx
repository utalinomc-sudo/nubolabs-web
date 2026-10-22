"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ListFieldProps<T> {
  label: string;
  itemLabel: string; // "Dolor", "Servicio"… (encabezado de cada ítem y nombre de los botones)
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, set: (next: T) => void, index: number) => ReactNode;
  // Largo fijo (resultados, enfoque, proceso): sin agregar, quitar ni mover; el diseño depende de la posición.
  fixed?: boolean;
  min?: number;
  max?: number;
  newItem?: () => T;
  hint?: string;
  inline?: boolean; // ítems de una sola línea (listas de textos), sin tarjeta
}

const btn =
  "grid h-11 min-w-11 place-items-center rounded-md px-2 text-[12px] font-semibold text-ink-soft transition hover:bg-surface-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

// Lista editable para los editores de /admin/config: agregar, quitar, subir y bajar, con mínimo y máximo.
// Cada ítem tiene una clave estable (no su posición): al moverlo, su campo y el foco lo acompañan.
export function ListField<T>({
  label,
  itemLabel,
  items,
  onChange,
  renderItem,
  fixed = false,
  min = 0,
  max = Infinity,
  newItem,
  hint,
  inline = false,
}: ListFieldProps<T>) {
  // Claves deterministas (iguales en el servidor y en el navegador): al inicio, la posición; después, un contador
  // propio de la lista. Si el largo cambió desde afuera (por ejemplo "Usar los textos recomendados"), se rehacen
  // (patrón de React para ajustar estado derivado durante el render).
  const [keys, setKeys] = useState(() => ({ ids: items.map((_, i) => i), next: items.length }));
  const ids = keys.ids;
  if (ids.length !== items.length) {
    setKeys({ ids: items.map((_, i) => keys.next + i), next: keys.next + items.length });
  }

  const listRef = useRef<HTMLDivElement>(null);
  const [focusAfterMove, setFocusAfterMove] = useState<{ id: number; dir: "up" | "down" } | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (!focusAfterMove || !listRef.current) return;
    const row = listRef.current.querySelector<HTMLElement>(`[data-item-id="${focusAfterMove.id}"]`);
    const same = row?.querySelector<HTMLButtonElement>(`[data-move="${focusAfterMove.dir}"]`);
    const other = row?.querySelector<HTMLButtonElement>(`[data-move="${focusAfterMove.dir === "up" ? "down" : "up"}"]`);
    (same && !same.disabled ? same : other)?.focus();
    setFocusAfterMove(null);
  }, [focusAfterMove]);

  const set = (i: number) => (next: T) => onChange(items.map((it, idx) => (idx === i ? next : it)));
  const remove = (i: number) => {
    setKeys({ ...keys, ids: ids.filter((_, idx) => idx !== i) });
    onChange(items.filter((_, idx) => idx !== i));
    setAnnouncement(`${itemLabel} ${i + 1} quitado.`);
  };
  const add = () => {
    setKeys({ ids: [...ids, keys.next], next: keys.next + 1 });
    onChange([...items, newItem!()]);
    setAnnouncement(`${itemLabel} ${items.length + 1} agregado.`);
  };
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    const nextIds = [...ids];
    [nextIds[i], nextIds[i + d]] = [nextIds[i + d], nextIds[i]];
    setKeys({ ...keys, ids: nextIds });
    onChange(next);
    setFocusAfterMove({ id: nextIds[i + d], dir: d === -1 ? "up" : "down" });
    setAnnouncement(`${itemLabel} movido a la posición ${i + d + 1}.`);
  };

  const controls = (i: number) =>
    fixed ? null : (
      <div className="flex flex-none items-center gap-0.5">
        <button
          type="button"
          className={btn}
          data-move="up"
          onClick={() => move(i, -1)}
          disabled={i === 0}
          aria-label={`Subir ${itemLabel} ${i + 1}`}
        >
          ↑
        </button>
        <button
          type="button"
          className={btn}
          data-move="down"
          onClick={() => move(i, 1)}
          disabled={i === items.length - 1}
          aria-label={`Bajar ${itemLabel} ${i + 1}`}
        >
          ↓
        </button>
        <button
          type="button"
          className={`${btn} text-accent-strong`}
          onClick={() => remove(i)}
          disabled={items.length <= min}
          aria-label={`Quitar ${itemLabel} ${i + 1}`}
        >
          Quitar
        </button>
      </div>
    );

  return (
    <div>
      <span className="text-[13px] font-semibold text-ink-soft">{label}</span>
      {hint && <span className="mt-0.5 block text-[11px] text-ink-muted">{hint}</span>}
      <p role="status" className="sr-only">
        {announcement}
      </p>
      <div ref={listRef} className={`mt-2 ${inline ? "space-y-2" : "space-y-3"}`}>
        {items.map((item, i) => {
          const id = ids[i] ?? `tmp-${i}`;
          return inline ? (
            <div key={id} data-item-id={id} className="flex items-center gap-2">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-surface-soft text-xs font-bold text-ink-muted">
                {i + 1}
              </span>
              <div className="flex-1">{renderItem(item, set(i), i)}</div>
              {controls(i)}
            </div>
          ) : (
            <div key={id} data-item-id={id} className="rounded-xl border border-line p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">
                  {itemLabel} {i + 1}
                </span>
                {controls(i)}
              </div>
              <div className="space-y-3">{renderItem(item, set(i), i)}</div>
            </div>
          );
        })}
        {!fixed && newItem && (
          <button
            type="button"
            onClick={add}
            disabled={items.length >= max}
            className="min-h-11 text-sm font-semibold text-brand hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
          >
            + Agregar {itemLabel.toLowerCase()}
            {items.length >= max ? ` (máximo ${max})` : ""}
          </button>
        )}
      </div>
    </div>
  );
}
