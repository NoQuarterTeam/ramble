import dayjs from "dayjs"
import { Image } from "expo-image"
import { Sunrise, Sunset } from "lucide-react-native"
import { ScrollView, View } from "react-native"
import type { RouterOutputs } from "~/lib/api"
import { FULL_WEB_URL } from "~/lib/config"
import { Icon } from "./Icon"
import { Text } from "./ui/Text"

interface Props {
  weather: NonNullable<RouterOutputs["spot"]["detail"]["weatherV2"]>
}

export function WeatherWidget(props: Props) {
  return (
    <View className="space-y-2">
      <Text className="font-500">5 day forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex flex-row space-x-2">
          {props.weather.map((day) => {
            console.log(day.weatherCode)

            const iconUrl = `${FULL_WEB_URL}/weather/${day.weatherCode}0.png`
            console.log(iconUrl)

            return (
              <View
                key={day.time}
                className="border flex flex-col items-center border-gray-200 dark:border-gray-700 rounded-sm p-3 px-4 space-y-2"
              >
                {/* <Text>Min: {day.temperatureMin} deg</Text> */}
                <Text className="w-[60px] text-center">
                  {dayjs(day.time).isSame(dayjs(), "date") ? "Today" : dayjs(day.time).format("ddd Do")}
                </Text>
                <Image className="w-6 h-6 " source={{ uri: `${FULL_WEB_URL}/weather/${day.weatherCode}0.png` }} />
                <Text>{day.temperatureMax} °C</Text>
                {/* <Text>{day.windSpeedAvg}km/h</Text> */}
              </View>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}
