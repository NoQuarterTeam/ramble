import * as Application from "expo-application"
import Constants from "expo-constants"
import * as Updates from "expo-updates"

const debuggerHost = Constants.debuggerHost ?? Constants.manifest2?.extra?.expoGo?.debuggerHost
const localhost = debuggerHost?.split(":")[0]

const config = {
  WEB_URL: `http://${localhost || "localhost"}:3000`,
  ENV: "development",
  UPDATE_ID: Updates.updateId?.split("-")[0] || "dev",
  STRIPE_PUBLIC_KEY:
    "pk_test_51Ow2sHJ4RkWCle62YTaQGEawPAPY0BP7xtnHJTmiRrmlrKWWfPZv4ggmj0rYkz8qFSQuVAwfxoj6vROFhA4JISkf00JRb2QUTQ",
}

if (Updates.channel === "production") {
  config.WEB_URL = "https://ramble.guide"
  config.ENV = "production"
  config.STRIPE_PUBLIC_KEY =
    "pk_live_51Ow2sHJ4RkWCle62G72BGhXVHUTUzu3WQX5IFWEfJ8UwWUL9P6KqOEZLynfHy40f8N0NTFs6JnAXOehUAtc2P5Vd00JL43qa3F"
} else if (Updates.channel === "preview") {
  config.WEB_URL = "https://dev.ramble.guide"
  config.ENV = "preview"
}

export const FULL_WEB_URL = config.WEB_URL
export const ENV = config.ENV

export const VERSION = Application.nativeApplicationVersion
export const UPDATE_ID = config.UPDATE_ID

export const IS_DEV = ENV === "development"
export const IS_PREVIEW = ENV === "preview"
export const IS_PRODUCTION = ENV === "production"
