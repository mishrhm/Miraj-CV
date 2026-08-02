import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Pulled directly from the docx template's ACCENT_COLOR — the web
        // form and the generated resume should read as the same product.
        accent: {
          DEFAULT: "#1F2A44",
          light: "#2D3A5C",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
