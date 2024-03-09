import { api } from "../api"

export function useMe() {
  const res = api.user.me.useQuery(undefined, { staleTime: Number.POSITIVE_INFINITY })
  return { ...res, me: res.data }
}
