import { useId } from "react";

type Variant = "gradient" | "dark" | "light";

interface LogoMarkProps {
  width?: number;
  height?: number;
  variant?: Variant;
  bg?: string; // color del "hueco" en los nodos (normalmente el fondo detrás del logo)
}

/** Isotipo: nube + "N" de nodos, con nodo naranjo de acento. */
export function LogoMark({
  width = 40,
  height = 33,
  variant = "gradient",
  bg = "#ffffff",
}: LogoMarkProps) {
  const id = useId();
  const cloudStroke =
    variant === "gradient"
      ? `url(#${id})`
      : variant === "dark"
        ? "#ffffff"
        : "#0B1D3A";
  const arrowStroke = variant === "light" ? "#0B1D3A" : "#ffffff";
  const topNode = variant === "light" ? "#0B1D3A" : "#1565FF";

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
      <path
        d="M32 70 C20 70 11 61 11 50 C11 41 17 34 26 32 C28 20 38 11 50 11 C60 11 69 17 73 26 C76 24 79 23 83 23 C93 23 101 31 101 41 C107 44 111 50 111 57 C111 64.5 105 70 97 70 Z"
        stroke={cloudStroke}
        strokeWidth={9}
        strokeLinejoin="round"
      />
      <path
        d="M42 78 L42 44 L70 68 L70 40"
        stroke={variant === "light" ? "#0B1D3A" : arrowStroke}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="42" cy="87" r="8" fill="#FF6B5E" stroke={bg} strokeWidth={4} />
      <circle cx="70" cy="30" r="8" fill={topNode} stroke={bg} strokeWidth={4} />
    </svg>
  );
}

/** Logo con texto "Nubolabs". */
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
      <LogoMark width={w} height={(w * 33) / 40} variant={variant} />
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
