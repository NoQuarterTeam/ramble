import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { type NativeStackNavigationProp } from "@react-navigation/native-stack"

import { type Spot, type SpotAmenities } from "@ramble/database/types"

type SpotFormParams = Pick<Spot, "latitude" | "longitude" | "type" | "name" | "description" | "isPetFriendly"> & {
  images: string[]
} & { amenities?: Omit<SpotAmenities, "id" | "spotId" | "createdAt" | "updatedAt"> }

export type ScreenParamsList = {
  AuthLayout: { screen?: "LoginScreen" | "RegisterScreen" | "RequestAccessScreen" } | undefined
  LoginScreen: undefined
  RegisterScreen: undefined
  RequestAccessScreen: undefined

  OnboardingLayout: undefined
  OnboardingStep1Screen: undefined
  OnboardingStep2Screen: undefined
  OnboardingStep3Screen: undefined

  AppLayout: undefined

  AccountLayout: undefined
  AccountScreen: undefined
  AccountInfoScreen: undefined
  AccountVanScreen: undefined
  AccountInterestsScreen: undefined
  AccountSettingsScreen: undefined
  AccountInviteScreen: undefined
  AccountFeedbackScreen: undefined

  MapLayout: undefined
  MapScreen: undefined

  SpotsLayout: undefined
  SpotsScreen: undefined

  NewSpotLayout: undefined
  NewSpotLocationScreen: undefined
  NewSpotTypeScreen: Pick<SpotFormParams, "latitude" | "longitude">
  NewSpotOptionsScreen: Pick<SpotFormParams, "latitude" | "longitude" | "type">
  NewSpotAmenitiesScreen: Pick<SpotFormParams, "latitude" | "longitude" | "type" | "name" | "description" | "isPetFriendly">
  NewSpotImagesScreen: Pick<
    SpotFormParams,
    "latitude" | "longitude" | "type" | "name" | "description" | "isPetFriendly" | "amenities"
  >
  NewSpotConfirmScreen: SpotFormParams

  EditSpotLayout: { id: string } & SpotFormParams
  EditSpotLocationScreen: { id: string } & SpotFormParams
  EditSpotTypeScreen: { id: string } & SpotFormParams
  EditSpotOptionsScreen: { id: string } & SpotFormParams
  EditSpotAmenitiesScreen: { id: string } & SpotFormParams
  EditSpotImagesScreen: { id: string } & SpotFormParams
  EditSpotConfirmScreen: { id: string } & SpotFormParams

  ListsLayout: undefined
  ListsScreen: undefined
  NewListScreen: undefined
  EditListScreen: { id: string }

  // SHARED
  SpotDetailScreen: { id: string }
  SaveSpotScreen: { id: string }
  SaveSpotImagesScreen: { id: string; images: string[] }
  DeleteSpotScreen: { id: string }
  NewReviewScreen: { spotId: string }
  ReviewDetailScreen: { id: string }
  ListDetailScreen: { id: string; name: string }
  ListDetailMapScreen: {
    id: string
    name: string
    initialBounds?: [number, number, number, number]
    initialCenter?: [number, number]
  }
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
