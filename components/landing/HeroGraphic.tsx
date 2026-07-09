// Diagrama "Nubolabs orquestando" — hub central + herramientas conectadas.
// Vectorial y responsive; reemplaza el placeholder del hero.

type Node = {
  title: string;
  status: string;
  x: number; // % ancho
  y: number; // % alto
  bg: string;
  color: string;
  icon: React.ReactNode;
};

const IconMail = (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
    <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M2.5 6 L10 11 L17.5 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
const IconList = (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
    <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M7 8h6M7 11.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconSwap = (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
    <path d="M4 7h10l-3-3M16 13H6l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCheck = (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
    <path d="M4 10.5 L8.5 15 L16 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPie = (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M10 3 V10 H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const nodes: Node[] = [
  { title: "Correo", status: "conectado", x: 50, y: 12, bg: "#EAF1FF", color: "#1565FF", icon: IconMail },
  { title: "CRM", status: "sincronizado", x: 80.6, y: 35.8, bg: "#E6F7F4", color: "#12A594", icon: IconList },
  { title: "Planillas", status: "al día", x: 67.5, y: 82.2, bg: "#EFEAFE", color: "#7C5CFC", icon: IconSwap },
  { title: "Facturación", status: "sin errores", x: 32.5, y: 82.2, bg: "#FFEDEB", color: "#FF6B5E", icon: IconCheck },
  { title: "Reportes", status: "en minutos", x: 19.4, y: 35.8, bg: "#EAF1FF", color: "#1565FF", icon: IconPie },
];

// Puntos donde los conectores tocan el anillo (radio 28 en coords 0-100).
const ringDots = [
  { x: 50, y: 22 },
  { x: 75.96, y: 39.51 },
  { x: 24.04, y: 39.51 },
  { x: 64.84, y: 73.74 },
  { x: 35.16, y: 73.74 },
];

export function HeroGraphic() {
  return (
    <div className="relative mx-auto aspect-[1120/1000] w-full max-w-[520px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#1565FF] to-[#00C2FF] shadow-float [container-type:inline-size]">
      {/* círculos decorativos suaves */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-14 -left-8 h-48 w-48 rounded-full bg-white/10" />

      {/* anillo + conectores (se estira con el contenedor para alinear con los nodos) */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="0.4" strokeDasharray="1.6 1.6" />
        {nodes.map((n) => (
          <line
            key={n.title}
            x1="50"
            y1="50"
            x2={n.x}
            y2={n.y}
            stroke="rgba(255,255,255,.5)"
            strokeWidth="0.4"
            strokeDasharray="1.4 1.4"
          />
        ))}
        {ringDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="0.9" fill="#fff" />
        ))}
      </svg>

      {/* nodo central */}
      <div className="absolute left-1/2 top-1/2 flex aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(11,29,58,.2)]">
        <svg width="34%" viewBox="0 0 122 76" fill="none" className="mb-1">
          <defs>
            <linearGradient id="hgc" x1="10" y1="10" x2="112" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1565FF" />
              <stop offset="1" stopColor="#00C2FF" />
            </linearGradient>
          </defs>
          <path
            d="M32 70 C20 70 11 61 11 50 C11 41 17 34 26 32 C28 20 38 11 50 11 C60 11 69 17 73 26 C76 24 79 23 83 23 C93 23 101 31 101 41 C107 44 111 50 111 57 C111 64.5 105 70 97 70 Z"
            stroke="url(#hgc)"
            strokeWidth="9"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-[clamp(14px,4.4cqw,22px)] font-extrabold leading-none tracking-[-0.5px] text-navy">
          Nubo<span className="text-brand">labs</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[clamp(9px,2.6cqw,12px)] font-semibold text-[#16A34A]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
          orquestando
        </div>
      </div>

      {/* nodos satélite */}
      {nodes.map((n) => (
        <div
          key={n.title}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-[0_6px_18px_rgba(11,29,58,.16)]"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <span
            className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px]"
            style={{ background: n.bg, color: n.color }}
          >
            {n.icon}
          </span>
          <div className="pr-1">
            <div className="text-[12.5px] font-extrabold leading-tight text-navy">{n.title}</div>
            <div className="text-[10.5px] font-semibold leading-tight text-[#16A34A]">✓ {n.status}</div>
          </div>
        </div>
      ))}

      {/* leyenda inferior */}
      <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-navy/25 px-4 py-2 text-center text-[clamp(10px,2.6cqw,13px)] font-bold text-white backdrop-blur-sm">
        Una sola integración · tus herramientas trabajando juntas
      </div>
    </div>
  );
}
