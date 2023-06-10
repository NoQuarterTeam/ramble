import * as React from "react"
import { useColorScheme, View } from "react-native"
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
import { type ErrorBoundaryProps, SplashScreen, Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { Button } from "../components/Button"
import { NewUpdate } from "../components/NewUpdate"
import { Text } from "../components/Text"
import { api, TRPCProvider } from "../lib/api"
import { useCheckExpoUpdates } from "../lib/hooks/useCheckExpoUpdates"
import { useMe } from "../lib/hooks/useMe"

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
            <Stack
              initialRouteName="(app)"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: isDark ? "black" : "white" },
              }}
            >
              <Stack.Screen name="(app)" />
              <Stack.Screen name="spots" />
              <Stack.Screen name="[username]" />
              <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
            </Stack>
          </CurrentUser>
        )}
        <StatusBar style={isDark ? "light" : "dark"} />
      </SafeAreaProvider>
    </TRPCProvider>
  )
}

function CurrentUser(props: { children: React.ReactNode }) {
  const { me, isLoading } = useMe()
  const utils = api.useContext()
  React.useEffect(() => {
    if (isLoading || !me) return
    utils.user.profile.prefetch({ username: me.username })
  }, [me, isLoading])
  if (isLoading) return <SplashScreen />
  return <>{props.children}</>
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <View className="space-y-4 px-4 py-20">
      <Text>{props.error.message}</Text>
      <Button onPress={props.retry}>Try Again?</Button>
    </View>
  )
}
