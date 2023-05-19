const { flatRoutes } = require("remix-flat-routes")

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/*"],
  serverModuleFormat: "cjs",
  future: {
    unstable_postcss: true,
    v2_meta: true,
    unstable_dev: false,
    v2_routeConvention: true,
    v2_errorBoundary: true,
    cssSideEffectImports: true,
    v2_normalizeFormMethod: true,
    tailwind: true,
  },
  serverDependenciesToBundle: [
    "@ramble/api",
    "@ramble/database",
    "@ramble/database/types",
    "@ramble/emails",
    "@ramble/shared",
    "@ramble/tailwind-config",
    "@ramble/ui",
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
