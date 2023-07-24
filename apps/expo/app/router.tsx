import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { type NativeStackNavigationProp } from "@react-navigation/native-stack"

import { type SpotType } from "@ramble/database/types"

type NewSpotParams = {
  location: { latitude: number; longitude: number }
  type: SpotType
  info: { name: string; description: string; isPetFriendly: boolean }
  images: string[]
  amenities?: {
    hotWater: boolean
    wifi: boolean
    shower: boolean
    toilet: boolean
    kitchen: boolean
    electricity: boolean
    water: boolean
    firePit: boolean
    sauna: boolean
    pool: boolean
    bbq: boolean
  }
}

export type ScreenParamsList = {
  AuthLayout: { screen?: "LoginScreen" | "RegisterScreen" } | undefined
  LoginScreen: undefined
  RegisterScreen: undefined

  OnboardingLayout: undefined
  OnboardingStep1Screen: undefined
  OnboardingStep2Screen: undefined
  OnboardingStep3Screen: undefined

  AppLayout: undefined

  AccountLayout: undefined
  AccountScreen: undefined
  AccountInfoScreen: undefined
  VanScreen: undefined
  InterestsScreen: undefined

  MapLayout: undefined
  SpotsMapScreen: undefined

  LatestLayout: undefined
  LatestScreen: undefined

  NewSpotLayout: undefined
  NewSpotLocationScreen: undefined
  NewSpotTypeScreen: Pick<NewSpotParams, "location">
  NewSpotOptionsScreen: Pick<NewSpotParams, "location" | "type">
  NewSpotAmenitiesScreen: Pick<NewSpotParams, "location" | "type" | "info">
  NewSpotImagesScreen: Pick<NewSpotParams, "location" | "type" | "info" | "amenities">
  NewSpotConfirmScreen: NewSpotParams

  ListsLayout: undefined
  ListsScreen: undefined
  NewListScreen: undefined
  EditListScreen: { id: string }

  // SHARED
  SpotDetailScreen: { id: string }
  SaveScreen: { id: string }
  NewReviewScreen: { spotId: string }
  ReviewDetailScreen: { id: string }
  ListDetailScreen: { id: string }
  ListDetailMapScreen: { id: string }
  UserScreen: { username: string; tab?: "spots" | "lists" | "van" }
  UserFollowers: { username: string }
  UserFollowing: { username: string }
}

export type NavigationParams<T extends keyof ScreenParamsList> = NativeStackNavigationProp<ScreenParamsList, T>

export type RouteParams<T extends keyof ScreenParamsList> = RouteProp<ScreenParamsList, T>

export function useRouter<T extends keyof ScreenParamsList>() {
  return useNavigation<NavigationParams<T>>()
}
export function useParams<T extends keyof ScreenParamsList>() {
  return useRoute<RouteParams<T>>()
}
