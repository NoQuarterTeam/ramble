import { db } from "@/lib/server/db"
import { env } from "@ramble/server-env"
import { type NextRequest, NextResponse } from "next/server"

const subscriptionName = "Ramble membership"

export const POST = async ({ request }: { request: NextRequest }) => {
  const authToken = request.headers.get("Authorization")
  if (!authToken || authToken !== env.REVENUE_CAT_WEBHOOK_TOKEN) throw new Response("Unauthorized", { status: 401 })
  try {
    const payload = (await request.json()) as Data
    if (!payload.event) {
      return NextResponse.json({ success: false, message: "No event found" })
    }
    const user = await db.user.findUnique({ where: { id: payload.event.app_user_id } })
    if (!user) {
      // TODO: how did this happen?
      return NextResponse.json({ success: true, message: "User not found" })
    }

    const customer = await fetch(`https://api.revenuecat.com/v1/subscribers/${user.id}`, {
      headers: { Authorization: env.REVENUE_CAT_API_KEY },
    })
    const customerData = (await customer.json()) as CustomerData

    if (!customerData.subscriber) {
      console.log("No subscriber found", customerData)
      return NextResponse.json({ success: false, message: "No subscriber found" })
    }

    const entitlement = customerData.subscriber.entitlements[subscriptionName]

    const currentSubscription = entitlement ? customerData.subscriber.subscriptions[entitlement.product_identifier] : null

    await db.user.update({
      where: { id: user.id },
      data: {
        planExpiry: entitlement ? entitlement.expires_date : null,
        planCancelledAt: currentSubscription ? currentSubscription.unsubscribe_detected_at : null,
        planId: entitlement ? entitlement.product_identifier : null,
        hasBillingIssue: currentSubscription ? currentSubscription.billing_issues_detected_at !== null : false,
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log("Oops, something went wrong", error)
    return NextResponse.json({ success: false, error: "Unknown error" })
  }
}

interface Subscription {
  auto_resume_date: string | null
  billing_issues_detected_at: string | null
  expires_date: string
  grace_period_expires_date: string | null
  is_sandbox: boolean
  original_purchase_date: string
  ownership_type: string
  period_type: string
  purchase_date: string
  refunded_at: string | null
  store: string
  store_transaction_id: string
  unsubscribe_detected_at: string
}

interface SubscriberAttributes {
  $attConsentStatus: {
    updated_at_ms: number
    value: string
  }
}

interface Subscriber {
  entitlements: {
    [key: string]: {
      expires_date: string
      grace_period_expires_date: string | null
      product_identifier: string
      purchase_date: string
    }
  }
  first_seen: string
  last_seen: string
  management_url: string
  original_app_user_id: string
  original_application_version: string
  original_purchase_date: string
  subscriber_attributes: SubscriberAttributes
  subscriptions: {
    [key: string]: Subscription
  }
}

interface CustomerData {
  request_date: string
  request_date_ms: number
  subscriber: Subscriber
}

type Event = {
  event_timestamp_ms: number
  product_id: string
  purchased_at_ms: number
  expiration_at_ms: number
  environment: string
  entitlement_id: null
  entitlement_ids: null
  presented_offering_id: null
  transaction_id: null
  original_transaction_id: null
  is_family_share: null
  country_code: string
  app_user_id: string
  aliases: string[]
  original_app_user_id: string
  currency: null
  price: null
  price_in_purchased_currency: null
  subscriber_attributes: Record<string, string>
  store: string
  takehome_percentage: null
  offer_code: null
  tax_percentage: null
  commission_percentage: null
  type: string
  id: string
  app_id: string
}
type Data = {
  event?: Event
}
