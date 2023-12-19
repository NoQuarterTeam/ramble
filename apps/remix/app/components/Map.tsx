import "mapbox-gl/dist/mapbox-gl.css"

import * as React from "react"
import ReactGLMap, { GeolocateControl, type MapRef, NavigationControl } from "react-map-gl"

import { useTheme } from "~/lib/theme"

type MapViewProps = React.ComponentProps<typeof ReactGLMap>

export const Map = React.forwardRef<MapRef, MapViewProps & { children?: React.ReactNode }>(function _Map(props, mapRef) {
  const internalMapRef = React.useRef<MapRef>(null)
  const ref = React.useMemo(() => mapRef || internalMapRef, [mapRef, internalMapRef]) as React.MutableRefObject<MapRef>

  const [isLoaded, setIsLoaded] = React.useState(false)
  const theme = useTheme()

  React.useEffect(() => {
    if (!ref?.current) return
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ref.current.setConfigProperty("basemap", "lightPreset", theme === "light" ? "day" : "night")
  }, [theme, ref])

  return (
    <ReactGLMap
      mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
      ref={ref}
      maxZoom={20}
      attributionControl={false}
      // mapStyle={
      //   preferences.mapStyleSatellite
      //     ? "mapbox://styles/jclackett/clp122bar007z01qu21kc8h4g"
      //     : theme === "dark"
      //       ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
      //       : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
      // }
      mapStyle={"mapbox://styles/mapbox/standard"}
      {...props}
      style={{ height: "100%", width: "100%", ...props.style, opacity: isLoaded ? 1 : 0 }}
      onLoad={(e) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        e.target.setConfigProperty("basemap", "lightPreset", theme === "light" ? "day" : "night")
        new Promise((resolve) => setTimeout(resolve, 200)).then(() => {
          setIsLoaded(true)
        })
        props.onLoad?.(e)
      }}
    >
      {props.children}
      <GeolocateControl position="bottom-right" />
      <NavigationControl position="bottom-right" />
    </ReactGLMap>
  )
})
