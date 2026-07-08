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
