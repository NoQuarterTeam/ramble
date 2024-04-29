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
  dt: number
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

    const sunriseLocal = dayjs.unix(json.city.sunrise + timezoneOffset)
    const sunriseLocalHour = Number.parseInt(sunriseLocal.format("H"))
    const sunriseLocalMinute = Number.parseInt(sunriseLocal.format("m"))
    const sunsetLocal = dayjs.unix(json.city.sunset + timezoneOffset)
    const sunsetLocalHour = Number.parseInt(sunsetLocal.format("H"))
    const sunsetLocalMinute = Number.parseInt(sunsetLocal.format("m"))

    const grouped = Object.values(
      groupBy(json.list, (forecast) =>
        dayjs
          .unix(forecast.dt + timezoneOffset)
          .utc()
          .format("YYYY-MM-DD"),
      ),
    )

    grouped.pop() // remove last day, as it will likely be just a partial forecast, not the entire day

    const data = grouped.map((forecasts) =>
      forecasts.map((forecast) => ({
        ...forecast,
        localTime: dayjs
          .unix(forecast.dt + timezoneOffset)
          .utc()
          .format(),
      })),
    )

    const currentLocalTime = dayjs().add(timezoneOffset, "seconds").utc()

    // Adding a fake "now" right at the start to mimmick a real current forecast
    data[0]?.unshift({
      isNow: true,
      localTime: currentLocalTime.format(),
      main: { temp: data[0][0]?.main?.temp || 0 },
      weather: [{ icon: data[0][0]?.weather[0]?.icon || "" }],
      dt: 0,
    })

    data.map((forecasts) => {
      const dailySunrise = dayjs(forecasts[0]?.localTime).set("hour", sunriseLocalHour).set("minute", sunriseLocalMinute)
      const dailySunset = dayjs(forecasts[0]?.localTime).set("hour", sunsetLocalHour).set("minute", sunsetLocalMinute)

      if (currentLocalTime.isBefore(dailySunrise)) {
        // Insert sunrise if the current time is before sunrise
        forecasts.push({
          isSunrise: true,
          localTime: dailySunrise.format(),
          weather: [{ icon: "" }],
          dt: 0,
        })
      }
      if (currentLocalTime.isBefore(dailySunset)) {
        // Insert sunset if the current time is before sunset
        forecasts.push({
          isSunset: true,
          weather: [{ icon: "" }],
          localTime: dailySunset.format(),
          dt: 0,
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

export async function get5DayForecastV2(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.tomorrow.io/v4/weather/forecast?location=${lat}%2C${lon}&timesteps=1d&apikey=${env.TOMORROW_API_KEY}`,
    )
    const json = (await res.json()) as TomorrowWeather

    return json.timelines.daily.map((day) => ({
      time: day.time,
      sunriseTime: day.values.sunriseTime,
      sunsetTime: day.values.sunsetTime,
      weatherCode: day.values.weatherCodeMax,
      windSpeedAvg: Math.round(day.values.windSpeedAvg),
      temperatureAvg: Math.round(day.values.temperatureAvg),
    }))
  } catch (error) {
    console.log(error)
    return null
  }
}

type TomorrowWeather = {
  timelines: {
    daily: {
      time: string
      values: {
        cloudBaseAvg: number
        cloudBaseMax: number
        cloudBaseMin: number
        cloudCeilingAvg: number
        cloudCeilingMax: number
        cloudCeilingMin: number
        cloudCoverAvg: number
        cloudCoverMax: number
        cloudCoverMin: number
        dewPointAvg: number
        dewPointMax: number
        dewPointMin: number
        evapotranspirationAvg: number
        evapotranspirationMax: number
        evapotranspirationMin: number
        evapotranspirationSum: number
        freezingRainIntensityAvg: number
        freezingRainIntensityMax: number
        freezingRainIntensityMin: number
        humidityAvg: number
        humidityMax: number
        humidityMin: number
        iceAccumulationAvg: number
        iceAccumulationLweAvg: number
        iceAccumulationLweMax: number
        iceAccumulationLweMin: number
        iceAccumulationLweSum: number
        iceAccumulationMax: number
        iceAccumulationMin: number
        iceAccumulationSum: number
        moonriseTime: string
        moonsetTime: string
        precipitationProbabilityAvg: number
        precipitationProbabilityMax: number
        precipitationProbabilityMin: number
        pressureSurfaceLevelAvg: number
        pressureSurfaceLevelMax: number
        pressureSurfaceLevelMin: number
        rainAccumulationAvg: number
        rainAccumulationLweAvg: number
        rainAccumulationLweMax: number
        rainAccumulationLweMin: number
        rainAccumulationMax: number
        rainAccumulationMin: number
        rainAccumulationSum: number
        rainIntensityAvg: number
        rainIntensityMax: number
        rainIntensityMin: number
        sleetAccumulationAvg: number
        sleetAccumulationLweAvg: number
        sleetAccumulationLweMax: number
        sleetAccumulationLweMin: number
        sleetAccumulationLweSum: number
        sleetAccumulationMax: number
        sleetAccumulationMin: number
        sleetIntensityAvg: number
        sleetIntensityMax: number
        sleetIntensityMin: number
        snowAccumulationAvg: number
        snowAccumulationLweAvg: number
        snowAccumulationLweMax: number
        snowAccumulationLweMin: number
        snowAccumulationLweSum: number
        snowAccumulationMax: number
        snowAccumulationMin: number
        snowAccumulationSum: number
        snowIntensityAvg: number
        snowIntensityMax: number
        snowIntensityMin: number
        sunriseTime: string
        sunsetTime: string
        temperatureApparentAvg: number
        temperatureApparentMax: number
        temperatureApparentMin: number
        temperatureAvg: number
        temperatureMax: number
        temperatureMin: number
        uvHealthConcernAvg: number
        uvHealthConcernMax: number
        uvHealthConcernMin: number
        uvIndexAvg: number
        uvIndexMax: number
        uvIndexMin: number
        visibilityAvg: number
        visibilityMax: number
        visibilityMin: number
        weatherCodeMax: number
        weatherCodeMin: number
        windDirectionAvg: number
        windGustAvg: number
        windGustMax: number
        windGustMin: number
        windSpeedAvg: number
        windSpeedMax: number
        windSpeedMin: number
      }
    }[]
  }
}
