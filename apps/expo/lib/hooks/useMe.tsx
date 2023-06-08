import { api } from "../api"

export function useMe() {
  const res = api.auth.me.useQuery()
  return { ...res, me: res.data }
}
