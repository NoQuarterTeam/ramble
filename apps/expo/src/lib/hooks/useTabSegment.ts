import { useSegments } from "expo-router"

type Group<T extends string> = `(${T})`

type SharedSegment = Group<"index"> | Group<"account"> | Group<"users"> | Group<"spots"> | Group<"trips">

type Home = Group<"home">

export type TabSegment = `${Home}/${SharedSegment}`

export function useTabSegment() {
  return useSegments().slice(0, 2).join("/") as TabSegment
}
