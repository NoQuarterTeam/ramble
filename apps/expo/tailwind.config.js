/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@ramble/tailwind-config")],
  content: ["./app/**/*.tsx", "./components/**/*.tsx", "./lib/**/*.tsx"],
  theme: {
    fontFamily: {
      400: ["Poppins_400Regular"],
      600: ["Poppins_600SemiBold"],
      700: ["Poppins_700Bold"],
      900: ["Poppins_900Black"],
    },
  },
}
