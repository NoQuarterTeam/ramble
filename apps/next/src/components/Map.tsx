"use client"
import "mapbox-gl/dist/mapbox-gl.css"

import * as React from "react"
import ReactGLMap, { GeolocateControl, type MapRef, NavigationControl } from "react-map-gl"

type MapViewProps = React.ComponentProps<typeof ReactGLMap>

export const MapView = React.forwardRef<MapRef, MapViewProps & { children?: React.ReactNode }>(function _Map(props, mapRef) {
  const internalMapRef = React.useRef<MapRef>(null)
  const ref = React.useMemo(() => mapRef || internalMapRef, [mapRef]) as React.MutableRefObject<MapRef>

  return (
    <ReactGLMap
      mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
      ref={ref}
      maxZoom={20}
      attributionControl={false}
      {...props}
      mapStyle={"mapbox://styles/mapbox/standard"}
      style={{ height: "100%", width: "100%", ...props.style }}
      onLoad={(e) => {
        props.onLoad?.(e)
        // @ts-ignore
        e.target.setConfigProperty("basemap", "lightPreset", "day")
      }}
    >
      {props.children}
      <GeolocateControl position="bottom-right" />
      <NavigationControl position="bottom-right" />
    </ReactGLMap>
  )
})
