import * as React from "react"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { enableScreens } from "react-native-screens"
import {
  Urbanist_300Light,
  Urbanist_300Light_Italic,
  Urbanist_400Regular,
  Urbanist_400Regular_Italic,
  Urbanist_500Medium,
  Urbanist_500Medium_Italic,
  Urbanist_600SemiBold,
  Urbanist_600SemiBold_Italic,
  Urbanist_700Bold,
  Urbanist_700Bold_Italic,
  Urbanist_800ExtraBold,
  Urbanist_800ExtraBold_Italic,
  Urbanist_900Black,
  Urbanist_900Black_Italic,
  useFonts,
} from "@expo-google-fonts/urbanist"
import { type LinkingOptions, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as Linking from "expo-linking"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import * as Sentry from "sentry-expo"

import { Toast } from "../components/ui/Toast"
import { api, TRPCProvider } from "../lib/api"
import { useCheckExpoUpdates } from "../lib/hooks/useCheckExpoUpdates"
import { useMe } from "../lib/hooks/useMe"
import { useBackgroundColor } from "../lib/tailwind"
import { AppLayout } from "./(app)/_layout"
import { NewListScreen } from "./(app)/lists/new"
import { EditListScreen } from "./(app)/shared/lists/[id]/edit"
import { DeleteSpotScreen } from "./(app)/shared/spots/[id]/delete"
import { EditSpotLayout } from "./(app)/shared/spots/[id]/edit/_layout"
import { ReviewDetailScreen } from "./(app)/shared/spots/[id]/reviews/[id]"
import { NewReviewScreen } from "./(app)/shared/spots/[id]/reviews/new"
import { SaveSpotScreen } from "./(app)/shared/spots/[id]/save"
import { SaveSpotImagesScreen } from "./(app)/shared/spots/[id]/save-spot-images"
import { NewSpotLayout } from "./(app)/shared/spots/new/_layout"
import { AuthLayout } from "./(auth)/_layout"
import { OnboardingLayout } from "./onboarding/_layout"
import { type ScreenParamsList } from "./router"

Sentry.init({
  dsn: "https://db8195777a2bb905e405557687f085b9@o204549.ingest.sentry.io/4506140516024320",
  enableInExpoDevelopment: false,
  debug: true,
})

SplashScreen.preventAutoHideAsync()
enableScreens()
const prefix = Linking.createURL("/")
const linking: LinkingOptions<ScreenParamsList> = {
  prefixes: [prefix, "ramble.guide", "dev.ramble.guide", "ramble://"],
  config: {
    screens: {
      AppLayout: {
        screens: {
          MapLayout: {
            screens: {
              SpotsMapScreen: "map",
              SpotDetailScreen: "spots/:id",
              UserScreen: ":username",
            },
          },
          ProfileLayout: {
            screens: {
              ProfileScreen: "account",
              VanScreen: "account/van",
              InterestScreen: "account/interests",
            },
          },
        },
      },
    },
  },
}
const Container = createNativeStackNavigator<ScreenParamsList>()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    urbanist300: Urbanist_300Light,
    urbanist400: Urbanist_400Regular,
    urbanist400Italic: Urbanist_400Regular_Italic,
    urbanist500: Urbanist_500Medium,
    urbanist600: Urbanist_600SemiBold,
    urbanist700: Urbanist_700Bold,
    urbanist800: Urbanist_800ExtraBold,
    urbanist900: Urbanist_900Black,
    urbanist700Italic: Urbanist_700Bold_Italic,
    urbanist200Italic: Urbanist_300Light_Italic,
    urbanist300Italic: Urbanist_500Medium_Italic,
    urbanist500Italic: Urbanist_600SemiBold_Italic,
    urbanist800Italic: Urbanist_800ExtraBold_Italic,
    urbanist900Italic: Urbanist_900Black_Italic,
  })

  const backgroundColor = useBackgroundColor()

  const { isDoneChecking } = useCheckExpoUpdates()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const isReady = fontsLoaded && isDoneChecking
  const onLayoutRootView = React.useCallback(() => SplashScreen.hideAsync(), [])

  if (!isReady) return null

  return (
    <TRPCProvider>
      <PrefetchTabs>
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <SafeAreaProvider>
            <NavigationContainer linking={linking}>
              <Container.Navigator
                initialRouteName="AppLayout"
                screenOptions={{ headerShown: false, contentStyle: { backgroundColor } }}
              >
                <Container.Group>
                  <Container.Screen name="AppLayout" component={AppLayout} />
                  <Container.Screen name="OnboardingLayout" component={OnboardingLayout} />
                </Container.Group>
                <Container.Group screenOptions={{ presentation: "modal", contentStyle: { backgroundColor } }}>
                  <Container.Screen name="AuthLayout" component={AuthLayout} />
                  <Container.Screen name="NewSpotLayout" component={NewSpotLayout} />
                  <Container.Screen name="EditSpotLayout" component={EditSpotLayout} />
                  <Container.Screen name="NewListScreen" component={NewListScreen} />
                  <Container.Screen name="EditListScreen" component={EditListScreen} />
                  <Container.Screen name="NewReviewScreen" component={NewReviewScreen} />
                  <Container.Screen name="ReviewDetailScreen" component={ReviewDetailScreen} />
                  <Container.Screen name="SaveSpotScreen" component={SaveSpotScreen} />
                  <Container.Screen name="SaveSpotImagesScreen" component={SaveSpotImagesScreen} />
                  <Container.Screen name="DeleteSpotScreen" component={DeleteSpotScreen} />
                </Container.Group>
              </Container.Navigator>
            </NavigationContainer>
            <Toast />
            <StatusBar style={isDark ? "light" : "dark"} />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PrefetchTabs>
    </TRPCProvider>
  )
}

function PrefetchTabs(props: { children: React.ReactNode }) {
  const { me, isLoading } = useMe()
  const utils = api.useUtils()
  React.useEffect(() => {
    utils.spot.list.prefetch({ skip: 0, sort: "latest" })
    if (isLoading || !me) return
    utils.user.profile.prefetch({ username: me.username })
    utils.list.allByUser.prefetch({ username: me.username })
  }, [me, isLoading, utils.spot.list, utils.user.profile, utils.list.allByUser])
  if (isLoading) return null

  return <>{props.children}</>
}
