import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Tokens de marca. Los tonos nuevos vienen de la HDU-08 §7 (cambio mensaje-principal-pyme, design.md decisión 1);
      // cada grupo conserva su DEFAULT para no romper las clases existentes.
      colors: {
        navy: {
          DEFAULT: "#0B1D3A",
          950: "#071327",
          800: "#12294F",
          700: "#1B3766",
        },
        brand: {
          DEFAULT: "#1565FF",
          dark: "#0F52D6", // hover del CTA
          deep: "#0A8FD6", // cian oscuro para texto y degradados sobre blanco (3,5:1)
          50: "#EBF1FF",
          100: "#D9E6FF",
          light: {
            DEFAULT: "#00C2FF",
            50: "#E6F9FF",
          },
        },
        accent: {
          DEFAULT: "#FF6B5E",
          strong: "#D63C2F", // texto chico sobre blanco
          50: "#FFEFED",
        },
        success: {
          DEFAULT: "#138A4D", // marcas de completado e íconos (no para texto chico sobre success-50: 4,09:1)
          strong: "#0F7A43", // texto chico sobre success-50 (5,02:1)
          50: "#E8FBF1",
          live: "#22C55E",
        },
        ink: {
          DEFAULT: "#0B1D3A",
          muted: "#5A6B85",
          soft: "#3D4E6B",
          faint: "#93A5C4", // solo decorativo: no cumple contraste para texto
        },
        // Texto sobre fondos navy (cambio lenguaje-sin-jerga). Todos cumplen AA (≥ 4,5:1) sobre navy y sobre navy con velo blanco.
        inverse: {
          DEFAULT: "#B8C7E0", // texto secundario
          strong: "#DCE6F7", // texto de listas destacadas
          muted: "#9FB2D4", // rótulos en mono
          faint: "#7F93B5", // pasos tachados del ejemplo antes/después
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F6F9FE",
          muted: "#F2F4F7",
        },
        line: {
          DEFAULT: "#E7EDF7",
          strong: "#D5DFEE",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(11,29,58,.06)",
        float: "0 12px 30px rgba(11,29,58,.14)",
        cta: "0 8px 20px rgba(21,101,255,.28)",
        lift: "0 18px 44px rgba(11,29,58,.16)", // paneles flotantes
        form: "0 24px 60px rgba(11,29,58,.10)",
      },
      maxWidth: {
        content: "1200px",
      },
      // Animaciones del panel "Tu negocio hoy". Se usan con `motion-safe:` para respetar "reducir movimiento".
      keyframes: {
        feedIn: {
          from: { opacity: "0", transform: "translateY(-12px) scale(.98)" },
          to: { opacity: "1", transform: "none" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
        livePulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,.45)" },
          "70%": { boxShadow: "0 0 0 9px rgba(34,197,94,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
        },
      },
      animation: {
        "feed-in": "feedIn .6s cubic-bezier(.22,1,.36,1)",
        bob: "bob 6s ease-in-out infinite",
        "bob-slow": "bob 7s ease-in-out infinite reverse",
        "live-pulse": "livePulse 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
