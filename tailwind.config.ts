import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: "#EEF4FF",
            100: "#D9E6FF",
            200: "#B3CDFF",
            300: "#7FA8F5",
            400: "#4A7FE0",
            500: "#1C57C7",
            600: "#124099",
            700: "#0D3179",
            800: "#0A2760",
            900: "#081D48",
          },
          orange: {
            50: "#FFF3EB",
            100: "#FFE1CC",
            200: "#FFC299",
            300: "#FF9E5C",
            400: "#FF8433",
            500: "#F26B12",
            600: "#D6560A",
            700: "#AD4409",
            800: "#833308",
            900: "#5C2406",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(8, 29, 72, 0.08)",
        "card-hover": "0 8px 24px rgba(8, 29, 72, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
