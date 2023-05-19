/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@ramble/tailwind-config")],
  content: ["./**/*.tsx"],
  theme: {
    fontFamily: {
      body: ["Poppins_400Regular"],
      label: ["Poppins_600SemiBold"],
      heading: ["Poppins_700Bold"],
      "extra-thick": ["Poppins_900Black"],
    },
  },
}
