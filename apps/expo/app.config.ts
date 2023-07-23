import { ConfigContext, ExpoConfig } from "expo/config"

const defineConfig = (_ctx: ConfigContext): ExpoConfig => ({
  name: "Ramble",
  description: "Ramble: Travel Guide",
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
    url: "https://u.expo.dev/b868666b-33e3-40d3-a88b-71c40a54e3dd",
    checkAutomatically: "ON_LOAD",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    icon: "./assets/icon.png",
    bundleIdentifier: "co.noquarter.ramble",
    associatedDomains: ["applinks:ramble.noquarter.co"],
    infoPlist: {
      LSApplicationQueriesSchemes: ["comgooglemaps"],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    softwareKeyboardLayoutMode: "resize",
    package: "co.noquarter.ramble",
  },
  runtimeVersion: {
    policy: "sdkVersion",
  },
  extra: {
    eas: {
      projectId: "b868666b-33e3-40d3-a88b-71c40a54e3dd",
    },
  },
  plugins: [
    "./expo-plugins/with-modify-gradle.js",
    "./expo-plugins/android-manifest.plugin.js",
    [
      "expo-location",
      {
        locationWhenInUsePermission: "Show current location on map.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "The app accesses your photos to allow you to upload a profile picture and share spot pictures",
      },
    ],
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsImpl: "mapbox",
        RNMapboxMapsDownloadToken: "sk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNsaHVvaXZ4bDAxdjMzY2xiNnE3OHp0dnMifQ.nwE8EhfOoonpunlKdGikiA",
      },
    ],
  ],
})

export default defineConfig
