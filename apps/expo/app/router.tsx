import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { type NativeStackNavigationProp } from "@react-navigation/native-stack"

export type ScreenParamsList = {
  AuthLayout: { screen?: "LoginScreen" | "RegisterScreen" } | undefined
  OnboardingLayout: undefined

  AppLayout: undefined

  ProfileLayout: undefined
  ProfileScreen: undefined
  AccountScreen: undefined
  VanScreen: undefined
  InterestsScreen: undefined

  SpotsLayout: undefined
  SpotsMapScreen: undefined
  SpotsScreen: undefined

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
  UsernameLayout: { username: string; tab?: "spots" | "lists" | "van" }
}

export type NavigationParams<T extends keyof ScreenParamsList> = NativeStackNavigationProp<ScreenParamsList, T>

export type RouteParams<T extends keyof ScreenParamsList> = RouteProp<ScreenParamsList, T>

export function useRouter<T extends keyof ScreenParamsList>() {
  return useNavigation<NavigationParams<T>>()
}
export function useParams<T extends keyof ScreenParamsList>() {
  return useRoute<RouteParams<T>>()
}
