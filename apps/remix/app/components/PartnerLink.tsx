import { Spot } from "@ramble/database/types"

interface Props {
  spot: Pick<Spot, "campspaceUrl" | "komootId" | "park4nightId">
}

const partner = {
  campspace: { name: "Campspace" },
  komoot: { name: "Komoot" },
  park4night: { name: "Park4Night" },
  surfline: { name: "Surfline" },
} as const

export function PartnerLink(props: Props) {
  if (!props.spot.campspaceUrl || !props.spot.komootId || !props.spot.park4nightId) return null

  const partnerName = props.spot.campspaceUrl
    ? partner.campspace.name
    : props.spot.komootId
    ? partner.komoot.name
    : partner.park4night.name

  return (
    <div>
      <p>Powered by {partnerName}</p>
    </div>
  )
}
