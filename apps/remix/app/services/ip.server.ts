import { getClientIPAddress } from "remix-utils"

import { IPAPI_KEY } from "~/lib/config.server"

export async function getIpInfo(request: Request) {
  const ip = getClientIPAddress(request)
  if (!ip) return null
  const res = await fetch(`http://api.ipapi.com/api/${ip}?access_key=${IPAPI_KEY}`)
  const data = (await res.json()) as IPInfo
  return {
    ip: data.ip,
    city: data.city,
    country: data.country_name,
    latitude: data.latitude,
    longitude: data.longitude,
  }
}

interface Location {
  geoname_id: number
  capital: string
  languages: Language[]
  country_flag: string
  country_flag_emoji: string
  country_flag_emoji_unicode: string
  calling_code: string
  is_eu: boolean
}

interface Language {
  code: string
  name: string
  native: string
}

interface TimeZone {
  id: string
  current_time: string
  gmt_offset: number
  code: string
  is_daylight_saving: boolean
}

interface Currency {
  code: string
  name: string
  plural: string
  symbol: string
  symbol_native: string
}

interface Connection {
  asn: number
  isp: string
}

interface Security {
  is_proxy: boolean
  proxy_type: string | null
  is_crawler: boolean
  crawler_name: string | null
  crawler_type: string | null
  is_tor: boolean
  threat_level: string
  threat_types: string[] | null
}

interface IPInfo {
  ip: string
  hostname: string
  type: string
  continent_code: string
  continent_name: string
  country_code: string
  country_name: string
  region_code: string
  region_name: string
  city: string
  zip: string
  latitude: number
  longitude: number
  location: Location
  time_zone: TimeZone
  currency: Currency
  connection: Connection
  security: Security
}
