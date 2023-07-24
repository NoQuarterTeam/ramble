import * as React from "react"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { enableScreens } from "react-native-screens"
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_400Regular_Italic,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
  useFonts,
} from "@expo-google-fonts/poppins"
import { LinkingOptions, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import * as Linking from "expo-linking"

import { NewUpdate } from "../components/NewUpdate"
import { Toast } from "../components/ui/Toast"
import { api, TRPCProvider } from "../lib/api"
import { useCheckExpoUpdates } from "../lib/hooks/useCheckExpoUpdates"
import { useMe } from "../lib/hooks/useMe"
import { AppLayout } from "./(app)/_layout"
import { NewListScreen } from "./(app)/lists/new"
import { EditListScreen } from "./(app)/shared/lists/[id]/edit"
import { ReviewDetailScreen } from "./(app)/shared/spots/[id]/reviews/[id]"
import { NewReviewScreen } from "./(app)/shared/spots/[id]/reviews/new"
import { SaveScreen } from "./(app)/shared/spots/[id]/save"
import { NewSpotLayout } from "./(app)/shared/spots/new/_layout"
import { AuthLayout } from "./(auth)/_layout"
import { OnboardingLayout } from "./onboarding/_layout"
import { type ScreenParamsList } from "./router"

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
    poppins300: Poppins_300Light,
    poppins400: Poppins_400Regular,
    poppins400Italic: Poppins_400Regular_Italic,
    poppins500: Poppins_500Medium,
    poppins600: Poppins_600SemiBold,
    poppins700: Poppins_700Bold,
    poppins800: Poppins_800ExtraBold,
    poppins900: Poppins_900Black,
  })

  const { isDoneChecking, isNewUpdateAvailable } = useCheckExpoUpdates()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const isReady = fontsLoaded && isDoneChecking
  const onLayoutRootView = React.useCallback(SplashScreen.hideAsync, [])

  if (!isReady) return null

  return (
    <TRPCProvider>
      <PrefetchTabs>
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <SafeAreaProvider>
            {isNewUpdateAvailable ? (
              <NewUpdate />
            ) : (
              <NavigationContainer linking={linking}>
                <Container.Navigator
                  initialRouteName="AppLayout"
                  screenOptions={{ headerShown: false, contentStyle: { backgroundColor: isDark ? "black" : "white" } }}
                >
                  <Container.Group>
                    <Container.Screen name="AppLayout" component={AppLayout} />
                    <Container.Screen name="OnboardingLayout" component={OnboardingLayout} />
                  </Container.Group>
                  <Container.Group
                    screenOptions={{ presentation: "modal", contentStyle: { backgroundColor: isDark ? "black" : "white" } }}
                  >
                    <Container.Screen name="AuthLayout" component={AuthLayout} />
                    <Container.Screen name="NewSpotLayout" component={NewSpotLayout} />
                    <Container.Screen name="NewListScreen" component={NewListScreen} />
                    <Container.Screen name="EditListScreen" component={EditListScreen} />
                    <Container.Screen name="NewReviewScreen" component={NewReviewScreen} />
                    <Container.Screen name="ReviewDetailScreen" component={ReviewDetailScreen} />
                    <Container.Screen name="SaveScreen" component={SaveScreen} />
                  </Container.Group>
                </Container.Navigator>
              </NavigationContainer>
            )}
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
  const utils = api.useContext()
  React.useEffect(() => {
    utils.spot.latest.prefetch({ skip: 0 })
    if (isLoading || !me) return
    utils.user.profile.prefetch({ username: me.username })
    utils.list.allByUser.prefetch({ username: me.username })
  }, [me, isLoading])
  if (isLoading) return null
  return <>{props.children}</>
}
