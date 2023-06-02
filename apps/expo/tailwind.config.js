/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@ramble/tailwind-config")],
  content: ["./app/**/*.tsx", "./components/**/*.tsx", "./lib/**/*.tsx"],
  theme: {
    fontFamily: {
      300: ["Poppins_300Light"],
      400: ["Poppins_400Regular"],
      500: ["Poppins_500Medium"],
      600: ["Poppins_600SemiBold"],
      700: ["Poppins_700Bold"],
      800: ["Poppins_800ExtraBold"],
      900: ["Poppins_900Black"],
    },
  },
}
