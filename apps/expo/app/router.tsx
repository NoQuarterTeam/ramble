import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

export type ScreenParamsList = {
  AuthLayout: { screen?: "LoginScreen" | "RegisterScreen" } | undefined

  AppLayout: undefined

  ProfileLayout: undefined
  ProfileScreen: undefined
  SettingsScreen: undefined

  SpotsLayout: undefined
  SpotsMapScreen: undefined
  SpotsScreen: undefined
  ListsLayout: undefined

  // SHARED
  SpotDetailScreen: { id: string }

  ListDetailScreen: { id: string }
  ListDetailMapScreen: { id: string }

  UsernameLayout: { username: string; tab?: "spots" | "lists" | "van" }

  // MODAL
  SaveScreen: { id: string }
}

export type NavigationParams<T extends keyof ScreenParamsList> = NativeStackNavigationProp<ScreenParamsList, T>

export type RouteParams<T extends keyof ScreenParamsList> = RouteProp<ScreenParamsList, T>

export function useRouter<T extends keyof ScreenParamsList>() {
  return useNavigation<NavigationParams<T>>()
}
export function useParams<T extends keyof ScreenParamsList>() {
  return useRoute<RouteParams<T>>()
}
