// https://api.unsplash.com/search/photos?client_id=9DxGMR7AzdjcdtU7gb7D_xHIB462W0xDPMmdFylIMh8&page=1&per_page=1&orientation=landscape&query=morzine

import { env } from "@ramble/server-env"

export async function getPlaceUnsplashImage(query: string) {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?client_id=${env.UNSPLASH_ACCESS_KEY}&page=1&per_page=1&orientation=landscape&query=${query}`,
  )

  const json = (await res.json()) as Res
  if (json.results.length === 0) return null

  return json.results[0]?.urls.thumb || null
}

type Res = {
  results: { urls: { thumb: string } }[]
}
