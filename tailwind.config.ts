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
          primary: "var(--fb-primary)",
          secondary: "var(--fb-secondary)",
          accent: "var(--fb-accent)",
          bg: "var(--fb-bg)",
          surface: "var(--fb-surface)",
          surfaceSoft: "var(--fb-surface-soft)",
          text: "var(--fb-text)",
          muted: "var(--fb-muted)",
          success: "var(--fb-success)",
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
