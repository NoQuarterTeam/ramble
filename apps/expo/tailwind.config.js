/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@ramble/tailwind-config")],
  content: ["./src/**/*.tsx", "../../packages/shared/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fffefe",
        "background-dark": "#241c17",
      },
      fontSize: {
        xxxs: "6.4px",
        xxs: "10px",
      },
      fontFamily: {
        300: ["urbanist300"],
        "300-italic": ["urbanist300Italic"],
        400: ["urbanist400"],
        "400-italic": ["urbanist400Italic"],
        500: ["urbanist500"],
        "500-italic": ["urbanist500Italic"],
        600: ["urbanist600"],
        "600-italic": ["urbanist600Italic"],
        700: ["urbanist700"],
        "700-italic": ["urbanist700Italic"],
        800: ["urbanist800"],
        "800-italic": ["urbanist800Italic"],
        900: ["urbanist900"],
        urbanist: ["urbanist700Italic"],
      },
    },
  },
}
