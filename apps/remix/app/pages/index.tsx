import { LinkButton } from "~/components/LinkButton"

import { PageContainer } from "../components/PageContainer"

export default function Home() {
  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 py-10 md:grid-cols-9 md:py-32">
        <div className="col-span-9 space-y-2 md:col-span-6">
          <h1 className="text-4xl font-medium">Everything you need for travelling Europe</h1>
          <p className="text-2xl">1000's of spots, service stations, cafes, parks and more</p>
          <LinkButton size="lg" to="map" className="max-w-min">
            Start exploring
          </LinkButton>
        </div>
        <div className="col-span-9 md:col-span-3">
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
