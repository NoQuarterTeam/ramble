import { isPartnerSpot, useDisclosure, type SpotPartnerFields } from "@ramble/shared"
import { Modal, TouchableOpacity, useColorScheme } from "react-native"
import { Text } from "./ui/Text"
import { Image } from "expo-image"
import { WEB_URL } from "../lib/config"
import { ModalView } from "./ui/ModalView"
import WebView from "react-native-webview"

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
} as const

export function PartnerLink(props: Props) {
  const modalProps = useDisclosure()
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
    : props.spot.surflineId
    ? partners.surfline
    : props.spot.roadsurferId
    ? partners.roadsurfer
    : props.spot.cucortuId
    ? partners.cucortu
    : partners.loodusegakoos

  if (!props.spot.sourceUrl) return null
  return (
    <>
      <TouchableOpacity
        onPress={modalProps.onOpen}
        className="rounded-xs flex flex-row items-center justify-between border border-gray-200 p-1.5 px-2.5 dark:border-gray-700/70"
      >
        <Text className="text-base">Provided by</Text>
        <Image
          contentFit="contain"
          className="h-[40px] w-[120px] bg-right object-contain"
          source={{ uri: WEB_URL + partner.logo[theme] }}
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        presentationStyle="formSheet"
        visible={modalProps.isOpen}
        onRequestClose={modalProps.onClose}
        onDismiss={modalProps.onClose}
      >
        <ModalView onBack={modalProps.onClose}>
          <WebView source={{ uri: props.spot.sourceUrl }} containerStyle={{ height: "100%" }} />
        </ModalView>
      </Modal>
    </>
  )
}
