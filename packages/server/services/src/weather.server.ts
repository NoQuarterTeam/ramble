import { env } from "@ramble/server-env"
import { groupBy } from "@ramble/shared"
import dayjs from "dayjs"

// https://openweathermap.org/current
type WeatherResponse = {
  isSunrise?: boolean
  isSunset?: boolean
  // dt: number
  dt_txt: string
  main: {
    temp: number
    // feels_like: number
    // temp_min: number
    // temp_max: number
    // pressure: number
    // humidity: number
  }
  weather: {
    // id: number
    // main: string
    // description: string
    icon: string
  }[]
  // clouds: {
  //   all: number // Cloudiness, %
  // }
  // visibility: number //  Visibility, meter. The maximum value of the visibility is 10 km
  // wind: {
  //   speed: number
  //   deg: number // Wind direction, degrees (meteorological)
  //   gust: number
  // }
  // rain: {
  //   "1h": number // Rain volume for the last 1 hour, mm.
  //   "3h": number // Rain volume for the last 3 hours, mm.
  // }
  // snow: {
  //   "1h": number // Snow volume for the last 1 hour, mm.
  //   "3h": number // Snow volume for the last 3 hours, mm.
  // }
  // pop: number // Probability of precipitation. The values of the parameter vary between 0 and 1, where 0 is equal to 0%, 1 is equal to 100%
}

// https://openweathermap.org/forecast5
type ForecastResponse = {
  list: WeatherResponse[]
  city: {
    sunrise: number // Sunrise time, Unix, UTC
    sunset: number // Sunset time, Unix, UTC
    timezone: number //Shift in seconds from UTC
  }
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
    // console.log("-------------- MUFFIN --------------")
    // console.log(json.city.timezone)
    const timezoneOffset = json.city.timezone
    // const sunriseHour = dayjs.unix(json.city.sunrise).format("H")
    // const sunriseMinute = dayjs.unix(json.city.sunrise).format("m")
    // const sunsetHour = dayjs.unix(json.city.sunset).format("H")
    // const sunsetMinute = dayjs.unix(json.city.sunset).format("m")

    // console.log(json.list)
    const grouped = Object.values(
      groupBy(json.list, (forecast) => dayjs(forecast.dt_txt).add(timezoneOffset, "seconds").format("YYYY-MM-DD")),
    )
    // console.log(grouped)

    grouped[0].unshift(grouped[0][0]) // dupe the very first element, we'll use it as a fake "now" forecast
    grouped.pop() // remove last day, as it will likely be just a partial forecast, not the entire day

    // grouped.map((forecasts) => {
    //   // Insert sunrise
    //   forecasts.push({
    //     isSunrise: true,
    //     dt: dayjs().set("hour", Number.parseInt(sunriseHour)).set("minute", Number.parseInt(sunriseMinute)).unix(),
    //     main: {
    //       temp: 0,
    //     },
    //     weather: [
    //       {
    //         icon: "",
    //       },
    //     ],
    //   })
    //   // Insert sunset
    //   forecasts.push({
    //     isSunset: true,
    //     dt: dayjs().set("hour", Number.parseInt(sunsetHour)).set("minute", Number.parseInt(sunsetMinute)).unix(),
    //     main: {
    //       temp: 0,
    //     },
    //     weather: [
    //       {
    //         icon: "",
    //       },
    //     ],
    //   })
    //   // forecasts.sort((a, b) => a.dt - b.dt)
    //   // forecasts.map((forecast) => {
    //   //   const forecastTime = dayjs.unix(forecast.dt).format("HH:mm")
    //   //   if (dayjs(forecastTime).diff())
    //   // })
    // })

    // console.log(grouped[0])

    return { timezoneOffset, list: grouped }
  } catch (error) {
    console.log(error)
    return
  }
}
