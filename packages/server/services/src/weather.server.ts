import { env } from "@ramble/server-env"
import dayjs from "dayjs"

// https://openweathermap.org/current
type WeatherResponse = {
  dt: number
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: { id: number; main: string; description: string; icon: string }[]
  clouds: {
    all: number // Cloudiness, %
  }
  visibility: number //  Visibility, meter. The maximum value of the visibility is 10 km
  wind: {
    speed: number
    deg: number // Wind direction, degrees (meteorological)
    gust: number
  }
  rain: {
    "1h": number // Rain volume for the last 1 hour, mm.
    "3h": number // Rain volume for the last 3 hours, mm.
  }
  snow: {
    "1h": number // Snow volume for the last 1 hour, mm.
    "3h": number // Snow volume for the last 3 hours, mm.
  }
  pop: number // Probability of precipitation. The values of the parameter vary between 0 and 1, where 0 is equal to 0%, 1 is equal to 100%
}

// https://openweathermap.org/forecast5
type ForecastResponse = {
  list: WeatherResponse[]
}

export async function getCurrentWeather(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${env.OPEN_WEATHER_API_KEY}`,
    )
    const json = (await res.json()) as WeatherResponse
    return json
  } catch (error) {
    console.log(error)
    return
  }
}

export async function get5DayForecast(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${env.OPEN_WEATHER_API_KEY}`,
    )
    const json = (await res.json()) as ForecastResponse
    if (!json || !json.list || json.list.length === 0) return
    return json.list
  } catch (error) {
    console.log(error)
    return
  }
}
