import * as React from "react"
import { useColorScheme } from "react-native"
import { AvoidSoftInput } from "react-native-avoid-softinput"
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
import * as Sentry from "@sentry/react-native"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { PostHogProvider, usePostHog } from "posthog-react-native"

import { Toast } from "~/components/ui/Toast"
import { api, TRPCProvider } from "~/lib/api"
import { IS_DEV, IS_PRODUCTION } from "~/lib/config"
import { useCheckExpoUpdates } from "~/lib/hooks/useCheckExpoUpdates"
import { useMe } from "~/lib/hooks/useMe"
import { useBackgroundColor } from "~/lib/tailwind"

Sentry.init({
  dsn: "https://db8195777a2bb905e405557687f085b9@o204549.ingest.sentry.io/4506140516024320",
  debug: true,
  enabled: !IS_DEV,
})
AvoidSoftInput.setShouldMimicIOSBehavior(true)

SplashScreen.preventAutoHideAsync()
enableScreens()

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(home)",
}

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
            <PostHogProvider
              autocapture
              apiKey="phc_3HuNiIa6zCcsNHFmXst4X0HJjOLq32yRyRPVZQhsD31"
              options={{ host: "https://eu.posthog.com", enable: IS_PRODUCTION }}
            >
              <IdentifyUser />
              <Stack initialRouteName="(home)" screenOptions={{ headerShown: false, contentStyle: { backgroundColor } }}>
                <Stack.Screen name="(home)" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
                <Stack.Screen name="new" options={{ presentation: "modal" }} />
                <Stack.Screen name="map-layers" options={{ presentation: "modal" }} />
              </Stack>
            </PostHogProvider>
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
    if (isLoading || !me) return
    utils.spot.list.prefetch({ skip: 0, sort: "latest" })
    utils.user.profile.prefetch({ username: me.username })
    utils.list.allByUser.prefetch({ username: me.username })
    utils.user.guides.prefetch({ skip: 0 })
  }, [me, isLoading, utils.spot.list, utils.user.profile, utils.list.allByUser, utils.user.guides])
  if (isLoading) return null

  return <>{props.children}</>
}

function IdentifyUser() {
  const { me, isLoading } = useMe()
  const posthog = usePostHog()
  React.useEffect(() => {
    if (isLoading || !me) return
    if (posthog) posthog.identify(me.id, { username: me.username, name: me.firstName + " " + me.lastName })
    Sentry.setUser({ id: me.id, username: me.username })
  }, [me, isLoading, posthog])
  return null
}
