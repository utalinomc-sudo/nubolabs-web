import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B1D3A",
        brand: {
          DEFAULT: "#1565FF",
          light: "#00C2FF",
        },
        accent: "#FF6B5E",
        ink: {
          DEFAULT: "#0B1D3A",
          muted: "#5A6B85",
          soft: "#3D4E6B",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F6F9FE",
          muted: "#F2F4F7",
        },
        line: "#E7EDF7",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(11,29,58,.06)",
        float: "0 12px 30px rgba(11,29,58,.14)",
        cta: "0 8px 20px rgba(21,101,255,.28)",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
