import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      "2xl": { max: "1535px" },
      xl: { max: "1279px" },
      lg: { max: "1023px" },
      md: { max: "767px" },
      sm: { max: "639px" },
    },
    extend: {
      screens: {
        "max-350": { max: "350px" },
      },
      fontFamily: {
        primary: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        black: "#0e1016",
        white: "#fff",
        grey: "#1a1a1a",
      },
    },
  },
  plugins: [],
};
export default config;
