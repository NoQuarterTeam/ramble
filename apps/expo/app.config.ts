import { ConfigContext, ExpoConfig } from "expo/config"

const defineConfig = (_ctx: ConfigContext): ExpoConfig => ({
  name: "Travel",
  description: "no quarter travel",
  slug: "travel",
  scheme: "travel",
  owner: "noquarter",
  version: "1.0.0",
  jsEngine: "hermes",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
    checkAutomatically: "ON_ERROR_RECOVERY",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    icon: "./assets/icon.png",
    bundleIdentifier: "co.noquarter.travel",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff",
    },
    package: "co.noquarter.travel",
  },
  plugins: ["./expo-plugins/with-modify-gradle.js"],
})

export default defineConfig
