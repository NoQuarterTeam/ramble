import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

const config = {
  darkMode: "class",
  presets: [require("@ramble/tailwind-config")],
  content: ["./app/**/*.{ts,tsx}", "../../packages/shared/**/*.{ts,tsx}"],
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
        serif: ["Urbanist", "sans-serif"],
        sans: ["Urbanist", "sans-serif"],
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".brand-header": {
          "@apply font-serif font-bold italic text-primary": {},
        },
        ".center": {
          "@apply flex items-center justify-center": {},
        },
        ".border-hover": {
          "@apply hover:border-gray-200 dark:hover:border-gray-600": {},
        },
        ".hstack": {
          "@apply flex flex-row items-center space-x-2": {},
        },
        ".vstack": {
          "@apply flex flex-col items-center space-y-2": {},
        },
      })
    }),
    require("@tailwindcss/forms"),
    require("tailwindcss-radix"),
    require("tailwind-scrollbar-hide"),
    require("@tailwindcss/container-queries"),
  ],
} satisfies Config

export default config
