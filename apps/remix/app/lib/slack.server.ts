import { WebClient } from "@slack/web-api"
import { SLACK_TOKEN } from "./env.server"
import { IS_PRODUCTION } from "./config.server"

export const slack = new WebClient(SLACK_TOKEN)

const username = IS_PRODUCTION ? "Ramble bot" : "Ramble bot (dev)"

export function sendSlackMessage(text: string) {
  try {
    void slack.chat.postMessage({ username, channel: "C05TPL2FS9X", text, icon_url: "https://ramble.guide/logo-dark.png" })
  } catch (error) {
    console.log(error)
  }
}
