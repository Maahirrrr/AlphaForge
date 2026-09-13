import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface0: "#08090B",
        surface1: "#0D1117",
        surface2: "#131822",
        surface3: "#1A2230",
        surface4: "#242E40",
        background: "#08090B",
        card: "#131822",
        cardHover: "#1A2230",
        border: "#1E2635",
        borderHighlight: "#2E3A4E",
        terminalGreen: "#22C55E",
        hazardRed: "#EF4444",
        alertAmber: "#F59E0B",
        quantBlue: "#007AFF",
        icyBlue: "#38BDF8",
        textPrimary: "#F0F3F8",
        textSecondary: "#8A94A6",
        textMuted: "#4F596A"
      },
      fontFamily: {
        mono: ["JetBrains Mono", "IBM Plex Mono", "SF Mono", "Menlo", "Consolas", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ticker: "ticker 40s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
