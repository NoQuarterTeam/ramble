import { WebClient } from "@slack/web-api"
import { SLACK_TOKEN } from "../lib/env"
import { IS_PRODUCTION } from "../lib/config"

export const slack = new WebClient(SLACK_TOKEN)

const username = IS_PRODUCTION ? "Ramble bot" : "Ramble bot (dev)"

export function sendSlackMessage(text: string) {
  try {
    if (!IS_PRODUCTION) return
    void slack.chat.postMessage({ username, channel: "C05TPL2FS9X", text, icon_url: "https://ramble.guide/logo-dark.png" })
  } catch (error) {
    console.log(error)
  }
}
