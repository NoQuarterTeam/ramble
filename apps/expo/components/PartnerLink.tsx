import { TouchableOpacity, useColorScheme } from "react-native"
import { Image } from "expo-image"
import * as WebBrowser from "expo-web-browser"

import { isPartnerSpot, type SpotPartnerFields } from "@ramble/shared"

import { WEB_URL } from "../lib/config"
import { Text } from "./ui/Text"
import { toast } from "./ui/Toast"

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
  const theme = useColorScheme() || "light"
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

  const handleOpen = async () => {
    try {
      await WebBrowser.openBrowserAsync(props.spot.sourceUrl || "", {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      })
    } catch {
      toast({ type: "error", title: "Error opening link" })
    }
  }

  if (!props.spot.sourceUrl) return null
  return (
    <TouchableOpacity
      onPress={handleOpen}
      className="rounded-xs flex flex-row items-center justify-between border border-gray-200 p-1.5 px-2.5 dark:border-gray-700/70"
    >
      <Text className="text-base">Provided by</Text>
      <Image
        contentFit="contain"
        className="h-[40px] w-[120px] bg-right object-contain"
        source={{ uri: WEB_URL + partner.logo[theme] }}
      />
    </TouchableOpacity>
  )
}
