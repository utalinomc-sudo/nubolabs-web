import { useId } from "react";

type Variant = "gradient" | "dark" | "light";

interface LogoMarkProps {
  width?: number;
  height?: number;
  variant?: Variant;
  /** Color del "hueco" alrededor de los nodos (normalmente el fondo detrás del logo). */
  bg?: string;
}

/**
 * Isotipo Nubolabs — nube + "N" de nodos, con nodo naranjo de acento.
 * Basado en la lámina de identidad de marca (2026).
 */
export function LogoMark({ width = 40, height = 33, variant = "gradient", bg }: LogoMarkProps) {
  const id = useId();
  const grad = `url(#${id})`;

  // Colores por variante (según la lámina de marca)
  let cloud: string, stroke: string, topNode: string, bottomNode: string, hole: string;
  if (variant === "dark") {
    // Sobre fondo navy
    cloud = "#ffffff";
    stroke = "#ffffff";
    topNode = "#00C2FF";
    bottomNode = "#FF6B5E";
    hole = bg ?? "#0B1D3A";
  } else if (variant === "light") {
    // Monocromo sobre fondo claro (conserva el acento naranjo)
    cloud = "#0B1D3A";
    stroke = "#0B1D3A";
    topNode = "#0B1D3A";
    bottomNode = "#FF6B5E";
    hole = bg ?? "#ffffff";
  } else {
    // Degradado sobre fondo claro (por defecto)
    cloud = grad;
    stroke = grad;
    topNode = "#00C2FF";
    bottomNode = "#FF6B5E";
    hole = bg ?? "#ffffff";
  }

  return (
    <svg width={width} height={height} viewBox="0 0 122 100" fill="none" aria-hidden>
      {variant === "gradient" && (
        <defs>
          <linearGradient id={id} x1="10" y1="10" x2="112" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1565FF" />
            <stop offset="1" stopColor="#00C2FF" />
          </linearGradient>
        </defs>
      )}
      {/* Nube */}
      <path
        d="M32 70 C20 70 11 61 11 50 C11 41 17 34 26 32 C28 20 38 11 50 11 C60 11 69 17 73 26 C76 24 79 23 83 23 C93 23 101 31 101 41 C107 44 111 50 111 57 C111 64.5 105 70 97 70 Z"
        stroke={cloud}
        strokeWidth={9}
        strokeLinejoin="round"
      />
      {/* "N" de nodos */}
      <path
        d="M42 78 L42 44 L70 68 L70 40"
        stroke={stroke}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Nodo inferior — acento naranjo */}
      <circle cx="42" cy="87" r="8" fill={bottomNode} stroke={hole} strokeWidth={4} />
      {/* Nodo superior — cian */}
      <circle cx="70" cy="30" r="8" fill={topNode} stroke={hole} strokeWidth={4} />
    </svg>
  );
}

/** Logo completo con la palabra "Nubolabs". */
export function Logo({
  size = "md",
  variant = "gradient",
}: {
  size?: "sm" | "md";
  variant?: Variant;
}) {
  const w = size === "sm" ? 30 : 40;
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark width={w} height={Math.round((w * 100) / 122)} variant={variant} />
      <span
        className={`font-extrabold tracking-[-0.5px] ${size === "sm" ? "text-base" : "text-[22px]"} ${
          variant === "dark" ? "text-white" : "text-navy"
        }`}
      >
        Nubo<span className="text-brand">labs</span>
      </span>
    </span>
  );
}
