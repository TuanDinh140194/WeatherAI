import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        typewriter: "typewriter 2s steps(30) forwards"
      },
      keyframes: {
        typewriter: {
          '0%': { width: "0%", overflow: "hidden" },
          '100%': { width: "100%", overflow: "hidden" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
