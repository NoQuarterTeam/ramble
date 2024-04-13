import { env } from "@ramble/server-env"
import { groupBy } from "@ramble/shared"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

// https://openweathermap.org/current
type WeatherResponse = {
  isSunrise?: boolean
  isSunset?: boolean
  isNow?: boolean
  localTime: string
  dt_txt?: string
  main?: {
    temp: number
  }
  weather: {
    icon: string
  }[]
}

// https://openweathermap.org/forecast5
type ForecastResponse = {
  list: WeatherResponse[]
  city: {
    sunrise: number // Sunrise time, Unix, UTC
    sunset: number // Sunset time, Unix, UTC
    timezone: number // Shift in seconds from UTC
  }
}

export async function getCurrentWeather(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${env.OPEN_WEATHER_API_KEY}`,
    )
    const json = (await res.json()) as WeatherResponse
    return json?.main && json.weather[0]?.icon ? { temp: json.main.temp, icon: json.weather[0].icon } : null
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function get5DayForecast(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${env.OPEN_WEATHER_API_KEY}`,
    )
    const json = (await res.json()) as ForecastResponse
    if (!json || !json.list || json.list.length === 0) return null
    const timezoneOffset = json.city.timezone

    const sunriseLocalHour = dayjs
      .unix(json.city.sunrise + timezoneOffset)
      .utc()
      .format("H")
    const sunriseLocalMinute = dayjs
      .unix(json.city.sunrise + timezoneOffset)
      .utc()
      .format("m")
    const sunsetLocalHour = dayjs
      .unix(json.city.sunset + timezoneOffset)
      .utc()
      .format("H")
    const sunsetLocalMinute = dayjs
      .unix(json.city.sunset + timezoneOffset)
      .utc()
      .format("m")

    const grouped = Object.values(
      groupBy(json.list, (forecast) => dayjs(forecast.dt_txt).add(timezoneOffset, "seconds").format("YYYY-MM-DD")),
    )

    grouped.pop() // remove last day, as it will likely be just a partial forecast, not the entire day

    const data = grouped.map((forecasts) =>
      forecasts.map((forecast) => ({
        ...forecast,
        localTime: dayjs(forecast.dt_txt).add(timezoneOffset, "seconds").format(),
      })),
    )

    // Adding a fake "now" right at the start to mimmick a real current forecast
    data[0]?.unshift({
      isNow: true,
      localTime: dayjs().add(timezoneOffset, "seconds").utc().format(),
      main: { temp: data[0][0]?.main?.temp || 0 },
      weather: [{ icon: data[0][0]?.weather[0]?.icon || "" }],
    })

    data.map((forecasts) => {
      const dailySunrise = dayjs(forecasts[0]?.localTime)
        .set("hour", Number.parseInt(sunriseLocalHour))
        .set("minute", Number.parseInt(sunriseLocalMinute))
      const dailySunset = dayjs(forecasts[0]?.localTime)
        .set("hour", Number.parseInt(sunsetLocalHour))
        .set("minute", Number.parseInt(sunsetLocalMinute))

      if (dayjs(forecasts[0]?.localTime).isBefore(dailySunrise)) {
        // Insert sunrise
        forecasts.push({
          isSunrise: true,
          localTime: dailySunrise.format(),
          weather: [{ icon: "" }],
        })
      }
      if (dayjs().add(timezoneOffset, "seconds").utc().isBefore(dailySunset)) {
        // Insert sunset
        forecasts.push({
          isSunset: true,
          weather: [{ icon: "" }],
          localTime: dayjs(forecasts[0]?.localTime)
            .set("hour", Number.parseInt(sunsetLocalHour))
            .set("minute", Number.parseInt(sunsetLocalMinute))
            .format(),
        })
      }
      forecasts.sort((a, b) => dayjs(a.localTime).unix() - dayjs(b.localTime).unix())
    })

    return data
  } catch (error) {
    console.log(error)
    return null
  }
}
