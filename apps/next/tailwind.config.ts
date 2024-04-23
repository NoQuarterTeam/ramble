import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  presets: [require("@ramble/tailwind-config")],
  content: ["./src/**/*.{ts,tsx}", "../../packages/shared/**/*.{ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        nav: "70px",
        "nav-screen": "calc(100vh - 70px)",
      },
      fontSize: {
        xxxs: "0.4rem",
        xxs: "0.625rem",
      },
      animation: {
        "pulse-fast": "pulse 0.5s linear infinite",
      },
      colors: {
        background: "var(--background)",
        "background-light": "var(--background-light)",
        "background-dark": "var(--background-dark)",
        border: "var(--border)",
      },
      fontFamily: {
        serif: ["var(--font-urbanist)"],
        sans: ["var(--font-urbanist)"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-radix"),
    require("tailwind-scrollbar-hide"),
    require("@tailwindcss/container-queries"),
  ],
} satisfies Config

export default config
