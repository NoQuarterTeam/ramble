import { isPartnerSpot, partners, type SpotPartnerFields } from "@ramble/shared"

import { useTheme } from "~/lib/theme"

interface Props {
  spot: SpotPartnerFields
}

export function PartnerLink(props: Props) {
  const theme = useTheme()
  if (!isPartnerSpot(props.spot)) return null

  const partner = props.spot.campspaceId
    ? partners.campspace
    : props.spot.theCragId
    ? partners.theCrag
    : props.spot.komootId
    ? partners.komoot
    : props.spot.hipcampId
    ? partners.hipcamp
    : props.spot.natuurKampeerterreinenId
    ? partners.natuur
    : props.spot.park4nightId
    ? partners.park4night
    : props.spot.nesteId
    ? partners.neste
    : props.spot.surflineId
    ? partners.surfline
    : props.spot.roadsurferId
    ? partners.roadsurfer
    : props.spot.cucortuId
    ? partners.cucortu
    : partners.loodusegakoos

  if (!props.spot.sourceUrl) return null
  return (
    <a
      href={props.spot.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="border-hover rounded-xs flex cursor-pointer flex-row items-center justify-between gap-6 border px-6 py-2"
    >
      <p className="text-lg">Provided by</p>
      <img className="h-[40px] w-[150px] bg-right object-contain" src={partner.logo[theme]} />
    </a>
  )
}
