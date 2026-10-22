// Íconos SVG inline (stroke), tamaño heredado por el contenedor.
type P = { className?: string };

export const IconSearch = ({ className }: P) => (
  <svg viewBox="0 0 22 22" fill="none" className={className} aria-hidden="true">
    <circle cx="9.5" cy="9.5" r="5.5" stroke="currentColor" strokeWidth="2.2" />
    <path d="M13.8 13.8 L19 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// ── Íconos del panel "Tu negocio hoy" y del hero (cambio mensaje-principal-pyme) ──
// Mismo estilo: trazo 2, extremos redondeados, viewBox 24.
const stroke = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconWallet = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path {...stroke} d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </svg>
);

export const IconChat = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export const IconPackage = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="m7.5 4.27 9 5.15" />
    <path {...stroke} d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path {...stroke} d="m3.3 7 8.7 5 8.7-5" />
    <path {...stroke} d="M12 22V12" />
  </svg>
);

export const IconCheck = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconBell = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path {...stroke} d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const IconUsers = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle {...stroke} cx="9" cy="7" r="4" />
    <path {...stroke} d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path {...stroke} d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconCalendar = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect {...stroke} width="18" height="18" x="3" y="4" rx="2" />
    <path {...stroke} d="M16 2v4" />
    <path {...stroke} d="M8 2v4" />
    <path {...stroke} d="M3 10h18" />
    <path {...stroke} d="m9 16 2 2 4-4" />
  </svg>
);

export const IconChart = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M3 3v18h18" />
    <path {...stroke} d="M18 17V9" />
    <path {...stroke} d="M13 17V5" />
    <path {...stroke} d="M8 17v-3" />
  </svg>
);

export const IconFile = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path {...stroke} d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path {...stroke} d="M16 13H8" />
    <path {...stroke} d="M16 17H8" />
    <path {...stroke} d="M10 9H8" />
  </svg>
);

export const IconArrowRight = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M5 12h14" />
    <path {...stroke} d="m12 5 7 7-7 7" />
  </svg>
);

export const IconArrowLeft = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M19 12H5" />
    <path {...stroke} d="m12 19-7-7 7-7" />
  </svg>
);

// ── Íconos de las secciones de contenido (cambio lenguaje-sin-jerga, design.md decisión 3) ──
export const IconClock = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle {...stroke} cx="12" cy="12" r="10" />
    <path {...stroke} d="M12 6v6l4 2" />
  </svg>
);

export const IconMoon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export const IconHelp = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle {...stroke} cx="12" cy="12" r="10" />
    <path {...stroke} d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path {...stroke} d="M12 17h.01" />
  </svg>
);

export const IconNote = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
    <path {...stroke} d="M15 3v4a2 2 0 0 0 2 2h4" />
  </svg>
);

export const IconUserX = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle {...stroke} cx="9" cy="7" r="4" />
    <path {...stroke} d="m17 8 5 5" />
    <path {...stroke} d="m22 8-5 5" />
  </svg>
);

export const IconZap = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);

export const IconWrench = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const IconRefresh = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path {...stroke} d="M21 3v5h-5" />
    <path {...stroke} d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path {...stroke} d="M8 16H3v5" />
  </svg>
);

export const IconLayers = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path {...stroke} d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path {...stroke} d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);

export const IconTrend = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <polyline {...stroke} points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline {...stroke} points="16 7 22 7 22 13" />
  </svg>
);

// Ícono por posición. Si el CMS trae más ítems que íconos, se repiten en ciclo.
export const problemIcons = [IconMoon, IconClock, IconWallet, IconHelp, IconNote, IconUserX];
export const serviceIcons = [IconZap, IconChat, IconChart, IconWrench];
export const includeIcons = [IconCalendar, IconSearch, IconFile];

// ── Íconos del cierre (cambio cierre-landing-faq-cta) ──
export const IconChevronDown = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path {...stroke} d="m6 9 6 6 6-6" />
  </svg>
);

export const IconGlobe = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle {...stroke} cx="12" cy="12" r="10" />
    <path {...stroke} d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path {...stroke} d="M2 12h20" />
  </svg>
);
