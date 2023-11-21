import Mapbox from "@rnmapbox/maps"
import { usePreferences } from "../lib/hooks/usePreferences"
import { useColorScheme } from "react-native"
import { merge } from "@ramble/shared"

Mapbox.setAccessToken("pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw")

type MapViewProps = React.ComponentProps<typeof Mapbox.MapView>

export function Map(props: MapViewProps & { children: React.ReactNode; ref?: React.Ref<Mapbox.MapView> }) {
  const [preferences] = usePreferences()
  const isDark = useColorScheme() === "dark"
  return (
    <Mapbox.MapView
      logoEnabled={false}
      compassEnabled
      pitchEnabled={false}
      compassFadeWhenNorth
      scaleBarEnabled={false}
      styleURL={
        preferences.mapStyleSatellite
          ? "mapbox://styles/jclackett/clp122bar007z01qu21kc8h4g"
          : isDark
            ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
            : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
      }
      {...props}
      className={merge("flex-1", props.className)}
    />
  )
}
