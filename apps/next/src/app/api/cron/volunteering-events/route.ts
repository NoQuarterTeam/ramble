import { db } from "@/lib/server/db"
import type { Prisma } from "@ramble/database/types"
import { IS_DEV, env } from "@ramble/server-env"
import dayjs from "dayjs"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const URL = "https://api.volunteeringevents.com/api/integration/events?limit=100"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!IS_DEV && authHeader !== `Bearer ${env.CRON_SECRET}`) return new Response("Unauthorized", { status: 401 })

    const res = await fetch(URL)
    const data = (await res.json()) as Data
    const events = data.events

    for (const event of events) {
      const data = {
        name: `${event.start_date ? `${event.start_date}: ` : ""}${event.name}`,
        latitude: event.location_lat,
        longitude: event.location_lng,
        description: event.details,
        creator: { connect: { email: "jack@noquarter.co" } },
        verifier: { connect: { email: "jack@noquarter.co" } },
        type: "VOLUNTEERING",
        volunteeringEventsId: event.id,
        sourceUrl: event.url,
      } satisfies Prisma.SpotCreateInput

      const spot = await db.spot.upsert({
        where: { volunteeringEventsId: event.id },
        create: {
          ...data,
          verifiedAt: new Date(),
        },
        update: data,
      })
      try {
        await db.spotImage.create({
          data: {
            spot: { connect: { id: spot.id } },
            coverSpot: { connect: { id: spot.id } },
            path: event.image_url,
            creator: { connect: { email: "jack@noquarter.co" } },
          },
        })
      } catch {}
    }

    return Response.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return Response.json({ ok: false }, { status: 500 })
  }
}

type EventType =
  | "beach_cleanup"
  | "river_cleanup"
  | "trash_picking"
  | "tree_planting"
  | "dog_walking"
  | "helping_shelters"
  | "charity"
  | "other"
  | "social_projects"

type Data = {
  events: {
    id: string
    name: string
    start_date: string | null
    start_time: string
    url: string
    image_url: string
    weekday: string | null
    repeat_schedule: string
    details: string | null
    end_time: string | null
    location_lng: number
    location_lat: number
    event_type: EventType
  }[]
}
