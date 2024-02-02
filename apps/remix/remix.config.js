// eslint-disable-next-line
const { flatRoutes } = require("remix-flat-routes")

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  cacheDirectory: "./node_modules/.cache/remix",
  serverModuleFormat: "cjs",
  serverBuildTarget: "cjs",
  future: {
    cssSideEffectImports: true,
  },
  serverDependenciesToBundle: [
    /@ramble/,
    /d3-/,
    "axios",
    "decode-uri-component",
    "filter-obj",
    "loops",
    "kdbush",
    "loops",
    "query-string",
    "split-on-first",
    "supercluster",
    "superjson",
    /@vercel\/analytics/,
    /remix-utils/,
  ],
  watchPaths: ["../../packages/**/*", "./tailwind.config.js"],
  routes: (defineRoutes) => {
    return flatRoutes("pages", defineRoutes)
  },
}
