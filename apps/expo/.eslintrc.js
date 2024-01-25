/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  root: true,
  extends: ["@ramble/eslint-config"],
  ignorePatterns: ["*.config.js", "*.config.ts", "node_modules"],
  rules: {
    "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
  },
}
