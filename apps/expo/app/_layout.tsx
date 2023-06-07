import { useColorScheme } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
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
import { SplashScreen, Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { NewUpdate } from "../components/NewUpdate"
import { TRPCProvider, api } from "../lib/api"
import { useCheckExpoUpdates } from "../lib/hooks/useCheckExpoUpdates"

// This is the main layout of the app
// It wraps your pages with the providers they need
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
  if (!fontsLoaded || !isDoneChecking) return <SplashScreen />

  return (
    <TRPCProvider>
      <SafeAreaProvider>
        {isNewUpdateAvailable ? (
          <NewUpdate />
        ) : (
          <CurrentUser>
            <Stack initialRouteName="(app)" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
              <Stack.Screen name="account" options={{ presentation: "modal" }} />
            </Stack>
          </CurrentUser>
        )}
        <StatusBar style={isDark ? "light" : "dark"} />
      </SafeAreaProvider>
    </TRPCProvider>
  )
}

function CurrentUser(props: { children: React.ReactNode }) {
  const { isLoading } = api.auth.me.useQuery()
  if (isLoading) return <SplashScreen />
  return <>{props.children}</>
}
