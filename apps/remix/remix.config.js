const { flatRoutes } = require("remix-flat-routes")

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/*"],
  serverModuleFormat: "cjs",
  future: {
    v2_dev: true,
    v2_meta: true,
    v2_routeConvention: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_normalizeFormMethod: true,
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
  ],
  watchPaths: ["../../packages/**/*", "./tailwind.config.js"],
  routes: (defineRoutes) => {
    return flatRoutes("pages", defineRoutes)
  },
}
