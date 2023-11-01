import { WebClient } from "@slack/web-api"
import { SLACK_TOKEN } from "./env.server"

export const slack = new WebClient(SLACK_TOKEN)

export function sendSlackMessage(text: string) {
  try {
    void slack.chat.postMessage({ channel: "C05TPL2FS9X", text })
  } catch (error) {
    console.log(error)
  }
}
