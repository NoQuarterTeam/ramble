import Mapbox, { StyleImport } from "@rnmapbox/maps"
import * as React from "react"
import { useColorScheme } from "react-native"

import { merge } from "@ramble/shared"

Mapbox.setAccessToken("pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw")

type MapViewProps = React.ComponentProps<typeof Mapbox.MapView>

export const MapView = React.forwardRef<Mapbox.MapView, MapViewProps & { children?: React.ReactNode }>(
  function _Map(props, mapRef) {
    const styleURL = props.styleURL || "mapbox://styles/mapbox/standard"
    return (
      <Mapbox.MapView
        logoEnabled={false}
        compassEnabled
        attributionPosition={{ top: 0, left: 10 }}
        // pitchEnabled={false}
        ref={mapRef}
        compassFadeWhenNorth
        scaleBarEnabled={false}
        {...props}
        styleURL={styleURL}
        className={merge("w-full flex-1", props.className)}
      >
        {props.children}
        <ThemeSwitcher styleUrl={styleURL} />
      </Mapbox.MapView>
    )
  },
)

function ThemeSwitcher(props: { styleUrl: string }) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const isDark = useColorScheme() === "dark"
  const lightPreset = isDark ? "night" : "day"

  React.useEffect(() => {
    setIsLoaded(false)
    if (props.styleUrl === "mapbox://styles/mapbox/standard") {
      new Promise((resolve) => setTimeout(resolve, 0)).then(() => setIsLoaded(true))
    }
  }, [props.styleUrl])

  if (!isLoaded || props.styleUrl !== "mapbox://styles/mapbox/standard") return null

  return <StyleImport id="basemap" existing config={{ lightPreset }} />
}
