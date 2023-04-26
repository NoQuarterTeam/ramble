process.env.EXPO_ROUTER_APP_ROOT = __dirname + "/src/app"

module.exports = function (api) {
  api.cache(true)
  return {
    presets: [["module:metro-react-native-babel-preset", { useTransformReactJSXExperimental: true }], "babel-preset-expo"],
    plugins: [
      require.resolve("expo-router/babel"),
      ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
      "nativewind/babel",
      "react-native-reanimated/plugin",
    ],
  }
}
