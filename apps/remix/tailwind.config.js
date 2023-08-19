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
    },
    fontFamily: {
      serif: ["Poppins", "sans-serif"],
      sans: ["Poppins", "sans-serif"],
      mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-radix"),
    require("tailwind-scrollbar-hide"),
    require("@tailwindcss/container-queries"),
  ],
}
