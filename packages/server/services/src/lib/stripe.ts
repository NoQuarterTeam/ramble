import { env } from "@ramble/server-env"
import Stripe from "stripe"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY)
