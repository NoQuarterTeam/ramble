import { Redirect, useLocalSearchParams } from "expo-router"
import { View } from "react-native"
import { Spinner } from "~/components/ui/Spinner"
import { api } from "~/lib/api"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

export default function Page() {
  const params = useLocalSearchParams<{ nanoid: string }>()
  const { data, isLoading } = api.spot.byNanoid.useQuery({ nanoid: params.nanoid || "" }, { staleTime: Number.POSITIVE_INFINITY })
  const tab = useTabSegment()
  if (isLoading)
    return (
      <View className="pt-20 flex items-center justify-center w-full">
        <Spinner />
      </View>
    )

  if (data?.id) return <Redirect href={`/${tab}/spot/${data.id}`} />
  return <Redirect href={`/${tab}/spots`} />
}
