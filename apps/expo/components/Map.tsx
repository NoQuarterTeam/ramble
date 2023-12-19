import * as React from "react"
import { useColorScheme } from "react-native"
import Mapbox, { StyleImport } from "@rnmapbox/maps"

import { merge } from "@ramble/shared"

Mapbox.setAccessToken("pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw")

type MapViewProps = React.ComponentProps<typeof Mapbox.MapView>

export const Map = React.forwardRef<Mapbox.MapView, MapViewProps & { children: React.ReactNode }>(function _Map(props, mapRef) {
  const isDark = useColorScheme() === "dark"
  const lightPreset = isDark ? "night" : "day"

  return (
    <Mapbox.MapView
      logoEnabled={false}
      compassEnabled
      // pitchEnabled={false}
      ref={mapRef}
      compassFadeWhenNorth
      scaleBarEnabled={false}
      // styleURL={
      //   preferences.mapStyleSatellite
      //   ? "mapbox://styles/jclackett/clp122bar007z01qu21kc8h4g"
      //   : isDark
      //   ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
      //   : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
      // }
      styleURL={"mapbox://styles/mapbox/standard"}
      {...props}
      className={merge("flex-1", props.className)}
    >
      {props.children}
      {!props.styleURL && props.styleURL !== "satellite" && <StyleImport id="basemap" existing config={{ lightPreset }} />}
    </Mapbox.MapView>
  )
})
