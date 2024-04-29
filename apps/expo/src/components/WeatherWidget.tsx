import dayjs from "dayjs"
import { Sunrise, Sunset } from "lucide-react-native"
import { ScrollView, View } from "react-native"
import type { RouterOutputs } from "~/lib/api"
import { Icon } from "./Icon"
import { Text } from "./ui/Text"

interface Props {
  weather: NonNullable<RouterOutputs["spot"]["detail"]["weatherV2"]>
}

export function WeatherWidget(props: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex flex-row space-x-2">
        {props.weather.map((day) => (
          <View key={day.time} className="border border-gray-200 dark:border-gray-700 rounded-sm p-2 space-y-1">
            <Text className="font-600">{dayjs(day.time).format("ddd Do")}</Text>
            <View className="flex flex-row space-x-3">
              <Text>{day.temperatureAvg} deg</Text>
              <Text>{day.windSpeedAvg}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
