const OFF = "off"
const ERROR = "error"
/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  root: true,
  //  TODO: temp sharing configs not working right now
  // extends: ["@travel/eslint-config", "@remix-run/eslint-config", "@remix-run/eslint-config/node"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "tailwindcss"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-var-requires": OFF,
    "react/function-component-definition": ERROR,
    "@typescript-eslint/no-unused-vars": [ERROR, { args: "none", argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "react/prop-types": OFF,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
}
