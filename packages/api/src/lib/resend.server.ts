import { Resend } from "resend"

import { RESEND_API_KEY } from "./env"

export const resend = new Resend(RESEND_API_KEY)
