const { flatRoutes } = require("remix-flat-routes")

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/*"],
  future: {
    unstable_postcss: true,
    v2_meta: true,
    v2_routeConvention: true,
    v2_errorBoundary: true,
    unstable_cssSideEffectImports: true,
    v2_normalizeFormMethod: true,
    unstable_tailwind: true,
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
    "query-string",
    "split-on-first",
  ],
  watchPaths: ["../../packages/**/*"],
  routes: (defineRoutes) => {
    return flatRoutes("pages", defineRoutes)
  },
}
