import { useLoaderData } from "@remix-run/react"
import { db } from "~/lib/db.server"
import { json } from "~/lib/remix.server"

export const loader = async () => {
  const spotCount = await db.spot.count()
  const userCount = await db.user.count()
  return json({ spotCount, userCount })
}

export default function AdminHome() {
  const { spotCount, userCount } = useLoaderData<typeof loader>()
  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      <div>
        <h2 className="font-normal">Spots</h2>
        <p className="text-2xl">{spotCount}</p>
      </div>
      <div>
        <h2 className="font-normal">Users</h2>
        <p className="text-2xl">{userCount}</p>
      </div>
    </div>
  )
}
