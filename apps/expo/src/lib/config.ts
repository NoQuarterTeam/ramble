import * as Application from "expo-application"
import Constants from "expo-constants"
import * as Updates from "expo-updates"

const debuggerHost = Constants.debuggerHost ?? Constants.manifest2?.extra?.expoGo?.debuggerHost
const localhost = debuggerHost?.split(":")[0]

const config = {
  WEB_URL: `http://${localhost || "localhost"}:3000`,
  ENV: "development" as "development" | "preview" | "production",
  UPDATE_ID: Updates.updateId?.split("-")[0] || "dev",
}

if (Updates.channel === "production") {
  config.WEB_URL = "https://ramble.guide"
  config.ENV = "production"
} else if (Updates.channel === "preview") {
  config.WEB_URL = "https://dev.ramble.guide"
  config.ENV = "preview"
}

export { config }

export const VERSION = Application.nativeApplicationVersion

export const IS_DEV = config.ENV === "development"
export const IS_PREVIEW = config.ENV === "preview"
export const IS_PRODUCTION = config.ENV === "production"
