import { isPartnerSpot, type SpotPartnerFields } from "@ramble/shared"

import { useTheme } from "~/lib/theme"

interface Props {
  spot: SpotPartnerFields
}

const partners = {
  campspace: { name: "Campspace", logo: { light: "/partners/campspace.svg", dark: "/partners/campspace-dark.svg" } },
  komoot: { name: "Komoot", logo: { light: "/partners/komoot.svg", dark: "/partners/komoot-dark.svg" } },
  park4night: { name: "Park4Night", logo: { light: "/partners/park4night.svg", dark: "/partners/park4night-dark.svg" } },
  surfline: { name: "Surfline", logo: { light: "/partners/surfline.svg", dark: "/partners/surfline-dark.svg" } },
  natuur: { name: "Natuurkampeerterrein", logo: { light: "/partners/natuur.svg", dark: "/partners/natuur.svg" } },
  roadsurfer: { name: "Roadsurfer", logo: { light: "/partners/roadsurfer.svg", dark: "/partners/roadsurfer-dark.svg" } },
  loodusegakoos: { name: "Loodusega koos ", logo: { light: "/partners/loodusegakoos.svg", dark: "/partners/loodusegakoos.svg" } },
  cucortu: { name: "Cucortu'", logo: { light: "/partners/cucortu.png", dark: "/partners/cucortu-dark.png" } },
  theCrag: { name: "The Crag", logo: { light: "/partners/the-crag.svg", dark: "/partners/the-crag-dark.svg" } },
  neste: { name: "Neste", logo: { light: "/partners/neste.png", dark: "/partners/neste.png" } },
} as const

export function PartnerLink(props: Props) {
  const theme = useTheme()
  if (!isPartnerSpot(props.spot)) return null

  const partner = props.spot.campspaceId
    ? partners.campspace
    : props.spot.theCragId
    ? partners.theCrag
    : props.spot.komootId
    ? partners.komoot
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
