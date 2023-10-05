import { type Spot } from "@ramble/database/types"

import { useTheme } from "~/lib/theme"

interface Props {
  spot: Pick<Spot, "campspaceId" | "campspaceUrl" | "komootId" | "park4nightId" | "surflineId" | "sourceUrl">
}

export const isPartnerSpot = (spot: Pick<Spot, "campspaceId" | "surflineId" | "komootId" | "park4nightId">) =>
  spot.campspaceId || spot.surflineId || spot.komootId || spot.park4nightId

const partners = {
  campspace: { name: "Campspace", logo: { light: "/partners/campspace.svg", dark: "/partners/campspace-dark.svg" } },
  komoot: { name: "Komoot", logo: { light: "/partners/komoot.svg", dark: "/partners/komoot-dark.svg" } },
  park4night: { name: "Park4Night", logo: { light: "/partners/park4night.svg", dark: "/partners/park4night-dark.svg" } },
  surfline: { name: "Surfline", logo: { light: "/partners/surfline.svg", dark: "/partners/surfline-dark.svg" } },
} as const

export function PartnerLink(props: Props) {
  const theme = useTheme()
  if (!isPartnerSpot(props.spot)) return null

  const partner = props.spot.campspaceUrl
    ? partners.campspace
    : props.spot.komootId
    ? partners.komoot
    : props.spot.park4nightId
    ? partners.park4night
    : partners.surfline

  if (!props.spot.sourceUrl) return null
  return (
    <a
      href={props.spot.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="border-hover rounded-xs flex flex-row items-center justify-between gap-6 border px-6 py-2"
    >
      <p className="text-lg">Provided by</p>
      <img className="h-[40px] w-[150px] object-contain" src={partner.logo[theme]} />
    </a>
  )
}
