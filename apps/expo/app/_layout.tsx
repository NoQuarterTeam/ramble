import * as React from "react"
import { useColorScheme } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { enableScreens } from "react-native-screens"
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
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar } from "expo-status-bar"

import { NewUpdate } from "../components/NewUpdate"
import { Toast } from "../components/Toast"
import { api, TRPCProvider } from "../lib/api"
import { useCheckExpoUpdates } from "../lib/hooks/useCheckExpoUpdates"
import { useMe } from "../lib/hooks/useMe"
import { AppLayout } from "./(app)/_layout"
import { ReviewDetailScreen } from "./(app)/shared/spots/[id]/reviews/[id]"
import { NewReviewScreen } from "./(app)/shared/spots/[id]/reviews/new"
import { SaveScreen } from "./(app)/shared/spots/[id]/save"
import { AuthLayout } from "./(auth)/_layout"
import { type ScreenParamsList } from "./router"
import { NewListScreen } from "./(app)/lists/new"
import { EditListScreen } from "./(app)/shared/lists/[id]/edit"

enableScreens()

const Container = createNativeStackNavigator<ScreenParamsList>()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    poppins300: Poppins_300Light,
    poppins400: Poppins_400Regular,
    poppins500: Poppins_500Medium,
    poppins600: Poppins_600SemiBold,
    poppins700: Poppins_700Bold,
    poppins800: Poppins_800ExtraBold,
    poppins900: Poppins_900Black,
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
                  <Container.Screen name="NewListScreen" component={NewListScreen} />
                  <Container.Screen name="EditListScreen" component={EditListScreen} />
                  <Container.Screen name="NewReviewScreen" component={NewReviewScreen} />
                  <Container.Screen name="ReviewDetailScreen" component={ReviewDetailScreen} />
                  <Container.Screen name="SaveScreen" component={SaveScreen} />
                </Container.Group>
              </Container.Navigator>
            </NavigationContainer>
          </PrefetchTabs>
        )}
        <Toast />
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
    utils.list.allByUser.prefetch({ username: me.username })
  }, [me, isLoading])
  if (isLoading) return null
  return <>{props.children}</>
}
