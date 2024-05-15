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
import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import NetInfo from "@react-native-community/netinfo"
import * as Sentry from "@sentry/react-native"
// import * as Notifications from "expo-notifications"
import { Stack, useGlobalSearchParams, usePathname } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { PostHogProvider, usePostHog } from "posthog-react-native"
import * as React from "react"
import { AppState, type AppStateStatus, Text, View, useColorScheme } from "react-native"
import { AvoidSoftInput } from "react-native-avoid-softinput"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { enableScreens } from "react-native-screens"
import { UnsupportedVersion } from "~/components/UnsupportedVersion"
import { Toast } from "~/components/ui/Toast"
import { TRPCProvider, api } from "~/lib/api"
import { IS_DEV, IS_PRODUCTION, VERSION } from "~/lib/config"
import { useCheckExpoUpdates } from "~/lib/hooks/useCheckExpoUpdates"
import { useMe } from "~/lib/hooks/useMe"
import { useNotificationObserver } from "~/lib/hooks/useNotificationObserver"
import { useBackgroundColor } from "~/lib/tailwind"

Sentry.init({
  dsn: "https://db8195777a2bb905e405557687f085b9@o204549.ingest.sentry.io/4506140516024320",
  debug: true,
  enabled: !IS_DEV,
})

AvoidSoftInput.setShouldMimicIOSBehavior(true)

SplashScreen.preventAutoHideAsync()
enableScreens()

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// })

export const unstable_settings = {
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
  useNotificationObserver()

  const backgroundColor = useBackgroundColor()

  const { isDoneChecking } = useCheckExpoUpdates()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const isReady = fontsLoaded && isDoneChecking
  const onLayoutRootView = React.useCallback(() => SplashScreen.hideAsync(), [])

  if (!isReady) return null

  return (
    <TRPCProvider>
      <PostHogProvider
        autocapture={{ captureScreens: false, captureLifecycleEvents: true, captureTouches: true }}
        apiKey="phc_3HuNiIa6zCcsNHFmXst4X0HJjOLq32yRyRPVZQhsD31"
        options={{ host: "https://eu.posthog.com", disabled: !IS_PRODUCTION }}
      >
        <ActionSheetProvider>
          <CheckSupportedVersion>
            <PrefetchTabs>
              <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <SafeAreaProvider>
                  <TrackScreens />
                  <IdentifyUser />
                  <Stack initialRouteName="(home)" screenOptions={{ headerShown: false, contentStyle: { backgroundColor } }}>
                    <Stack.Screen name="(home)" />
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
                    <Stack.Screen name="new" options={{ presentation: "modal" }} />
                    <Stack.Screen name="spot" options={{ presentation: "modal" }} />
                    <Stack.Screen name="filters" options={{ presentation: "modal" }} />
                  </Stack>
                  <Toast />
                  <CheckNetwork />
                  <StatusBar style={isDark ? "light" : "dark"} />
                </SafeAreaProvider>
              </GestureHandlerRootView>
            </PrefetchTabs>
          </CheckSupportedVersion>
        </ActionSheetProvider>
      </PostHogProvider>
    </TRPCProvider>
  )
}

function CheckNetwork() {
  const [isConnected, setIsConnected] = React.useState(true)
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected || false)
    })
    return () => unsubscribe()
  }, [])

  if (isConnected) return null
  return (
    <Animated.View entering={SlideInUp.duration(500)} exiting={SlideOutUp.duration(500)} className="absolute top-14 z-10 w-full">
      <View className="bg-red-500 px-4 py-3 flex flex-row items-center justify-center rounded-full mx-auto">
        <Text className="text-white">No internet connection</Text>
      </View>
    </Animated.View>
  )
}

function CheckSupportedVersion(props: { children: React.ReactNode }) {
  const { data, isLoading, refetch } = api.version.isSupported.useQuery({ version: VERSION! })
  const appState = React.useRef(AppState.currentState)

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow
  const handleAppStateChange = React.useCallback((nextAppState: AppStateStatus) => {
    const isBackground = appState.current === "background"
    if (isBackground && nextAppState === "active") {
      refetch()
    }
    appState.current = nextAppState
  }, [])

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => {
      subscription.remove()
    }
  }, [handleAppStateChange])

  if (isLoading) return null
  if (data === false) return <UnsupportedVersion />
  return <>{props.children}</>
}

function PrefetchTabs(props: { children: React.ReactNode }) {
  const { me, isLoading, error } = useMe()
  const utils = api.useUtils()
  React.useEffect(() => {
    if (isLoading || !me) return
    utils.spot.list.prefetch({ skip: 0, sort: "latest" })
    utils.user.profile.prefetch({ username: me.username })
    utils.trip.mine.prefetch()
    utils.user.guides.prefetch({ skip: 0 })
  }, [me, isLoading, utils.spot.list, utils.user.profile, utils.trip.mine, utils.user.guides])

  if (isLoading && !error) return null

  return <>{props.children}</>
}

function IdentifyUser() {
  const { me, isLoading } = useMe()
  const posthog = usePostHog()
  React.useEffect(() => {
    if (isLoading || !me) return
    posthog.identify(me.id, { username: me.username, name: `${me.firstName} ${me.lastName}` })
    Sentry.setUser({ id: me.id, username: me.username })
  }, [me, isLoading, posthog])
  return null
}

function TrackScreens() {
  const pathname = usePathname()
  const params = useGlobalSearchParams()
  const posthog = usePostHog()
  React.useEffect(() => {
    // @ts-ignore
    if (params.params) params.params = undefined
    posthog.screen(pathname, { params })
  }, [pathname, params, posthog])

  return null
}
