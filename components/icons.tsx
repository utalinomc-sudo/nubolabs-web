// Íconos SVG inline (stroke), tamaño heredado por el contenedor.
type P = { className?: string };

export const IconMail = ({ className }: P) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M2.5 6 L10 11 L17.5 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const IconGrid = ({ className }: P) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="3" y="3" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <rect x="11.5" y="3" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="11.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const IconBars = ({ className }: P) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M4 17 V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M10 17 V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M16 17 V8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const IconClock = ({ className }: P) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M10 6 V10 L13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconSearch = ({ className }: P) => (
  <svg viewBox="0 0 22 22" fill="none" className={className}>
    <circle cx="9.5" cy="9.5" r="5.5" stroke="currentColor" strokeWidth="2.2" />
    <path d="M13.8 13.8 L19 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const IconNodes = ({ className }: P) => (
  <svg viewBox="0 0 22 22" fill="none" className={className}>
    <circle cx="6" cy="16" r="3" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="16" cy="6" r="3" stroke="currentColor" strokeWidth="2.2" />
    <path d="M8.2 13.8 L13.8 8.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const IconDoc = ({ className }: P) => (
  <svg viewBox="0 0 22 22" fill="none" className={className}>
    <rect x="4.5" y="3" width="13" height="16" rx="2" stroke="currentColor" strokeWidth="2.2" />
    <path d="M8.5 8.5 H13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M8.5 12.5 H13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const IconAgent = ({ className }: P) => (
  <svg viewBox="0 0 22 22" fill="none" className={className}>
    <path d="M11 3 V19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M4.5 7.2 L17.5 14.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M17.5 7.2 L4.5 14.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const serviceIcons = [IconSearch, IconNodes, IconDoc, IconAgent];
export const problemIcons = [IconMail, IconGrid, IconBars, IconClock];

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
