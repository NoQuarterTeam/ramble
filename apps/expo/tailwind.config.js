/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@ramble/tailwind-config")],
  content: ["./app/**/*.tsx", "./components/**/*.tsx", "./lib/**/*.tsx", "../../packages/shared/**/*.{ts,tsx}"],
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
        300: ["poppins300"],
        400: ["poppins400"],
        "400-italic": ["poppins400Italic"],
        500: ["poppins500"],
        600: ["poppins600"],
        700: ["poppins700"],
        800: ["poppins800"],
        900: ["poppins900"],
        urbanist: ["urbanist700Italic"],
      },
    },
  },
}
