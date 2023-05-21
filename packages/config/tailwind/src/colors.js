const twColors = require("tailwindcss/colors")

delete twColors["lightBlue"]
delete twColors["warmGray"]
delete twColors["trueGray"]
delete twColors["coolGray"]
delete twColors["blueGray"]

module.exports = {
  ...twColors,
  primary: twColors.green,
  gray: twColors.stone,
}
