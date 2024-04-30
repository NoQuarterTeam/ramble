import { env } from "@ramble/server-env"
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
      `https://api.tomorrow.io/v4/weather/forecast?location=${lat}%2C${lon}&timesteps=1d&apikey=${env.TOMORROW_API_KEY}`,
    )
    const json = (await res.json()) as TomorrowWeather
    if (!json?.timelines?.daily) return null
    return json.timelines.daily.map((day) => ({
      time: day.time,
      sunriseTime: day.values.sunriseTime,
      sunsetTime: day.values.sunsetTime,
      weatherCode: day.values.weatherCodeMax,
      windSpeedAvg: Math.round(day.values.windSpeedAvg * 3.6), // m/s to km/h,
      temperatureAvg: Math.round(day.values.temperatureAvg),
      temperatureMax: Math.round(day.values.temperatureMax),
      temperatureMin: Math.round(day.values.temperatureMin),
    }))
  } catch (error) {
    console.log(error)
    return null
  }
}

type TomorrowWeather = {
  timelines: {
    daily?: {
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
