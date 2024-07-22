import { Redirect, useLocalSearchParams } from "expo-router"
import { api } from "~/lib/api"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

export default function Page() {
  const params = useLocalSearchParams<{ nanoid: string }>()
  const { data, isLoading } = api.spot.byNanoid.useQuery({ nanoid: params.nanoid || "" }, { staleTime: Number.POSITIVE_INFINITY })
  const tab = useTabSegment()
  if (isLoading) return null
  if (data?.id) <Redirect href={`/${tab}/spot/${data.id}`} />
  else <Redirect href={`/${tab}`} />
}
