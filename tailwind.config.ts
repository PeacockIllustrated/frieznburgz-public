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
        fb: {
          primary: "#e71e26",
          secondary: "#fbae29",
          accent: "#ffde5c",
          bg: "#050505",
          surface: "#2f2f2f",
          surfaceSoft: "#43464d",
          text: "#ffffff",
          muted: "#c4c4c4",
          success: "#027a48",
        },
      },
      fontFamily: {
        fbHeading: ["var(--font-fraunces)", "system-ui", "serif"],
        fbBody: ["var(--font-futura)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
