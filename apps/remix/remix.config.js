const { flatRoutes } = require("remix-flat-routes")

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/*"],
  serverModuleFormat: "cjs",
  future: {
    cssSideEffectImports: true,
  },
  tailwind: true,
  postcss: true,
  serverDependenciesToBundle: [
    "@ramble/api",
    "@ramble/database",
    "@ramble/database/types",
    "@ramble/emails",
    "@ramble/shared",
    "@ramble/tailwind-config",
    "axios",
    "decode-uri-component",
    "filter-obj",
    "kdbush",
    "query-string",
    "split-on-first",
    "supercluster",
    /remix-utils/,
  ],
  watchPaths: ["../../packages/**/*", "./tailwind.config.js"],
  routes: (defineRoutes) => {
    return flatRoutes("pages", defineRoutes)
  },
}
