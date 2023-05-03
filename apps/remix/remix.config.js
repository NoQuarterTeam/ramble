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
    v2_routeConvention: true,
    v2_errorBoundary: true,
    cssSideEffectImports: true,
    v2_normalizeFormMethod: true,
    tailwind: true,
  },
  serverDependenciesToBundle: [
    "@travel/api",
    "@travel/database",
    "@travel/database/types",
    "@travel/emails",
    "@travel/shared",
    "@travel/tailwind-config",
    "@travel/ui",
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
