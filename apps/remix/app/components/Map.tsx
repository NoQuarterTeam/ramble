import "mapbox-gl/dist/mapbox-gl.css"

import * as React from "react"
import ReactGLMap, { GeolocateControl, type MapRef, NavigationControl } from "react-map-gl"

import { useTheme } from "~/lib/theme"

type MapViewProps = React.ComponentProps<typeof ReactGLMap>

export const MapView = React.forwardRef<MapRef, MapViewProps & { children?: React.ReactNode }>(function _Map(props, mapRef) {
  const internalMapRef = React.useRef<MapRef>(null)
  const ref = React.useMemo(() => mapRef || internalMapRef, [mapRef]) as React.MutableRefObject<MapRef>

  const [isLoaded, setIsLoaded] = React.useState(false)
  const theme = useTheme()

  React.useEffect(() => {
    if (!ref.current) return
    if (props.mapStyle) return
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setTimeout(() => ref.current.setConfigProperty("basemap", "lightPreset", theme === "light" ? "day" : "night"), 500)
  }, [theme, ref, props.mapStyle])

  return (
    <ReactGLMap
      mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
      ref={ref}
      maxZoom={20}
      attributionControl={false}
      {...props}
      mapStyle={props.mapStyle || "mapbox://styles/mapbox/standard"}
      style={{ height: "100%", width: "100%", ...props.style, opacity: isLoaded ? 1 : 0 }}
      onLoad={(e) => {
        props.onLoad?.(e)
        if (props.mapStyle) return setIsLoaded(true)
        new Promise((resolve) => setTimeout(resolve, 200)).then(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          e.target.setConfigProperty("basemap", "lightPreset", theme === "light" ? "day" : "night")
          setIsLoaded(true)
        })
      }}
    >
      {props.children}
      <GeolocateControl position="bottom-right" />
      <NavigationControl position="bottom-right" />
    </ReactGLMap>
  )
})
