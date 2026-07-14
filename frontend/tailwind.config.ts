import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2EEE2",       // thermal-paper cream
        ink: "#211F1C",         // near-black ink
        rail: "#C9C2AC",        // rail / dashed divider tone
        stamp: "#B3231C",       // rubber-stamp red accent
        stampdark: "#7A1712",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        perforation:
          "radial-gradient(circle, transparent 4px, #F2EEE2 4px) top / 16px 8px repeat-x",
      },
    },
  },
  plugins: [],
};
export default config;
