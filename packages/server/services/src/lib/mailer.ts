import { IS_PRODUCTION } from "@ramble/server-env"
import { render } from "@react-email/render"
import * as Sentry from "@sentry/nextjs"
import nodemailer from "nodemailer"

import { resend } from "./resend"

type CreateEmailOptions = Parameters<typeof resend.emails.create>[0]

type Props = Omit<CreateEmailOptions, "from"> & { react: React.ReactElement<unknown>; from?: string }
class Mailer {
  async send(args: Props) {
    try {
      const from = args.from || "hello@ramble.guide"
      if (IS_PRODUCTION) {
        await resend.emails.send({ ...args, from, text: args.text || "" })
      } else {
        await this.sendDev({ ...args, from })
      }
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  private async sendDev(args: Props) {
    const devMail = nodemailer.createTransport({ host: "localhost", port: 1025, secure: false, debug: true, ignoreTLS: true })
    const html = render(args.react, { pretty: true })
    const text = render(args.react, { plainText: true })
    return devMail.sendMail({ ...args, html, text })
  }
}

export const mailer = new Mailer()
