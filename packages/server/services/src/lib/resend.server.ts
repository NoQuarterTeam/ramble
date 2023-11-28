import { Resend } from "resend"

import { env } from "@ramble/server-env"

export const resend = new Resend(env.RESEND_API_KEY)
