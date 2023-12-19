module.exports = function (api) {
  api.cache(true)
  return {
    plugins: [
      ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
      "nativewind/babel",
      ["react-native-reanimated/plugin"],
    ],
    presets: ["babel-preset-expo"],
  }
}
