/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@ramble/tailwind-config")],
  content: ["./app/**/*.tsx", "./components/**/*.tsx", "./lib/**/*.tsx"],
  theme: {
    fontFamily: {
      300: ["poppins300"],
      400: ["poppins400"],
      500: ["poppins500"],
      600: ["poppins600"],
      700: ["poppins700"],
      800: ["poppins800"],
      900: ["poppins900"],
    },
  },
}
