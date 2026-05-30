import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette « Noirmoutier » — sable, sel, océan, marais
        sable: {
          50: "#fbf8f3",
          100: "#f5eee1",
          200: "#ead9c0",
          300: "#dcc097",
        },
        ocean: {
          400: "#5b9aa8",
          500: "#3d8294",
          600: "#2f6a7a",
          700: "#274f5d",
        },
        marais: {
          400: "#8fa68a",
          500: "#6e8a6a",
          600: "#566e53",
        },
        sel: "#fdfcfa",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(39, 79, 93, 0.15)",
        card: "0 2px 16px -4px rgba(39, 79, 93, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
