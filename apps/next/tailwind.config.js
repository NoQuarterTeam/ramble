/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  presets: [require("@travel/tailwind-config")],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "../../packages/ui/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        nav: "70px",
      },
      fontSize: {
        xxxs: "0.4rem",
        xxs: "0.625rem",
      },
    },
    fontFamily: {
      sans: ["var(--font-custom)"],
      serif: ["var(--font-custom)"],
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-radix")],
}
