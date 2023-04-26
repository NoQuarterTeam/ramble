/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  root: true,
  extends: ["@travel/eslint-config"],
  rules: {
    "react/function-component-definition": "off",
  },
}
