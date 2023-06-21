import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
  useFonts,
} from "@expo-google-fonts/poppins"
import * as React from "react"
import { useColorScheme } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { StatusBar } from "expo-status-bar"

import { NewUpdate } from "../components/NewUpdate"

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { enableScreens } from "react-native-screens"
import { api, TRPCProvider } from "../lib/api"
import { useCheckExpoUpdates } from "../lib/hooks/useCheckExpoUpdates"
import { useMe } from "../lib/hooks/useMe"

import { NavigationContainer } from "@react-navigation/native"
import { AppLayout } from "./(app)/_layout"
import { AuthLayout } from "./(auth)/_layout"
import { SaveScreen } from "./(app)/shared/spots/[id]/save"
import { NewReviewScreen } from "./(app)/shared/spots/[id]/reviews/new"
import { ReviewDetailScreen } from "./(app)/shared/spots/[id]/reviews/[id]"

enableScreens()

const Container = createNativeStackNavigator()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  })

  const { isDoneChecking, isNewUpdateAvailable } = useCheckExpoUpdates()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  // Prevent rendering until the font has loaded
  if (!fontsLoaded || !isDoneChecking) return null

  return (
    <TRPCProvider>
      <SafeAreaProvider>
        {isNewUpdateAvailable ? (
          <NewUpdate />
        ) : (
          <PrefetchTabs>
            <NavigationContainer>
              <Container.Navigator
                initialRouteName="AppLayout"
                screenOptions={{ headerShown: false, contentStyle: { backgroundColor: isDark ? "black" : "white" } }}
              >
                <Container.Group>
                  <Container.Screen name="AppLayout" component={AppLayout} />
                </Container.Group>
                <Container.Group
                  screenOptions={{ presentation: "modal", contentStyle: { backgroundColor: isDark ? "black" : "white" } }}
                >
                  <Container.Screen name="AuthLayout" component={AuthLayout} />
                  <Container.Screen name="NewReviewScreen" component={NewReviewScreen} />
                  <Container.Screen name="ReviewDetailScreen" component={ReviewDetailScreen} />
                  <Container.Screen name="SaveScreen" component={SaveScreen} />
                </Container.Group>
              </Container.Navigator>
            </NavigationContainer>
          </PrefetchTabs>
        )}
        <StatusBar style={isDark ? "light" : "dark"} />
      </SafeAreaProvider>
    </TRPCProvider>
  )
}

function PrefetchTabs(props: { children: React.ReactNode }) {
  const { me, isLoading } = useMe()
  const utils = api.useContext()
  React.useEffect(() => {
    if (isLoading || !me) return
    utils.user.profile.prefetch({ username: me.username })
    utils.user.lists.prefetch({ username: me.username })
  }, [me, isLoading])
  if (isLoading) return null
  return <>{props.children}</>
}
