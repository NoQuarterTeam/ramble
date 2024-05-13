import { IS_PRODUCTION } from "@ramble/server-env"
import { render } from "@react-email/render"
import * as Sentry from "@sentry/nextjs"
import { waitUntil } from "@vercel/functions"
import nodemailer from "nodemailer"

import { resend } from "./resend"

type CreateEmailOptions = Parameters<typeof resend.emails.create>[0]

type Props = Omit<CreateEmailOptions, "from"> & { react: React.ReactElement<unknown>; from?: string }
class Mailer {
  send(args: Props) {
    const from = args.from || "hello@ramble.guide"
    if (IS_PRODUCTION) {
      waitUntil(resend.emails.send({ ...args, from, text: args.text || "" }).catch(Sentry.captureException))
    } else {
      waitUntil(this.sendDev({ ...args, from }).catch(Sentry.captureException))
    }
  }

  private sendDev(args: Props) {
    const devMail = nodemailer.createTransport({ host: "localhost", port: 1025, secure: false, debug: true, ignoreTLS: true })
    const html = render(args.react, { pretty: true })
    const text = render(args.react, { plainText: true })
    return devMail.sendMail({ ...args, html, text })
  }
}

export const mailer = new Mailer()
