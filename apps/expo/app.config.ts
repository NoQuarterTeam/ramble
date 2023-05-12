import { ConfigContext, ExpoConfig } from "expo/config"

const defineConfig = (_ctx: ConfigContext): ExpoConfig => ({
  name: "Ramble",
  description: "Ramble: ramble Guide",
  slug: "ramble",
  scheme: "ramble",
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
    bundleIdentifier: "co.noquarter.ramble",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff",
    },
    package: "co.noquarter.ramble",
  },
  plugins: ["./expo-plugins/with-modify-gradle.js"],
})

export default defineConfig
