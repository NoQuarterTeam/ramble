import { api } from "../api"

export function useMe() {
  const res = api.user.me.useQuery(undefined, { staleTime: Infinity })
  return { ...res, me: res.data }
}
