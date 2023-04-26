const colors = require("./colors")
const plugin = require("tailwindcss/plugin")

// allows writing sq-10 instead of h-10 w-10
const shapes = plugin(function ({ matchUtilities, theme }) {
  matchUtilities(
    {
      sq: (value) => ({ width: value, height: value }),
      circle: (value) => ({ width: value, height: value, borderRadius: "9999px" }),
    },
    { values: theme("spacing") },
  )
})

// /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      spacing: {
        full: "100%",
      },
      borderRadius: {
        xs: "2px",
      },
      colors,
    },
  },
  plugins: [shapes, require("tailwindcss-animate")],
}
