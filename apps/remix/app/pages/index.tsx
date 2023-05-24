import { json, type LoaderArgs, redirect } from "@vercel/remix"

import { LinkButton } from "~/components/LinkButton"
import { getMaybeUser } from "~/services/auth/auth.server"
import { PageContainer } from "../components/PageContainer"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getMaybeUser(request)

  if (user) redirect("/map")
  return json(null)
}

export default function Home() {
  return (
    <PageContainer>
      <div className="flex gap-10 py-32">
        <div className="space-y-2">
          <h1 className="text-4xl font-medium">Everything you need for travelling Europe</h1>
          <p className="text-2xl">1000's of spots, service stations, cafes, parks and more</p>
          <LinkButton size="lg" to="map" className="max-w-min">
            Start exploring
          </LinkButton>
        </div>
        <div>
          <img
            src="/hero.jpg"
            width={400}
            height={400}
            alt="two vans in the forest"
            className="sq-[400px] rounded-md object-cover"
          />
        </div>
      </div>
    </PageContainer>
  )
}
