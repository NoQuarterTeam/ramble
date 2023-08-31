import { json } from "~/lib/remix.server"

export const loader = async () => {
  const res = await fetch(
    "https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=d7adbfe03bf54ea0adbfe03bf5fea065",
  )
  const jsonData = await res.json()
  const data = jsonData.seriesInfo.radarEurope.series[0].ts
  return json(data)
}

export const weatherSeriesLoader = loader
