import { type KnownBlock, WebClient } from "@slack/web-api"

import { env, IS_PRODUCTION } from "@ramble/server-env"

export const slack = new WebClient(env.SLACK_TOKEN)

const username = IS_PRODUCTION ? "Ramble bot" : "Ramble bot (dev)"

export async function sendSlackMessage(text: string, blocks?: KnownBlock[]) {
  try {
    if (!IS_PRODUCTION) return console.log("Slack disabled in dev mode, message: ", text)
    await slack.chat.postMessage({
      username,
      channel: "C05TPL2FS9X",
      text,
      blocks,
      icon_url: "https://ramble.guide/logo-dark.png",
    })
  } catch (error) {
    console.log(error)
  }
}
