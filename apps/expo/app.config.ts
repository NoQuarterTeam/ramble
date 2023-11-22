import { ConfigContext, ExpoConfig } from "expo/config"

const VERSION = "1.0.9"
const BUILD = 14

const splash: ExpoConfig["splash"] = {
  image: "./assets/splash.png",
  resizeMode: "contain",
  backgroundColor: "#fffefe",
  dark: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#241c17",
  },
}

const IS_DEV = process.env.APP_VARIANT === "development"

const defineConfig = (_ctx: ConfigContext): ExpoConfig => ({
  name: IS_DEV ? "Ramble (dev)" : "Ramble",
  description: "Ramble: Van Travel App",
  slug: "ramble",
  scheme: "ramble",
  owner: "noquarter",
  version: VERSION,
  jsEngine: "hermes",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash,
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/b868666b-33e3-40d3-a88b-71c40a54e3dd",
    checkAutomatically: "ON_LOAD",
  },
  assetBundlePatterns: ["**/*"],
  runtimeVersion: {
    policy: "nativeVersion",
  },
  ios: {
    supportsTablet: true,
    icon: "./assets/icon.png",
    config: {
      usesNonExemptEncryption: false,
    },
    bundleIdentifier: IS_DEV ? "co.noquarter.ramble.dev" : "co.noquarter.ramble",
    associatedDomains: ["applinks:ramble.guide", "applinks:dev.ramble.guide"],
    splash,
    infoPlist: {
      LSApplicationQueriesSchemes: ["comgooglemaps"],
    },
    buildNumber: BUILD.toString(),
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#fffefe",
    },
    softwareKeyboardLayoutMode: "resize",
    package: IS_DEV ? "co.noquarter.ramble.dev" : "co.noquarter.ramble",
    splash,
    versionCode: BUILD,
  },
  extra: {
    eas: {
      projectId: "b868666b-33e3-40d3-a88b-71c40a54e3dd",
    },
  },
  plugins: [
    "sentry-expo",
    "expo-localization",
    "./expo-plugins/with-modify-gradle.js",
    "./expo-plugins/android-manifest.plugin.js",
    [
      "expo-location",
      {
        locationWhenInUsePermission: "The app uses your location to show spots that are near to you on the map.",
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
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: "noquarter",
          project: "ramble-app",
        },
      },
    ],
  },
})

export default defineConfig
