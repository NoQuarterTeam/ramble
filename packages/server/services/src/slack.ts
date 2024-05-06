import { IS_PRODUCTION, env } from "@ramble/server-env"
import * as Sentry from "@sentry/nextjs"
import { type KnownBlock, WebClient } from "@slack/web-api"

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
    Sentry.captureException(error)
  }
}
