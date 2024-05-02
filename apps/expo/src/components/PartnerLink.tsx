import { Image } from "expo-image"
import * as WebBrowser from "expo-web-browser"
import { TouchableOpacity, useColorScheme } from "react-native"

import { type SpotPartnerFields, isPartnerSpot, partners } from "@ramble/shared"

import { FULL_WEB_URL } from "~/lib/config"

import { Text } from "./ui/Text"
import { toast } from "./ui/Toast"

interface Props {
  spot: SpotPartnerFields
}

export function PartnerLink(props: Props) {
  const theme = useColorScheme() || "light"
  if (!isPartnerSpot(props.spot)) return null

  const partner = props.spot.campspaceId
    ? partners.campspace
    : props.spot.theCragId
      ? partners.theCrag
      : props.spot.volunteeringEventsId
        ? partners.volunteeringEvents
        : props.spot.komootId
          ? partners.komoot
          : props.spot.natuurKampeerterreinenId
            ? partners.natuur
            : props.spot.park4nightId
              ? partners.park4night
              : props.spot.nesteId
                ? partners.neste
                : props.spot.hipcampId
                  ? partners.hipcamp
                  : props.spot.surflineId
                    ? partners.surfline
                    : props.spot.roadsurferId
                      ? partners.roadsurfer
                      : props.spot.cucortuId
                        ? partners.cucortu
                        : props.spot.loodusegakoosId
                          ? partners.loodusegakoos
                          : props.spot.norcampId
                            ? partners.norcamp
                            : props.spot.mossyEarthId
                              ? partners.mossyEarth
                              : props.spot.rewildingEuropeId
                                ? partners.rewildingEurope
                                : partners.polskiCaravaning

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
      className="flex flex-row items-center justify-between rounded-xs border border-gray-200 p-2 px-3 dark:border-gray-700/70"
    >
      <Text className="text-base">Provided by</Text>
      <Image
        contentFit="contain"
        className="h-[40px] w-1/2 bg-right object-contain"
        source={{ uri: FULL_WEB_URL + partner.logo[theme] }}
      />
    </TouchableOpacity>
  )
}
