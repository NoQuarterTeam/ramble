const twColors = require("tailwindcss/colors")

delete twColors["lightBlue"]
delete twColors["warmGray"]
delete twColors["trueGray"]
delete twColors["coolGray"]
delete twColors["blueGray"]

module.exports = {
  ...twColors,
  primary: { DEFAULT: twColors.orange[600], ...twColors.orange },
  gray: twColors.stone,
}
