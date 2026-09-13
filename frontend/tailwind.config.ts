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
        background: "#08090B",
        card: "#0E1115",
        cardHover: "#13171D",
        border: "#1D232C",
        borderHighlight: "#2A323E",
        terminalGreen: "#34C759",
        hazardRed: "#FF3B30",
        alertAmber: "#FF9500",
        quantBlue: "#007AFF",
        textPrimary: "#F0F2F5",
        textSecondary: "#8A94A6",
        textMuted: "#525C6C"
      },
      fontFamily: {
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "Consolas", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"]
      }
    },
  },
  plugins: [],
};

export default config;
