const plugin = require("tailwindcss/plugin")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  presets: [require("@ramble/tailwind-config")],
  content: ["./app/**/*.{js,ts,jsx,tsx}", "!./app/pages/emails+/**/*"],
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
      colors: {
        background: "var(--background)",
        border: "var(--border)",
      },
      fontFamily: {
        serif: ["Urbanist", "sans-serif"],
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme, config }) {
      addUtilities({
        ".brand-header": {
          "@apply font-serif italic text-primary": {},
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
}
